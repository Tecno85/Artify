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

function crearDbConSesionAjena() {
  const eventos = [];
  const dbPromise = {
    async beginTransaction() {
      eventos.push('begin');
    },
    async query(_consulta, params) {
      eventos.push(['query', params]);
      return [
        [
          {
            ses_id_sesion: 91,
            ses_usr_id_usuario: 99,
            ses_estado_sesion: 'activa',
          },
        ],
      ];
    },
    async rollback() {
      eventos.push('rollback');
    },
    async commit() {
      eventos.push('commit');
    },
  };

  return {
    db: {
      promise() {
        return dbPromise;
      },
    },
    obtenerEventos() {
      return eventos;
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

test('actividad rechaza metadatos de imagen que exceden 16 MP', async () => {
  const dbMock = crearDbSinConsultas();
  const { actividad } = cargarControladoresConDb(dbMock.db);
  const imagen = crearRespuesta();

  try {
    await actividad.registrarImagen(
      {
        body: {
          idUsuario: 7,
          idSesion: 91,
          nombreOriginal: 'demasiado-grande.png',
          formatoOriginal: 'png',
          tamanoOriginal: 1024,
          anchoOriginal: 4001,
          altoOriginal: 4000,
        },
      },
      imagen
    );

    assert.equal(imagen.statusCode, 400);
    assert.equal(imagen.body.mensaje, 'Datos de imagen inválidos');
    assert.equal(dbMock.obtenerConsultas(), 0);
  } finally {
    limpiarControladores();
  }
});

test('actividad rechaza metadatos con controles o rutas antes de consultar', async () => {
  const dbMock = crearDbSinConsultas();
  const { actividad } = cargarControladoresConDb(dbMock.db);
  const operacionTipo = crearRespuesta();
  const operacionDescripcion = crearRespuesta();
  const imagen = crearRespuesta();

  try {
    await actividad.registrarOperacion(
      {
        body: {
          idUsuario: 7,
          idSesion: 91,
          tipo: `filtro${String.fromCharCode(7)}`,
          descripcion: 'Filtro aplicado',
        },
      },
      operacionTipo
    );
    await actividad.registrarOperacion(
      {
        body: {
          idUsuario: 7,
          idSesion: 91,
          tipo: 'filtro',
          descripcion: `Filtro${String.fromCharCode(10)}aplicado`,
        },
      },
      operacionDescripcion
    );
    await actividad.registrarImagen(
      {
        body: {
          idUsuario: 7,
          idSesion: 91,
          nombreOriginal: '../ataque.png',
          formatoOriginal: 'png',
          tamanoOriginal: 1024,
          anchoOriginal: 640,
          altoOriginal: 480,
        },
      },
      imagen
    );

    assert.equal(operacionTipo.statusCode, 400);
    assert.equal(operacionTipo.body.mensaje, 'Datos de operación inválidos');
    assert.equal(operacionDescripcion.statusCode, 400);
    assert.equal(
      operacionDescripcion.body.mensaje,
      'Datos de operación inválidos'
    );
    assert.equal(imagen.statusCode, 400);
    assert.equal(imagen.body.mensaje, 'Datos de imagen inválidos');
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

test('sesión de edición rechaza cuerpos no objeto y cierres ajenos', async () => {
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

  const dbSesionAjena = crearDbConSesionAjena();
  const { sesion: sesionConDb } = cargarControladoresConDb(dbSesionAjena.db);
  const cierreAjeno = crearRespuesta();

  try {
    await sesionConDb.cerrarSesionEdicion(
      {
        auth: { id: 7, rol: 'usuario' },
        body: { idSesion: 91 },
      },
      cierreAjeno
    );

    assert.equal(cierreAjeno.statusCode, 404);
    assert.equal(cierreAjeno.body.mensaje, 'Sesión no encontrada');
    assert.deepEqual(dbSesionAjena.obtenerEventos(), [
      'begin',
      ['query', [91]],
      'rollback',
    ]);
  } finally {
    limpiarControladores();
  }

  const dbSesionAjenaAdmin = crearDbConSesionAjena();
  const { sesion: sesionConAdmin } = cargarControladoresConDb(
    dbSesionAjenaAdmin.db
  );
  const cierreAjenoAdmin = crearRespuesta();

  try {
    await sesionConAdmin.cerrarSesionEdicion(
      {
        auth: { id: 7, rol: 'admin' },
        body: { idSesion: 91 },
      },
      cierreAjenoAdmin
    );

    assert.equal(cierreAjenoAdmin.statusCode, 404);
    assert.equal(cierreAjenoAdmin.body.mensaje, 'Sesión no encontrada');
    assert.deepEqual(dbSesionAjenaAdmin.obtenerEventos(), [
      'begin',
      ['query', [91]],
      'rollback',
    ]);
  } finally {
    limpiarControladores();
  }
});

test('actividad rechaza payloads inválidos y sesiones ajenas', async () => {
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

  const dbOperacionAjena = crearDbConSesionAjena();
  const { actividad: actividadOperacion } = cargarControladoresConDb(
    dbOperacionAjena.db
  );
  const operacionAjena = crearRespuesta();

  try {
    await actividadOperacion.registrarOperacion(
      {
        body: {
          idUsuario: 7,
          idSesion: 91,
          tipo: 'filtro',
          descripcion: 'Intento con sesión ajena',
        },
      },
      operacionAjena
    );

    assert.equal(operacionAjena.statusCode, 404);
    assert.equal(operacionAjena.body.mensaje, 'Sesión no encontrada');
    assert.deepEqual(dbOperacionAjena.obtenerEventos(), [
      'begin',
      ['query', [91]],
      'rollback',
    ]);
  } finally {
    limpiarControladores();
  }

  const dbImagenAjena = crearDbConSesionAjena();
  const { actividad: actividadImagen } = cargarControladoresConDb(
    dbImagenAjena.db
  );
  const imagenAjena = crearRespuesta();

  try {
    await actividadImagen.registrarImagen(
      {
        body: {
          idUsuario: 7,
          idSesion: 91,
          nombreOriginal: 'ajena.png',
          formatoOriginal: 'png',
          tamanoOriginal: 1024,
          anchoOriginal: 640,
          altoOriginal: 480,
        },
      },
      imagenAjena
    );

    assert.equal(imagenAjena.statusCode, 404);
    assert.equal(imagenAjena.body.mensaje, 'Sesión no encontrada');
    assert.deepEqual(dbImagenAjena.obtenerEventos(), [
      'begin',
      ['query', [91]],
      'rollback',
    ]);
  } finally {
    limpiarControladores();
  }
});
