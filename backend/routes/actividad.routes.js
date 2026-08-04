// ========== DEPENDENCIAS ==========
const express = require('express');

const {
  obtenerEstadisticas,
  registrarOperacion,
  obtenerTotalOperaciones,
  registrarImagen,
} = require('../controllers/actividad.controller');
const {
  autenticarToken,
  autorizarUsuarioPorParametro,
  autorizarPropietarioPorBody,
} = require('../middlewares/auth');

const router = express.Router();

// ========== RUTAS PROTEGIDAS DE ACTIVIDAD ==========
router.get(
  '/estadisticas/:id',
  autenticarToken,
  autorizarUsuarioPorParametro('id'),
  obtenerEstadisticas
);
router.get(
  '/operacion/total/:id',
  autenticarToken,
  autorizarUsuarioPorParametro('id'),
  obtenerTotalOperaciones
);
router.post(
  '/operacion',
  autenticarToken,
  autorizarPropietarioPorBody('idUsuario'),
  registrarOperacion
);
router.post(
  '/imagen',
  autenticarToken,
  autorizarPropietarioPorBody('idUsuario'),
  registrarImagen
);

// ========== EXPORTACIÓN ==========
module.exports = router;
