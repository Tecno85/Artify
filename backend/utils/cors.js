// ========== ORÍGENES CORS ==========
// La variable admite una lista separada por comas para desarrollo y despliegue.
function normalizarOrigenesCors(valor) {
  return (valor || '')
    .split(',')
    .map((origen) => origen.trim())
    .filter(Boolean);
}

function esOrigenHttpValido(origen) {
  if (origen === '*' || origen.toLowerCase() === 'null') {
    return false;
  }

  try {
    const url = new URL(origen);
    return (
      ['http:', 'https:'].includes(url.protocol) &&
      url.origin === origen &&
      Boolean(url.hostname)
    );
  } catch {
    return false;
  }
}

function obtenerOrigenesPermitidos() {
  const origenes = normalizarOrigenesCors(process.env.CORS_ORIGIN);

  if (process.env.NODE_ENV === 'production' && origenes.length === 0) {
    throw new Error(
      'CORS_ORIGIN debe contener al menos un origen autorizado en producción'
    );
  }

  if (
    process.env.NODE_ENV === 'production' &&
    origenes.some((origen) => !esOrigenHttpValido(origen))
  ) {
    throw new Error(
      'CORS_ORIGIN solo debe contener orígenes HTTP o HTTPS válidos en producción'
    );
  }

  return origenes;
}

// ========== EXPORTACIÓN ==========
module.exports = {
  esOrigenHttpValido,
  normalizarOrigenesCors,
  obtenerOrigenesPermitidos,
};
