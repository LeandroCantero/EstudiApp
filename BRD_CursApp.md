# Documentación de Requerimientos de Negocio
**CursApp - Study Tracker**

- **Versión:** 1.0
- **Fecha:** 12/02/2026
- **Sponsor Operación:** UNAHUR
- **Sponsor Organización:** UNAHUR
- **Autor:** Cantero, Leandro
- **Release:** Marzo 2026

## Tabla de Contenidos
1. [Historial de Cambios](#1-historial-de-cambios)
2. [Alcance](#2-alcance)
    - 2.1. Descripción del Proyecto / Objetivos
    - 2.2. Justificación
    - 2.3. Hipótesis
    - 2.4. Restricciones
    - 2.5. Dependencias
    - 2.6. Alcance del Proyecto
3. [Requerimientos de Negocio](#3-requerimientos-de-negocio)
    - 3.1. Reglas de Negocio
    - 3.2. Casos de Estudio
4. [Requerimientos Funcionales](#4-requerimientos-funcionales)
    - 4.1. Historias de Usuario
    - 4.2. Criterios de Bondad
5. [Pantallas de Usuario](#5-pantallas-de-usuario)
6. [Glosario](#6-glosario)
7. [Minutas de Reunión](#7-minutas-de-reunión)

---

### 1. Historial de Cambios

| Versión | Fecha | Autor | Descripción |
| :--- | :--- | :--- | :--- |
| 1.0 | 12/02/2026 | Cantero, Leandro | Versión Inicial

### 2. Alcance

#### 2.1. Descripción del Proyecto / Objetivos
Desarrollar una aplicación web ("CursApp") diseñada para que los estudiantes universitarios realicen un seguimiento exhaustivo de su trayectoria académica. El objetivo principal es centralizar el progreso (materias, notas, créditos) y proporcionar herramientas inteligentes de recomendación y simulación de escenarios futuros.

#### 2.2. Justificación
La complejidad de los planes de estudio y los regímenes de correlatividades genera desorientación en los alumnos. CursApp simplifica la vida del estudiante: muestra de forma clara qué materias están trabando la carrera, avisa sobre vencimientos de cursadas y ayuda a planificar la carrera de manera más organizada.

#### 2.3. Hipótesis
- Un seguimiento visual del avance incrementa la motivación del estudiante.
- La simulación de escenarios ayuda a priorizar materias importantes antes de que generen cuellos de botella.

#### 2.4. Restricciones
- Este requerimiento no tiene restricciones identificadas.

#### 2.5. Dependencias
- Disponibilidad de los planes de estudio de las carreras ofrecidas por la UNAHUR.

#### 2.6. Alcance del Proyecto
- Gestión de estados de materias: Pendiente, En Curso, Promocionada, Regularizada, Desaprobada, Recursando.
- Dashboard con métricas: Promedio, Porcentaje de avance, Créditos Extracurriculares y Fecha Estimada de Graduación.
- Motor de Recomendaciones basado en correlatividades y prioridad de avance.
- Simulador Visual: Posibilidad de simular escenarios futuros.
- Sección de Recursos generales y por materia (apuntes, links, notas, etc).
- Calendario de entregas y exámenes.
- Sistema de Créditos: Registro de actividades extracurriculares (Categoría, Actividad, Cantidad de Créditos).

### 3. Requerimientos de Negocio

#### 3.1. Reglas de Negocio

| Regla | Descripción |
| :--- | :--- |
| **RN1 - Ciclo de Vida de Materia** | El sistema debe gestionar la transición lógica entre estados: Pendiente -> En Curso/Recursando -> (Regularizada/Promocionada/Desaprobada). |
| **RN2 - Correlatividad de Cursada** | Se permite cursar una materia si la correlativa previa está al menos "Regularizada". |
| **RN3 - Gestión de Finales** | Las materias en estado "Regularizada" no computan como aprobadas para el promedio final hasta que se registre el examen final aprobado. |
| **RN4 - Sistema de Créditos** | La acumulación de créditos extracurriculares es independiente del avance en materias y debe permitir categorización manual. |
| **RN5 - Algoritmo de Priorización** | Las sugerencias del sistema deben priorizar el "Camino lógico", identificando materias que desbloquean la mayor cantidad de cuatrimestres futuros. |
| **RN6 - Consistencia de Datos** | El promedio académico debe recalcularse automáticamente ante cualquier cambio en las notas cargadas. |
| **RN7 - Lógica de Simulación** | El modo simulador permite alterar estados de forma temporal sin persistir cambios en la historia académica real del usuario. |
| **RN8 - Cierre de Materia** | Para registrar el estado final satisfactorio (Aprobada/Promocionada) de una materia nueva, es requisito mandatorio haber aprobado la materia correlativa anterior (Promocionada o haber aprobado el examen final). El sistema debe alertar sobre esta dependencia en el seguimiento. |
| **RN9 - Proyección de Graduación** | El cálculo de la fecha estimada de graduación debe considerar la tasa de aprobación histórica (materias por cuatrimestre), la carga pendiente del plan de estudios y las restricciones de correlatividad. |

#### 3.2. Casos de Estudio

**Caso 1: Dependencia de Exámenes Finales**
- El alumno regularizó una materia inicial y está cursando la siguiente. El sistema le permite el seguimiento de la cursada actual, pero le impide cerrar la nueva materia (ya sea por promoción o examen) hasta que se registre la aprobación definitiva (final) de la materia inicial.

**Caso 2: Detección de Cuellos de Botella**
- El alumno adeuda una materia de primer año que es correlativa de varias de tercero. El sistema resalta esta situación para incentivar la regularización de la deuda académica.

**Caso 3: Simulación de Cuatrimestre Futuro**
- El alumno utiliza la herramienta para proyectar el próximo año lectivo, verificando qué materias podría cursar y cómo esto impactaría en su fecha estimada de graduación.

**Caso 4: Gestión de Créditos Extracurriculares**
- El alumno realiza un curso externo y lo carga en el sistema. El total de créditos se actualiza permitiendo ver cuánto falta para completar el requisito de la tecnicatura/licenciatura.

### 4. Requerimientos Funcionales

#### 4.1. Historias de Usuario

- **ID:** US-01
- **Descripción:** Como estudiante, quiero visualizar mi avance general y mi porcentaje de carrera completado para entender mi progreso total.
- **Criterio de Aceptación:** Ver una barra de progreso o métrica clara en el dashboard.

- **ID:** US-02
- **Descripción:** Como estudiante, quiero gestionar el estado de mis materias (En curso, regular, etc.) para mantener mi historial actualizado.
- **Criterio de Aceptación:** Poder cambiar el estado de una materia y que se refleje en el sistema.

- **ID:** US-03
- **Descripción:** Como estudiante, quiero recibir recomendaciones automáticas de cursada basadas en mis correlativas para planificar mi próximo cuatrimestre.
- **Criterio de Aceptación:** Visualizar un listado de materias sugeridas según el plan de estudios.

- **ID:** US-04
- **Descripción:** Como estudiante, quiero adjuntar links y notas de texto a cada materia para centralizar mis apuntes y recursos.
- **Criterio de Aceptación:** Acceder a una sección de "notas/recursos" dentro del detalle de cada materia.

- **ID:** US-05
- **Descripción:** Como estudiante, quiero registrar mis créditos extracurriculares de forma manual para cumplir con los requisitos de la tecnicatura.
- **Criterio de Aceptación:** Ver el total de créditos acumulados en una sección dedicada.

- **ID:** US-06
- **Descripción:** Como estudiante, quiero visualizar una fecha estimada de graduación basada en mi ritmo histórico de aprobación.
- **Criterio de Aceptación:** Visualizar la fecha proyectada en el dashboard principal.

- **ID:** US-07
- **Descripción:** Como nuevo usuario, quiero seleccionar mi carrera y realizar una carga inicial rápida para no tener que cargar todo desde cero.
- **Criterio de Aceptación:** Completar el setup inicial y ver mi dashboard poblado con datos básicos.

- **ID:** US-08
- **Descripción:** Como estudiante, quiero simular que apruebo materias futuras para ver gráficamente cómo se destraba el resto de mi carrera.
- **Criterio de Aceptación:** Interactuar con un modo "Simulador" que muestre cambios visuales en el flujo de materias.

- **ID:** US-09
- **Descripción:** Como estudiante, quiero registrar mis materias desaprobadas o recursadas para llevar un control de mis intentos y demoras.
- **Criterio de Aceptación:** Mantener un historial de estados que incluya fallos y recursadas.

#### 4.2. Criterios de Bondad
- **Integridad de Datos:** Los cálculos de promedio y créditos deben ser consistentes y precisos.
- **Usabilidad:** La interfaz debe ser intuitiva, permitiendo al usuario realizar cargas y consultas con pocos clics.
- **Feedback Visual:** Los estados de avance y las alertas deben ser fácilmente distinguibles mediante elementos visuales y esquemas de colores.
- **Performance:** La aplicación debe responder de forma fluida ante las solicitudes de simulación y carga de datos.

### 5. Pantallas de Usuario
- **Dashboard:** Centro de comando con el simulador, promedio, avance y la proyección de graduación.
- **Mis Materias:** Vista de lista/grilla organizada por año de cursada.
- **Detalle de Materia:** Ficha técnica con notas, recursos y tareas pendientes.
- **Calendario:** Vista tipo Timeline de eventos académicos.
- **Recursos:** Hub central de información global (links a la UNAHUR, planes de carrera, calendario académico) y panel de seguimiento de créditos extracurriculares.

### 6. Glosario

| Término | Descripción |
| :--- | :--- |
| **User Stories** | Descripciones cortas y concisas desde el punto de vista del usuario al probar un producto digital. |
| **Criterio de Aceptación** | Condiciones que un producto de software debe satisfacer para ser aceptado por un usuario o cliente. |

### 7. Minutas de Reunión
- **12/02/2026:** Acuerdo sobre el alcance inicial del tracker.
