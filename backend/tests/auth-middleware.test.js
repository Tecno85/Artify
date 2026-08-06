const assert = require('node:assert/strict');
const test = require('node:test');

const { crearToken } = require('../utils/token');

const DB_PATH = require.resolve('../config/db');
const AUTH_PATH = require.resolve('../middlewares/auth');

function cargarAuthConDb(dbMock) {
  delete require.cache[AUTH_PATH];
  require.cache[DB_PATH] = {
    id: DB_PATH,
    filename: DB_PATH,
    loaded: true,
    exports: dbMock,
  };

  return require('../middlewares/auth');
}

function crearRespuesta() {
  return {
    statusCode: null,
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

test('autenticación rechaza cuentas activas con rol no permitido', async () => {
  const nodeEnvOriginal = process.env.NODE_ENV;
  const tokenSecretOriginal = process.env.TOKEN_SECRET;
  process.env.NODE_ENV = 'test';
  process.env.TOKEN_SECRET = 'artify-token-test-2026-secreto-seguro-privado';

  const dbMock = {
    query(_query, _params, callback) {
      callback(null, [
        {
          usr_id_usuario: 7,
          usr_correo: 'ana@artify.local',
          usr_rol: 'moderador',
          usr_estado_usuario: 'activo',
        },
      ]);
    },
  };
  const { autenticarToken } = cargarAuthConDb(dbMock);
  const token = crearToken({
    id: 7,
    correo: 'ana@artify.local',
    rol: 'usuario',
  });
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = crearRespuesta();
  let nextEjecutado = false;

  try {
    autenticarToken(req, res, () => {
      nextEjecutado = true;
    });

    assert.equal(nextEjecutado, false);
    assert.equal(res.statusCode, 401);
    assert.deepEqual(res.body, {
      mensaje: 'Token ausente, inválido o expirado',
    });
  } finally {
    if (nodeEnvOriginal === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = nodeEnvOriginal;
    }

    if (tokenSecretOriginal === undefined) {
      delete process.env.TOKEN_SECRET;
    } else {
      process.env.TOKEN_SECRET = tokenSecretOriginal;
    }

    delete require.cache[AUTH_PATH];
    delete require.cache[DB_PATH];
  }
});

test('autorización administrativa exige rol admin vigente', () => {
  const { requiereAdmin } = cargarAuthConDb({ query() {} });
  const req = { auth: { id: 7, rol: 'usuario' } };
  const res = crearRespuesta();
  let nextEjecutado = false;

  requiereAdmin(req, res, () => {
    nextEjecutado = true;
  });

  assert.equal(nextEjecutado, false);
  assert.equal(res.statusCode, 403);
  assert.deepEqual(res.body, {
    mensaje: 'Se requieren permisos de administrador',
  });

  delete require.cache[AUTH_PATH];
  delete require.cache[DB_PATH];
});

test('autorización por propietario rechaza IDs malformados o ajenos', () => {
  const {
    autorizarUsuarioPorParametro,
    autorizarUsuarioPorBody,
    autorizarPropietarioPorBody,
  } = cargarAuthConDb({ query() {} });

  const casos = [
    {
      middleware: autorizarUsuarioPorParametro('id'),
      req: { auth: { id: 7, rol: 'usuario' }, params: { id: 'abc' } },
      statusCode: 400,
      mensaje: 'Identificador de usuario inválido',
    },
    {
      middleware: autorizarUsuarioPorParametro('id'),
      req: { auth: { id: 7, rol: 'usuario' }, params: { id: '8' } },
      mensaje: 'No puedes acceder a recursos de otro usuario',
    },
    {
      middleware: autorizarUsuarioPorBody('idUsuario'),
      req: { auth: { id: 7, rol: 'usuario' }, body: { idUsuario: '8' } },
      mensaje: 'No puedes modificar recursos de otro usuario',
    },
    {
      middleware: autorizarPropietarioPorBody('idUsuario'),
      req: { auth: { id: 7, rol: 'admin' }, body: { idUsuario: '8' } },
      mensaje: 'No puedes modificar recursos de otro usuario',
    },
  ];

  for (const caso of casos) {
    const res = crearRespuesta();
    let nextEjecutado = false;
    caso.middleware(caso.req, res, () => {
      nextEjecutado = true;
    });

    assert.equal(nextEjecutado, false);
    assert.equal(res.statusCode, caso.statusCode || 403);
    assert.deepEqual(res.body, { mensaje: caso.mensaje });
  }

  delete require.cache[AUTH_PATH];
  delete require.cache[DB_PATH];
});

test('consultas personales requieren propietario exacto aunque el rol sea admin', () => {
  const { autorizarUsuarioPorParametro } = cargarAuthConDb({ query() {} });
  const middleware = autorizarUsuarioPorParametro('id');
  const res = crearRespuesta();
  let nextEjecutado = false;

  middleware(
    { auth: { id: 7, rol: 'admin' }, params: { id: '8' } },
    res,
    () => {
      nextEjecutado = true;
    }
  );

  assert.equal(nextEjecutado, false);
  assert.equal(res.statusCode, 403);
  assert.deepEqual(res.body, {
    mensaje: 'No puedes acceder a recursos de otro usuario',
  });

  delete require.cache[AUTH_PATH];
  delete require.cache[DB_PATH];
});
