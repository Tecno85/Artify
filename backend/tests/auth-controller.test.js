const assert = require('node:assert/strict');
const test = require('node:test');

const bcrypt = require('bcryptjs');

const DB_PATH = require.resolve('../config/db');
const AUTH_CONTROLLER_PATH = require.resolve('../controllers/auth.controller');

function cargarAuthControllerConDb(dbMock) {
  delete require.cache[AUTH_CONTROLLER_PATH];
  require.cache[DB_PATH] = {
    id: DB_PATH,
    filename: DB_PATH,
    loaded: true,
    exports: dbMock,
  };

  return require('../controllers/auth.controller');
}

function crearRespuesta() {
  return {
    statusCode: 200,
    body: null,
    status(codigo) {
      this.statusCode = codigo;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

test('login rechaza cuentas activas con rol no permitido sin emitir token', () => {
  const password = 'PruebaArtify123!';
  let consultasEjecutadas = 0;
  const dbMock = {
    query(_query, _params, callback) {
      consultasEjecutadas += 1;
      callback(null, [
        {
          usr_id_usuario: 7,
          usr_nombres: 'Ana',
          usr_apellidos: 'Prueba',
          usr_correo: 'ana@artify.local',
          usr_contrasena: bcrypt.hashSync(password, 10),
          usr_estado_usuario: 'activo',
          usr_rol: 'moderador',
        },
      ]);
    },
  };
  const { login } = cargarAuthControllerConDb(dbMock);
  const req = {
    body: {
      correo: 'ana@artify.local',
      password,
    },
  };
  const res = crearRespuesta();

  try {
    login(req, res);

    assert.equal(consultasEjecutadas, 1);
    assert.equal(res.statusCode, 401);
    assert.deepEqual(res.body, { mensaje: 'Credenciales incorrectas' });
    assert.equal(Object.hasOwn(res.body, 'token'), false);
  } finally {
    delete require.cache[AUTH_CONTROLLER_PATH];
    delete require.cache[DB_PATH];
  }
});
