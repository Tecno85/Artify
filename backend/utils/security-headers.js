// ========== CABECERAS DE SEGURIDAD ==========
const HSTS_PRODUCCION = 'max-age=31536000; includeSubDomains';

function aplicarCabecerasSeguridad(res, entorno = process.env.NODE_ENV) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  if (entorno === 'production') {
    res.setHeader('Strict-Transport-Security', HSTS_PRODUCCION);
  }
}

// ========== EXPORTACIÓN ==========
module.exports = {
  aplicarCabecerasSeguridad,
};
