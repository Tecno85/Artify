// ========== AUTOGUARDADO LOCAL DEL EDITOR ==========
window.ArtifyEditorStorage = (() => {
  const RESPALDO_LOCAL_KEY = 'artify_backup_v1';
  const RESPALDO_EXPIRACION_MS = 7 * 24 * 60 * 60 * 1000;
  const RESPALDO_LEGACY_KEYS = [
    'artify_backup_image',
    'artify_backup_timestamp',
  ];
  const RESPALDO_DATA_URL_REGEX =
    /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/;

  function eliminarRespaldoLocal() {
    [RESPALDO_LOCAL_KEY, ...RESPALDO_LEGACY_KEYS].forEach((clave) => {
      try {
        localStorage.removeItem(clave);
      } catch {
        // El navegador puede bloquear localStorage; el editor debe seguir funcionando.
      }
    });
  }

  function guardarRespaldoLocal({
    dataUrl,
    formato,
    nombreOriginal,
    tamanoBytes,
  }) {
    try {
      const usuario = obtenerUsuarioAuth();
      const idUsuario = Number(usuario?.id);
      const formatoNormalizado = String(formato || '').toLowerCase();

      if (
        !Number.isSafeInteger(idUsuario) ||
        idUsuario <= 0 ||
        !esDataUrlImagenValido(dataUrl, formatoNormalizado)
      ) {
        return false;
      }

      // Vincular el respaldo al usuario evita recuperar imágenes desde otra cuenta.
      const respaldo = {
        version: 1,
        idUsuario,
        timestamp: Date.now(),
        dataUrl,
        formato: formatoNormalizado,
        nombreOriginal:
          typeof nombreOriginal === 'string' && nombreOriginal.trim()
            ? nombreOriginal.trim().slice(0, 255)
            : `imagen-recuperada.${formatoNormalizado}`,
        tamanoBytes:
          Number.isSafeInteger(tamanoBytes) && tamanoBytes > 0
            ? tamanoBytes
            : 0,
      };

      localStorage.setItem(RESPALDO_LOCAL_KEY, JSON.stringify(respaldo));
      RESPALDO_LEGACY_KEYS.forEach((clave) => localStorage.removeItem(clave));
      return true;
    } catch {
      return false;
    }
  }

  function leerRespaldoLocalParaUsuario(idUsuario, ahora = Date.now()) {
    RESPALDO_LEGACY_KEYS.forEach((clave) => {
      try {
        localStorage.removeItem(clave);
      } catch {
        // Las claves antiguas no deben impedir la recuperación del formato vigente.
      }
    });

    try {
      const respaldo = JSON.parse(localStorage.getItem(RESPALDO_LOCAL_KEY));
      const idNormalizado = Number(idUsuario);
      const esValido =
        respaldo?.version === 1 &&
        Number.isSafeInteger(idNormalizado) &&
        idNormalizado > 0 &&
        respaldo.idUsuario === idNormalizado &&
        Number.isFinite(respaldo.timestamp) &&
        respaldo.timestamp <= ahora &&
        ahora - respaldo.timestamp <= RESPALDO_EXPIRACION_MS &&
        esDataUrlImagenValido(respaldo.dataUrl, respaldo.formato);

      // Eliminar respaldos ajenos, vencidos o alterados en lugar de intentar cargarlos.
      if (!esValido) {
        eliminarRespaldoLocal();
        return null;
      }

      return respaldo;
    } catch {
      eliminarRespaldoLocal();
      return null;
    }
  }

  function esDataUrlImagenValido(dataUrl, formato) {
    if (typeof dataUrl !== 'string') return false;

    const formatoNormalizado = String(formato || '').toLowerCase();
    const coincidencia = dataUrl.match(RESPALDO_DATA_URL_REGEX);

    return Boolean(
      coincidencia &&
        coincidencia[1] === formatoNormalizado &&
        coincidencia[2].length % 4 === 0
    );
  }

  // Mantener la persistencia detrás de este API facilita probarla sin acoplarla al Canvas.
  return {
    eliminarRespaldoLocal,
    guardarRespaldoLocal,
    leerRespaldoLocalParaUsuario,
  };
})();
