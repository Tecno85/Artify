const assert = require('node:assert/strict');
const test = require('node:test');

const {
  AlmacenamientoSimulado,
  crearContextoFrontend,
  ejecutarScript,
  evaluar,
} = require('./helpers/frontend-vm');

function crearEscenarioEditor(fetchAuth) {
  const usuario = {
    id: 7,
    nombres: 'Usuario',
    apellidos: 'Editor',
    rol: 'usuario',
  };
  const sessionStorage = new AlmacenamientoSimulado({
    artifyUser: JSON.stringify(usuario),
    artifyToken: 'token-editor',
  });
  const contextoFrontend = crearContextoFrontend({ sessionStorage });
  contextoFrontend.contexto.API = 'http://api.artify.test';
  contextoFrontend.contexto.fetchAuth = fetchAuth;
  contextoFrontend.contexto.obtenerTokenAuth = () =>
    sessionStorage.getItem('artifyToken');
  contextoFrontend.contexto.obtenerUsuarioAuth = () => {
    const usuarioGuardado =
      sessionStorage.getItem('artifyUser') ||
      contextoFrontend.localStorage.getItem('artifyUser');
    return usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
  };
  contextoFrontend.contexto.limpiarSesionAuth = () => sessionStorage.clear();
  ejecutarScript(contextoFrontend.contexto, 'editor-storage.js');
  ejecutarScript(contextoFrontend.contexto, 'editor-image.js');
  ejecutarScript(contextoFrontend.contexto, 'editor.js');

  return { ...contextoFrontend, usuario };
}

test('editor inicia la sesión en segundo plano sin bloquear su inicialización', async () => {
  let resolverSolicitud;
  const escenario = crearEscenarioEditor(
    () =>
      new Promise((resolve) => {
        resolverSolicitud = resolve;
      })
  );

  escenario.contexto.usuarioPrueba = escenario.usuario;
  const promesa = evaluar(
    escenario.contexto,
    'iniciarSesionEdicionEnSegundoPlano(usuarioPrueba)'
  );

  assert.equal(typeof promesa.then, 'function');
  assert.equal(escenario.sessionStorage.getItem('artifyIdSesion'), null);

  resolverSolicitud({
    status: 200,
    ok: true,
    json: async () => ({ mensaje: 'Sesión iniciada', idSesion: 42 }),
  });

  assert.equal(await promesa, 42);
  assert.equal(escenario.sessionStorage.getItem('artifyIdSesion'), '42');

  escenario.contexto.datosRespaldo = {
    dataUrl: 'data:image/png;base64,AAAA',
    formato: 'png',
    nombreOriginal: 'prueba.png',
    tamanoBytes: 128,
  };
  assert.equal(
    evaluar(escenario.contexto, 'guardarRespaldoLocal(datosRespaldo)'),
    true
  );
  const respaldo = evaluar(
    escenario.contexto,
    'leerRespaldoLocalParaUsuario(7)'
  );
  assert.equal(respaldo.idUsuario, 7);
  assert.equal(respaldo.nombreOriginal, 'prueba.png');
  assert.equal(respaldo.formato, 'png');
});

test('editor descarta una sesión tardía si el usuario autenticado cambió', async () => {
  let resolverSolicitud;
  const escenario = crearEscenarioEditor(
    () =>
      new Promise((resolve) => {
        resolverSolicitud = resolve;
      })
  );

  escenario.contexto.usuarioPrueba = escenario.usuario;
  escenario.contexto.datosRespaldo = {
    dataUrl: 'data:image/webp;base64,AAAA',
    formato: 'webp',
    nombreOriginal: 'privada.webp',
    tamanoBytes: 256,
  };
  assert.equal(
    evaluar(escenario.contexto, 'guardarRespaldoLocal(datosRespaldo)'),
    true
  );
  const promesa = evaluar(
    escenario.contexto,
    'iniciarSesionEdicionEnSegundoPlano(usuarioPrueba)'
  );
  escenario.sessionStorage.setItem(
    'artifyUser',
    JSON.stringify({ ...escenario.usuario, id: 99 })
  );
  resolverSolicitud({
    status: 200,
    ok: true,
    json: async () => ({ mensaje: 'Sesión iniciada', idSesion: 43 }),
  });

  assert.equal(await promesa, null);
  assert.equal(escenario.sessionStorage.getItem('artifyIdSesion'), null);
  assert.equal(
    evaluar(escenario.contexto, 'leerRespaldoLocalParaUsuario(99)'),
    null
  );
  assert.equal(escenario.localStorage.getItem('artify_backup_v1'), null);
});

test('editor elimina respaldos vencidos o alterados antes de recuperarlos', () => {
  const escenario = crearEscenarioEditor(async () => ({
    status: 200,
    ok: true,
    json: async () => ({ mensaje: 'Sesión iniciada', idSesion: 42 }),
  }));
  const ahora = Date.now();
  const respaldoVencido = {
    version: 1,
    idUsuario: 7,
    timestamp: ahora - 8 * 24 * 60 * 60 * 1000,
    dataUrl: 'data:image/png;base64,AAAA',
    formato: 'png',
    nombreOriginal: 'vencida.png',
    tamanoBytes: 128,
  };

  escenario.localStorage.setItem(
    'artify_backup_v1',
    JSON.stringify(respaldoVencido)
  );
  assert.equal(
    evaluar(escenario.contexto, `leerRespaldoLocalParaUsuario(7, ${ahora})`),
    null
  );
  assert.equal(escenario.localStorage.getItem('artify_backup_v1'), null);

  escenario.localStorage.setItem(
    'artify_backup_v1',
    JSON.stringify({
      ...respaldoVencido,
      timestamp: ahora,
      dataUrl: 'javascript:alert(1)',
    })
  );
  assert.equal(
    evaluar(escenario.contexto, `leerRespaldoLocalParaUsuario(7, ${ahora})`),
    null
  );
  assert.equal(escenario.localStorage.getItem('artify_backup_v1'), null);

  escenario.localStorage.setItem(
    'artify_backup_v1',
    JSON.stringify({
      ...respaldoVencido,
      timestamp: ahora,
      dataUrl: 'data:image/png;base64,AAAA<script>',
    })
  );
  assert.equal(
    evaluar(escenario.contexto, `leerRespaldoLocalParaUsuario(7, ${ahora})`),
    null
  );
  assert.equal(escenario.localStorage.getItem('artify_backup_v1'), null);
});

test('editor no guarda respaldos locales con datos no válidos', () => {
  const escenario = crearEscenarioEditor(async () => ({
    status: 200,
    ok: true,
    json: async () => ({ mensaje: 'Sesión iniciada', idSesion: 42 }),
  }));

  escenario.contexto.respaldoInvalido = {
    dataUrl: 'javascript:alert(1)',
    formato: 'png',
    nombreOriginal: 'ataque.png',
    tamanoBytes: 128,
  };
  assert.equal(
    evaluar(escenario.contexto, 'guardarRespaldoLocal(respaldoInvalido)'),
    false
  );
  assert.equal(escenario.localStorage.getItem('artify_backup_v1'), null);

  escenario.contexto.respaldoFormatoInvalido = {
    dataUrl: 'data:image/gif;base64,AAAA',
    formato: 'gif',
    nombreOriginal: 'animada.gif',
    tamanoBytes: 128,
  };
  assert.equal(
    evaluar(
      escenario.contexto,
      'guardarRespaldoLocal(respaldoFormatoInvalido)'
    ),
    false
  );
  assert.equal(escenario.localStorage.getItem('artify_backup_v1'), null);

  escenario.contexto.respaldoMimeIncoherente = {
    dataUrl: 'data:image/jpeg;base64,AAAA',
    formato: 'png',
    nombreOriginal: 'incoherente.png',
    tamanoBytes: 128,
  };
  assert.equal(
    evaluar(
      escenario.contexto,
      'guardarRespaldoLocal(respaldoMimeIncoherente)'
    ),
    false
  );
  assert.equal(escenario.localStorage.getItem('artify_backup_v1'), null);

  escenario.contexto.respaldoTamanoInvalido = {
    dataUrl: 'data:image/png;base64,AAAA',
    formato: 'png',
    nombreOriginal: 'sin-tamano.png',
    tamanoBytes: 0,
  };
  assert.equal(
    evaluar(
      escenario.contexto,
      'guardarRespaldoLocal(respaldoTamanoInvalido)'
    ),
    false
  );
  assert.equal(escenario.localStorage.getItem('artify_backup_v1'), null);

  escenario.contexto.respaldoDemasiadoGrande = {
    dataUrl: 'data:image/png;base64,AAAA',
    formato: 'png',
    nombreOriginal: 'grande.png',
    tamanoBytes: 10 * 1024 * 1024 + 1,
  };
  assert.equal(
    evaluar(
      escenario.contexto,
      'guardarRespaldoLocal(respaldoDemasiadoGrande)'
    ),
    false
  );
  assert.equal(escenario.localStorage.getItem('artify_backup_v1'), null);
});

test('editor limpia la sesión y vuelve al login cuando la API rechaza el token', async () => {
  const escenario = crearEscenarioEditor(async () => ({
    status: 401,
    ok: false,
    json: async () => ({ mensaje: 'Token inválido' }),
  }));
  escenario.contexto.usuarioPrueba = escenario.usuario;

  const resultado = await evaluar(
    escenario.contexto,
    'iniciarSesionEdicionEnSegundoPlano(usuarioPrueba)'
  );

  assert.equal(resultado, null);
  assert.equal(escenario.sessionStorage.getItem('artifyToken'), null);
  assert.equal(escenario.window.location.href, './login.html');
});

function prepararAutoguardadoSimulado() {
  const escenario = crearEscenarioEditor(() => {
    throw new Error('El autoguardado no debe consultar la API');
  });
  const estado = { textContent: '' };
  escenario.contexto.document = { getElementById: () => estado };
  const lectores = [];
  escenario.contexto.FileReader = class {
    constructor() { lectores.push(this); }
    readAsDataURL(blob) { this.blob = blob; }
  };
  evaluar(escenario.contexto, `
    preferenciasActuales = { autoguardado: true };
    operationsHistory = [{ blob: { size: 3 } }, { blob: { size: 6 } }];
    historyIndex = 0;
  `);
  return { ...escenario, estado, lectores };
}

test('un respaldo tardío no reemplaza el estado más reciente', () => {
  const escenario = prepararAutoguardadoSimulado();
  evaluar(escenario.contexto, 'autoguardarImagen()');
  evaluar(escenario.contexto, `
    revisionAutoguardado++;
    historyIndex = 1;
    autoguardarImagen();
  `);
  escenario.lectores[1].result = 'data:image/png;base64,AQIDBAUG';
  escenario.lectores[1].onload();
  escenario.lectores[0].result = 'data:image/png;base64,AAAA';
  escenario.lectores[0].onload();
  const respaldo = JSON.parse(escenario.localStorage.getItem('artify_backup_v1'));
  assert.equal(respaldo.dataUrl, 'data:image/png;base64,AQIDBAUG');
  assert.equal(respaldo.tamanoBytes, 6);
});

test('desactivar autoguardado descarta una escritura que ya estaba en curso', () => {
  const escenario = prepararAutoguardadoSimulado();
  evaluar(escenario.contexto, 'autoguardarImagen()');
  evaluar(escenario.contexto, 'aplicarPreferencias({ autoguardado: false })');
  escenario.lectores[0].result = 'data:image/png;base64,AAAA';
  escenario.lectores[0].onload();
  assert.equal(escenario.localStorage.getItem('artify_backup_v1'), null);
  assert.equal(escenario.estado.textContent, 'Autoguardado desactivado.');
});

test('un error al leer el respaldo deja una advertencia visible', () => {
  const escenario = prepararAutoguardadoSimulado();
  evaluar(escenario.contexto, 'autoguardarImagen()');
  escenario.lectores[0].onerror();
  assert.match(escenario.estado.textContent, /No se pudo autoguardar/);
  assert.equal(escenario.localStorage.getItem('artify_backup_v1'), null);
});
