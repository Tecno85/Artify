// ========== DEPENDENCIAS ==========
const express = require('express');

const {
  iniciarSesionEdicion,
  cerrarSesionEdicion,
} = require('../controllers/sesion.controller');
const {
  autenticarToken,
  autorizarPropietarioPorBody,
} = require('../middlewares/auth');

const router = express.Router();

// ========== RUTAS PROTEGIDAS DE SESIÓN ==========
router.post(
  '/sesion/iniciar',
  autenticarToken,
  autorizarPropietarioPorBody('idUsuario'),
  iniciarSesionEdicion
);
router.post('/sesion/cerrar', autenticarToken, cerrarSesionEdicion);

// ========== EXPORTACIÓN ==========
module.exports = router;
