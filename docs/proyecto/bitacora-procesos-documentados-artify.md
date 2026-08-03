# Bitácora de procesos documentados de Artify

**Evidencia de producto:** GA11-220501098-AA1-EV04<br>
**Producto:** bitácora con los procesos documentados<br>
**Estudiante:** Iván Darío Madrid Daza<br>
**Programa:** Análisis y Desarrollo de Software<br>
**Institución:** Servicio Nacional de Aprendizaje (SENA)<br>
**Instructor:** José Ignacio Botero Osorio<br>
**Fecha:** Julio de 2026

---

## Control del documento

| Elemento | Descripción |
| --- | --- |
| Documento | Bitácora de procesos documentados del proyecto Artify |
| Evidencia | GA11-220501098-AA1-EV04 |
| Versión | 1.0 |
| Periodo registrado | 24 de junio al 30 de julio de 2026 |
| Responsable | Iván Darío Madrid Daza |
| Estado | Procesos consolidados y documentados |
| Antecedentes | [Diseño de instrumentos EV02](./instrumentos-calidad-software.md) y [formatos diligenciados EV03](./instrumentos-calidad-software-diligenciados.md) |

## 1. Introducción

Una bitácora permite conservar la memoria del proyecto y explicar cómo se llegó al estado actual. No se limita a indicar que un archivo cambió: registra la necesidad que originó el trabajo, las actividades realizadas, los resultados, las dificultades, las decisiones y la evidencia disponible. Esta información ayuda a comprender el avance, repetir una comprobación y evitar que un aprendizaje se pierda.

En esta evidencia documento la evolución verificable de Artify, una aplicación web de edición de imágenes con frontend HTML, CSS y JavaScript Vanilla, backend Node.js con Express y persistencia PostgreSQL. La bitácora comienza el 24 de junio de 2026, fecha en la que inició la consolidación del repositorio oficial con PostgreSQL, y termina el 30 de julio de 2026 con la revisión de calidad, seguridad, despliegue y coherencia documental.

Los registros se construyeron a partir del historial Git, `CONTEXT.md`, `README.md`, los requisitos, el código, los workflows, las pruebas y las evidencias académicas. Los commits se usan como referencias técnicas, pero la bitácora agrupa cambios relacionados para explicar su significado. No se inventan tiempos históricos ni se presenta una prueba anterior como si hubiera sido ejecutada nuevamente.

## 2. Objetivos

### 2.1 Objetivo general

Documentar cronológicamente los procesos, avances, resultados, dificultades, decisiones y aprendizajes más importantes del desarrollo de Artify mediante una bitácora clara, trazable y relacionada con buenas prácticas de calidad de *software*.

### 2.2 Objetivos específicos

- Consolidar los hitos verificables del proyecto sin convertir la bitácora en una lista de commits.
- Relacionar planificación, construcción, pruebas, despliegue, mantenimiento y documentación.
- Registrar obstáculos y decisiones con la evidencia disponible en el repositorio.
- Aplicar buenas prácticas proporcionales de ISO/IEC 25010, ISO/IEC/IEEE 12207, MinTIC, PSP, Scrum y OWASP.
- Identificar aprendizajes y acciones de mejora que orienten el trabajo posterior.

## 3. Alcance y metodología

### 3.1 Alcance temporal y técnico

La bitácora cubre el periodo trazable del repositorio oficial de Artify entre el 24 de junio y el 30 de julio de 2026. Incluye los procesos relacionados con:

- consolidación y control de versiones;
- diseño y migración de PostgreSQL;
- frontend, editor y accesibilidad;
- backend, autenticación, autorización y seguridad;
- pruebas automatizadas y validaciones manuales;
- despliegue en GitHub Pages, Render y Neon;
- respaldo, mantenimiento, monitoreo y documentación;
- evidencias de calidad GA11-220501098-AA1-EV01 a EV04.

La bitácora no reconstruye el tiempo invertido en actividades históricas porque ese dato no fue registrado de forma uniforme. Los tiempos medidos en la EV03 conservan su alcance propio y no se extrapolan al resto del proyecto.

### 3.2 Fuentes de evidencia

| Fuente | Uso en la bitácora |
| --- | --- |
| Historial Git | Fechas, cambios y referencias técnicas |
| [`CONTEXT.md`](../../CONTEXT.md) | Estado operativo, decisiones e historial reciente |
| [`README.md`](../../README.md) | Presentación, uso, pruebas, despliegue e índice documental |
| [`requerimientos-funcionales.md`](./requerimientos-funcionales.md) | Necesidades y criterios verificables |
| Código de `frontend/` y `backend/` | Correspondencia entre documentación e implementación |
| `database/postgresql/` | Esquema, migraciones, respaldo y menor privilegio |
| `.github/workflows/` y `scripts/` | Integración continua, despliegue, migraciones y monitoreo |
| EV02 y EV03 | Instrumentos diseñados, resultados y acciones de mejora |

### 3.3 Criterios de registro

Cada entrada conserva los siguientes campos:

| Campo | Propósito |
| --- | --- |
| Fecha o periodo | Ubicar el avance en el tiempo |
| Proceso | Relacionar el hito con el ciclo de vida |
| Objetivo | Explicar la necesidad atendida |
| Actividades | Resumir el trabajo realizado |
| Resultado | Indicar el producto o cambio obtenido |
| Obstáculo u observación | Conservar el problema, riesgo o dato útil |
| Decisión | Explicar el criterio adoptado |
| Buena práctica | Relacionar el trabajo con un referente |
| Evidencia | Permitir la verificación |
| Estado y siguiente acción | Distinguir cierre y trabajo pendiente |

## 4. Buenas prácticas seleccionadas

Los referentes se aplican de manera complementaria y proporcional. Su uso en esta bitácora no representa una certificación de Artify.

| Referente | Práctica seleccionada | Aplicación en la bitácora |
| --- | --- | --- |
| ISO/IEC/IEEE 12207:2026 | Organizar y mejorar procesos del ciclo de vida | Clasificación de planificación, desarrollo, operación, mantenimiento y documentación |
| ISO/IEC 25010:2023 | Definir y evaluar características de calidad | Análisis de funcionalidad, fiabilidad, interacción, seguridad y mantenibilidad |
| MinTIC - MGGTI | Mantener información documentada, seguimiento y mejora | Trazabilidad entre decisiones, resultados, evidencias y acciones |
| PSP | Registrar trabajo, defectos y aprendizaje personal | Observaciones, defectos documentales y revisión posterior |
| Scrum | Inspeccionar resultados y adaptar el trabajo | Ajustes iterativos después de pruebas y revisiones |
| OWASP Top 10 | Revisar riesgos web prioritarios | Autenticación, autorización, inyección, configuración y dependencias |

## 5. Resumen cronológico

| N.º | Fecha o periodo | Hito | Resultado principal |
| --- | --- | --- | --- |
| 1 | 24/06/2026 | Consolidación del repositorio | Base oficial de Artify con PostgreSQL |
| 2 | 27-28/06/2026 | Validación y formalización | PostgreSQL declarado motor oficial |
| 3 | 04/07/2026 | Despliegue y acceso | Validación pública inicial y login unificado |
| 4 | 07/07/2026 | Identidad y mantenimiento | Proyecto renombrado y plan de soporte documentado |
| 5 | 09/07/2026 | Seguridad, sesiones y analíticas | Estado, descargas y contratos reforzados |
| 6 | 10-12/07/2026 | Editor y publicación | Filtros mejorados y frontend desplegado con Actions |
| 7 | 13/07/2026 | Instalación y pruebas seguras | Documentación consolidada y base de pruebas protegida |
| 8 | 14/07/2026 | Calidad del backend | Límites, CORS, autorización y validaciones reforzados |
| 9 | 14/07/2026 | Operación y recuperación | Autoguardado, accesibilidad, respaldo y pruebas E2E |
| 10 | 17/07/2026 | Modularización y monitoreo | Cobertura frontend y smoke público diario |
| 11 | 19-20/07/2026 | Sesión y minimización funcional | Historial persistente retirado y sesión recordada implementada |
| 12 | 21-23/07/2026 | Claridad, datos y manuales | Filtros continuos, menos datos personales y guías de usuario |
| 13 | 24-25/07/2026 | Entrega y documentación interna | Capacitación, actas y comentarios técnicos |
| 14 | 29-30/07/2026 | Evidencias de calidad | Infografía, instrumentos y formatos diligenciados |
| 15 | 30/07/2026 | Auditoría documental y técnica | Datos actualizados y riesgo de dependencia registrado |

## 6. Bitácora detallada

### Registro 1. Consolidación de Artify con PostgreSQL

| Campo | Registro |
| --- | --- |
| Fecha | 24 de junio de 2026 |
| Proceso | Planificación, construcción y gestión de configuración |
| Objetivo | Establecer un repositorio oficial y una base tecnológica coherente para Artify |
| Actividades | Se creó el proyecto, se incorporó el esquema PostgreSQL y se migró el backend mediante `pg`. También se preparó la configuración necesaria para el despliegue. |
| Resultado | Artify quedó organizado con frontend Vanilla, backend Node.js y persistencia PostgreSQL. |
| Obstáculo u observación | Los controladores existentes utilizaban convenciones heredadas, por lo que una migración directa podía romper consultas y respuestas. |
| Decisión | Conservar una capa de compatibilidad en `backend/config/db.js` para adaptar marcadores y resultados mientras PostgreSQL se convertía en la fuente oficial. |
| Buena práctica | ISO 12207: control de la construcción y de la configuración; ISO 25010: mantenibilidad. |
| Evidencia | Commits `73759bf`, `2a65482` y `8458f7a`; `database/postgresql/schema.sql`. |
| Estado y siguiente acción | Cerrado. Continuar con validación reproducible y documentación. |

### Registro 2. Validación y formalización del motor de datos

| Campo | Registro |
| --- | --- |
| Fecha | 27 al 28 de junio de 2026 |
| Proceso | Verificación, validación y documentación técnica |
| Objetivo | Comprobar que la variante PostgreSQL podía instalarse, probarse y explicarse de forma reproducible |
| Actividades | Se actualizaron los documentos, se reforzó el backend y se detallaron la preparación local, Neon y el despliegue full stack. |
| Resultado | PostgreSQL quedó formalizado como motor oficial y se documentaron los entornos local y administrado. |
| Obstáculo u observación | Era necesario separar las credenciales locales de la cadena privada de producción para evitar configuraciones inseguras. |
| Decisión | Usar variables `DB_*` en local y `DATABASE_URL` en servicios administrados, siempre fuera del repositorio. |
| Buena práctica | OWASP: configuración segura; MinTIC: información documentada y trazabilidad. |
| Evidencia | Commits `4a0b554`, `e131091`, `4f105f1`, `02a208e`, `f2c43cc` y `94a269e`. |
| Estado y siguiente acción | Cerrado. Validar públicamente la arquitectura. |

### Registro 3. Despliegue público y acceso unificado

| Campo | Registro |
| --- | --- |
| Fecha | 4 de julio de 2026 |
| Proceso | Despliegue, transición y validación funcional |
| Objetivo | Publicar Artify y simplificar el acceso por roles |
| Actividades | Se validó el despliegue full stack, se unificó el acceso administrativo con el login principal y se ajustó la interfaz para pantallas divididas. |
| Resultado | Usuarios y administradores ingresan por el mismo formulario y son redirigidos según su rol. |
| Obstáculo u observación | El diseño ocupaba demasiado espacio en ventanas de poca altura y el acceso administrativo separado duplicaba lógica. |
| Decisión | Mantener un único flujo de autenticación y aplicar ajustes responsive sin cambiar la identidad visual. |
| Buena práctica | ISO 25010: capacidad de interacción y adecuación funcional; Scrum: inspección y adaptación. |
| Evidencia | Commits `286b4fb`, `bb00d24`, `3fa245f`, `dd73c2f`, `fd62033` y `97816ef`. |
| Estado y siguiente acción | Cerrado. Mantener observación sobre diferentes tamaños de pantalla. |

### Registro 4. Identidad del proyecto y mantenimiento

| Campo | Registro |
| --- | --- |
| Fecha | 7 de julio de 2026 |
| Proceso | Mantenimiento y gestión documental |
| Objetivo | Consolidar el nombre Artify y definir cómo conservar el sistema operativo y documentado |
| Actividades | Se elaboró el plan de mantenimiento, se actualizó la identidad del repositorio y se ajustó el fondo principal. |
| Resultado | El repositorio `artify` quedó como referencia oficial y el mantenimiento se organizó en acciones preventivas y correctivas. |
| Obstáculo u observación | La coexistencia de nombres históricos podía producir enlaces, instrucciones y evidencias contradictorias. |
| Decisión | Conservar el estado histórico fuera del repositorio activo y usar Artify como nombre único en la documentación vigente. |
| Buena práctica | ISO 12207: mantenimiento y gestión de configuración; MinTIC: gobierno de la información. |
| Evidencia | Commits `426e7c3`, `06af683`, `e471eff`, `f2401f5` y `5909941`. |
| Estado y siguiente acción | Cerrado. Revisar enlaces después de cada cambio de despliegue. |

### Registro 5. Seguridad, sesiones, respaldo y analíticas

| Campo | Registro |
| --- | --- |
| Fecha | 9 de julio de 2026 |
| Proceso | Construcción, seguridad, datos y validación |
| Objetivo | Corregir inconsistencias de estado y mejorar la trazabilidad operativa |
| Actividades | Se documentó el respaldo con referencia en ISO 27001, se actualizaron las URL activas y se reforzaron sesiones, descargas, estados de cuenta, analíticas y pruebas. |
| Resultado | Los indicadores usan datos reales de operaciones y descargas; las cuentas suspendidas o inválidas reciben controles coherentes. |
| Obstáculo u observación | Las sesiones y analíticas podían quedar desalineadas si una descarga o un cambio de estado no se registraban correctamente. |
| Decisión | Actualizar estado y contadores de forma explícita y mantener pruebas sobre los contratos de analytics. |
| Buena práctica | ISO 25010: seguridad y fiabilidad; OWASP: autenticación y control de acceso. |
| Evidencia | Commits `dc9cc88`, `8cca8d5`, `5296cff`, `90943d6` y `a9104bf`. |
| Estado y siguiente acción | Cerrado. Mantener respaldo y monitoreo como controles periódicos. |

### Registro 6. Iteración del editor y despliegue mediante GitHub Actions

| Campo | Registro |
| --- | --- |
| Fecha | 10 al 12 de julio de 2026 |
| Proceso | Construcción, integración y despliegue |
| Objetivo | Mejorar la interacción con filtros y automatizar la publicación del frontend |
| Actividades | Se ajustaron vistas previas, selección de filtros, layouts de autenticación y opciones del editor. Se impidió conservar un recorte pendiente al cambiar de herramienta y se configuró GitHub Pages mediante Actions. |
| Resultado | El editor ofrece una interacción más controlada y cada `push` a `main` puede publicar el frontend con la URL del backend generada. |
| Obstáculo u observación | Las operaciones pendientes podían producir estados visuales ambiguos y la configuración pública no debía quedar escrita con credenciales o valores locales. |
| Decisión | Cancelar estados incompatibles al cambiar de herramienta y generar `config.js` durante el workflow. |
| Buena práctica | ISO 25010: capacidad de interacción; ISO 12207: integración y transición. |
| Evidencia | Commits `b37138f`, `2c42f3c`, `78e5ea5`, `4208f85`, `9d1a4dd`, `cf9b0f3` y `237632b`. |
| Estado y siguiente acción | Cerrado. Validar el entorno publicado después de cada despliegue. |

### Registro 7. Instalación consolidada y pruebas protegidas

| Campo | Registro |
| --- | --- |
| Fecha | 13 de julio de 2026 |
| Proceso | Documentación, pruebas y seguridad |
| Objetivo | Hacer reproducible la instalación y evitar que las pruebas modifiquen datos reales |
| Actividades | Se consolidaron las guías de instalación y despliegue, se retiró el dump histórico y se incorporaron guardas para la base de pruebas. También se reforzaron la carga de imágenes, el inicio del editor, la configuración del backend y el renderizado seguro. |
| Resultado | La suite de integración exige `NODE_ENV=test`, confirmación explícita y una base terminada en `_test`; los mensajes externos se muestran como texto. |
| Obstáculo u observación | Una ejecución accidental contra Neon o producción podía alterar datos, y el contenido dinámico podía convertirse en un vector de inyección. |
| Decisión | Bloquear configuraciones de prueba inseguras y usar renderizado textual para datos externos. |
| Buena práctica | OWASP: inyección y configuración; PSP: prevención temprana de defectos. |
| Evidencia | Commits `ae691fe`, `671427f`, `f3d1576`, `92ce3d5`, `c57a174`, `f60ab8c`, `722a8bd` y `069fe49`. |
| Estado y siguiente acción | Cerrado. Mantener las guardas como requisito obligatorio. |

### Registro 8. Fortalecimiento integral del backend

| Campo | Registro |
| --- | --- |
| Fecha | 14 de julio de 2026 |
| Proceso | Construcción, verificación y seguridad |
| Objetivo | Reducir riesgos en solicitudes, autenticación, autorización, configuración y concurrencia |
| Actividades | Se agregaron límites y cabeceras HTTP, control de intentos, CORS explícito, respuestas uniformes, validación de identificadores, transacciones, protección de la cuenta administrativa y reglas compartidas para contraseñas y datos personales. |
| Resultado | El backend limita cuerpos a `64kb`, oculta `X-Powered-By`, evita caché en rutas operativas y valida identidad, rol, propiedad y estado actual. |
| Obstáculo u observación | Las validaciones duplicadas podían divergir y las solicitudes concurrentes podían desordenar operaciones de una sesión. |
| Decisión | Centralizar reglas reutilizables y bloquear la sesión dentro de transacciones cuando se registran operaciones o imágenes. |
| Buena práctica | OWASP: acceso, autenticación, inyección y configuración; ISO 25010: seguridad y fiabilidad. |
| Evidencia | Commits `fbff8de`, `dbfda1b`, `0413e6b`, `ccb6e34`, `3210199`, `0ef299b`, `7f74ed1`, `dd7397f` y `e7519e1`. |
| Estado y siguiente acción | Cerrado. Continuar auditorías de dependencias y pruebas negativas. |

### Registro 9. Recuperación, accesibilidad y operación verificable

| Campo | Registro |
| --- | --- |
| Fecha | 14 de julio de 2026 |
| Proceso | Operación, respaldo, validación y mejora |
| Objetivo | Fortalecer la recuperación del trabajo y la evidencia operativa |
| Actividades | Se completó el autoguardado local, se validaron despliegue y navegadores, se incorporó semántica accesible, se verificó respaldo y restauración, se midió `/health` y se agregó una prueba E2E del editor. |
| Resultado | El respaldo local queda aislado por usuario durante siete días; existen scripts reproducibles de validación pública, migración y restauración. |
| Obstáculo u observación | Una copia local inválida o perteneciente a otro usuario no debía recuperarse; una medición breve de salud no debía presentarse como prueba de capacidad. |
| Decisión | Validar propietario y antigüedad del respaldo, y documentar explícitamente los límites de las mediciones. |
| Buena práctica | ISO 25010: fiabilidad e interacción; ISO 12207: operación y mantenimiento. |
| Evidencia | Commits `3899662`, `12bc755`, `efd1981`; `scripts/verificar-respaldo-postgresql.js`. |
| Estado y siguiente acción | Cerrado. Repetir restauraciones y pruebas de forma periódica. |

### Registro 10. Modularización, cobertura y monitoreo público

| Campo | Registro |
| --- | --- |
| Fecha | 17 de julio de 2026 |
| Proceso | Mantenimiento, pruebas y monitoreo |
| Objetivo | Reducir acoplamiento del editor y detectar fallos del despliegue de forma temprana |
| Actividades | Se separaron el almacenamiento y las validaciones de imagen, se amplió el login E2E, se integró cobertura frontend y se agregó monitoreo público diario. |
| Resultado | El código crítico del editor dispone de módulos específicos y el workflow comprueba Pages, Render, PostgreSQL, analytics y CORS. |
| Obstáculo u observación | El crecimiento de `editor.js` dificultaba probar responsabilidades aisladas y una validación manual podía no detectar una caída posterior. |
| Decisión | Extraer módulos con API controlada y ejecutar un smoke no destructivo programado. |
| Buena práctica | ISO 25010: mantenibilidad; Scrum: inspección frecuente; MinTIC: seguimiento. |
| Evidencia | Commit `e1dbe63`; `.github/workflows/monitor-public.yml`. |
| Estado y siguiente acción | Cerrado. Ampliar cobertura según el riesgo, no solo por porcentaje. |

### Registro 11. Sesión recordada y simplificación del perfil

| Campo | Registro |
| --- | --- |
| Fecha | 19 al 20 de julio de 2026 |
| Proceso | Mantenimiento evolutivo y experiencia de usuario |
| Objetivo | Eliminar información poco útil y permitir que el usuario elija la persistencia de su sesión |
| Actividades | Se retiró el historial persistente del perfil, se implementó “Recordar sesión”, se agregaron términos consultables y se aclaró el procesamiento local de imágenes. |
| Resultado | El perfil conserva el contador de operaciones y el editor mantiene su historial local; la sesión puede guardarse temporalmente o en `localStorage`. |
| Obstáculo u observación | El historial persistente podía confundirse con el historial local de deshacer y rehacer, y una sesión expirada no debía redirigir automáticamente. |
| Decisión | Separar los conceptos de historial y descartar tokens expirados antes de redirigir. |
| Buena práctica | ISO 25010: capacidad de interacción y seguridad; Scrum: simplificación basada en revisión. |
| Evidencia | Commits `68c7549`, `df52436` y `aa8bd5d`. |
| Estado y siguiente acción | Cerrado. Mantener mensajes que expliquen almacenamiento y privacidad. |

### Registro 12. Claridad de filtros, minimización de datos y manuales

| Campo | Registro |
| --- | --- |
| Fecha | 21 al 23 de julio de 2026 |
| Proceso | Construcción, datos, pruebas y documentación de usuario |
| Objetivo | Hacer más predecibles los filtros, mejorar el contraste y solicitar solo información necesaria |
| Actividades | Se implementó una sesión continua de filtros, se ajustó la legibilidad, se simplificó el registro, se eliminaron datos de identificación del esquema y se elaboraron las guías de usuario operativo y administrador. |
| Resultado | El sistema gestiona nombres, apellidos, correo, contraseña y datos operativos; los manuales reflejan los flujos vigentes. |
| Obstáculo u observación | Las vistas previas repetidas podían acumular efectos y los formularios históricos solicitaban más información de la necesaria. |
| Decisión | Recalcular filtros desde una base estable y aplicar minimización de datos en frontend, backend y PostgreSQL. |
| Buena práctica | OWASP: reducción de exposición; ISO 25010: interacción y seguridad; MinTIC: gestión de información. |
| Evidencia | Commits `2ed6e36`, `aeff846`, `905f833`, `c703ffe`, `cf209cf` y `20eebd9`; migraciones `20260721_002` y `20260723_003`. |
| Estado y siguiente acción | Cerrado. Revisar los manuales cuando cambie una interfaz visible. |

### Registro 13. Preparación de entrega y documentación interna

| Campo | Registro |
| --- | --- |
| Fecha | 24 al 25 de julio de 2026 |
| Proceso | Transición, capacitación y mantenibilidad |
| Objetivo | Preparar la entrega académica y facilitar el mantenimiento del código y del repositorio |
| Actividades | Se elaboraron el plan de capacitación y las actas de satisfacción y entrega, se mejoraron comentarios técnicos y se reorganizaron las reglas del skill de Artify. |
| Resultado | El proyecto dispone de materiales para transferencia de conocimiento y de instrucciones internas especializadas por dominio. |
| Obstáculo u observación | Comentarios excesivos o desactualizados también dificultan el mantenimiento; las reglas generales no cubrían por igual backend, frontend, datos y evidencias. |
| Decisión | Mantener comentarios selectivos sobre decisiones no evidentes y separar procedimientos especializados. |
| Buena práctica | ISO 12207: transición y mantenimiento; MinTIC: uso, apropiación e información documentada. |
| Evidencia | Commits `3c3e0ba`, `674a379`, `36aceaf` y `334d01c`. |
| Estado y siguiente acción | Cerrado. Actualizar materiales cuando cambien contratos o procesos. |

### Registro 14. Evidencias de procesos y calidad de software

| Campo | Registro |
| --- | --- |
| Fecha | 29 al 30 de julio de 2026 |
| Proceso | Aseguramiento de calidad y documentación académica |
| Objetivo | Explicar los procesos de desarrollo y aplicar instrumentos de calidad sobre Artify |
| Actividades | Se elaboró la infografía EV01, se diseñaron ocho instrumentos en la EV02 y se diligenciaron con resultados reales en la EV03. También se corrigieron proporciones visuales y se retiró un PDF que ya no formaba parte de la entrega. |
| Resultado | Artify cuenta con plan, trazabilidad, listas, matriz de pruebas, registro de defectos, PSP y revisión posterior documentados. |
| Obstáculo u observación | Los diagramas de la EV02 perdieron su proporción durante la generación del documento y la cifra de pruebas debía comprobarse contra la suite actual. |
| Decisión | Revisar visualmente todos los recursos y separar evidencia ejecutada, inspeccionada e histórica. |
| Buena práctica | PSP: registro y prevención de defectos; Scrum: revisión posterior; ISO 12207: aseguramiento de calidad. |
| Evidencia | Commits `d709c21`, `f6aa7e1`, `65fddf2`, `5e8b5b4`, `ac70a63` y `d348949`; EV01, EV02 y EV03. |
| Estado y siguiente acción | Cerrado. Consolidar los procesos en la presente bitácora. |

### Registro 15. Auditoría documental y técnica de cierre

| Campo | Registro |
| --- | --- |
| Fecha | 30 de julio de 2026 |
| Proceso | Revisión, mantenimiento y mejora continua |
| Objetivo | Verificar que la documentación principal coincidiera con el repositorio y el despliegue actuales |
| Actividades | Se contrastaron README, CONTEXT, documentos técnicos, rutas, esquema, versiones, pruebas y enlaces. Se ejecutaron sintaxis backend, 26 pruebas frontend con cobertura, `pnpm audit --prod` y el smoke público de nueve comprobaciones. |
| Resultado | Sintaxis aprobada; 26/26 pruebas frontend aprobadas; cobertura de 25,58 % en líneas y 50,00 % en funciones; enlaces locales existentes; nueve comprobaciones públicas correctas. Se actualizaron cifras, cobertura, auditoría y fecha de despliegue. |
| Obstáculo u observación | Algunos documentos conservaban 22 pruebas frontend, una cobertura anterior y la validación pública del 17 de julio. La auditoría reportó una vulnerabilidad baja y transitiva en `body-parser`. |
| Decisión | Corregir primero las fuentes documentales y registrar en esa fecha el aviso `GHSA-v422-hmwv-36x6` como pendiente. El servidor conserva el límite válido `64kb`, pero no se declara el riesgo como resuelto hasta actualizar la dependencia. |
| Buena práctica | OWASP: componentes y configuración; PSP: revisión posterior; MinTIC: seguimiento y mejora. |
| Evidencia | `CONTEXT.md`, `README.md`, documentos de pruebas y despliegue; salidas de los comandos ejecutados el 30/07/2026. |
| Estado y siguiente acción | Cerrado con seguimiento posterior. El 03/08/2026 se actualizó la dependencia transitiva afectada mediante override de `body-parser@2.3.0` y `pnpm audit --prod` quedó sin vulnerabilidades conocidas. |

## 7. Resumen por procesos del ciclo de vida

| Proceso | Aplicación observada en Artify | Evidencia principal |
| --- | --- | --- |
| Planificación | Alcance, arquitectura, riesgos, mantenimiento y criterios de calidad | CONTEXT, requisitos, EV02 |
| Definición | Requisitos funcionales, límites de imagen y contratos de autenticación | Requisitos y matrices |
| Construcción | Frontend, editor, API, PostgreSQL, seguridad y analytics | Código y commits |
| Integración | Comunicación entre Pages, Render y Neon; workflows de CI | Actions y guía de despliegue |
| Verificación | Sintaxis, backend, frontend, E2E, matrices y revisión manual | Suites y documentos de pruebas |
| Validación | Smoke público, navegadores, requisitos y formatos diligenciados | Scripts, EV03 y bitácora |
| Operación | Salud, disponibilidad, analytics, CORS y monitoreo diario | `/health`, `/ready`, monitor público |
| Mantenimiento | Correcciones, modularización, respaldo y actualización documental | Plan de mantenimiento e historial Git |
| Transición | Instalación, despliegue, manuales, capacitación y actas | Documentación técnica y de usuario |

## 8. Obstáculos, decisiones y lecciones aprendidas

| Situación | Decisión adoptada | Aprendizaje |
| --- | --- | --- |
| Migración con consultas heredadas | Crear una capa de compatibilidad PostgreSQL | Una migración gradual reduce roturas y conserva trazabilidad. |
| Riesgo de ejecutar pruebas sobre datos reales | Exigir una base `_test` y confirmación explícita | Una prueba automatizada también necesita controles de seguridad. |
| Estados pendientes del editor | Cancelar o confirmar antes de acciones incompatibles | La coherencia interna mejora la experiencia y previene defectos. |
| Historial persistente poco claro | Conservar contador y separar historial local | Eliminar complejidad puede aportar más valor que añadir funciones. |
| Formularios con datos innecesarios | Aplicar minimización en todas las capas | La privacidad debe reflejarse en interfaz, API y base de datos. |
| Diagramas deformados | Verificar proporciones y páginas antes de entregar | La presentación también forma parte de la calidad documental. |
| Métricas desactualizadas | Ejecutar y contrastar antes de documentar | Una cifra sin fecha ni fuente pierde valor rápidamente. |
| Vulnerabilidad transitiva baja | Registrar el aviso, actualizar la dependencia afectada y repetir auditoría | Un riesgo mitigado por configuración no equivale a una dependencia corregida; el cierre requiere evidencia nueva del auditor. |

## 9. Acciones de mejora y seguimiento

| Prioridad | Acción | Responsable | Criterio de cierre | Estado |
| --- | --- | --- | --- | --- |
| Alta | Actualizar la dependencia transitiva afectada por `GHSA-v422-hmwv-36x6` | Iván Darío Madrid Daza | `pnpm audit --prod` sin el aviso y suites aplicables aprobadas | Aplicada el 03/08/2026 |
| Media | Ampliar cobertura en las funciones de mayor riesgo del editor y administración | Iván Darío Madrid Daza | Nuevos casos relevantes, no solo aumento porcentual | En seguimiento |
| Media | Mantener sincronizadas las cifras de pruebas en documentos vigentes | Iván Darío Madrid Daza | Búsqueda global sin cifras anteriores | Aplicada en esta revisión |
| Media | Repetir el smoke público después de cambios de despliegue | Iván Darío Madrid Daza | Nueve comprobaciones correctas | Control periódico |
| Baja | Aplicar PSP a nuevas tareas con tiempos comparables | Iván Darío Madrid Daza | Registro de estimación, tiempo y revisión posterior | Próxima iteración |

## 10. Relación con las evidencias anteriores

| Evidencia | Producto | Relación con la bitácora |
| --- | --- | --- |
| GA11-220501098-AA1-EV01 | Infografía de procesos | Aporta la visión general del ciclo de desarrollo y sus referentes. |
| GA11-220501098-AA1-EV02 | Diseño de instrumentos | Define los formatos y controles de calidad utilizados. |
| GA11-220501098-AA1-EV03 | Instrumentos diligenciados | Registra una revisión concreta con resultados, defectos y PSP. |
| GA11-220501098-AA1-EV04 | Bitácora | Integra los avances, decisiones, obstáculos, evidencias y aprendizajes del proyecto. |

La secuencia muestra una progresión coherente: primero se explican los procesos, después se diseñan los instrumentos, luego se aplican y finalmente se conserva la memoria del trabajo mediante la bitácora.

## 11. Conclusiones

La bitácora permitió reunir en un solo documento la evolución verificable de Artify sin reducirla a una lista de cambios. Los registros explican qué necesidad se atendió, qué resultado se obtuvo, qué dificultad apareció y qué decisión permitió continuar.

El proyecto avanzó desde la consolidación con PostgreSQL hasta un sistema desplegado con autenticación, editor, persistencia, analíticas, pruebas, respaldo, monitoreo y documentación. Este avance fue iterativo: las pruebas y revisiones originaron ajustes de seguridad, interacción, mantenibilidad y claridad documental.

Las buenas prácticas seleccionadas aportaron criterios complementarios. ISO/IEC/IEEE 12207 ayudó a organizar los procesos; ISO/IEC 25010 permitió relacionarlos con atributos del producto; MinTIC apoyó la trazabilidad; PSP y Scrum orientaron la revisión y mejora; y OWASP permitió registrar riesgos web sin presentar la revisión como una certificación.

El cierre también evidencia que la calidad no significa ausencia absoluta de pendientes. La vulnerabilidad transitiva de severidad baja quedó documentada con una acción verificable y posteriormente se cerró el 3 de agosto de 2026 al fijar `body-parser@2.3.0` y repetir `pnpm audit --prod` sin vulnerabilidades conocidas. Esta transparencia convierte la bitácora en una herramienta útil para continuar el proyecto.

## Referencias

GitHub Advisory Database. (s. f.). *GHSA-v422-hmwv-36x6: body-parser vulnerable to denial of service when invalid limit value silently disables size enforcement*. Consultado el 3 de agosto de 2026. https://github.com/advisories/GHSA-v422-hmwv-36x6

Humphrey, W. S. (2000). *The Personal Software Process (PSP)* (CMU/SEI-2000-TR-022). Software Engineering Institute, Carnegie Mellon University. https://doi.org/10.1184/R1/6585197.v1

International Organization for Standardization. (2023). *ISO/IEC 25010:2023: Systems and software engineering - Systems and software Quality Requirements and Evaluation (SQuaRE) - Product quality model*. https://www.iso.org/standard/78176.html

International Organization for Standardization. (2026). *ISO/IEC/IEEE 12207:2026: Systems and software engineering - Software life cycle processes*. https://www.iso.org/standard/90219.html

Ministerio de Tecnologías de la Información y las Comunicaciones. (s. f.). *Modelo de Gestión y Gobierno TI (MGGTI)*. Consultado el 30 de julio de 2026. https://mintic.gov.co/arquitecturaempresarial/portal/modelomrae/Modelo-de-Gestion-y-Gobierno-TI-MGGTI/

OWASP Foundation. (2021). *OWASP Top 10:2021*. https://owasp.org/Top10/2021/es/

Schwaber, K., & Sutherland, J. (2020). *La Guía de Scrum: la guía definitiva de Scrum, las reglas del juego*. https://scrumguides.org/download.html

---

*Proyecto Artify - Análisis y Desarrollo de Software - SENA 2026*
