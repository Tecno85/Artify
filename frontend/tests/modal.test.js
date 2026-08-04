const assert = require('node:assert/strict');
const test = require('node:test');

const {
  crearContextoFrontend,
  crearElemento,
  ejecutarScript,
} = require('./helpers/frontend-vm');

function crearBoton(id) {
  return crearElemento({
    id,
    offsetParent: {},
    focus() {
      this.enfocado = true;
      this.ownerDocument.activeElement = this;
    },
  });
}

test('modal accesible atrapa foco y lo restaura al cerrar', () => {
  const disparador = crearBoton('abrir');
  const primero = crearBoton('primero');
  const ultimo = crearBoton('ultimo');
  const modal = crearElemento({
    style: { display: 'none' },
    querySelector(selector) {
      return selector === '#primero' ? primero : null;
    },
    querySelectorAll() {
      return [primero, ultimo];
    },
  });
  const eventos = new Map();
  const document = {
    activeElement: disparador,
    addEventListener(tipo, manejador) {
      eventos.set(tipo, manejador);
    },
    querySelectorAll(selector) {
      return selector === '[role="dialog"][aria-modal="true"]'
        ? [modal]
        : [];
    },
  };
  disparador.ownerDocument = document;
  primero.ownerDocument = document;
  ultimo.ownerDocument = document;
  const contextoFrontend = crearContextoFrontend({ document });

  ejecutarScript(contextoFrontend.contexto, 'modal.js');
  contextoFrontend.contexto.modalPrueba = modal;
  contextoFrontend.contexto.disparadorPrueba = disparador;
  contextoFrontend.window.ArtifyModal.abrir(modal, {
    disparador,
    focoInicial: '#primero',
  });

  assert.equal(modal.style.display, 'flex');
  assert.equal(document.activeElement, primero);

  let tabPrevenido = false;
  document.activeElement = ultimo;
  eventos.get('keydown')({
    key: 'Tab',
    shiftKey: false,
    preventDefault() {
      tabPrevenido = true;
    },
  });

  assert.equal(tabPrevenido, true);
  assert.equal(document.activeElement, primero);

  contextoFrontend.window.ArtifyModal.cerrar(modal);
  assert.equal(modal.style.display, 'none');
  assert.equal(document.activeElement, disparador);
});
