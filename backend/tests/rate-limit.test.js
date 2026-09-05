const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const test = require('node:test');

const { limitarIntentos, limitarSolicitudesPorIp } = require('../middlewares/rate-limit');

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

test('limitador permite configurar qué respuestas fallidas cuentan', () => {
  const middleware = limitarIntentos({
    ventanaMs: 60_000,
    maxIntentos: 2,
    maxRegistros: 10,
    frecuenciaLimpieza: 100,
    contarRespuesta: (statusCode) => statusCode >= 400 && statusCode < 500,
  });

  assert.equal(
    ejecutarIntento(middleware, {
      originalUrl: '/api/registro',
      statusCode: 400,
    }).nextLlamado,
    true
  );
  assert.equal(
    ejecutarIntento(middleware, {
      originalUrl: '/api/registro',
      statusCode: 400,
    }).nextLlamado,
    true
  );

  const bloqueado = ejecutarIntento(middleware, {
    originalUrl: '/api/registro',
    statusCode: 400,
  });

  assert.equal(bloqueado.nextLlamado, false);
  assert.equal(bloqueado.res.statusCode, 429);
});

test('queries, mayúsculas y barra final no reinician el bloqueo de login', () => {
  const middleware = limitarIntentos({ maxIntentos: 2 });
  ejecutarIntento(middleware);
  ejecutarIntento(middleware);
  for (const originalUrl of ['/api/login?intento=1', '/API/LOGIN', '/api/login/']) {
    const resultado = ejecutarIntento(middleware, { originalUrl });
    assert.equal(resultado.nextLlamado, false);
    assert.equal(resultado.res.statusCode, 429);
  }
});

test('el límite por IP cuenta registros exitosos aunque cambien correo y URL', () => {
  const middleware = limitarSolicitudesPorIp({ maxIntentos: 2 });
  for (let indice = 0; indice < 2; indice++) {
    assert.equal(ejecutarIntento(middleware, {
      originalUrl: `/api/registro?intento=${indice}`,
      correo: `cuenta${indice}@artify.local`,
      statusCode: 200,
    }).nextLlamado, true);
  }
  assert.equal(ejecutarIntento(middleware, {
    originalUrl: '/api/registro?intento=3',
    correo: 'otra@artify.local', statusCode: 200,
  }).res.statusCode, 429);
  assert.equal(ejecutarIntento(middleware, { ip: '127.0.0.2' }).nextLlamado, true);
});

test('solicitudes simultáneas reservan su intento antes de terminar', () => {
  const middleware = limitarIntentos({ maxIntentos: 2 });
  const req = { ip: '127.0.0.1', originalUrl: '/api/login', body: { correo: 'a@artify.local' } };
  const respuestas = [crearRespuesta(401), crearRespuesta(401), crearRespuesta(401)];
  let admitidas = 0;
  for (const res of respuestas) middleware(req, res, () => admitidas++);
  assert.equal(admitidas, 2);
  assert.equal(respuestas[2].statusCode, 429);
});

test('el límite de memoria no expulsa contadores bloqueados y libera entradas vencidas', (t) => {
  t.mock.timers.enable({ apis: ['Date'], now: 1000 });
  const middleware = limitarSolicitudesPorIp({ maxIntentos: 1, maxRegistros: 1, ventanaMs: 1000 });
  assert.equal(ejecutarIntento(middleware).nextLlamado, true);
  assert.equal(ejecutarIntento(middleware, { ip: '127.0.0.2' }).res.statusCode, 429);
  assert.equal(ejecutarIntento(middleware).res.statusCode, 429);
  t.mock.timers.tick(1000);
  assert.equal(ejecutarIntento(middleware, { ip: '127.0.0.2' }).nextLlamado, true);
});

test('las respuestas correctas y errores del servidor no consumen el límite de fallos', () => {
  const middleware = limitarIntentos({ maxIntentos: 2 });
  for (const statusCode of [200, 200, 500, 200, 500]) {
    assert.equal(ejecutarIntento(middleware, { statusCode }).nextLlamado, true);
  }
  ejecutarIntento(middleware);
  ejecutarIntento(middleware);
  assert.equal(ejecutarIntento(middleware).res.statusCode, 429);
});

test('una respuesta tardía no altera el contador de una ventana nueva', (t) => {
  t.mock.timers.enable({ apis: ['Date'], now: 1000 });
  const middleware = limitarIntentos({ maxIntentos: 1, ventanaMs: 1000 });
  const resAntigua = crearRespuesta(200);
  middleware({ ip: '127.0.0.1', originalUrl: '/api/login', body: { correo: 'ana@artify.local' } }, resAntigua, () => {});
  t.mock.timers.tick(1000);
  ejecutarIntento(middleware);
  resAntigua.emit('finish');
  assert.equal(ejecutarIntento(middleware).res.statusCode, 429);
});
