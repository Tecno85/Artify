// ========== DEPENDENCIAS ==========
const express = require('express');

const { login, registro } = require('../controllers/auth.controller');
const { limitarIntentos } = require('../middlewares/rate-limit');

const router = express.Router();
const limitarLogin = limitarIntentos();
const limitarRegistro = limitarIntentos({
  mensaje: 'Demasiadas solicitudes de registro. Intenta nuevamente más tarde',
  contarRespuesta: (statusCode) => statusCode >= 400 && statusCode < 500,
});

// ========== RUTAS PÚBLICAS DE AUTENTICACIÓN ==========
router.post('/login', limitarLogin, login);
router.post('/registro', limitarRegistro, registro);

// ========== EXPORTACIÓN ==========
module.exports = router;
