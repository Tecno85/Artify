// ========== LIMITADOR SIMPLE DE INTENTOS FALLIDOS ==========
// El registro vive en memoria y limita credenciales por IP, ruta y correo.
// Una instancia distribuida requeriría un almacén compartido para aplicar el mismo criterio.
function limitarIntentos({
  ventanaMs = 15 * 60 * 1000,
  maxIntentos = 10,
  maxRegistros = 1000,
  frecuenciaLimpieza = 100,
  mensaje = 'Demasiados intentos. Intenta nuevamente más tarde',
  contarRespuesta = (statusCode) => statusCode === 401,
} = {}) {
  const intentos = new Map();
  let solicitudesDesdeLimpieza = 0;

  function limpiarRegistrosExpirados(ahora) {
    for (const [clave, registro] of intentos.entries()) {
      if (registro.expira <= ahora) {
        intentos.delete(clave);
      }
    }
  }

  function asegurarCapacidad(ahora) {
    limpiarRegistrosExpirados(ahora);

    while (intentos.size >= maxRegistros) {
      const claveMasAntigua = intentos.keys().next().value;
      if (claveMasAntigua === undefined) break;
      intentos.delete(claveMasAntigua);
    }
  }

  return (req, res, next) => {
    const ahora = Date.now();
    solicitudesDesdeLimpieza += 1;

    if (solicitudesDesdeLimpieza >= frecuenciaLimpieza) {
      limpiarRegistrosExpirados(ahora);
      solicitudesDesdeLimpieza = 0;
    }

    const correo = String(req.body?.correo || '').trim().toLowerCase();
    // Separar por ruta y correo evita que un intento sobre una cuenta bloquee otras.
    const clave = `${req.ip}:${req.originalUrl}:${correo}`;
    let registro = intentos.get(clave);

    if (registro?.expira <= ahora) {
      intentos.delete(clave);
      registro = null;
    }

    if (registro?.total >= maxIntentos) {
      const esperaSegundos = Math.max(
        1,
        Math.ceil((registro.expira - ahora) / 1000)
      );
      res.setHeader('Retry-After', String(esperaSegundos));
      return res.status(429).json({ mensaje });
    }

    // Contabilizar al terminar permite distinguir respuestas fallidas
    // configurables de una operación correcta, que limpia los intentos acumulados.
    res.on('finish', () => {
      if (contarRespuesta(res.statusCode)) {
        const momento = Date.now();
        const vigente = intentos.get(clave);

        if (!vigente || vigente.expira <= momento) {
          asegurarCapacidad(momento);
          intentos.set(clave, { total: 1, expira: momento + ventanaMs });
        } else {
          vigente.total += 1;
        }
      } else if (res.statusCode >= 200 && res.statusCode < 300) {
        intentos.delete(clave);
      }
    });

    return next();
  };
}

module.exports = {
  limitarIntentos,
};
