const assert = require('node:assert/strict');
const test = require('node:test');
const { construirCsp } = require('../../scripts/lib/frontend-csp');

test('CSP de producción permite solamente el origen configurado para la API', () => {
  const csp = construirCsp('https://api.artify.test/ruta');
  assert.match(csp, /connect-src 'self' https:\/\/api\.artify\.test;/);
  assert.doesNotMatch(csp, /localhost|127\.0\.0\.1/);
  assert.match(csp, /script-src 'self'; script-src-attr 'none'/);
  assert.throws(() => construirCsp('http://api.artify.test'));
  assert.throws(() => construirCsp('https://usuario:clave@api.artify.test'));
});

test('CSP local permite la API de desarrollo sin relajar los scripts', () => {
  const csp = construirCsp();
  assert.match(csp, /connect-src 'self' http:\/\/localhost:3000 http:\/\/127\.0\.0\.1:3000/);
  assert.match(csp, /script-src 'self';/);
  assert.doesNotMatch(csp, /unsafe-eval/);
});
