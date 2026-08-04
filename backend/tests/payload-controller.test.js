const assert = require('node:assert/strict');
const test = require('node:test');

const DB_PATH = require.resolve('../config/db');
const CONTROLADORES = [
  require.resolve('../controllers/auth.controller'),
  require.resolve('../controllers/configuracion.controller'),
  require.resolve('../controllers/actividad.controller'),
  require.resolve('../controllers/sesion.controller'),
];

function cargarControladoresConDb(dbMock) {
  for (const ruta of CONTROLADORES) {
    delete require.cache[ruta];
  }

  require.cache[DB_PATH] = {
    id: DB_PATH,
    filename: DB_PATH,
    loaded: true,
    exports: dbMock,
  };

  return {
    auth: require('../controllers/auth.controller'),
    configuracion: require('../controllers/configuracion.controller'),
    actividad: require('../controllers/actividad.controller'),
    sesion: require('../controllers/sesion.controller'),
  };
}

function limpiarControladores() {
  for (const ruta of CONTROLADORES) {
    delete require.cache[ruta];
  }
  delete require.cache[DB_PATH];
}

function crearDbSinConsultas() {
  let consultas = 0;

  return {
    db: {
      query() {
        consultas += 1;
        throw new Error('No debía consultar la base de datos');
      },
      promise() {
        consultas += 1;
        throw new Error('No debía preparar consultas a base de datos');
      },
    },
    obtenerConsultas() {
      return consultas;
    },
  };
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

test('login rechaza cuerpo null antes de consultar credenciales', () => {
  const dbMock = crearDbSinConsultas();
  const { auth } = cargarControladoresConDb(dbMock.db);
  const res = crearRespuesta();

  try {
    auth.login({ body: null }, res);

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.mensaje, 'Ingresa un correo válido');
    assert.equal(dbMock.obtenerConsultas(), 0);
  } finally {
    limpiarControladores();
  }
});

test('configuración rechaza arrays antes de guardar preferencias', () => {
  const dbMock = crearDbSinConsultas();
  const { configuracion } = cargarControladoresConDb(dbMock.db);
  const res = crearRespuesta();

  try {
    configuracion.guardarConfiguracion({ body: [] }, res);

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.mensaje, 'Selecciona una calidad de exportación válida');
    assert.equal(dbMock.obtenerConsultas(), 0);
  } finally {
    limpiarControladores();
  }
});

test('sesión de edición rechaza cuerpos no objeto antes de abrir transacción', async () => {
  const dbMock = crearDbSinConsultas();
  const { sesion } = cargarControladoresConDb(dbMock.db);
  const inicio = crearRespuesta();
  const cierre = crearRespuesta();

  try {
    await sesion.iniciarSesionEdicion({ body: null }, inicio);
    await sesion.cerrarSesionEdicion({ body: [] }, cierre);

    assert.equal(inicio.statusCode, 400);
    assert.equal(inicio.body.mensaje, 'Datos de sesión inválidos');
    assert.equal(cierre.statusCode, 400);
    assert.equal(cierre.body.mensaje, 'Datos de sesión inválidos');
    assert.equal(dbMock.obtenerConsultas(), 0);
  } finally {
    limpiarControladores();
  }
});

test('actividad rechaza operación e imagen no objeto antes de consultar sesión', async () => {
  const dbMock = crearDbSinConsultas();
  const { actividad } = cargarControladoresConDb(dbMock.db);
  const operacion = crearRespuesta();
  const imagen = crearRespuesta();

  try {
    await actividad.registrarOperacion({ body: null }, operacion);
    await actividad.registrarImagen({ body: [] }, imagen);

    assert.equal(operacion.statusCode, 400);
    assert.equal(operacion.body.mensaje, 'Datos de operación inválidos');
    assert.equal(imagen.statusCode, 400);
    assert.equal(imagen.body.mensaje, 'Datos de imagen inválidos');
    assert.equal(dbMock.obtenerConsultas(), 0);
  } finally {
    limpiarControladores();
  }
});
