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
  porIp = false,
  contarAlRecibir = false,
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

    return intentos.size < maxRegistros;
  }

  return (req, res, next) => {
    const ahora = Date.now();
    solicitudesDesdeLimpieza += 1;

    if (solicitudesDesdeLimpieza >= frecuenciaLimpieza) {
      limpiarRegistrosExpirados(ahora);
      solicitudesDesdeLimpieza = 0;
    }

    const correo = String(req.body?.correo || '').trim().toLowerCase();
    // La ruta declarada por Express no cambia con queries, mayúsculas o barra final.
    const ruta = String(req.route?.path || req.originalUrl || '')
      .split('?')[0].replace(/\/+$/, '').toLowerCase();
    const clave = porIp ? req.ip : JSON.stringify([req.ip, ruta, correo]);
    let registro = intentos.get(clave);

    if (registro?.expira <= ahora) {
      intentos.delete(clave);
      registro = null;
    }

    // No expulsar contadores vigentes: llenar el mapa no debe levantar bloqueos.
    if (!registro) {
      if (!asegurarCapacidad(ahora)) {
        const primeraExpiracion = Math.min(
          ...Array.from(intentos.values(), (entrada) => entrada.expira)
        );
        res.setHeader('Retry-After', Math.max(1, Math.ceil((primeraExpiracion - ahora) / 1000)));
        return res.status(429).json({ mensaje });
      }
      registro = { total: 0, expira: ahora + ventanaMs };
      intentos.set(clave, registro);
    }

    if (registro?.total >= maxIntentos) {
      const esperaSegundos = Math.max(
        1,
        Math.ceil((registro.expira - ahora) / 1000)
      );
      res.setHeader('Retry-After', String(esperaSegundos));
      return res.status(429).json({ mensaje });
    }

    // Reservar el intento antes de next evita que solicitudes simultáneas superen el límite.
    registro.total++;
    if (contarAlRecibir) return next();

    // El límite por IP cuenta todo; el de credenciales solo conserva los fallos.
    res.on('finish', () => {
      if (intentos.get(clave) !== registro) return;
      if (!contarRespuesta(res.statusCode)) {
        registro.total = Math.max(0, registro.total - 1);
        if (registro.total === 0) intentos.delete(clave);
      }
    });

    return next();
  };
}

function limitarSolicitudesPorIp(opciones = {}) {
  return limitarIntentos({ ...opciones, porIp: true, contarAlRecibir: true });
}

module.exports = {
  limitarIntentos,
  limitarSolicitudesPorIp,
};
