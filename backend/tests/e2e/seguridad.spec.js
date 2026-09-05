const { test, expect } = require('@playwright/test');

async function preparar(page, rol = 'usuario') {
  const estado = { fallarLogout: true, cierres: 0 };
  await page.addInitScript((rol) => {
    if (window.location.pathname.endsWith('/index.html')) return;
    sessionStorage.setItem('artifyToken', 'token-seguridad-e2e');
    sessionStorage.setItem('artifyUser', JSON.stringify({ id: 7, nombres: 'Usuario', apellidos: 'Prueba', rol }));
  }, rol);
  await page.route('http://127.0.0.1:3000/**', (route) => {
    const ruta = new URL(route.request().url()).pathname;
    if (ruta === '/api/logout') {
      estado.cierres++;
      expect(route.request().headers().authorization).toBe('Bearer token-seguridad-e2e');
      return route.fulfill({
        status: estado.fallarLogout ? 503 : 200,
        json: { mensaje: estado.fallarLogout ? 'No disponible' : 'Sesión de acceso cerrada' },
      });
    }
    const body = ruta === '/api/sesion/iniciar'
      ? { mensaje: 'Sesión iniciada', idSesion: 91 }
      : { mensaje: 'ok', configuracion: null, usuarios: [
          { usr_id_usuario: 8, usr_nombres: 'Ana', usr_apellidos: 'Prueba', usr_correo: 'ana@example.test', usr_estado_usuario: 'activo', usr_rol: 'usuario' },
        ] };
    return route.fulfill({ json: body });
  });
  await page.goto(`/pages/${rol === 'admin' ? 'admin' : 'editor'}.html`);
  return estado;
}

for (const rol of ['usuario', 'admin']) {
  test(`${rol} puede reintentar logout y limpia la sesión tras confirmar revocación`, async ({ page }) => {
    const estado = await preparar(page, rol);
    if (rol === 'usuario') {
      await page.locator('#btnPerfil').click();
      await page.locator('#btnCerrarSesion').click();
    }
    const boton = page.locator(rol === 'admin' ? '#btnLogout' : '#btnConfirmarLogout');
    await boton.click();
    await expect.poll(() => estado.cierres).toBe(1);
    await expect(boton).toBeEnabled();
    expect(await page.evaluate(() => sessionStorage.getItem('artifyToken'))).toBe('token-seguridad-e2e');
    if (rol === 'usuario') {
      await expect(page.locator('#errorLogout')).toContainText('No se pudo cerrar');
      await expect(page.locator('#errorLogout')).toBeVisible();
    }
    await page.screenshot({ path: test.info().outputPath('logout-reintento.png'), animations: 'disabled' });
    estado.fallarLogout = false;
    await boton.click();
    await expect(page).toHaveURL(/\/index\.html$/);
    expect(await page.evaluate(() => sessionStorage.getItem('artifyToken'))).toBeNull();
    expect(estado.cierres).toBe(2);
  });
}

test('CSP bloquea scripts incrustados y externos y conserva las acciones administrativas', async ({ page }) => {
  await preparar(page, 'admin');
  await page.evaluate(() => {
    window.violacionesCsp = [];
    document.addEventListener('securitypolicyviolation', (evento) => window.violacionesCsp.push(evento.blockedURI));
    const inline = document.createElement('script');
    inline.textContent = 'window.scriptIncrustadoEjecutado = true';
    document.body.append(inline);
    const externo = document.createElement('script');
    externo.src = 'https://scripts-no-permitidos.example/prueba.js';
    document.body.append(externo);
  });
  await expect.poll(() => page.evaluate(() => window.violacionesCsp.length)).toBeGreaterThanOrEqual(2);
  expect(await page.evaluate(() => window.scriptIncrustadoEjecutado)).toBeUndefined();
  await page.locator('button[data-accion="editar"]').click();
  await expect(page.locator('#modalUsuario')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.locator('button[data-accion="eliminar"]').click();
  await expect(page.locator('#modalEliminar')).toBeVisible();
});
