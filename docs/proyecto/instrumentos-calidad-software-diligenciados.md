# Instrumentos diligenciados para documentar procesos de calidad del software

**Evidencia:** GA11-220501098-AA1-EV03<br>
**Producto:** formatos diligenciados con el proceso de calidad de software<br>
**Estudiante:** Iván Darío Madrid Daza<br>
**Programa:** Análisis y Desarrollo de Software<br>
**Institución:** Servicio Nacional de Aprendizaje (SENA)<br>
**Instructor:** José Ignacio Botero Osorio<br>
**Fecha:** Julio de 2026

---

## Control del documento

| Elemento | Descripción |
| --- | --- |
| Documento | Instrumentos diligenciados para documentar procesos de calidad del software en Artify |
| Evidencia | GA11-220501098-AA1-EV03 |
| Versión | 1.0 |
| Fecha de diligenciamiento | 30 de julio de 2026 |
| Responsable | Iván Darío Madrid Daza |
| Estado | Revisión ejecutada y documentada |
| Actividad anterior | [Diseño de instrumentos de calidad - GA11-220501098-AA1-EV02](./instrumentos-calidad-software.md) |

## 1. Introducción

La calidad del *software* necesita registros que permitan demostrar qué se revisó, cómo se comprobó y cuál fue el resultado. En la evidencia GA11-220501098-AA1-EV02 diseñé ocho instrumentos sencillos para planificar, verificar, probar, registrar defectos y mejorar el trabajo personal. En esta evidencia los diligencio mediante una revisión controlada de Artify.

Artify es una aplicación web de edición de imágenes construida con HTML, CSS y JavaScript Vanilla, un backend Node.js con Express y persistencia PostgreSQL. La revisión toma como caso principal el requisito RF-05, correspondiente a la carga segura de imágenes, y añade controles de autenticación, accesibilidad, configuración y trazabilidad cuando el instrumento lo requiere.

Los resultados se dividen entre **evidencia ejecutada en esta sesión**, **inspección de archivos del repositorio** y **evidencia histórica referenciada**. Esta separación evita presentar una prueba anterior como si hubiera sido ejecutada nuevamente.

## 2. Objetivos

### 2.1 Objetivo general

Diligenciar los instrumentos diseñados en la evidencia anterior para documentar de forma clara, verificable y comprensible el proceso de calidad aplicado a Artify.

### 2.2 Objetivos específicos

- Aplicar buenas prácticas de ISO/IEC 25010, ISO/IEC/IEEE 12207, MinTIC, PSP, Scrum y OWASP de manera proporcional al proyecto.
- Relacionar requisitos, controles, pruebas, defectos y evidencias mediante identificadores estables.
- Registrar resultados reales de sintaxis, pruebas frontend e inspección técnica.
- Utilizar PSP para medir la sesión de revisión y definir una acción concreta de mejora.

## 3. Alcance y método de diligenciamiento

La revisión se realizó sobre la versión de Artify disponible el 30 de julio de 2026. El alcance principal corresponde al requisito RF-05, relacionado con la carga segura de imágenes. Como controles complementarios se revisan la sesión frontend, la semántica accesible, el renderizado seguro, la autorización backend, las consultas parametrizadas y la configuración protegida.

### 3.1 Fuentes de evidencia

| Tipo | Fuente | Uso |
| --- | --- | --- |
| Requisito | [`requerimientos-funcionales.md`](./requerimientos-funcionales.md) | Criterios de RF-05 y protección de rutas |
| Diseño de formatos | [`instrumentos-calidad-software.md`](./instrumentos-calidad-software.md) | Estructura de los ocho instrumentos |
| Implementación | `frontend/assets/js/editor-image.js` | Formatos, peso, megapíxeles y dimensiones |
| Interfaz | `frontend/pages/editor.html` | Tipos admitidos y mensaje de límites |
| Pruebas | `frontend/tests/*.test.js` | Validación funcional, autenticación, accesibilidad y seguridad de renderizado |
| Backend | `backend/middlewares/auth.js`, `backend/controllers/actividad.controller.js` y `backend/server.js` | Autorización, consultas parametrizadas y configuración HTTP |
| Integración continua | `.github/workflows/backend-tests.yml` | Entorno de pruebas PostgreSQL y suites automatizadas |
| Historial | Git | Trazabilidad de la corrección documental `5e8b5b4` |

### 3.2 Validaciones ejecutadas el 30 de julio de 2026

| Validación | Comando | Resultado |
| --- | --- | --- |
| Sintaxis del backend | `pnpm run check` | Aprobada; `node --check server.js` terminó con código 0 |
| Suite frontend | `pnpm run test:frontend` | Aprobada; 26 pruebas superadas, 0 fallidas, 0 omitidas |

**Entorno observado:** macOS, Node.js 24.14.0 y pnpm 11.1.1.

Las pruebas de integración backend y E2E no se ejecutaron nuevamente porque requieren un entorno controlado adicional. Sus resultados previos se mencionan solo como evidencia histórica del repositorio.

## 4. Instrumento 1: plan de calidad diligenciado

| Campo | Registro diligenciado |
| --- | --- |
| Identificación | PC-ARTIFY-2026-07-30, versión 1.0 |
| Responsable | Iván Darío Madrid Daza |
| Línea base | Commit `ac70a63` de la rama `main` |
| Alcance | RF-05 y controles complementarios de sesión, accesibilidad, autorización y configuración |
| Atributos de calidad | Adecuación funcional, fiabilidad, capacidad de interacción, seguridad y mantenibilidad |
| Referentes | ISO/IEC 25010, ISO/IEC/IEEE 12207, MinTIC MGGTI, PSP, Scrum y OWASP Top 10 |
| Controles | Revisión de requisitos, inspección de código, sintaxis backend, pruebas frontend, trazabilidad y documentación |
| Ambiente | Repositorio local; las pruebas ejecutadas no utilizaron PostgreSQL ni modificaron datos |
| Criterio de entrada | EV02 disponible, requisitos identificados, repositorio limpio y dependencias instaladas |
| Criterio de salida | Sintaxis aprobada, 26/26 pruebas frontend aprobadas, cero defectos críticos nuevos y ocho instrumentos diligenciados |
| Riesgos controlados | Archivo incompatible o excesivo, consumo de memoria, sesión inválida, acceso indebido, inyección y documentación inconsistente |
| Evidencias | Resultados de comandos, archivos inspeccionados, tablas de este documento e historial Git |
| Estado final | Cumplido |

## 5. Instrumento 2: matriz de trazabilidad diligenciada

| ID | Necesidad | Atributo | Criterio verificable | Componente | Prueba o evidencia | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| RF-05 | Cargar imágenes compatibles | Adecuación funcional | JPG, PNG o WebP válidos son aceptados | `editor-image.js` | CP-IMG-01 y prueba frontend ejecutada | Aprobado |
| RF-05-LIM | Proteger el navegador de archivos excesivos | Fiabilidad / seguridad | Rechazar más de 10 MB, 16 MP o 8192 px por lado | `editor-image.js` | CP-IMG-02 a CP-IMG-06 | Aprobado |
| RF-04-FE | Conservar y cerrar la sesión frontend de forma segura | Seguridad | Token vigente, expiración, almacenamiento y redirección se comportan según el rol | `auth.js`, `inicio.js` y `login.js` | Pruebas frontend ejecutadas | Aprobado |
| RF-04-BE | Proteger rutas y recursos privados | Seguridad | Validar token, cuenta actual, rol y propiedad en el backend | `backend/middlewares/auth.js` | Inspección actual; pruebas backend históricas | Verificado por inspección |
| RNF-ACC-01 | Operar mensajes y modales de forma accesible | Capacidad de interacción | Semántica y anuncios comprensibles | HTML y JavaScript frontend | Pruebas de accesibilidad ejecutadas | Aprobado |
| RNF-SEC-01 | Evitar ejecutar HTML externo | Seguridad | Mensajes dinámicos se muestran como texto | JavaScript frontend | Pruebas de renderizado seguro ejecutadas | Aprobado |

La matriz conserva separados los resultados aprobados por ejecución, los verificados por inspección y los antecedentes no reejecutados.

## 6. Instrumento 3: lista de verificación técnica diligenciada

| Categoría | Verificación | Resultado | Evidencia o acción |
| --- | --- | --- | --- |
| Requisitos | Existe un criterio verificable y un alcance delimitado | Cumple | RF-05 y criterios en `requerimientos-funcionales.md` |
| Alcance | No se presentan funciones futuras como implementadas | Cumple | Revisión limitada al estado de `ac70a63` |
| Frontend | Los formatos y límites se validan antes de usar Canvas | Cumple | `editor-image.js`; pruebas de formato, peso y dimensiones aprobadas |
| Interfaz | El selector declara JPG, PNG y WebP y comunica los límites | Cumple | `frontend/pages/editor.html` |
| JavaScript | Las reglas de imagen están centralizadas y usan nombres descriptivos | Cumple | API `window.ArtifyEditorImage` |
| Backend | La sintaxis es válida y las entradas observadas se normalizan | Cumple | `pnpm run check`; `actividad.controller.js` |
| Autorización | Se comprueban token, estado actual, rol y propiedad | Cumple por inspección | `backend/middlewares/auth.js` |
| PostgreSQL | Las consultas observadas usan parámetros separados | Cumple por inspección | Consultas con `?` y arreglos de valores en controladores |
| Configuración | Los secretos no están incorporados al código | Cumple | `.env` excluido y `.env.example` como plantilla |
| Pruebas | Se ejecutó la validación más cercana al alcance | Cumple | Sintaxis y 26/26 pruebas frontend aprobadas |
| Documentación | Requisitos, instrumentos y estado real son coherentes | Cumple | EV02, EV03, README y CONTEXT revisados |

## 7. Instrumento 4: lista de seguridad web diligenciada

Esta lista utiliza OWASP Top 10 como referencia inicial y no equivale a una auditoría o certificación de seguridad.

| Riesgo de referencia | Control revisado en Artify | Resultado | Evidencia |
| --- | --- | --- | --- |
| Control de acceso | Token Bearer, cuenta activa, rol y propiedad del recurso | Cumple por inspección | `backend/middlewares/auth.js` |
| Fallas criptográficas | Contraseñas con bcrypt y secreto JWT fuera del repositorio | Cumple por inspección | `auth.controller.js`, `.env.example` y `.gitignore` |
| Inyección | Valores separados de las consultas PostgreSQL | Cumple por inspección | Controladores y adaptador `backend/config/db.js` |
| Diseño inseguro | Límites de archivo, cuerpo HTTP y acciones administrativas | Cumple en el alcance | 10 MB, 16 MP, 8192 px y cuerpo HTTP de 64 KB |
| Configuración incorrecta | CORS, cabeceras, caché y `X-Powered-By` | Cumple por inspección | `backend/server.js` |
| Componentes vulnerables | Auditoría actual de dependencias | No ejecutado en esta sesión | Se conserva como control pendiente; no se infiere un resultado |
| Autenticación | Expiración, almacenamiento y limpieza de sesión frontend | Cumple | Pruebas frontend ejecutadas |
| Integridad del software | Cambios versionados y suites definidas en CI | Cumple por inspección | Git y `.github/workflows/backend-tests.yml` |
| Registro y monitoreo | Errores sin datos sensibles y monitoreo automatizado | Cumple por inspección | Respuestas genéricas en `server.js` y flujo de monitoreo existente |

## 8. Instrumento 5: matriz de casos de prueba diligenciada

| ID | Requisito | Datos o pasos | Resultado esperado | Resultado obtenido | Estado | Tipo de evidencia |
| --- | --- | --- | --- | --- | --- | --- |
| CP-IMG-01 | RF-05 | PNG de 1024 bytes | Archivo válido | `{ valido: true }` | Aprobado | Ejecutada el 30/07/2026 |
| CP-IMG-02 | RF-05 | GIF de 1024 bytes | Rechazo por formato | `valido: false` | Aprobado | Ejecutada el 30/07/2026 |
| CP-IMG-03 | RF-05-LIM | WebP de 10 MB + 1 byte | Rechazo por peso | Mensaje: `La imagen supera el límite de 10 MB` | Aprobado | Ejecutada el 30/07/2026 |
| CP-IMG-04 | RF-05-LIM | Imagen de 4000 × 4000 px | Aceptar 16 MP | `valido: true` | Aprobado | Ejecutada el 30/07/2026 |
| CP-IMG-05 | RF-05-LIM | Imagen de 4001 × 4000 px | Rechazar más de 16 MP | `valido: false` | Aprobado | Ejecutada el 30/07/2026 |
| CP-IMG-06 | RF-05-LIM | Imagen de 9000 × 1 px | Rechazar lado mayor a 8192 px | `valido: false` | Aprobado | Ejecutada el 30/07/2026 |
| CP-AUTH-FE | RF-04-FE | Sesiones temporales, recordadas, expiradas y respuestas 401 | Conservar, descartar o redirigir según el caso | Pruebas de autenticación frontend aprobadas | Aprobado | Ejecutada el 30/07/2026 |
| CP-ACC-01 | RNF-ACC-01 | Revisar semántica y anuncios dinámicos | Controles y mensajes accesibles | Pruebas de accesibilidad aprobadas | Aprobado | Ejecutada el 30/07/2026 |
| CP-E2E-IMG | RF-05 | Cargar una imagen y operar herramientas en Chromium | Imagen visible y herramientas activas | Flujo descrito en el estado validado del repositorio | Referenciado | Evidencia histórica; no reejecutada |

**Resumen de ejecución:** 26 pruebas frontend aprobadas, 0 fallidas, 0 canceladas y 0 omitidas. La matriz muestra los casos representativos relacionados con el alcance; el total también incluye contraste, login, sesión del editor y renderizado seguro.

## 9. Instrumento 6: registro y seguimiento de defectos diligenciado

### 9.1 Resultado de la revisión actual

| Registro | Origen | Resultado | Estado |
| --- | --- | --- | --- |
| REV-2026-07-30 | Sintaxis, 26 pruebas frontend e inspección técnica | No se detectaron defectos nuevos de software en el alcance ejecutado | Cerrado sin hallazgos |

La ausencia de un defecto nuevo no demuestra que Artify carezca de defectos; solo describe las validaciones ejecutadas y el alcance inspeccionado.

### 9.2 Defecto documental real conservado para trazabilidad

| Campo | Registro diligenciado |
| --- | --- |
| Identificación | DEF-DOC-001 |
| Fecha de detección | 30 de julio de 2026 |
| Origen | Revisión visual del documento de la EV02 |
| Fase de inyección | Generación del documento |
| Fase de detección | Revisión visual |
| Severidad / prioridad | Media / alta para la entrega académica |
| Comportamiento observado | Los diagramas del documento se mostraban comprimidos y con proporciones incorrectas |
| Resultado esperado | Diagramas legibles y con la proporción definida por sus SVG originales |
| Causa comprobada | Conversión a miniaturas cuadradas y ajuste posterior dentro de espacios horizontales |
| Corrección | Restaurar la relación de aspecto de los cuatro diagramas |
| Verificación | Revisión visual de las páginas afectadas y validación de dimensiones |
| Evidencia | Commit `5e8b5b4` |
| Estado | Verificado |
| Prevención | Comprobar la relación de aspecto de cada recurso antes de cerrar una evidencia visual |

## 10. Instrumento 7: registro personal PSP diligenciado

El registro PSP corresponde a la sesión controlada de revisión y documentación de esta evidencia. Los tiempos están redondeados al minuto y no se utilizan para medir productividad aislada.

### 10.1 Registro de tiempo

| Fecha | Fase | Inicio | Fin | Interrupción | Tiempo neto | Producto |
| --- | --- | --- | --- | --- | --- | --- |
| 30/07/2026 | Planificación y alcance | 11:36 | 11:37 | 0 min | 1 min | Alcance, fuentes y criterios |
| 30/07/2026 | Inspección técnica | 11:37 | 11:38 | 0 min | 1 min | Archivos y controles verificados |
| 30/07/2026 | Pruebas | 11:38 | 11:39 | 0 min | 1 min | Sintaxis y suite frontend |
| 30/07/2026 | Documentación y revisión | 11:39 | 11:42 | 0 min | 3 min | Ocho instrumentos diligenciados |
| **Total observable** |  | **11:36** | **11:42** | **0 min** | **6 min** | **Documento Markdown** |

**Estimación inicial:** 10 minutos. **Tiempo neto observado:** 6 minutos. La medición representa esta sesión asistida y no el tiempo histórico de construcción de Artify.

### 10.2 Registro personal de defectos

| ID | Tipo | Inyectado en | Detectado en | Tiempo de corrección | Causa | Prevención |
| --- | --- | --- | --- | --- | --- | --- |
| DEF-DOC-001 | Documentación / imagen | Generación | Revisión visual | Registrado en la sesión de la EV02 | Pérdida de proporción al rasterizar | Validar dimensiones y revisar todas las páginas |
| S/N | Software | Sesión actual | Sintaxis y pruebas | No aplica | No se detectaron defectos nuevos | Mantener las pruebas cercanas al cambio |

### 10.3 Métricas PSP

| Métrica | Cálculo | Resultado | Interpretación |
| --- | --- | --- | --- |
| Desviación de tiempo | `(6 - 10) / 10 × 100` | -40 % | La sesión requirió menos tiempo que el estimado; no se generaliza a otras tareas |
| Aprobación de pruebas frontend | `26 / 26 × 100` | 100 % | Solo representa la suite ejecutada el 30/07/2026 |
| Remoción previa | No aplica | No calculada | No se detectaron defectos nuevos en la sesión actual |
| Densidad de defectos | No aplica | No calculada | No se definió una unidad comparable de tamaño de software |
| Corrección documental verificada | `1 / 1 × 100` | 100 % | El defecto documental registrado cuenta con corrección y verificación |

## 11. Instrumento 8: revisión posterior y mejora diligenciada

| Pregunta | Registro diligenciado |
| --- | --- |
| ¿Qué se planeó? | Diligenciar ocho instrumentos con evidencia real de Artify y entregar un único documento Markdown |
| ¿Qué se entregó? | Plan, trazabilidad, dos listas, matriz de pruebas, registro de defectos, PSP y revisión posterior diligenciados |
| ¿Qué validaciones se ejecutaron? | Sintaxis backend y suite frontend completa |
| ¿Cuál fue el resultado? | Sintaxis correcta y 26/26 pruebas frontend aprobadas |
| ¿Qué no se ejecutó? | Integración backend, E2E y auditoría actual de dependencias |
| ¿Dónde aparecieron defectos? | No hubo defectos nuevos de software; se conservó un defecto documental real de la EV02 |
| ¿Qué práctica debe conservarse? | Separar evidencia ejecutada, inspeccionada e histórica y revisar visualmente los recursos |
| ¿Qué debe mejorar? | Automatizar una comprobación específica de proporciones cuando se generen documentos con diagramas |

### 11.1 Acción de mejora priorizada

| Acción | Responsable | Momento | Criterio de verificación | Estado |
| --- | --- | --- | --- | --- |
| Incorporar a la lista de cierre la comprobación de dimensiones, legibilidad y proporción de cada imagen usada en una evidencia | Iván Darío Madrid Daza | Antes de entregar el siguiente documento visual | Todas las páginas revisadas y ningún recurso deformado | Definida |

## 12. Conclusiones

El diligenciamiento demuestra que los formatos diseñados en la EV02 pueden utilizarse de manera sencilla sin perder trazabilidad. Cada instrumento identifica el alcance, la fuente y el estado del resultado, lo cual facilita su lectura y evita depender de afirmaciones generales.

La revisión de Artify aprobó la sintaxis del backend y las 26 pruebas frontend ejecutadas. Los casos relacionados con RF-05 comprobaron formatos, peso, megapíxeles y dimensiones, mientras que otras pruebas cubrieron sesión, accesibilidad y renderizado seguro.

Las listas de verificación permitieron documentar controles existentes en autenticación, consultas, configuración y manejo de archivos. Al mismo tiempo, dejaron explícito que la integración backend, las pruebas E2E y la auditoría actual de dependencias no fueron ejecutadas en esta sesión.

El registro PSP y la revisión posterior convierten los resultados en aprendizaje. El defecto documental conservado muestra que la calidad también depende de verificar la presentación de la evidencia, y origina una mejora concreta para futuras entregas.

## Referencias

CMMI Institute. (s. f.). *CMMI Development*. Consultado el 30 de julio de 2026. https://cmmiinstitute.com/products/cmmi/cmmi-dev

Humphrey, W. S. (2000). *The Personal Software Process (PSP)* (CMU/SEI-2000-TR-022). Software Engineering Institute, Carnegie Mellon University. https://doi.org/10.1184/R1/6585197.v1

International Organization for Standardization. (2023). *ISO/IEC 25010:2023: Systems and software engineering - Systems and software Quality Requirements and Evaluation (SQuaRE) - Product quality model*. https://www.iso.org/standard/78176.html

International Organization for Standardization. (2026). *ISO/IEC/IEEE 12207:2026: Systems and software engineering - Software life cycle processes*. https://www.iso.org/standard/90219.html

ISO 25000. (s. f.). *ISO/IEC 25010*. Consultado el 30 de julio de 2026. https://iso25000.com/index.php/11-espanol/iso-iec-25010

Ministerio de Tecnologías de la Información y las Comunicaciones. (s. f.). *Modelo de Gestión y Gobierno TI (MGGTI)*. Consultado el 30 de julio de 2026. https://mintic.gov.co/arquitecturaempresarial/portal/modelomrae/Modelo-de-Gestion-y-Gobierno-TI-MGGTI/

OWASP Foundation. (2021). *OWASP Top 10:2021*. https://owasp.org/Top10/2021/es/

Schwaber, K., & Sutherland, J. (2020). *La Guía de Scrum: la guía definitiva de Scrum, las reglas del juego*. https://scrumguides.org/download.html

---

*Proyecto Artify - Análisis y Desarrollo de Software - SENA 2026*
