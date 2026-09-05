const { expect, test } = require('@playwright/test');

const IMAGEN_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGM4kWL0HwAFtAJeHzr7ywAAAABJRU5ErkJggg==',
  'base64'
);

async function prepararEditor(page, { autoguardado = false, formato = 'png' } = {}) {
  const api = { modo: 'normal', consultasPreferencias: 0, solicitudesFallidas: 0 };
  await page.route('http://127.0.0.1:3000/**', async (route) => {
    const ruta = new URL(route.request().url()).pathname;
    if (ruta === '/api/configuracion/7') api.consultasPreferencias++;
    if (api.modo === 'pendiente') return;
    if (api.modo === 'desconectado') {
      api.solicitudesFallidas++;
      return route.abort('internetdisconnected');
    }
    if (api.modo === 'expirada') {
      api.solicitudesFallidas++;
      return route.fulfill({ status: 401, json: { mensaje: 'Token expirado' } });
    }
    const body = ruta === '/api/sesion/iniciar'
      ? { mensaje: 'Sesión iniciada', idSesion: 91 }
      : ruta === '/api/configuracion/7'
        ? {
            mensaje: 'ok',
            configuracion: {
              calidadExportacion: 'alta',
              notificacionesHabilitadas: true,
              formatoDefecto: formato,
              autoguardado,
            },
          }
        : { mensaje: 'ok' };
    return route.fulfill({ json: body });
  });
  await page.addInitScript(() => {
    sessionStorage.setItem('artifyToken', 'token-e2e');
    sessionStorage.setItem('artifyUser', JSON.stringify({
      id: 7, nombres: 'Usuario', apellidos: 'E2E', rol: 'usuario',
    }));
  });
  return api;
}

async function cargarImagen(page) {
  await page.goto('/pages/editor.html');
  await page.locator('#fileInput').setInputFiles({
    name: 'prueba.png', mimeType: 'image/png', buffer: IMAGEN_PNG,
  });
  await expect(page.locator('#btnDescargar')).toBeEnabled();
  await expect.poll(() => page.evaluate(() => historyIndex)).toBe(0);
}

async function leerPixelRespaldo(page) {
  return page.evaluate(async () => {
    const respaldo = JSON.parse(localStorage.getItem('artify_backup_v1'));
    if (!respaldo) return null;
    const img = new Image();
    img.src = respaldo.dataUrl;
    await img.decode();
    const lienzo = document.createElement('canvas');
    lienzo.width = img.width;
    lienzo.height = img.height;
    const ctx = lienzo.getContext('2d');
    ctx.drawImage(img, 0, 0);
    return Array.from(ctx.getImageData(0, 0, 1, 1).data);
  });
}

test('autoguardado sigue deshacer y rehacer y recupera el estado confirmado', async ({ page }) => {
  await prepararEditor(page, { autoguardado: true });
  await cargarImagen(page);
  await expect.poll(() => leerPixelRespaldo(page)).toEqual([200, 100, 50, 255]);
  await page.locator('#btnFiltros').click();
  await page.locator('[data-filter="grayscale"]').click();
  await page.locator('#filterIntensity').evaluate((slider) => {
    slider.value = '70';
    slider.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await page.locator('#btnAplicarFiltro').click();
  await expect(page.locator('#operationsCount')).toHaveText('1 cambio aplicado');
  // Una vista previa posterior no debe entrar en el respaldo del cambio confirmado.
  await page.locator('#filterIntensity').evaluate((slider) => {
    slider.value = '40';
    slider.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await expect.poll(() => leerPixelRespaldo(page)).toEqual([147, 117, 102, 255]);
  await page.locator('#btnDeshacer').click();
  await expect.poll(() => leerPixelRespaldo(page)).toEqual([200, 100, 50, 255]);
  await page.locator('#btnRehacer').click();
  await expect.poll(() => leerPixelRespaldo(page)).toEqual([147, 117, 102, 255]);
  await page.locator('#btnDeshacer').click();
  await expect.poll(() => leerPixelRespaldo(page)).toEqual([200, 100, 50, 255]);
  await expect(page.locator('#estadoRespaldo')).toContainText('Autoguardado actualizado');
  await page.reload();
  await page.locator('#btnRecuperarRespaldo').click();
  await expect.poll(() => page.locator('#mainCanvas').evaluate((canvas) =>
    Array.from(canvas.getContext('2d').getImageData(0, 0, 1, 1).data)
  )).toEqual([200, 100, 50, 255]);
});

test('un almacenamiento lleno muestra el fallo y permite descargar', async ({ page }) => {
  await prepararEditor(page, { autoguardado: true });
  await page.addInitScript(() => {
    const guardar = Storage.prototype.setItem;
    Storage.prototype.setItem = function (clave, valor) {
      if (clave === 'artify_backup_v1') throw new DOMException('Sin espacio', 'QuotaExceededError');
      return guardar.call(this, clave, valor);
    };
  });
  await cargarImagen(page);
  await expect(page.locator('#estadoRespaldo')).toContainText('No se pudo autoguardar');
  await page.screenshot({ path: test.info().outputPath('autoguardado-fallido.png') });
  const pendiente = page.waitForEvent('download');
  await page.locator('#btnDescargar').click();
  expect(await (await pendiente).failure()).toBeNull();
});

for (const modo of ['pendiente', 'desconectado', 'expirada']) {
  test(`descarga con preferencias en memoria y API ${modo}`, async ({ page }) => {
    const api = await prepararEditor(page, { formato: 'webp' });
    await cargarImagen(page);
    await expect.poll(() => page.evaluate(() => preferenciasActuales?.formatoDefecto)).toBe('webp');
    await expect.poll(() => page.evaluate(() => sessionStorage.getItem('artifyIdSesion'))).toBe('91');
    const consultasIniciales = api.consultasPreferencias;
    api.modo = modo;
    const pendiente = page.waitForEvent('download');
    await page.locator('#btnDescargar').click();
    const descarga = await pendiente;
    expect(descarga.suggestedFilename()).toMatch(/\.webp$/);
    expect(await descarga.failure()).toBeNull();
    expect(api.consultasPreferencias).toBe(consultasIniciales);
    if (modo !== 'pendiente') {
      await expect.poll(() => api.solicitudesFallidas).toBeGreaterThan(0);
    }
    if (modo === 'expirada') {
      await expect(page.locator('#estadoRespaldo')).toContainText('Sesión vencida');
      await page.setViewportSize({ width: 1024, height: 600 });
      await page.screenshot({ path: test.info().outputPath('sesion-vencida.png') });
      expect(await page.evaluate(() => sessionStorage.getItem('artifyToken'))).toBeNull();
      const segunda = page.waitForEvent('download');
      await page.locator('#btnDescargar').click();
      expect(await (await segunda).failure()).toBeNull();
    }
    await expect(page).toHaveURL(/\/pages\/editor\.html$/);
  });
}

test('descarga con valores predeterminados mientras el arranque de la API sigue pendiente', async ({ page }) => {
  const api = await prepararEditor(page);
  api.modo = 'pendiente';
  await cargarImagen(page);
  const pendiente = page.waitForEvent('download');
  await page.locator('#btnDescargar').click();
  const descarga = await pendiente;
  expect(descarga.suggestedFilename()).toMatch(/\.png$/);
  expect(await descarga.failure()).toBeNull();
  await expect(page).toHaveURL(/\/pages\/editor\.html$/);
});
