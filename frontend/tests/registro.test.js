const assert = require('node:assert/strict');
const test = require('node:test');

const {
  crearContextoFrontend,
  crearElemento,
  ejecutarScript,
  esperarPromesas,
} = require('./helpers/frontend-vm');

function crearEscenarioRegistro(
  respuestaFetch = { mensaje: 'Registro exitoso' }
) {
  let manejadorDOMContentLoaded;
  const botonSubmit = crearElemento({ textContent: 'Registrarse' });
  const registroForm = crearElemento({
    querySelector(selector) {
      return selector === 'button[type="submit"]' ? botonSubmit : null;
    },
  });
  const elementos = {
    registroForm,
    nombres: crearElemento(),
    apellidos: crearElemento(),
    email: crearElemento(),
    password: crearElemento({ type: 'password' }),
    confirmPassword: crearElemento({ type: 'password' }),
    terminos: crearElemento({ checked: false }),
    'nombres-error': crearElemento({ scrollIntoView() {} }),
    'apellidos-error': crearElemento({ scrollIntoView() {} }),
    'email-error': crearElemento({ scrollIntoView() {} }),
    'password-error': crearElemento({ scrollIntoView() {} }),
    'confirmPassword-error': crearElemento({ scrollIntoView() {} }),
    'terminos-error': crearElemento({ scrollIntoView() {} }),
    'strength-fill': crearElemento(),
    'strength-text': crearElemento(),
  };
  const solicitudes = [];
  const body = crearElemento();
  body.appendChild = (elemento) => body.append(elemento);

  const document = {
    body,
    addEventListener(tipo, manejador) {
      if (tipo === 'DOMContentLoaded') {
        manejadorDOMContentLoaded = manejador;
      }
    },
    createElement() {
      return crearElemento({ remove() {} });
    },
    getElementById(id) {
      return elementos[id] || null;
    },
    querySelector(selector) {
      if (selector !== '.error-message.show') {
        return null;
      }

      return Object.values(elementos).find((elemento) =>
        elemento.classList?.contains('show')
      ) || null;
    },
    querySelectorAll(selector) {
      return selector === '.toggle-password' ? [] : [];
    },
  };
  const contextoFrontend = crearContextoFrontend({
    apiUrl: 'http://api.artify.test',
    document,
    location: { pathname: '/pages/registro.html' },
    fetch: async (url, options) => {
      solicitudes.push({ url, options });
      return { json: async () => respuestaFetch };
    },
    setTimeout: (callback) => {
      callback();
      return 1;
    },
  });

  ejecutarScript(contextoFrontend.contexto, 'auth.js');
  ejecutarScript(contextoFrontend.contexto, 'registro.js');
  manejadorDOMContentLoaded();

  return {
    ...contextoFrontend,
    botonSubmit,
    elementos,
    registroForm,
    solicitudes,
  };
}

function enviarFormulario(escenario) {
  let envioPrevenido = false;
  escenario.registroForm.obtenerManejador('submit')({
    preventDefault() {
      envioPrevenido = true;
    },
  });

  return envioPrevenido;
}

test('registro valida datos y términos antes de consultar el backend', () => {
  const escenario = crearEscenarioRegistro();
  escenario.elementos.nombres.value = 'Ana';
  escenario.elementos.apellidos.value = 'Prueba';
  escenario.elementos.email.value = 'ana@artify.local';
  escenario.elementos.password.value = 'solominusculas';
  escenario.elementos.confirmPassword.value = 'otraPassword123';
  escenario.elementos.terminos.checked = false;

  assert.equal(enviarFormulario(escenario), true);
  assert.equal(escenario.solicitudes.length, 0);
  assert.equal(escenario.botonSubmit.disabled, false);
  assert.equal(escenario.elementos.password.classList.contains('error'), true);
  assert.equal(
    escenario.elementos.confirmPassword.classList.contains('error'),
    true
  );
  assert.equal(escenario.elementos.terminos.classList.contains('error'), true);
  assert.equal(
    escenario.elementos['password-error'].textContent,
    'Incluye al menos 1 mayúscula, 1 minúscula y 1 número'
  );
  assert.equal(
    escenario.elementos['confirmPassword-error'].textContent,
    'Las contraseñas no coinciden'
  );
  assert.equal(
    escenario.elementos['terminos-error'].textContent,
    'Debes aceptar los términos y condiciones'
  );
});

test('registro exitoso guarda sesión temporal y redirige al editor', async () => {
  const usuario = {
    id: 15,
    nombres: 'Laura',
    apellidos: 'Prueba',
    correo: 'laura@artify.local',
    rol: 'usuario',
  };
  const escenario = crearEscenarioRegistro({
    mensaje: 'Registro exitoso',
    usuario,
    token: 'token-registro',
  });
  escenario.elementos.nombres.value = usuario.nombres;
  escenario.elementos.apellidos.value = usuario.apellidos;
  escenario.elementos.email.value = usuario.correo;
  escenario.elementos.password.value = 'Password123';
  escenario.elementos.confirmPassword.value = 'Password123';
  escenario.elementos.terminos.checked = true;

  assert.equal(enviarFormulario(escenario), true);
  await esperarPromesas();

  assert.equal(escenario.solicitudes.length, 1);
  assert.equal(
    escenario.solicitudes[0].url,
    'http://api.artify.test/api/registro'
  );
  assert.deepEqual(JSON.parse(escenario.solicitudes[0].options.body), {
    nombres: usuario.nombres,
    apellidos: usuario.apellidos,
    correo: usuario.correo,
    password: 'Password123',
  });
  assert.equal(
    escenario.sessionStorage.getItem('artifyToken'),
    'token-registro'
  );
  assert.deepEqual(
    JSON.parse(escenario.sessionStorage.getItem('artifyUser')),
    usuario
  );
  assert.equal(escenario.localStorage.getItem('artifyToken'), null);
  assert.equal(escenario.window.location.href, './editor.html');
  assert.equal(escenario.botonSubmit.disabled, false);
  assert.equal(escenario.botonSubmit.textContent, 'Registrarse');
});

test('registro muestra error de backend sin guardar sesión', async () => {
  const escenario = crearEscenarioRegistro({
    mensaje: 'No fue posible completar el registro',
  });
  escenario.elementos.nombres.value = 'Laura';
  escenario.elementos.apellidos.value = 'Prueba';
  escenario.elementos.email.value = 'laura@artify.local';
  escenario.elementos.password.value = 'Password123';
  escenario.elementos.confirmPassword.value = 'Password123';
  escenario.elementos.terminos.checked = true;

  assert.equal(enviarFormulario(escenario), true);
  await esperarPromesas();

  assert.equal(escenario.solicitudes.length, 1);
  assert.equal(escenario.sessionStorage.getItem('artifyToken'), null);
  assert.equal(escenario.sessionStorage.getItem('artifyUser'), null);
  assert.equal(escenario.localStorage.getItem('artifyToken'), null);
  assert.equal(escenario.window.location.href, '');
  assert.equal(escenario.botonSubmit.disabled, false);
  assert.equal(escenario.botonSubmit.textContent, 'Registrarse');
  assert.equal(escenario.elementos.email.classList.contains('error'), true);
  assert.equal(
    escenario.elementos['email-error'].textContent,
    'No fue posible completar el registro'
  );
});

test('registro bloqueado por la API no guarda sesión ni redirige', async () => {
  const escenario = crearEscenarioRegistro({
    mensaje: 'Demasiadas solicitudes de registro. Intenta nuevamente más tarde',
  });
  escenario.elementos.nombres.value = 'Laura';
  escenario.elementos.apellidos.value = 'Prueba';
  escenario.elementos.email.value = 'laura@artify.local';
  escenario.elementos.password.value = 'Password123';
  escenario.elementos.confirmPassword.value = 'Password123';
  escenario.elementos.terminos.checked = true;

  assert.equal(enviarFormulario(escenario), true);
  await esperarPromesas();

  assert.equal(escenario.solicitudes.length, 1);
  assert.equal(escenario.sessionStorage.getItem('artifyToken'), null);
  assert.equal(escenario.sessionStorage.getItem('artifyUser'), null);
  assert.equal(escenario.window.location.href, '');
  assert.equal(
    escenario.elementos['email-error'].textContent,
    'Demasiadas solicitudes de registro. Intenta nuevamente más tarde'
  );
});
