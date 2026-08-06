// ========== VALIDACIONES COMPARTIDAS ==========
// ========== NORMALIZACIÓN ==========
function esTexto(valor, minimo = 1, maximo = 255) {
  return (
    typeof valor === 'string' &&
    valor.trim().length >= minimo &&
    valor.trim().length <= maximo
  );
}

function esCorreo(valor) {
  return esTexto(valor, 5, 150) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
}

function contieneCaracteresControl(valor) {
  return /[\u0000-\u001F\u007F]/.test(valor);
}

function normalizarCorreo(valor) {
  return typeof valor === 'string' ? valor.trim().toLowerCase() : valor;
}

function normalizarTexto(valor) {
  return typeof valor === 'string' ? valor.trim() : valor;
}

function normalizarCuerpoEntrada(datos) {
  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
    return {};
  }

  return datos;
}

function normalizarDatosUsuario(datos = {}) {
  const cuerpo = normalizarCuerpoEntrada(datos);

  return {
    nombres: normalizarTexto(cuerpo.nombres),
    apellidos: normalizarTexto(cuerpo.apellidos),
    correo: normalizarCorreo(cuerpo.correo),
    password: cuerpo.password,
    estado: cuerpo.estado,
  };
}

// ========== CONTRASEÑAS ==========
// El login solo comprueba la longitud para no invalidar cuentas históricas.
// Las contraseñas nuevas también deben cumplir la política de complejidad.
function esPassword(valor) {
  return typeof valor === 'string' && valor.length >= 8 && valor.length <= 128;
}

function obtenerErrorLongitudPassword(valor) {
  if (typeof valor !== 'string' || valor.length < 8) {
    return 'La contraseña debe tener mínimo 8 caracteres';
  }

  if (valor.length > 128) {
    return 'La contraseña no puede superar 128 caracteres';
  }

  return null;
}

function esPasswordNuevaSegura(valor) {
  return (
    esPassword(valor) &&
    /[a-z]/.test(valor) &&
    /[A-Z]/.test(valor) &&
    /[0-9]/.test(valor)
  );
}

function normalizarIdEntero(valor) {
  if (typeof valor === 'number' && Number.isSafeInteger(valor) && valor > 0) {
    return valor;
  }

  if (typeof valor === 'string' && /^[1-9][0-9]*$/.test(valor)) {
    const numero = Number(valor);
    return Number.isSafeInteger(numero) ? numero : null;
  }

  return null;
}

function esRolPermitido(valor) {
  return ['usuario', 'admin'].includes(valor);
}

// ========== CONTRATOS DE ENTRADA ==========
function validarCredenciales({ correo, password }) {
  if (!esCorreo(normalizarCorreo(correo))) {
    return 'Ingresa un correo válido';
  }

  const errorLongitudPassword = obtenerErrorLongitudPassword(password);
  if (errorLongitudPassword) {
    return errorLongitudPassword;
  }

  return null;
}

function validarDatosPersonales({ nombres, apellidos }) {
  if (!esTexto(nombres, 2, 100)) {
    return 'Ingresa nombres válidos';
  }

  if (!esTexto(apellidos, 2, 100)) {
    return 'Ingresa apellidos válidos';
  }

  return null;
}

function validarUsuario({
  nombres,
  apellidos,
  correo,
  password,
}) {
  const errorDatosPersonales = validarDatosPersonales({ nombres, apellidos });
  if (errorDatosPersonales) {
    return errorDatosPersonales;
  }

  if (!esCorreo(normalizarCorreo(correo))) {
    return 'Ingresa un correo válido';
  }

  const errorLongitudPassword = obtenerErrorLongitudPassword(password);
  if (errorLongitudPassword) {
    return errorLongitudPassword;
  }

  if (!esPasswordNuevaSegura(password)) {
    return 'La contraseña debe incluir al menos una mayúscula, una minúscula y un número';
  }

  return null;
}

function validarEdicionUsuario({
  nombres,
  apellidos,
  correo,
  estado,
}) {
  const errorDatosPersonales = validarDatosPersonales({
    nombres,
    apellidos,
  });
  if (errorDatosPersonales) {
    return errorDatosPersonales;
  }

  if (!esCorreo(correo)) {
    return 'Ingresa un correo válido';
  }

  if (!['activo', 'inactivo', 'suspendido'].includes(estado)) {
    return 'Selecciona un estado válido';
  }

  return null;
}

function validarConfiguracion({
  calidadExportacion,
  notificaciones,
  formatoDefecto,
  autoguardado,
}) {
  if (!['baja', 'media', 'alta'].includes(calidadExportacion)) {
    return 'Selecciona una calidad de exportación válida';
  }

  if (!['png', 'jpeg', 'webp'].includes(formatoDefecto)) {
    return 'Selecciona un formato por defecto válido';
  }

  if (typeof notificaciones !== 'boolean' || typeof autoguardado !== 'boolean') {
    return 'Las preferencias booleanas son inválidas';
  }

  return null;
}

function validarTipoOperacion(valor) {
  return (
    typeof valor === 'string' &&
    esTexto(valor, 1, 100) &&
    !contieneCaracteresControl(valor)
  );
}

function validarDescripcionOperacion(valor) {
  if (valor === undefined || valor === null) {
    return true;
  }

  return (
    typeof valor === 'string' &&
    valor.length <= 500 &&
    !contieneCaracteresControl(valor)
  );
}

function validarNombreArchivoImagen(valor) {
  return (
    typeof valor === 'string' &&
    esTexto(valor, 1, 255) &&
    !/[\\/]/.test(valor) &&
    !contieneCaracteresControl(valor)
  );
}

// ========== EXPORTACIÓN ==========
module.exports = {
  esRolPermitido,
  normalizarCuerpoEntrada,
  normalizarCorreo,
  normalizarDatosUsuario,
  normalizarIdEntero,
  validarConfiguracion,
  validarCredenciales,
  validarDescripcionOperacion,
  validarNombreArchivoImagen,
  validarTipoOperacion,
  validarUsuario,
  validarEdicionUsuario,
};
