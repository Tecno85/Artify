const assert = require('node:assert/strict');
const test = require('node:test');

const {
  crearContextoFrontend,
  crearElemento,
  ejecutarScript,
} = require('./helpers/frontend-vm');

function crearEscenarioRegistro() {
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
  const document = {
    body: crearElemento(),
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
      return { json: async () => ({ mensaje: 'Registro exitoso' }) };
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
