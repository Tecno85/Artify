const assert = require('node:assert/strict');
const test = require('node:test');

const {
  parsearConfiguracionAvanzada,
} = require('../utils/configuracion');
const {
  esRolPermitido,
  normalizarCuerpoEntrada,
  normalizarDatosUsuario,
  normalizarIdEntero,
  validarConfiguracion,
  validarCredenciales,
  validarEdicionUsuario,
  validarUsuario,
} = require('../utils/validacion');

test('creación y edición comparten normalización y reglas personales', () => {
  const datosNormalizados = normalizarDatosUsuario({
    nombres: '  Ana María  ',
    apellidos: '  Pérez Díaz  ',
    correo: '  ANA.PEREZ@EXAMPLE.COM  ',
    password: 'ClaveSegura123!',
    estado: 'activo',
  });

  assert.deepEqual(datosNormalizados, {
    nombres: 'Ana María',
    apellidos: 'Pérez Díaz',
    correo: 'ana.perez@example.com',
    password: 'ClaveSegura123!',
    estado: 'activo',
  });
  assert.equal(validarUsuario(datosNormalizados), null);
  assert.equal(validarEdicionUsuario(datosNormalizados), null);

  assert.equal(
    validarUsuario({
      nombres: 'Ana María',
      apellidos: 'Pérez Díaz',
      correo: 'ana.perez@example.com',
      password: 'ClaveSegura123!',
    }),
    null
  );
  assert.equal(
    validarCredenciales({
      correo: datosNormalizados.correo,
      password: 'aaaaaaaa',
    }),
    null
  );
  assert.equal(
    validarUsuario({ ...datosNormalizados, password: 'aaaaaaaa' }),
    'La contraseña debe incluir al menos una mayúscula, una minúscula y un número'
  );
  assert.equal(
    validarUsuario({
      ...datosNormalizados,
      password: `A1${'a'.repeat(127)}`,
    }),
    'La contraseña no puede superar 128 caracteres'
  );

  const casosPersonalesInvalidos = [
    ['nombres', ' ', 'Ingresa nombres válidos'],
    ['apellidos', ' ', 'Ingresa apellidos válidos'],
  ];

  for (const [campo, valor, mensaje] of casosPersonalesInvalidos) {
    const datosInvalidos = { ...datosNormalizados, [campo]: valor };
    assert.equal(validarUsuario(datosInvalidos), mensaje);
    assert.equal(validarEdicionUsuario(datosInvalidos), mensaje);
  }
});

test('cuerpos de entrada solo aceptan objetos JSON simples', () => {
  const cuerpo = { idUsuario: 7 };

  assert.equal(normalizarCuerpoEntrada(cuerpo), cuerpo);
  assert.deepEqual(normalizarCuerpoEntrada(null), {});
  assert.deepEqual(normalizarCuerpoEntrada(undefined), {});
  assert.deepEqual(normalizarCuerpoEntrada([]), {});
  assert.deepEqual(normalizarDatosUsuario(null), {
    nombres: undefined,
    apellidos: undefined,
    correo: undefined,
    password: undefined,
    estado: undefined,
  });
});

test('identificadores enteros aceptan solo valores positivos seguros', () => {
  assert.equal(normalizarIdEntero(1), 1);
  assert.equal(normalizarIdEntero('27'), 27);
  assert.equal(
    normalizarIdEntero(Number.MAX_SAFE_INTEGER),
    Number.MAX_SAFE_INTEGER
  );

  for (const valor of [
    0,
    -1,
    1.5,
    Number.MAX_SAFE_INTEGER + 1,
    '0',
    '01',
    '12abc',
    ' 12 ',
    '',
    null,
    undefined,
  ]) {
    assert.equal(normalizarIdEntero(valor), null);
  }
});

test('roles de usuario aceptan únicamente perfiles autorizados', () => {
  assert.equal(esRolPermitido('usuario'), true);
  assert.equal(esRolPermitido('admin'), true);

  for (const valor of ['moderador', 'root', '', null, undefined, 1]) {
    assert.equal(esRolPermitido(valor), false);
  }
});

test('configuración de usuario valida preferencias permitidas y booleanos estrictos', () => {
  const configuracionValida = {
    calidadExportacion: 'alta',
    notificaciones: true,
    formatoDefecto: 'webp',
    autoguardado: false,
  };

  assert.equal(validarConfiguracion(configuracionValida), null);
  assert.equal(
    validarConfiguracion({
      ...configuracionValida,
      calidadExportacion: 'maxima',
    }),
    'Selecciona una calidad de exportación válida'
  );
  assert.equal(
    validarConfiguracion({
      ...configuracionValida,
      formatoDefecto: 'gif',
    }),
    'Selecciona un formato por defecto válido'
  );
  assert.equal(
    validarConfiguracion({
      ...configuracionValida,
      notificaciones: 'true',
    }),
    'Las preferencias booleanas son inválidas'
  );
  assert.equal(
    validarConfiguracion({
      ...configuracionValida,
      autoguardado: 0,
    }),
    'Las preferencias booleanas son inválidas'
  );
});

test('configuración avanzada tolera JSON inválido y objetos ya parseados', () => {
  assert.deepEqual(parsearConfiguracionAvanzada(null), {});
  assert.deepEqual(parsearConfiguracionAvanzada(''), {});
  assert.deepEqual(parsearConfiguracionAvanzada('{json-invalido'), {});
  assert.deepEqual(
    parsearConfiguracionAvanzada(
      '{"notificaciones":false,"formatoDefecto":"webp","autoguardado":true}'
    ),
    {
      notificaciones: false,
      formatoDefecto: 'webp',
      autoguardado: true,
    }
  );

  const configuracion = {
    notificaciones: true,
    formatoDefecto: 'png',
    autoguardado: false,
  };
  assert.equal(parsearConfiguracionAvanzada(configuracion), configuracion);
});
