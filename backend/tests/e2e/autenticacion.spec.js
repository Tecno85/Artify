const { expect, test } = require('@playwright/test');

function crearTokenPrueba(usuario) {
  const payload = Buffer.from(
    JSON.stringify({
      id: usuario.id,
      rol: usuario.rol,
      exp: 4_102_444_800,
    })
  ).toString('base64url');

  return `e30.${payload}.firma-prueba`;
}

async function prepararApi(page, usuario, opciones = {}) {
  await page.route('http://127.0.0.1:3000/**', async (route) => {
    const url = new URL(route.request().url());
    let body = { mensaje: 'ok' };

    if (url.pathname === '/api/login') {
      body = {
        mensaje: 'Login exitoso',
        token: crearTokenPrueba(usuario),
        usuario,
      };
    } else if (url.pathname === '/api/registro') {
      body = {
        mensaje: 'Registro exitoso',
        token: crearTokenPrueba(usuario),
        usuario,
      };
    } else if (url.pathname === '/api/sesion/iniciar') {
      body = { mensaje: 'Sesión iniciada', idSesion: 101 };
    } else if (url.pathname.startsWith('/api/configuracion/')) {
      body = { mensaje: 'ok', configuracion: null };
    } else if (url.pathname === '/api/admin/usuarios') {
      body = { mensaje: 'ok', usuarios: opciones.usuariosAdmin || [] };
    }

    await route.fulfill({ json: body });
  });
}

async function iniciarSesion(page, usuario, recordar = false) {
  await prepararApi(page, usuario);
  await page.goto('/pages/login.html');
  await page.locator('#email').fill(usuario.correo);
  await page.locator('#password').fill('ClaveSegura1');
  if (recordar) {
    await page.locator('#remember').check();
  }
  await page.locator('#loginForm button[type="submit"]').click();
}

test('usuario inicia sesión, conserva el token y entra al editor', async ({
  page,
}) => {
  const usuario = {
    id: 7,
    nombres: 'Usuario',
    apellidos: 'E2E',
    correo: 'usuario.e2e@artify.local',
    rol: 'usuario',
  };

  await iniciarSesion(page, usuario);
  await page.waitForURL('**/pages/editor.html');

  await expect(page.locator('#userName')).toHaveText('Usuario E2E');
  await expect
    .poll(() =>
      page.evaluate(() => ({
        token: sessionStorage.getItem('artifyToken'),
        usuario: JSON.parse(sessionStorage.getItem('artifyUser')),
      }))
    )
    .toEqual({ token: crearTokenPrueba(usuario), usuario });
});

test('usuario se registra, acepta términos y entra al editor', async ({
  page,
}) => {
  const usuario = {
    id: 22,
    nombres: 'Ana',
    apellidos: 'Operadora',
    correo: 'ana.operadora@artify.local',
    rol: 'usuario',
  };

  await prepararApi(page, usuario);
  await page.goto('/pages/registro.html');

  await page.locator('#nombres').fill(usuario.nombres);
  await page.locator('#apellidos').fill(usuario.apellidos);
  await page.locator('#email').fill(usuario.correo);
  await page.locator('#password').fill('ClaveSegura1');
  await page.locator('#confirmPassword').fill('ClaveSegura1');
  await page.locator('#registroForm button[type="submit"]').click();

  await expect(page.locator('#terminos-error')).toHaveText(
    'Debes aceptar los términos y condiciones'
  );
  await expect(page.locator('#terminos')).toHaveAttribute(
    'aria-invalid',
    'true'
  );

  await page.locator('#terminos').check();
  await page.locator('#registroForm button[type="submit"]').click();
  await page.waitForURL('**/pages/editor.html');

  await expect(page.locator('#userName')).toHaveText('Ana Operadora');
  await expect
    .poll(() =>
      page.evaluate(() => ({
        token: sessionStorage.getItem('artifyToken'),
        usuario: JSON.parse(sessionStorage.getItem('artifyUser')),
        tokenRecordado: localStorage.getItem('artifyToken'),
      }))
    )
    .toEqual({
      token: crearTokenPrueba(usuario),
      usuario,
      tokenRecordado: null,
    });
});

test('usuario operativo no permanece en el panel administrativo', async ({
  page,
}) => {
  const usuario = {
    id: 31,
    nombres: 'Usuario',
    apellidos: 'Operativo',
    correo: 'operativo.e2e@artify.local',
    rol: 'usuario',
  };

  await prepararApi(page, usuario);
  await page.addInitScript(
    ({ token, usuarioActual }) => {
      sessionStorage.setItem('artifyToken', token);
      sessionStorage.setItem('artifyUser', JSON.stringify(usuarioActual));
    },
    {
      token: crearTokenPrueba(usuario),
      usuarioActual: usuario,
    }
  );

  await page.goto('/pages/admin.html');
  await page.waitForURL('**/pages/editor.html');

  await expect(page.locator('#adminPanel')).toHaveCount(0);
  await expect(page.locator('#userName')).toHaveText('Usuario Operativo');
  await expect
    .poll(() => page.evaluate(() => sessionStorage.getItem('artifyToken')))
    .toBe(crearTokenPrueba(usuario));
});

test('administrador inicia sesión y entra al panel administrativo', async ({
  page,
}) => {
  const usuario = {
    id: 1,
    nombres: 'Administrador',
    apellidos: 'E2E',
    correo: 'admin.e2e@artify.local',
    rol: 'admin',
  };

  await iniciarSesion(page, usuario);
  await page.waitForURL('**/pages/admin.html');

  await expect(page.locator('#adminName')).toContainText('Administrador');
  await expect
    .poll(() => page.evaluate(() => sessionStorage.getItem('artifyToken')))
    .toBe(crearTokenPrueba(usuario));
});

test('administrador no puede eliminar su propia cuenta desde el panel', async ({
  page,
}) => {
  const usuario = {
    id: 1,
    nombres: 'Laura',
    apellidos: 'Administradora',
    correo: 'laura.admin@artify.local',
    rol: 'admin',
  };

  const usuariosAdmin = [
    {
      usr_id_usuario: 1,
      usr_nombres: 'Laura',
      usr_apellidos: 'Administradora',
      usr_correo: 'laura.admin@artify.local',
      usr_fecha_registro: '2026-07-10T00:00:00.000Z',
      usr_estado_usuario: 'activo',
      usr_rol: 'admin',
    },
    {
      usr_id_usuario: 2,
      usr_nombres: 'Carlos',
      usr_apellidos: 'Operador',
      usr_correo: 'carlos.operador@artify.local',
      usr_fecha_registro: '2026-07-15T00:00:00.000Z',
      usr_estado_usuario: 'activo',
      usr_rol: 'usuario',
    },
  ];

  await prepararApi(page, usuario, { usuariosAdmin });
  await page.goto('/pages/login.html');
  await page.locator('#email').fill(usuario.correo);
  await page.locator('#password').fill('ClaveSegura1');
  await page.locator('#loginForm button[type="submit"]').click();
  await page.waitForURL('**/pages/admin.html');

  const filaCuentaActual = page
    .locator('#tablaBody tr')
    .filter({ hasText: 'Laura Administradora' });
  await expect(filaCuentaActual).toContainText('Cuenta actual');
  await expect(filaCuentaActual.locator('.btn-eliminar-row')).toBeDisabled();
  await expect(filaCuentaActual.locator('.btn-eliminar-row')).toHaveAttribute(
    'title',
    'No puedes eliminar tu propia cuenta administrativa'
  );

  const filaOtroUsuario = page
    .locator('#tablaBody tr')
    .filter({ hasText: 'Carlos Operador' });
  await expect(filaOtroUsuario.locator('.btn-eliminar-row')).toBeEnabled();
  await expect(filaOtroUsuario.locator('.btn-eliminar-row')).toHaveText(
    /Eliminar/
  );
});

test('recordar sesión mantiene el acceso al abrir el editor en otra pestaña', async ({
  context,
  page,
}) => {
  const usuario = {
    id: 12,
    nombres: 'Usuario',
    apellidos: 'Recordado',
    correo: 'recordado.e2e@artify.local',
    rol: 'usuario',
  };

  await iniciarSesion(page, usuario, true);
  await page.waitForURL('**/pages/editor.html');

  const nuevaPagina = await context.newPage();
  await prepararApi(nuevaPagina, usuario);
  await nuevaPagina.goto('/');
  await nuevaPagina.waitForURL('**/pages/editor.html');

  await expect(nuevaPagina.locator('#userName')).toHaveText(
    'Usuario Recordado'
  );
  await nuevaPagina.close();
});
