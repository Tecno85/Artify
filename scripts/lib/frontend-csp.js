function construirCsp(apiUrl = '') {
  let origenesApi = 'http://localhost:3000 http://127.0.0.1:3000';
  if (apiUrl) {
    const url = new URL(apiUrl);
    const esLocal = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
    if ((url.protocol !== 'https:' && !(esLocal && url.protocol === 'http:')) || url.username || url.password) {
      throw new Error('ARTIFY_API_URL debe usar HTTPS (HTTP solo para localhost) y no contener credenciales');
    }
    origenesApi = url.origin;
  }
  return [
    "default-src 'self'",
    "script-src 'self'",
    "script-src-attr 'none'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob:",
    `connect-src 'self' ${origenesApi}`,
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'self'",
    "frame-src 'none'",
  ].join('; ');
}

module.exports = { construirCsp };
