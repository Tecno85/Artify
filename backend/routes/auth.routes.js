// ========== DEPENDENCIAS ==========
const express = require('express');

const { login, registro, cerrarSesionAuth } = require('../controllers/auth.controller');
const { autenticarToken } = require('../middlewares/auth');
const { limitarIntentos, limitarSolicitudesPorIp } = require('../middlewares/rate-limit');

const router = express.Router();
const limitarAccesoPorIp = limitarSolicitudesPorIp({
  maxIntentos: 100,
  mensaje: 'Demasiadas solicitudes de acceso. Intenta nuevamente más tarde',
});
const limitarRegistroPorIp = limitarSolicitudesPorIp({
  maxIntentos: 30,
  mensaje: 'Demasiadas solicitudes de registro. Intenta nuevamente más tarde',
});
const limitarLogin = limitarIntentos();
const limitarRegistro = limitarIntentos({
  mensaje: 'Demasiadas solicitudes de registro. Intenta nuevamente más tarde',
  contarRespuesta: (statusCode) => statusCode >= 400 && statusCode < 500,
});

// ========== RUTAS PÚBLICAS DE AUTENTICACIÓN ==========
router.post('/login', limitarAccesoPorIp, limitarLogin, login);
router.post('/registro', limitarAccesoPorIp, limitarRegistroPorIp, limitarRegistro, registro);
router.post('/logout', autenticarToken, cerrarSesionAuth);

// ========== EXPORTACIÓN ==========
module.exports = router;
