// ========== DEPENDENCIAS ==========
const db = require('../config/db');

// ========== ANALYTICS: FILTROS ==========
function filtrosPopulares(req, res) {
  // Preferir el nombre estructurado del filtro y usar la descripción como respaldo
  // mantiene compatibles las operaciones registradas antes de incorporar parámetros.
  const query = `
    WITH filtros_registrados AS (
      SELECT
        CASE
          WHEN filtro IN ('Blanco y Negro', 'Sepia', 'Brillo', 'Contraste')
            THEN filtro
          ELSE 'Sin especificar'
        END AS filtro
      FROM (
        SELECT
          COALESCE(
            NULLIF(BTRIM(opr_parametros ->> 'filtro'), ''),
            NULLIF(
              REGEXP_REPLACE(
                COALESCE(opr_parametros ->> 'descripcion', ''),
                '^Filtro aplicado:\\s*',
                '',
                'i'
              ),
              ''
            ),
            'Sin especificar'
          ) AS filtro
        FROM OPERACION
        WHERE opr_estado_operacion = 'completada'
          AND opr_tipo_operacion = 'filtro'
      ) filtros_normalizados
    )
    SELECT
      filtro,
      COUNT(*)::int as usos,
      COALESCE(
        ROUND(
          100.0 * COUNT(*) / NULLIF(
            (SELECT COUNT(*) FROM filtros_registrados),
            0
          ),
          2
        ),
        0
      )::float as porcentaje
    FROM filtros_registrados
    GROUP BY filtro
    ORDER BY usos DESC
    LIMIT 10
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ Error obteniendo filtros:', err.message);
      return res.status(500).json({
        ok: false,
        mensaje: 'Error obteniendo datos',
      });
    }

    return res.json({
      ok: true,
      mensaje: 'Top filtros utilizados',
      data: { filtros: results },
      meta: {
        timestamp: new Date().toISOString(),
        totalFiltros: results.length,
      },
    });
  });
}

// ========== ANALYTICS: HORARIOS ==========
function horariosEdicion(req, res) {
  // El porcentaje se calcula sobre todas las operaciones completadas; NULLIF
  // permite responder cero cuando todavía no existen datos.
  const query = `
    SELECT
      EXTRACT(HOUR FROM opr_fecha_hora)::int as hora,
      COUNT(*)::int as cantidad_ediciones,
      COALESCE(
        ROUND(
          100.0 * COUNT(*) / NULLIF(
            (SELECT COUNT(*) FROM OPERACION WHERE opr_estado_operacion = 'completada'),
            0
          ),
          2
        ),
        0
      )::float as porcentaje
    FROM OPERACION
    WHERE opr_estado_operacion = 'completada'
    GROUP BY EXTRACT(HOUR FROM opr_fecha_hora)
    ORDER BY cantidad_ediciones DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ Error obteniendo horarios:', err.message);
      return res.status(500).json({
        ok: false,
        mensaje: 'Error obteniendo datos',
      });
    }

    return res.json({
      ok: true,
      mensaje: 'Horarios pico de edición',
      data: { horarios: results },
      meta: {
        timestamp: new Date().toISOString(),
        totalHoras: results.length,
      },
    });
  });
}

// ========== ANALYTICS: FORMATOS ==========
function formatosPreferidos(req, res) {
  // Una fecha de modificación identifica imágenes descargadas y evita contar
  // cargas que todavía no produjeron un archivo final.
  const query = `
    SELECT
      img_formato as formato,
      COUNT(*)::int as descargas,
      COALESCE(
        ROUND(
          100.0 * COUNT(*) / NULLIF(
            (SELECT COUNT(*) FROM IMAGEN
             WHERE img_estado_imagen = 'activa'
               AND img_fecha_modificacion IS NOT NULL),
            0
          ),
          2
        ),
        0
      )::float as porcentaje
    FROM IMAGEN
    WHERE img_estado_imagen = 'activa'
      AND img_fecha_modificacion IS NOT NULL
    GROUP BY img_formato
    ORDER BY descargas DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ Error obteniendo formatos:', err.message);
      return res.status(500).json({
        ok: false,
        mensaje: 'Error obteniendo datos',
      });
    }

    return res.json({
      ok: true,
      mensaje: 'Formatos más descargados',
      data: { formatos: results },
      meta: {
        timestamp: new Date().toISOString(),
        totalFormatos: results.length,
      },
    });
  });
}

// ========== ANALYTICS: CONVERSIÓN ==========
function tasaConversion(req, res) {
  // La conversión representa sesiones finalizadas que guardaron al menos un resultado.
  const query = `
    SELECT
      COALESCE(
        ROUND(
          100.0 * SUM(CASE WHEN ses_cambios_guardados = true THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0),
          2
        ),
        0
      )::float as tasa_conversion_porcentaje,
      COUNT(*)::int as total_sesiones,
      COALESCE(SUM(CASE WHEN ses_cambios_guardados = true THEN 1 ELSE 0 END), 0)::int as sesiones_exitosas
    FROM SESION_EDICION
    WHERE ses_estado_sesion = 'finalizada'
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ Error obteniendo tasa de conversión:', err.message);
      return res.status(500).json({
        ok: false,
        mensaje: 'Error obteniendo datos',
      });
    }

    return res.json({
      ok: true,
      mensaje: 'Tasa de conversión de sesiones',
      data: { conversionData: results[0] },
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  });
}

// ========== EXPORTACIÓN ==========
module.exports = {
  filtrosPopulares,
  horariosEdicion,
  formatosPreferidos,
  tasaConversion,
};
