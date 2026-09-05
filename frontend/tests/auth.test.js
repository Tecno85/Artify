const assert = require('node:assert/strict');
const test = require('node:test');

const {
  AlmacenamientoSimulado,
  crearContextoFrontend,
  ejecutarScript,
  evaluar,
} = require('./helpers/frontend-vm');

function crearTokenPrueba(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `e30.${body}.firma-prueba`;
}

test('logout espera confirmación del servidor antes de borrar credenciales', async () => {
  let resolver;
  const escenario = crearContextoFrontend({
    sessionStorage: new AlmacenamientoSimulado({ artifyToken: 'token-salida', artifyUser: '{"id":7}' }),
    fetch: () => new Promise((resolve) => { resolver = resolve; }),
  });
  ejecutarScript(escenario.contexto, 'auth.js');
  const pendiente = evaluar(escenario.contexto, 'cerrarSesionAuth()');
  assert.equal(escenario.sessionStorage.getItem('artifyToken'), 'token-salida');
  resolver({ ok: true, status: 200, json: async () => ({ mensaje: 'Sesión de acceso cerrada' }) });
  assert.equal(await pendiente, true);
  assert.equal(escenario.sessionStorage.getItem('artifyToken'), null);
});

test('logout conserva credenciales para reintentar si falla la revocación', async () => {
  const escenario = crearContextoFrontend({
    sessionStorage: new AlmacenamientoSimulado({ artifyToken: 'token-salida' }),
    fetch: async () => ({ ok: false, status: 503 }),
  });
  ejecutarScript(escenario.contexto, 'auth.js');
  assert.equal(await evaluar(escenario.contexto, 'cerrarSesionAuth()'), false);
  assert.equal(escenario.sessionStorage.getItem('artifyToken'), 'token-salida');
});

test('logout no borra una sesión nueva iniciada mientras esperaba la respuesta', async () => {
  let resolver;
  const escenario = crearContextoFrontend({
    sessionStorage: new AlmacenamientoSimulado({ artifyToken: 'anterior' }),
    fetch: () => new Promise((resolve) => { resolver = resolve; }),
  });
  ejecutarScript(escenario.contexto, 'auth.js');
  const pendiente = evaluar(escenario.contexto, 'cerrarSesionAuth()');
  escenario.sessionStorage.setItem('artifyToken', 'nueva');
  resolver({ ok: true, status: 200, json: async () => ({ mensaje: 'Sesión de acceso cerrada' }) });
  assert.equal(await pendiente, false);
  assert.equal(escenario.sessionStorage.getItem('artifyToken'), 'nueva');
});

test('auth guarda el token y construye headers sin modificar el objeto original', () => {
  const { contexto, sessionStorage } = crearContextoFrontend();
  ejecutarScript(contexto, 'auth.js');

  evaluar(contexto, "guardarTokenAuth('token-seguro')");
  const headersOriginales = { 'Content-Type': 'application/json' };
  contexto.headersOriginales = headersOriginales;
  const headers = evaluar(
    contexto,
    'construirHeadersAuth(headersOriginales)'
  );

  assert.equal(sessionStorage.getItem('artifyToken'), 'token-seguro');
  assert.equal(headers.Authorization, 'Bearer token-seguro');
  assert.equal(headers['Content-Type'], 'application/json');
  assert.deepEqual(headersOriginales, { 'Content-Type': 'application/json' });
});

test('auth guarda una sesión recordada en localStorage y permite recuperarla', () => {
  const { contexto, localStorage, sessionStorage } = crearContextoFrontend();
  ejecutarScript(contexto, 'auth.js');
  contexto.usuario = {
    id: 7,
    correo: 'ana@artify.local',
    rol: 'usuario',
  };

  const guardada = evaluar(
    contexto,
    "guardarSesionAuth('token-recordado', usuario, true)"
  );

  assert.equal(guardada, true);
  assert.equal(localStorage.getItem('artifyToken'), 'token-recordado');
  assert.deepEqual(
    JSON.parse(localStorage.getItem('artifyUser')),
    contexto.usuario
  );
  assert.equal(sessionStorage.getItem('artifyToken'), null);
  assert.equal(evaluar(contexto, 'obtenerTokenAuth()'), 'token-recordado');
  assert.deepEqual(
    JSON.parse(JSON.stringify(evaluar(contexto, 'obtenerUsuarioAuth()'))),
    contexto.usuario
  );
});

test('auth reemplaza una sesión recordada por una sesión temporal sin mezclar datos', () => {
  const localStorage = new AlmacenamientoSimulado({
    artifyToken: 'token-anterior',
    artifyUser: '{"id":1}',
  });
  const contextoFrontend = crearContextoFrontend({ localStorage });
  ejecutarScript(contextoFrontend.contexto, 'auth.js');
  contextoFrontend.contexto.usuario = { id: 2, rol: 'usuario' };

  evaluar(
    contextoFrontend.contexto,
    "guardarSesionAuth('token-temporal', usuario, false)"
  );

  assert.equal(localStorage.getItem('artifyToken'), null);
  assert.equal(localStorage.getItem('artifyUser'), null);
  assert.equal(
    contextoFrontend.sessionStorage.getItem('artifyToken'),
    'token-temporal'
  );
});

test('auth descarta usuario almacenado con JSON corrupto', () => {
  const sessionStorage = new AlmacenamientoSimulado({
    artifyUser: '{usuario-invalido',
  });
  const localStorage = new AlmacenamientoSimulado({
    artifyUser: '{usuario-recordado-invalido',
  });
  const contextoFrontend = crearContextoFrontend({
    sessionStorage,
    localStorage,
  });
  ejecutarScript(contextoFrontend.contexto, 'auth.js');

  assert.equal(evaluar(contextoFrontend.contexto, 'obtenerUsuarioAuth()'), null);
  assert.equal(sessionStorage.getItem('artifyUser'), null);
  assert.equal(localStorage.getItem('artifyUser'), null);
});

test('auth redirige desde el inicio al editor con una sesión vigente', () => {
  const usuario = { id: 7, rol: 'usuario' };
  const token = crearTokenPrueba({
    id: usuario.id,
    rol: usuario.rol,
    exp: Math.floor(Date.now() / 1000) + 3600,
  });
  const localStorage = new AlmacenamientoSimulado({
    artifyUser: JSON.stringify(usuario),
    artifyToken: token,
  });
  const contextoFrontend = crearContextoFrontend({
    localStorage,
    location: { pathname: '/index.html' },
  });
  ejecutarScript(contextoFrontend.contexto, 'auth.js');

  const redirigida = evaluar(
    contextoFrontend.contexto,
    'redirigirSesionAuth()'
  );

  assert.equal(redirigida, true);
  assert.deepEqual(contextoFrontend.reemplazos, ['./pages/editor.html']);
});

test('auth redirige desde el login al panel cuando la sesión es administrativa', () => {
  const usuario = { id: 1, rol: 'admin' };
  const token = crearTokenPrueba({
    id: usuario.id,
    rol: usuario.rol,
    exp: Math.floor(Date.now() / 1000) + 3600,
  });
  const localStorage = new AlmacenamientoSimulado({
    artifyUser: JSON.stringify(usuario),
    artifyToken: token,
  });
  const contextoFrontend = crearContextoFrontend({
    localStorage,
    location: { pathname: '/pages/login.html' },
  });
  ejecutarScript(contextoFrontend.contexto, 'auth.js');

  evaluar(contextoFrontend.contexto, 'redirigirSesionAuth()');

  assert.deepEqual(contextoFrontend.reemplazos, ['./admin.html']);
});

test('auth descarta una sesión recordada cuando el token expiró', () => {
  const usuario = { id: 7, rol: 'usuario' };
  const token = crearTokenPrueba({
    id: usuario.id,
    rol: usuario.rol,
    exp: Math.floor(Date.now() / 1000) - 60,
  });
  const localStorage = new AlmacenamientoSimulado({
    artifyUser: JSON.stringify(usuario),
    artifyToken: token,
  });
  const contextoFrontend = crearContextoFrontend({
    localStorage,
    location: { pathname: '/index.html' },
  });
  ejecutarScript(contextoFrontend.contexto, 'auth.js');

  const redirigida = evaluar(
    contextoFrontend.contexto,
    'redirigirSesionAuth()'
  );

  assert.equal(redirigida, false);
  assert.equal(localStorage.getItem('artifyUser'), null);
  assert.equal(localStorage.getItem('artifyToken'), null);
  assert.deepEqual(contextoFrontend.reemplazos, []);
});

test('auth descarta sesiones con rol desconocido antes de redirigir', () => {
  const usuario = { id: 7, rol: 'moderador' };
  const token = crearTokenPrueba({
    id: usuario.id,
    rol: usuario.rol,
    exp: Math.floor(Date.now() / 1000) + 3600,
  });
  const sessionStorage = new AlmacenamientoSimulado({
    artifyUser: JSON.stringify(usuario),
    artifyToken: token,
  });
  const contextoFrontend = crearContextoFrontend({
    sessionStorage,
    location: { pathname: '/pages/login.html' },
  });
  ejecutarScript(contextoFrontend.contexto, 'auth.js');

  const redirigida = evaluar(
    contextoFrontend.contexto,
    'redirigirSesionAuth()'
  );

  assert.equal(redirigida, false);
  assert.equal(sessionStorage.getItem('artifyUser'), null);
  assert.equal(sessionStorage.getItem('artifyToken'), null);
  assert.deepEqual(contextoFrontend.reemplazos, []);
});

test('auth descarta sesiones si el usuario almacenado no coincide con el token', () => {
  const token = crearTokenPrueba({
    id: 7,
    rol: 'usuario',
    exp: Math.floor(Date.now() / 1000) + 3600,
  });
  const sessionStorage = new AlmacenamientoSimulado({
    artifyUser: JSON.stringify({ id: 7, rol: 'admin' }),
    artifyToken: token,
  });
  const contextoFrontend = crearContextoFrontend({
    sessionStorage,
    location: { pathname: '/pages/login.html' },
  });
  ejecutarScript(contextoFrontend.contexto, 'auth.js');

  assert.equal(evaluar(contextoFrontend.contexto, 'obtenerUsuarioAuth()'), null);
  assert.equal(sessionStorage.getItem('artifyUser'), null);
  assert.equal(sessionStorage.getItem('artifyToken'), null);
  assert.equal(
    evaluar(contextoFrontend.contexto, 'redirigirSesionAuth()'),
    false
  );
  assert.deepEqual(contextoFrontend.reemplazos, []);
});

test('auth limpia todos los datos locales relacionados con la sesión', () => {
  const sessionStorage = new AlmacenamientoSimulado({
    artifyAdmin: '{}',
    artifyUser: '{}',
    artifyToken: 'token',
    artifyIdSesion: '25',
  });
  const localStorage = new AlmacenamientoSimulado({
    artifyAdmin: '{}',
    artifyUser: '{"id":7}',
    artifyToken: 'token-recordado',
    artify_backup_v1: '{"version":1}',
    artify_backup_image: 'imagen',
    artify_backup_timestamp: '123',
    preferencia_no_relacionada: 'conservar',
  });
  const contextoFrontend = crearContextoFrontend({
    sessionStorage,
    localStorage,
  });
  ejecutarScript(contextoFrontend.contexto, 'auth.js');

  evaluar(contextoFrontend.contexto, 'limpiarSesionAuth()');

  assert.equal(sessionStorage.getItem('artifyAdmin'), null);
  assert.equal(sessionStorage.getItem('artifyUser'), null);
  assert.equal(sessionStorage.getItem('artifyToken'), null);
  assert.equal(sessionStorage.getItem('artifyIdSesion'), null);
  assert.equal(localStorage.getItem('artifyAdmin'), null);
  assert.equal(localStorage.getItem('artifyUser'), null);
  assert.equal(localStorage.getItem('artifyToken'), null);
  assert.equal(localStorage.getItem('artify_backup_v1'), null);
  assert.equal(localStorage.getItem('artify_backup_image'), null);
  assert.equal(localStorage.getItem('artify_backup_timestamp'), null);
  assert.equal(localStorage.getItem('preferencia_no_relacionada'), 'conservar');
});

test('fetchAuth adjunta el token y redirige al login ante un 401', async () => {
  let solicitud;
  const sessionStorage = new AlmacenamientoSimulado({
    artifyUser: '{"id":7}',
    artifyToken: 'token-vigente',
  });
  const contextoFrontend = crearContextoFrontend({
    sessionStorage,
    fetch: async (url, options) => {
      solicitud = { url, options };
      return { status: 401 };
    },
  });
  ejecutarScript(contextoFrontend.contexto, 'auth.js');

  await evaluar(
    contextoFrontend.contexto,
    "fetchAuth('http://api.test/recurso', { headers: { Accept: 'application/json' } })"
  );

  assert.equal(solicitud.url, 'http://api.test/recurso');
  assert.equal(solicitud.options.headers.Authorization, 'Bearer token-vigente');
  assert.equal(solicitud.options.headers.Accept, 'application/json');
  assert.equal(sessionStorage.getItem('artifyToken'), null);
  assert.deepEqual(contextoFrontend.reemplazos, ['./login.html']);
});

test('fetchAuth no genera una redirección repetida desde el propio login', async () => {
  const contextoFrontend = crearContextoFrontend({
    location: { pathname: '/pages/login.html' },
    fetch: async () => ({ status: 401 }),
  });
  ejecutarScript(contextoFrontend.contexto, 'auth.js');

  await evaluar(
    contextoFrontend.contexto,
    "fetchAuth('http://api.test/recurso')"
  );

  assert.deepEqual(contextoFrontend.reemplazos, []);
});
