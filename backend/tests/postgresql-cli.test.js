const assert = require('node:assert/strict');
const test = require('node:test');

const {
  validarDestinoMigraciones,
  validarOrigenRespaldoLocal,
} = require('../../scripts/lib/postgresql-cli');

const baseLocalTest = {
  host: 'localhost',
  port: '5432',
  user: 'postgres',
  password: 'postgres',
  database: 'artify_test',
};

test('guardas de migración permiten bases de prueba locales sin confirmación adicional', () => {
  assert.equal(validarDestinoMigraciones(baseLocalTest, {}), true);
});

test('guardas de migración exigen confirmación para bases no terminadas en _test', () => {
  const destino = { ...baseLocalTest, database: 'artify_db' };

  assert.throws(
    () => validarDestinoMigraciones(destino, {}),
    /ALLOW_NON_TEST_MIGRATIONS=true/
  );

  assert.equal(
    validarDestinoMigraciones(destino, {
      ALLOW_NON_TEST_MIGRATIONS: 'true',
    }),
    true
  );
});

test('guardas de migración exigen confirmación remota explícita', () => {
  const destino = {
    ...baseLocalTest,
    host: 'db.example.com',
  };

  assert.throws(
    () => validarDestinoMigraciones(destino, {}),
    /ALLOW_REMOTE_MIGRATIONS=true/
  );

  assert.equal(
    validarDestinoMigraciones(destino, {
      ALLOW_REMOTE_MIGRATIONS: 'true',
    }),
    true
  );
});

test('guardas de migración bloquean bases administrativas', () => {
  assert.throws(
    () =>
      validarDestinoMigraciones(
        { ...baseLocalTest, database: 'postgres' },
        {
          ALLOW_NON_TEST_MIGRATIONS: 'true',
        }
      ),
    /base administrativa/
  );
});

test('verificación de respaldo solo acepta bases locales funcionales', () => {
  assert.equal(validarOrigenRespaldoLocal(baseLocalTest), true);

  assert.throws(
    () =>
      validarOrigenRespaldoLocal({
        ...baseLocalTest,
        host: 'db.example.com',
      }),
    /PostgreSQL local/
  );

  assert.throws(
    () =>
      validarOrigenRespaldoLocal({
        ...baseLocalTest,
        database: 'template1',
      }),
    /base administrativa/
  );
});
