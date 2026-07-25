# Artify

## Alcance Y Fuentes

Aplicar estas instrucciones a todo el repositorio. Trabajar desde la raíz identificada por `CONTEXT.md`, `README.md`, `frontend/` y `backend/`.

- Leer siempre `CONTEXT.md` antes de analizar o modificar el proyecto.
- Leer `README.md` para instalación, uso o navegación documental.
- Leer `docs/tecnica/coding-standards.md` para estilo y convenciones.
- Usar el skill `artify` ubicado en `.agents/skills/artify/` para toda tarea de análisis, cambio, prueba, documentación, evidencia o pulido del proyecto; dejar que el skill cargue solo las referencias especializadas aplicables.
- Consultar el repositorio como fuente de verdad para endpoints, estructura, cifras de pruebas y demás datos volátiles.

## Proteger El Trabajo Existente

Antes de modificar archivos:

1. Revisar `git status` y, en archivos coincidentes, el diff existente.
2. Distinguir los cambios preexistentes del usuario de los cambios propios de la tarea.
3. No restaurar, sobrescribir, reformatear ni incorporar automáticamente cambios ajenos al alcance.
4. Realizar ediciones mínimas compatibles; consultar si no es posible separar con seguridad cambios coincidentes.

## Arquitectura Y Convenciones

- Mantener HTML, CSS y JavaScript Vanilla en frontend; Node.js con Express en backend; PostgreSQL mediante `pg`; y `pnpm` en `backend/`.
- No introducir frameworks frontend, TypeScript, bundlers, ORMs ni cambios grandes de arquitectura sin aprobación explícita.
- Preservar la separación entre `frontend/`, `backend/`, `database/`, `docs/`, `scripts/` y `.agents/`.
- Usar nombres y textos en español cuando el archivo existente esté en español.
- Hacer cambios pequeños, trazables y enfocados; evitar reescrituras amplias.

## Calidad, Seguridad Y Coherencia

- Validar siempre en backend aunque el frontend también valide.
- Renderizar de forma segura datos externos y no exponer secretos, tokens, credenciales ni datos personales.
- Mantener `.env` fuera del repositorio y actualizar `.env.example` cuando cambien variables requeridas.
- Mantener implementado y futuro separados; no presentar funciones planeadas como existentes.
- Actualizar `CONTEXT.md` cuando cambie el estado real del proyecto.
- Actualizar el índice documental de `README.md` al agregar, eliminar o reubicar documentos relevantes.
- Contrastar código, pruebas y documentación cuando cambie un comportamiento; modificar únicamente las fuentes que queden desactualizadas.
- Ejecutar pruebas de integración solo con `NODE_ENV=test`, confirmación explícita y una base cuyo nombre termine en `_test`; no desactivar las guardas ni usar datos de desarrollo o producción.
- No ejecutar `git commit` ni `git push` salvo solicitud explícita.
