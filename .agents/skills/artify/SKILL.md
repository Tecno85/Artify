---
name: artify
description: "Mantener y mejorar Artify en código, interfaz, editor de imágenes, backend, API, autenticación, administración, PostgreSQL, pruebas, documentación, despliegue y evidencias académicas. Usar siempre que Codex analice, modifique, pruebe, documente o prepare entregas de este repositorio, incluso ante solicitudes generales de revisión o pulido."
---

# Artify

Aplicar primero las reglas permanentes de `AGENTS.md`. Usar este skill para clasificar la tarea, resolver ambigüedad y cargar bajo demanda los procedimientos especializados, sin duplicar aquí el estado vigente del repositorio.

## Clasificar Y Enrutar

Identificar todos los dominios afectados antes de actuar y leer completas únicamente las referencias aplicables:

- Backend, API, controladores, autenticación, autorización, administración, analytics o secretos: [references/backend-seguridad.md](references/backend-seguridad.md).
- HTML, CSS, JavaScript del navegador, autenticación frontend, panel administrativo, editor Canvas o accesibilidad: [references/frontend-editor-accesibilidad.md](references/frontend-editor-accesibilidad.md).
- PostgreSQL, esquema, consultas, datos semilla, migraciones, respaldo o `backend/config/db.js`: [references/base-datos-migraciones.md](references/base-datos-migraciones.md).
- Documentación funcional o técnica, manuales, capturas, diagramas y evidencias académicas: [references/documentacion-evidencias.md](references/documentacion-evidencias.md).
- Pruebas, revisión final, entrega, estado de Git o commits sugeridos: [references/validacion-cierre.md](references/validacion-cierre.md).

Leer varias referencias cuando la tarea sea transversal. Si durante el trabajo aparece un dominio no detectado inicialmente, detener la modificación, leer su referencia y revisar el impacto antes de continuar.

## Resolver Ambigüedad

Ante una solicitud amplia, breve o incompleta:

1. Inspeccionar primero los archivos y dependencias relacionados sin modificar.
2. Inferir los dominios afectados a partir del comportamiento, las rutas y los contratos existentes.
3. Leer todas las referencias razonablemente aplicables.
4. Elegir la interpretación más conservadora que cumpla la intención sin ampliar materialmente el alcance.
5. Consultar al usuario solo si las alternativas producen comportamientos sustancialmente diferentes, requieren nueva autoridad o implican una decisión de producto no recuperable del repositorio.

## Comprobar El Impacto

Antes de finalizar, reclasificar el cambio y comprobar como mínimo:

- Contrato API: backend, consumidores frontend y pruebas.
- Autenticación o roles: backend, almacenamiento de sesión, redirecciones y pruebas.
- Esquema PostgreSQL: migración, esquema inicial, datos semilla, controladores, pruebas y documentación de datos.
- Interfaz visible: accesibilidad, pruebas frontend, manuales y capturas que representen el estado anterior.
- Editor: Canvas, historial, persistencia, operaciones, descarga y documentación relacionada.

Aplicar la validación y el cierre descritos en `references/validacion-cierre.md` cuando la tarea deje cambios o requiera una evaluación verificable.

## Mantener El Skill

Tratar `.agents/skills/artify/` como única fuente de verdad versionada. Después de modificarla, ejecutar el validador oficial, comprobar `agents/openai.yaml` y verificar sus referencias. No mantener otra copia global con el mismo nombre, porque Codex no combina skills duplicados.
