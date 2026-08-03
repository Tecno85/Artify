const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const {
  crearContextoFrontend,
  crearElemento,
  ejecutarScript,
  evaluar,
} = require('./helpers/frontend-vm');

test('admin escapa HTML y protege la cuenta administrativa actual', () => {
  const elementos = new Map();
  const document = {
    addEventListener() {},
    getElementById(id) {
      if (!elementos.has(id)) {
        elementos.set(
          id,
          crearElemento({
            dataset: {},
            style: {},
          })
        );
      }

      return elementos.get(id);
    },
    querySelectorAll() {
      return [];
    },
  };
  const contextoFrontend = crearContextoFrontend({ document });
  contextoFrontend.sessionStorage.setItem(
    'artifyUser',
    JSON.stringify({
      id: 7,
      nombres: 'Admin',
      apellidos: 'Artify',
      correo: 'admin@artify.local',
      rol: 'admin',
    })
  );
  contextoFrontend.contexto.API = 'http://api.artify.test';
  contextoFrontend.contexto.fetchAuth = async () => ({
    json: async () => ({ mensaje: 'ok', usuarios: [] }),
  });
  contextoFrontend.contexto.obtenerTokenAuth = () => 'token-admin';
  contextoFrontend.contexto.obtenerUsuarioAuth = () =>
    JSON.parse(contextoFrontend.sessionStorage.getItem('artifyUser'));
  contextoFrontend.contexto.limpiarSesionAuth = () => {};
  ejecutarScript(contextoFrontend.contexto, 'admin.js');
  contextoFrontend.contexto.valorMalicioso =
    '<img src=x onerror="alert(1)"> &\' ataque';

  const resultado = evaluar(
    contextoFrontend.contexto,
    'escaparHtml(valorMalicioso)'
  );

  assert.equal(
    resultado,
    '&lt;img src=x onerror=&quot;alert(1)&quot;&gt; &amp;&#39; ataque'
  );

  evaluar(
    contextoFrontend.contexto,
    `renderizarTabla([
      {
        usr_id_usuario: 7,
        usr_nombres: 'Admin',
        usr_apellidos: 'Artify',
        usr_correo: 'admin@artify.local',
        usr_estado_usuario: 'activo',
        usr_rol: 'admin'
      },
      {
        usr_id_usuario: 8,
        usr_nombres: 'Usuario',
        usr_apellidos: 'Prueba',
        usr_correo: 'usuario@artify.local',
        usr_estado_usuario: 'activo',
        usr_rol: 'usuario'
      }
    ])`
  );

  const tabla = elementos.get('tablaBody').innerHTML;
  assert.match(tabla, /Cuenta actual/);
  assert.match(tabla, /Admin Artify/);
  assert.match(tabla, /Usuario Prueba/);
  assert.doesNotMatch(tabla, /abrirEliminar\(7\)/);
  assert.match(tabla, /abrirEliminar\(8\)/);
  assert.equal(
    evaluar(
      contextoFrontend.contexto,
      "esPasswordNuevaValida('PasswordSeguro123')"
    ),
    true
  );
  assert.equal(
    evaluar(
      contextoFrontend.contexto,
      "esPasswordNuevaValida('solominusculas')"
    ),
    false
  );
  assert.equal(
    evaluar(
      contextoFrontend.contexto,
      `esPasswordNuevaValida('A1${'a'.repeat(127)}')`
    ),
    false
  );
  assert.equal(
    evaluar(
      contextoFrontend.contexto,
      "obtenerErrorPasswordNueva('solominusculas')"
    ),
    'Incluye al menos 1 mayúscula, 1 minúscula y 1 número'
  );
  assert.equal(
    evaluar(
      contextoFrontend.contexto,
      `obtenerErrorPasswordNueva('A1${'a'.repeat(127)}')`
    ),
    'La contraseña no puede superar 128 caracteres'
  );
  evaluar(contextoFrontend.contexto, 'renderizarTabla([])');
  assert.match(elementos.get('tablaBody').innerHTML, /colspan="7"/);
});

test('notificaciones muestran mensajes como texto y no como HTML ejecutable', () => {
  const rutaJs = path.resolve(__dirname, '..', 'assets', 'js');
  const editor = fs.readFileSync(path.join(rutaJs, 'editor.js'), 'utf8');
  const registro = fs.readFileSync(path.join(rutaJs, 'registro.js'), 'utf8');
  const editorHtml = fs.readFileSync(
    path.resolve(__dirname, '..', 'pages', 'editor.html'),
    'utf8'
  );

  assert.match(editor, /contenido\.textContent = String\(mensaje\)/);
  assert.match(registro, /contenido\.textContent = String\(mensaje\)/);
  assert.doesNotMatch(editor, /innerHTML\s*=\s*`[^`]*\$\{mensaje\}/s);
  assert.doesNotMatch(registro, /innerHTML\s*=\s*`[^`]*\$\{mensaje\}/s);
  assert.match(editorHtml, /id="modalRecuperacion"/);
  assert.match(editorHtml, /id="btnRecuperarRespaldo"/);
  assert.match(editorHtml, /id="btnDescartarRespaldo"/);
  assert.match(editor, /operationsHistory\.splice\(historyIndex \+ 1\)/);
  assert.match(editor, /URL\.revokeObjectURL\(estado\.imageUrl\)/);
  assert.doesNotMatch(editor, /maxima:\s*1\.0/);
});

test('admin redirige accesos no autorizados sin mostrar el panel', () => {
  const crearEscenarioAdmin = ({ usuario, token }) => {
    const elementos = new Map();
    let manejadorDOMContentLoaded;
    let sesionLimpiada = false;
    const document = {
      addEventListener(tipo, manejador) {
        if (tipo === 'DOMContentLoaded') {
          manejadorDOMContentLoaded = manejador;
        }
      },
      getElementById(id) {
        if (!elementos.has(id)) {
          elementos.set(
            id,
            crearElemento({
              dataset: {},
              style: {},
            })
          );
        }

        return elementos.get(id);
      },
      querySelectorAll() {
        return [];
      },
    };
    const contextoFrontend = crearContextoFrontend({ document });
    contextoFrontend.contexto.API = 'http://api.artify.test';
    contextoFrontend.contexto.fetchAuth = async () => ({
      json: async () => ({ mensaje: 'ok', usuarios: [] }),
    });
    contextoFrontend.contexto.obtenerTokenAuth = () => token;
    contextoFrontend.contexto.obtenerUsuarioAuth = () => usuario;
    contextoFrontend.contexto.limpiarSesionAuth = () => {
      sesionLimpiada = true;
    };
    ejecutarScript(contextoFrontend.contexto, 'admin.js');

    return {
      ...contextoFrontend,
      elementos,
      ejecutarDOMContentLoaded: manejadorDOMContentLoaded,
      sesionFueLimpiada: () => sesionLimpiada,
    };
  };

  const usuarioOperativo = crearEscenarioAdmin({
    usuario: { id: 8, rol: 'usuario' },
    token: 'token-usuario',
  });
  usuarioOperativo.ejecutarDOMContentLoaded();

  assert.equal(usuarioOperativo.window.location.href, './editor.html');
  assert.equal(usuarioOperativo.sesionFueLimpiada(), false);
  assert.notEqual(
    usuarioOperativo.elementos.get('adminPanel')?.style.display,
    'block'
  );

  const visitante = crearEscenarioAdmin({
    usuario: null,
    token: null,
  });
  visitante.ejecutarDOMContentLoaded();

  assert.equal(visitante.window.location.href, './login.html');
  assert.equal(visitante.sesionFueLimpiada(), true);
  assert.notEqual(
    visitante.elementos.get('adminPanel')?.style.display,
    'block'
  );
});
