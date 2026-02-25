**![][image1]**

**Documentación de Requerimientos Funcionales**   
**CursApp - Study Tracker**

Versión: 	1.0  
Fecha: 	25/02/2026  
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

Abarca desde la autenticación del usuario, gestión de estados académicos, generación de proyecciones, simulación en el frontend y seguimiento de créditos.

3. **Información de Requerimientos de Negocio**

    1. **Reglas de Negocio**

|  | Regla 0 [SETUP] | Regla 1 [CURSADA] | Regla 2 [FINAL] | Regla 3 [RECOMENDACIÓN] | Regla 4 [PROYECCIÓN] | Regla 5 [SIMULACIÓN] | Regla 6 [RECURSOS] |
| ----- | :---: | ----- | ----- | ----- | ----- | ----- | ----- |
| **Condición** | Usuario nuevo registrado. | Materia previa regularizada. | Materia previa aprobada (final). | Correlativas directas al 100% aprobadas. | Existen materias aprobadas en el historial. | Modo simulador activo en el cliente. | Acceso al detalle de materia. |
| **Acción** | Cargar plan de estudio de la carrera seleccionada. | Permitir transición de PENDIENTE a EN_CURSO (RN2). | Permitir transición a PROMOCIONADA (Aprobada) (RN8). | Aplicar algoritmo de Impacto Transitivo (RN5). | Calcular fecha estimada según ritmo histórico (V). | Ejecutar lógica bidireccional en React Flow (RN7). | Permitir adjuntar links y notas personales. |
| **Lógica** | **[Detalle 0](#L0)** | **[Detalle 1](#L1)** | **[Detalle 2](#L2)** | **[Detalle 3](#L3)** | **[Detalle 4](#L4)** | **[Detalle 5](#L5)** | **[Detalle 6](#L6)** |

<a name="L0"></a>**Detalle 0:** Al detectar el Onboarding (US-07), el sistema inicializa el autómata de estados para todas las materias del plan `careers-import.service`.

<a name="L1"></a>**Detalle 1:** Validación de correlatividades nivel 1. La materia padre debe tener estado `>= REGULARIZADA` para desbloquear la cursada del hijo.

<a name="L2"></a>**Detalle 2:** Validación nivel 2. Para registrar una nota final o promoción, el sistema verifica que la materia padre tenga registro definitivo de aprobación.

<a name="L3"></a>**Detalle 3:** Algoritmo recursivo que suma el `Puntaje Base` (desbloqueos directos) + `Bonus Transitivo` (cadena completa) + `Estacionalidad` (cuatrimestre actual).

<a name="L4"></a>**Detalle 4:** Fórmula: `Max((MateriasRestantes / V), ProfundidadCaminoCrítico)`. Donde `V` es el promedio de materias aprobadas por cuatrimestre cursado.

<a name="L5"></a>**Detalle 5:** Manejo de estado en local mediante React Context. Permite "pintar" aprobaciones hipotéticas y visualizar el impacto en cascada sin modificar la DB.

<a name="L6"></a>**Detalle 6:** Persistencia de metadatos asociados a la relación Alumno-Materia. Los recursos son privados y accesibles mediante el panel lateral de "Recursos Académicos".

2. **Casos de estudio**

| ALUMNO 1 | Regla 0 [SETUP] | Regla 1 [CURSADA] | Regla 3 [RECOMENDACIÓN] | Regla 4 [PROYECCIÓN] | Regla 6 [RECURSOS] |
| :---: | :---: | ----- | ----- | ----- | ----- |
| **Condición** | Inscripto en Univ. Prog. | Regularizó: -Matemática I -Intro. Prog. | Aprobó con Final: -Matemática I | Tiene V = 3 materias/cuat. | Cargó Drive de apuntes en Intro. Prog. |
| **Resultado** | Ve 32 materias en Dashboard. | Puede cursar: -Matemática II -Prog. Objetos I | Se recomienda: -Matemática II (Bonus Transitivo). | Graduación estimada en 2.5 años. | Accesible desde cualquier dispositivo. |

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
|  US-01 Como alumno quiero ver mi avance porcentual para motivarme con mi progreso. <br> US-03 Como alumno quiero sugerencias de materias para optimizar mi tiempo de graduación. <br> US-08 Como alumno quiero simular aprobaciones para planificar mis próximos años académicos. |
|  **Criterio de Aceptación** |
|  CA-01 Visualización de barra de progreso en Dashboard. <br> CA-03 Listado de materias recomendadas según impacto transitivo. <br> CA-08 Mapa interactivo con nodos coloreables para simulación. |
|  **Dependencias** |
|  Servicio de autenticación Clerk y base de datos Supabase. |

    2. **Criterios de Bondad** 

Para cada transición de estado académica, se definen los conjuntos de impacto:

**ESTADO A => IMPACTO B**

|  | Regla C1 [APROBADA] | Regla C2 [RECOMENDADA] | Regla C3 [SIMULADA] |
| :---: | ----- | ----- | ----- |
| **Condición** | Transición a PROMOCIONADA. | Correlativas OK + Alto peso transitivo. | Cambio de estado en UI de simulación. |
| **Acción** | Recalcular Promedio y % de Avance. | Marcar con brillo ámbar en el mapa. | Recalcular cascada visual de desbloqueos pendientes. |

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
**Fecha:** 25/02/2026

[image1]: <data:image/png;base64,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/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtI3BAj3Mko9QWZh7SIRtE6/2naFDEUGEwpLZBCWji5NM4p2JtTf7/A0X3j0hFpSjS/VAAIAZ4B7e/kAAAAAAElFTkSuQmCC>
