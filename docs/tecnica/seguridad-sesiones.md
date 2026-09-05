# Seguridad de acceso y sesiones

Revisión: 5 de septiembre de 2026. Describe los cambios locales preparados para Artify; su publicación requiere el orden indicado abajo.

## Límites de acceso

En cada ventana de quince minutos se admiten hasta 100 solicitudes de login y registro combinadas por IP, y hasta 30 solicitudes de registro por IP. Estos contadores incluyen solicitudes correctas, fallidas y en curso. Se conserva además el límite de diez intentos fallidos por IP, ruta y correo normalizado. Los intentos correctos no consumen este último límite; los fallos anteriores permanecen hasta vencer la ventana.

La ruta usada para contar es la declarada por Express. Cambiar parámetros de consulta, mayúsculas o la barra final no crea un contador nuevo. El bloqueo devuelve HTTP `429` y `Retry-After`.

Los contadores viven en memoria, con un máximo de 1000 entradas por limitador. Al llenarse, se rechazan nuevas claves hasta que expire alguna, sin expulsar bloqueos vigentes. Un reinicio limpia los contadores; varias instancias requerirían almacenamiento compartido. Los límites por IP también se comparten entre personas que usan la misma salida de red.

## Cierre y revocación

`POST /api/logout` requiere el token en `Authorization: Bearer ...`. Guarda su huella SHA-256 y vencimiento en `TOKEN_REVOCADO`, y responde `{"mensaje":"Sesión de acceso cerrada"}`. La tabla nunca almacena el token reutilizable ni datos personales.

Cada petición privada comprueba firma, expiración, estado de cuenta, rol vigente y ausencia de revocación. Un token revocado recibe `401`. Cada login genera un identificador aleatorio distinto: cerrar una sesión no revoca otras sesiones independientes de la misma cuenta. Las pestañas que comparten el mismo token pierden ese acceso.

Las huellas vencidas se eliminan cada treinta minutos. Cerrar una sesión de edición (`/api/sesion/cerrar`) sigue siendo independiente; cerrar una pestaña no revoca automáticamente una sesión recordada.

Editor y administración esperan confirmación del servidor antes de borrar credenciales. Si falla el cierre, muestran un error y permiten reintentar. Un `401` al cerrar significa que el token ya no permite acceso y se limpia localmente. El plazo para confirmar la revocación es de diez segundos.

## Política CSP

Las seis páginas incluyen `<meta http-equiv="Content-Security-Policy">` antes de cargar recursos. Permiten scripts del mismo origen; bloquean scripts incrustados, manejadores como `onclick`, evaluación dinámica de código, objetos y marcos embebidos. Las acciones administrativas y del modal de resolución utilizan eventos registrados desde archivos JavaScript.

Se permiten imágenes locales, `data:` y `blob:` de Canvas, las fuentes de Google usadas en administración y los estilos existentes. Los estilos conservan `unsafe-inline`; los scripts no.

`scripts/write-frontend-config.js` genera la URL de la API y el origen permitido en `connect-src`. En desarrollo admite localhost y 127.0.0.1 en el puerto 3000. En despliegue permite el origen de `ARTIFY_API_URL`, que debe usar HTTPS salvo en localhost. Cambiar la API requiere ejecutar de nuevo ese script.

CSP no sustituye el renderizado seguro. Los tokens siguen en `sessionStorage` o `localStorage`, accesibles a JavaScript del mismo origen. Migrar a cookies `HttpOnly` queda pendiente de un diseño compatible con el despliegue entre dominios. `frame-ancestors` no funciona en una meta CSP y no se presenta como implementado en GitHub Pages.

## Dependencias y despliegue

Los overrides de pnpm 11 se mantienen en `backend/pnpm-workspace.yaml`, con `body-parser@2.3.0` y `qs@6.16.0`. El lockfile contiene ambas reglas. La auditoría de producción de esta revisión no encontró vulnerabilidades conocidas.

Para actualizar una instalación existente:

1. Revisar el destino y disponer de un respaldo de PostgreSQL.
2. Consultar `node scripts/ejecutar-migraciones.js` y aplicar las pendientes según las [guardas documentadas](../../database/postgresql/migrations/README.md). La nueva migración es `20260905_004_revocar_tokens.sql`.
3. Verificar permisos `SELECT`, `INSERT` y `DELETE` del rol de aplicación sobre `TOKEN_REVOCADO`. La migración los concede a roles con esos permisos sobre `USUARIO`; `app-role.sql` también los incluye para instalaciones nuevas.
4. Instalar el backend con `pnpm install --frozen-lockfile` y desplegarlo después de la migración.
5. Generar la configuración frontend con `ARTIFY_API_URL` y publicarlo después del backend. GitHub Actions ya ejecuta ese generador.

Sin la tabla de revocaciones, las rutas privadas fallan de forma cerrada; no se omite la comprobación. No desplegar el frontend nuevo contra un backend que aún no ofrezca `/api/logout`.
