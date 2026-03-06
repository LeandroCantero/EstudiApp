**![][image1]**

**Documentación de Requerimientos Funcionales**   
**CursApp - Study Tracker**

Versión: 	1.0  
Fecha: 	27/02/2026  
Sponsor Operación: 	UNAHUR  
Sponsor Organización:	UNAHUR  
Autor: 	Cantero, Leandro  
Tutor: 	Prof. Ciarallo, Cristian  
Release: 	Marzo 2026

**Tabla de contenidos**

**1**	**HISTORIAL DE CAMBIOS	3**

**2**	**ALCANCE	4**  
2.1	Descripcion de Proyecto/Objectivos	4  
2.2	Justificacion	4  
2.3	Hipotesis	4  
2.4	Restricciones	4  
2.5	Dependencias	4  
2.6	Alcance	4

**3**	**INFORMACION DE REQUERIMIENTOS DE NEGOCIO	5**  
3.1	Reglas de Negocio	5  
3.2	Casos de Estudio	7

**4**	**REQUERIMIENTOS FUNCIONALES	11**  
4.1	Uses Stories	11  
4.2      Criterios de Bondad	12

**5**	**PANTALLAS DE USUARIO	12**

**6**	**GLOSARIO	14**

# 

1. **Historial de cambios**

| Version | Fecha | Autor | Descripcion |
| :---- | :---- | :---- | :---- |
| 1.0 | 25/02/2026 | Cantero, Leandro | Versión inicial sincronizada con plataforma. |
| 1.1 | 06/03/2026 | Cantero, Leandro | Incorporación de US-10 (Autenticación) en Roadmap. |

2. **Alcance**

    1. **Descripción del Proyecto/Objetivos** 

Desarrollar una plataforma integral de seguimiento académico que optimice la trayectoria del estudiante mediante algoritmos de recomendación, proyecciones de graduación y herramientas de simulación visual.

    2. **Justificación** 

Brindar al alumno claridad sobre su progreso real, ayudándole a tomar decisiones informadas sobre inscripciones y gestión de recursos para reducir el riesgo de deserción o estancamiento.

    3. **Hipótesis** 

Se priorizarán aquellas materias que desbloqueen la mayor cantidad de cuatrimestres futuros (camino crítico) para acelerar el egreso.

    4. **Restricciones** 

La plataforma depende de la integridad de los planes de estudio cargados en el backend.

    5. **Dependencias** 

Requiere conexión estable a la base de datos de Supabase para la persistencia de estados y recursos. 

    6. **Alcance** 

Abarca desde la gestión de estados académicos, generación de proyecciones, simulación en el frontend y seguimiento de créditos. **(Mejora v1.1: Autenticación de usuarios vía Clerk/Supabase).**

3. **Información de Requerimientos de Negocio**

    1. **Reglas de Negocio**

|  | Regla 0 [SETUP] | Regla 1 [CURSADA] | Regla 2 [FINAL] | Regla 3 [RECOMENDACIÓN] | Regla 4 [PROYECCIÓN] | Regla 5 [SIMULACIÓN] | Regla 6 [RECURSOS] |
| ----- | :---: | ----- | ----- | ----- | ----- | ----- | ----- |
| **Condición** | Usuario nuevo registrado. | Materia previa regularizada. | Materia previa aprobada (final). | Correlativas directas al 100% aprobadas. | Existen materias aprobadas en el historial. | Modo simulador activo en el cliente. | Acceso al detalle de materia. |
| **Acción** | Cargar plan de estudio de la carrera seleccionada. | Permitir transición de PENDIENTE a EN_CURSO (RN2). | Permitir transición a APROBADA (RN8). | Aplicar algoritmo de Impacto Transitivo (RN5). | Calcular fecha estimada según ritmo histórico (V). | Ejecutar lógica bidireccional en React Flow (RN7). | Permitir adjuntar links y notas personales. |
| **Lógica** | **[Detalle 0](#L0)** | **[Detalle 1](#L1)** | **[Detalle 2](#L2)** | **[Detalle 3](#L3)** | **[Detalle 4](#L4)** | **[Detalle 5](#L5)** | **[Detalle 6](#L6)** |

<a name="L0"></a>**Detalle 0:** Al detectar el Onboarding (US-07), el sistema inicializa el autómata de estados para todas las materias del plan `careers-import.service`.

<a name="L1"></a>**Detalle 1:** Validación de correlatividades nivel 1. La materia padre debe tener estado `>= REGULARIZADA` para desbloquear la cursada del hijo.

<a name="L2"></a>**Detalle 2:** Validación nivel 2. Para registrar una nota final o promoción, el sistema verifica que la materia padre tenga registro definitivo de aprobación.

<a name="L3"></a>**Detalle 3:** Algoritmo recursivo que suma el `Puntaje Base` (desbloqueos directos) + `Bonus Transitivo` (cadena completa) + `Estacionalidad` (cuatrimestre actual).

<a name="L4"></a>**Detalle 4:** Fórmula: `Max((MateriasRestantes / V), ProfundidadCaminoCrítico)`. Donde `V` es el promedio de materias aprobadas por cuatrimestre cursado.

<a name="L5"></a>**Detalle 5:** Manejo de estado en local mediante React Context. Permite "pintar" aprobaciones hipotéticas y visualizar el impacto en cascada sin modificar la DB.

<a name="L6"></a>**Detalle 6:** Persistencia de metadatos asociados a la relación Alumno-Materia. Los recursos son privados y accesibles mediante el panel lateral de "Recursos Académicos".

2. **Casos de estudio**

| ALUMNO 1 | Regla 0 [SETUP] | Regla 1 [CURSADA] | Regla 2 [FINAL] | Regla 3 [RECOMENDACIÓN] | Regla 4 [PROYECCIÓN] | Regla 5 [SIMULACIÓN] | Regla 6 [RECURSOS] |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Condición** | Inscripto en Univ. Prog. | Regularizó: -Matemática I -Intro. Prog. | Rinde mesa de Intro. Prog. (Nota >= 4). | Aprobó con Final: -Matemática I | Tiene V = 3 materias/cuat. | Marca "Prog. Objetos I" como aprobada en el Mapa. | Cargó Drive de apuntes en Intro. Prog. |
| **Resultado** | Ve 32 materias en Dashboard. | Puede cursar: -Matemática II -Prog. Objetos I (RN2). | Estado cambia a **APROBADA**. | Se recomienda: -Matemática II (Impacto Transitivo). | Graduación estimada en 2.5 años. | El grafo visualiza desbloqueos en cascada de 2do año. | Accesible desde cualquier dispositivo. |

4. **Requerimientos Funcionales**

    1. **User Stories**

| EP-1: CursApp Core |
| :---- |
|  **Project** CursApp  **Status** Active **Responsible** Leandro Cantero |
|  |
|  **Created on** 20/02/2026 **Last Updated** 25/02/2026 |
|  |
| **Description** |
|  Ecosistema de gestión y seguimiento académico inteligente. |
|  |
| **Plan Estimate** |
|  6 meses (Fase 1 completada) |
|   |
| **User Stories** |
|  **US-01** Como alumno quiero ver mi avance porcentual para motivarme con mi progreso. (CA-01: Barra en Dashboard) <br> **US-02** Como alumno quiero gestionar mis estados (En curso, etc.) para ver mi historial. (CA-02: Selector de estados funcional) <br> **US-03** Como alumno quiero sugerencias de materias para optimizar mi tiempo de graduación. (CA-03: Listado por impacto transitivo) <br> **US-04** Como alumno quiero adjuntar notas y links para centralizar mis recursos. (CA-04: Persistencia de recursos por materia) <br> **US-05** Como alumno quiero registrar créditos extracurriculares para cumplir requisitos. (CA-05: Contador de créditos acumulados) <br> **US-06** Como alumno quiero ver mi fecha estimada de graduación para planificar mi futuro. (CA-06: Widget de proyección en Dashboard) <br> **US-07** Como nuevo usuario quiero realizar una carga inicial rápida para empezar rápido. (CA-07: Proceso de Onboarding funcional) <br> **US-08** Como alumno quiero simular aprobaciones para visualizar mi carrera. (CA-08: Nodos interactivos en Simulador) <br> **US-09** Como alumno quiero registrar desaprobadas para controlar mis demoras. (CA-09: Historial de intentos persistente) <br> **US-10** (V1.1) Como estudiante quiero autenticarme para sincronizar mis datos. (CA-10: Login/Registro funcional) |
|  **Dependencias** |
|  Servicio de autenticación Clerk y base de datos Supabase. |

    2. **Criterios de Bondad** 

Para cada ciclo académico, se definen los conjuntos de impacto que gobiernan el motor de reglas (RN):

**ESTADO A => IMPACTO B**

**ESTADO A: Representa la situación inicial del estudiante al comenzar un periodo académico:**

| | Regla C1 [PROMOCIONADA] | Regla C2 [ELEGIBLE] | Regla C3 [SIMULADA] |
| :--- | :--- | :--- | :--- |
| **Condición** | Materias en estado PROMOCIONADA o **APROBADA**. | Materias PENDIENTE con correlativas OK (RN2) + Alto impacto. | Nodos del Mapa interactivo con estado alterado localmente. |
| **Acción** | Determinan el Promedio Académico y % de Avance Real. | Brillar con prioridad en Dashboard y Recomendaciones. | Disparar recalculo de proyecciones y desbloqueos visuales. |

**IMPACTO B: Define los resultados posibles tras finalizar una cursada o instancia de examen (RN1):**

| | Regla C1 [PROMOCIONADA] | Regla C2 [REGULARIZADA] | Regla C3 [EXAMEN FINAL] | Regla C4 [DESAPROBADA] |
| :--- | :--- | :--- | :--- | :--- |
| **Condición** | Aprobación directa por nota de cursada >= 7 (RN3). | Cursada aprobada con nota 4-6 (RN3). | Materia regularizada pendiente de aprobación definitiva. | Nota inferior a 4 o pérdida de condición (RN3). |
| **Acción** | Cierre definitivo (Estado: PROMOCIONADA). | Materia disponible para cursar hijos (RN2) pero no para cierre. | Transición a **APROBADA** tras aprobar mesa de examen. | Incremento de `AttemptCount` y habilitación para recursar. |

* **Lógica de Sugerencia:** Al inicio de cuatrimestre, el sistema genera el conjunto **MATERIAS A** (Elegibles) priorizando aquellas con mayor peso transitivo según el algoritmo de Camino Crítico (RN9).
* **Lógica de Cierre:** El **IMPACTO B** actualiza automáticamente las métricas de éxito (Aprobadas vs. Desaprobadas) y recalcula la velocidad de avance para ajustar la fecha de graduación.
* **Fusión de Estados:** Para el cálculo de progreso porcentual, una materia en **IMPACTO B** con Regla C2 [REGULARIZADA] computa al 50% del peso, mientras que la Regla C1 [PROMOCIONADA] computa al 100%.

5. **Pantallas de Usuario**

No aplica para esta versión de documentación textual (Ver Prototipos Figma).

6. **GLOSARIO** 

| Término | Descripción |
| ----- | ----- |
| Impacto Transitivo | Algoritmo que mide cuántas materias se desbloquean a futuro mediante una cadena de correlatividades. |
| Camino Crítico | La secuencia de materias más larga que determina el tiempo mínimo de graduación. |
| Estado Regularizado | Materia cursada y aprobada en su instancia de parciales, pendiente de examen final. |
| Velocidad de Avance | Tasa histórica de materias aprobadas por periodo de tiempo. |

**Autor:** Cantero, Leandro  
**Fecha:** 27/02/2026