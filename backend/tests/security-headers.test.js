const assert = require('node:assert/strict');
const test = require('node:test');

const {
  aplicarCabecerasSeguridad,
} = require('../utils/security-headers');

function crearRespuesta() {
  const headers = {};

  return {
    headers,
    setHeader(nombre, valor) {
      headers[nombre.toLowerCase()] = valor;
    },
  };
}

test('cabeceras de seguridad incluyen HSTS solo en producción', () => {
  const desarrollo = crearRespuesta();
  aplicarCabecerasSeguridad(desarrollo, 'development');

  assert.equal(desarrollo.headers['x-content-type-options'], 'nosniff');
  assert.equal(desarrollo.headers['x-frame-options'], 'DENY');
  assert.equal(
    desarrollo.headers['referrer-policy'],
    'strict-origin-when-cross-origin'
  );
  assert.equal(
    desarrollo.headers['permissions-policy'],
    'camera=(), microphone=(), geolocation=()'
  );
  assert.equal(desarrollo.headers['strict-transport-security'], undefined);

  const produccion = crearRespuesta();
  aplicarCabecerasSeguridad(produccion, 'production');

  assert.equal(
    produccion.headers['strict-transport-security'],
    'max-age=31536000; includeSubDomains'
  );
});
