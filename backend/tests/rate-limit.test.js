const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const test = require('node:test');

const { limitarIntentos } = require('../middlewares/rate-limit');

function crearRespuesta(statusCode = 200) {
  const res = new EventEmitter();
  res.statusCode = statusCode;
  res.headers = {};
  res.body = null;
  res.setHeader = (nombre, valor) => {
    res.headers[nombre.toLowerCase()] = String(valor);
  };
  res.status = (codigo) => {
    res.statusCode = codigo;
    return res;
  };
  res.json = (body) => {
    res.body = body;
    return res;
  };
  return res;
}

function ejecutarIntento(middleware, opciones = {}) {
  const req = {
    body: { correo: opciones.correo ?? 'ana@artify.local' },
    ip: opciones.ip ?? '127.0.0.1',
    originalUrl: opciones.originalUrl ?? '/api/login',
  };
  const res = crearRespuesta(opciones.statusCode ?? 401);
  let nextLlamado = false;

  middleware(req, res, () => {
    nextLlamado = true;
  });

  if (nextLlamado) {
    res.emit('finish');
  }

  return { nextLlamado, res };
}

test('limitador bloquea fallos por IP, ruta y correo normalizado', () => {
  const middleware = limitarIntentos({
    ventanaMs: 60_000,
    maxIntentos: 2,
    maxRegistros: 10,
    frecuenciaLimpieza: 100,
  });

  assert.equal(
    ejecutarIntento(middleware, { correo: ' ANA@ARTIFY.LOCAL ' }).nextLlamado,
    true
  );
  assert.equal(
    ejecutarIntento(middleware, { correo: 'ana@artify.local' }).nextLlamado,
    true
  );

  const bloqueado = ejecutarIntento(middleware, {
    correo: 'ana@artify.local',
  });
  assert.equal(bloqueado.nextLlamado, false);
  assert.equal(bloqueado.res.statusCode, 429);
  assert.deepEqual(bloqueado.res.body, {
    mensaje: 'Demasiados intentos. Intenta nuevamente más tarde',
  });
  assert.equal(bloqueado.res.headers['retry-after'], '60');

  const otroCorreo = ejecutarIntento(middleware, {
    correo: 'otro@artify.local',
  });
  assert.equal(otroCorreo.nextLlamado, true);
});
