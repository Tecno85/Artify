// ========== CONFIGURACIÓN ==========
const API =
  window.ARTIFY_API_URL ||
  (window.location.hostname
    ? `${window.location.protocol}//${window.location.hostname}:3000`
    : 'http://localhost:3000');

// ========== TOKEN Y SESIÓN ==========
const CLAVES_AUTH = ['artifyAdmin', 'artifyUser', 'artifyToken'];

// Buscar primero en sessionStorage conserva el modo temporal; localStorage se usa
// únicamente cuando la persona selecciona recordar su sesión.
function obtenerValorAuth(clave) {
  return sessionStorage.getItem(clave) || localStorage.getItem(clave);
}

function obtenerTokenAuth() {
  return obtenerValorAuth('artifyToken');
}

function obtenerUsuarioAuth() {
  const usuarioGuardado = obtenerValorAuth('artifyUser');

  if (!usuarioGuardado) {
    return null;
  }

  try {
    const usuario = JSON.parse(usuarioGuardado);
    const payload = obtenerPayloadTokenAuth(obtenerTokenAuth());
    const idUsuario = Number(usuario?.id);
    const idToken = Number(payload?.id);

    if (
      payload &&
      (
        usuario?.rol !== payload.rol ||
        !Number.isSafeInteger(idUsuario) ||
        idUsuario !== idToken
      )
    ) {
      limpiarSesionAuth();
      return null;
    }

    return usuario;
  } catch {
    sessionStorage.removeItem('artifyUser');
    localStorage.removeItem('artifyUser');
    return null;
  }
}

function obtenerPayloadTokenAuth(token) {
  // El frontend solo lee la expiración para mejorar la navegación. La firma y los
  // permisos siempre se validan nuevamente en el backend.
  try {
    const partes = String(token || '').split('.');
    if (partes.length !== 3) {
      return null;
    }

    const payloadBase64 = partes[1].replace(/-/g, '+').replace(/_/g, '/');
    const relleno = '='.repeat((4 - (payloadBase64.length % 4)) % 4);
    return JSON.parse(atob(payloadBase64 + relleno));
  } catch {
    return null;
  }
}

function esTokenAuthVigente(token = obtenerTokenAuth()) {
  const payload = obtenerPayloadTokenAuth(token);
  const expiracion = Number(payload?.exp);
  const ahora = Math.floor(Date.now() / 1000);

  return Number.isFinite(expiracion) && expiracion > ahora;
}

function limpiarCredencialesAuth() {
  CLAVES_AUTH.forEach((clave) => {
    sessionStorage.removeItem(clave);
    localStorage.removeItem(clave);
  });
}

function guardarSesionAuth(token, usuario, recordar = false) {
  if (!token || !usuario) {
    return false;
  }

  limpiarCredencialesAuth();
  const almacenamiento = recordar ? localStorage : sessionStorage;
  almacenamiento.setItem('artifyToken', token);
  almacenamiento.setItem('artifyUser', JSON.stringify(usuario));
  return true;
}

function guardarTokenAuth(token, recordar = false) {
  if (!token) {
    return false;
  }

  sessionStorage.removeItem('artifyToken');
  localStorage.removeItem('artifyToken');
  const almacenamiento = recordar ? localStorage : sessionStorage;
  almacenamiento.setItem('artifyToken', token);
  return true;
}

function limpiarSesionAuth() {
  limpiarCredencialesAuth();
  sessionStorage.removeItem('artifyIdSesion');
  localStorage.removeItem('artify_backup_v1');
  localStorage.removeItem('artify_backup_image');
  localStorage.removeItem('artify_backup_timestamp');
}

async function cerrarSesionAuth() {
  const token = obtenerTokenAuth();
  if (!token) {
    limpiarSesionAuth();
    return true;
  }
  try {
    const res = await fetch(`${API}/api/logout`, {
      method: 'POST',
      headers: construirHeadersAuth(),
      signal: AbortSignal.timeout(10_000),
    });
    const confirmado = res.status === 401 || (
      res.ok && (await res.json()).mensaje === 'Sesión de acceso cerrada'
    );
    if (!confirmado || obtenerTokenAuth() !== token) return false;
    limpiarSesionAuth();
    return true;
  } catch {
    // Conservar la sesión permite reintentar cuando el servidor no confirma la revocación.
    return false;
  }
}

function obtenerRutaSesionAuth(usuario) {
  const paginaInterna = window.location.pathname.includes('/pages/');
  const archivo =
    usuario.rol === 'admin'
      ? 'admin.html'
      : usuario.rol === 'usuario'
        ? 'editor.html'
        : null;

  if (!archivo) {
    return null;
  }

  return paginaInterna ? `./${archivo}` : `./pages/${archivo}`;
}

function redirigirSesionAuth() {
  const token = obtenerTokenAuth();
  const usuario = obtenerUsuarioAuth();

  if (!token && !usuario) {
    return false;
  }

  if (!token || !usuario || !esTokenAuthVigente(token)) {
    limpiarSesionAuth();
    return false;
  }

  const destino = obtenerRutaSesionAuth(usuario);
  if (!destino) {
    limpiarSesionAuth();
    return false;
  }

  window.location.replace(destino);
  return true;
}

// ========== HEADERS DE AUTENTICACIÓN ==========
function construirHeadersAuth(headers = {}) {
  const token = obtenerTokenAuth();
  const resultado = { ...headers };

  if (token) {
    resultado.Authorization = `Bearer ${token}`;
  }

  return resultado;
}

// ========== FETCH PROTEGIDO ==========
// Adjuntar el token y limpiar sesión cuando el backend responde 401
async function fetchAuth(url, options = {}) {
  const optionsFinales = { ...options };
  optionsFinales.headers = construirHeadersAuth(options.headers || {});

  const response = await fetch(url, optionsFinales);

  if (response.status === 401) {
    limpiarSesionAuth();

    const paginaActual = window.location.pathname.split('/').pop();
    // El editor puede conservar una imagen local para permitir su descarga.
    if (
      paginaActual === 'editor.html' &&
      window.manejarSesionExpiradaEditor?.()
    ) {
      return response;
    }
    if (!['login.html', 'registro.html'].includes(paginaActual)) {
      window.location.replace('./login.html');
    }
  }

  return response;
}
