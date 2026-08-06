const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const test = require('node:test');

const {
  crearToken,
  validarConfiguracionToken,
  verificarToken,
} = require('../utils/token');

function configurarEntorno(nodeEnv, tokenSecret) {
  if (nodeEnv === undefined) {
    delete process.env.NODE_ENV;
  } else {
    process.env.NODE_ENV = nodeEnv;
  }

  if (tokenSecret === undefined) {
    delete process.env.TOKEN_SECRET;
    return;
  }

  process.env.TOKEN_SECRET = tokenSecret;
}

function base64UrlEncode(valor) {
  return Buffer.from(valor)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function firmarPrueba(valor, secreto) {
  return crypto
    .createHmac('sha256', secreto)
    .update(valor)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function crearTokenPrueba(
  payload,
  secreto,
  headerPayload = { alg: 'HS256', typ: 'JWT' }
) {
  const header = base64UrlEncode(JSON.stringify(headerPayload));
  const body = base64UrlEncode(JSON.stringify(payload));
  const firma = firmarPrueba(`${header}.${body}`, secreto);

  return `${header}.${body}.${firma}`;
}

test('TOKEN_SECRET se valida según el entorno antes de iniciar el backend', () => {
  const nodeEnvOriginal = process.env.NODE_ENV;
  const tokenSecretOriginal = process.env.TOKEN_SECRET;
  const consoleWarnOriginal = console.warn;
  console.warn = () => {};

  try {
    configurarEntorno('development', undefined);
    assert.match(validarConfiguracionToken(), /^[a-f0-9]{64}$/);

    configurarEntorno('production', undefined);
    assert.throws(
      () => validarConfiguracionToken(),
      /TOKEN_SECRET no está configurado/
    );

    configurarEntorno('production', 'secreto-corto');
    assert.throws(
      () => validarConfiguracionToken(),
      /al menos 32 caracteres/
    );

    configurarEntorno(
      'production',
      'cambia_este_valor_por_un_secreto_largo_y_aleatorio'
    );
    assert.throws(
      () => validarConfiguracionToken(),
      /conserva un valor de ejemplo/
    );

    configurarEntorno(
      'production',
      'PEGA_AQUI_LOS_64_CARACTERES_GENERADOS_PARA_ARTIFY'
    );
    assert.throws(
      () => validarConfiguracionToken(),
      /conserva un valor de ejemplo/
    );

    const secretoSeguro = 'artify-produccion-2026-secreto-aleatorio-privado';
    configurarEntorno('production', secretoSeguro);
    assert.equal(validarConfiguracionToken(), secretoSeguro);
  } finally {
    console.warn = consoleWarnOriginal;
    configurarEntorno(nodeEnvOriginal, tokenSecretOriginal);
  }
});

test('tokens firmados se verifican y rechazan manipulación o expiración', () => {
  const nodeEnvOriginal = process.env.NODE_ENV;
  const tokenSecretOriginal = process.env.TOKEN_SECRET;
  const secretoSeguro = 'artify-token-test-2026-secreto-seguro-privado';

  try {
    configurarEntorno('test', secretoSeguro);

    const token = crearToken({
      id: 7,
      correo: 'ana@artify.local',
      rol: 'usuario',
    });
    const payload = verificarToken(token);

    assert.equal(payload.id, 7);
    assert.equal(payload.correo, 'ana@artify.local');
    assert.equal(payload.rol, 'usuario');
    assert.equal(typeof payload.exp, 'number');

    const partes = token.split('.');
    const bodyManipulado = base64UrlEncode(
      JSON.stringify({ ...payload, rol: 'admin' })
    );
    const tokenManipulado = `${partes[0]}.${bodyManipulado}.${partes[2]}`;
    assert.throws(() => verificarToken(tokenManipulado), /TOKEN_INVALIDO/);

    const tokenExpirado = crearTokenPrueba(
      {
        id: 7,
        correo: 'ana@artify.local',
        rol: 'usuario',
        exp: Math.floor(Date.now() / 1000) - 60,
      },
      secretoSeguro
    );
    assert.throws(() => verificarToken(tokenExpirado), /TOKEN_EXPIRADO/);
  } finally {
    configurarEntorno(nodeEnvOriginal, tokenSecretOriginal);
  }
});

test('tokens firmados rechazan encabezados y payloads no esperados', () => {
  const nodeEnvOriginal = process.env.NODE_ENV;
  const tokenSecretOriginal = process.env.TOKEN_SECRET;
  const secretoSeguro = 'artify-token-test-2026-secreto-seguro-privado';

  try {
    configurarEntorno('test', secretoSeguro);

    const tokenAlgoritmoInvalido = crearTokenPrueba(
      {
        id: 7,
        correo: 'ana@artify.local',
        rol: 'usuario',
        exp: Math.floor(Date.now() / 1000) + 60,
      },
      secretoSeguro,
      { alg: 'none', typ: 'JWT' }
    );
    assert.throws(
      () => verificarToken(tokenAlgoritmoInvalido),
      /TOKEN_INVALIDO/
    );

    const tokenPayloadInvalido = crearTokenPrueba(
      'payload-no-objeto',
      secretoSeguro
    );
    assert.throws(() => verificarToken(tokenPayloadInvalido), /TOKEN_INVALIDO/);
  } finally {
    configurarEntorno(nodeEnvOriginal, tokenSecretOriginal);
  }
});
