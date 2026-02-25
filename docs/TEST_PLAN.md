![][image1]

**Plan de Pruebas**   
CursApp - Study Tracker

Versión: 		1.0

Fecha: 	25/02/2026  
Sponsor Operación: UNAHUR  
Sponsor Organización: UNAHUR  
Autor:	Cantero, Leandro  
Tutor: 	Prof. Ciarallo, Cristian  
Release: Marzo 2026

**Tabla de contenidos**

[Objetivo del Testing:	3](#objetivo-del-testing:)

[Alcance del Testing:	3](#alcance-del-testing:)

[Herramientas para el Testing:	3](#herramientas-para-el-testing:)

[Pruebas individuales:	3](#pruebas-individuales:)

[Pruebas Masivas:	3](#pruebas-masivas:)

[Casos de Prueba:	4](#casos-de-prueba:)

[1\. Pruebas de Autenticación y Onboarding:	4](#pruebas-de-autenticación-y-onboarding:)

[Caso de Prueba 1: Registro de usuario y selección de carrera	4](#caso-de-prueba-1:-registro-de-usuario-y-selección-de-carrera)

[Caso de Prueba 2: Login con credenciales inválidas	4](#caso-de-prueba-2:-login-con-credenciales-inválidas)

[2\. Pruebas de Gestión Académica y Estados:	5](#pruebas-de-gestión-académica-y-estados:)

[Caso de Prueba 3: Cursar con correlativa regularizada	5](#caso-de-prueba-3:-cursar-con-correlativa-regularizada)

[Caso de Prueba 4: Cerrar materia sin final de la correlativa	5](#caso-de-prueba-4:-cerrar-materia-sin-final-de-la-correlativa)

[Caso de Prueba 11: Registrar materias desaprobadas e intentos	5](#caso-de-prueba-11:-registrar-materias-desaprobadas-e-intentos)

[3\. Pruebas de Seguimiento y Proyección:	5](#pruebas-de-seguimiento-y-proyección:)

[Caso de Prueba 7: Visualización del avance general y Dashboard	5](#caso-de-prueba-7:-visualización-del-avance-general-y-dashboard)

[Caso de Prueba 8: Generación de recomendaciones automáticas	5](#caso-de-prueba-8:-generación-de-recomendaciones-automáticas)

[Caso de Prueba 9: Cálculo de fecha estimada de graduación	5](#caso-de-prueba-9:-cálculo-de-fecha-estimada-de-graduación)

[4\. Pruebas de Inteligencia y Recursos:	5](#pruebas-de-inteligencia-y-recursos:)

[Caso de Prueba 5: Registrar actividad extracurricular	5](#caso-de-prueba-5:-registrar-actividad-extracurricular)

[Caso de Prueba 6: Adjuntar link y nota a materia	5](#caso-de-prueba-6:-adjuntar-link-y-nota-a-materia)

[Caso de Prueba 10: Simulación gráfica de escenarios futuros	5](#caso-de-prueba-10:-simulación-gráfica-de-escenarios-futuros)

[Plan de Ejecución:	5](#plan-de-ejecución:)

# 

# **Plan de Pruebas para CursApp - Study Tracker**

# **Objetivo del Testing:** {#objetivo-del-testing:}

Garantizar la integridad de los datos académicos y asegurar que el sistema verifique el 100% de las Historias de Usuario (US) del BRD, desde el seguimiento visual hasta las proyecciones inteligentes de carrera.

# **Alcance del Testing:** {#alcance-del-testing:}

Pruebas de funcionamiento de Autenticación, Setup Inicial y Selección de Carrera (US-07).  
Métricas de Panel Central: Avance, Promedio y Porcentaje (US-01).  
Gestión de Estados Académicos (US-02) y Validación de Reglas de Correlatividad (RN1-RN9).  
Algoritmos de Recomendación (US-03) y Proyecciones de Graduación (US-06).  
Módulo de Simulación Visual de materias futuras (US-08).  
Registro de Créditos Extracurriculares (US-05) y Recursos Personales (US-04).  
Historial de Materias: Desaprobadas, Recursadas e Intentos (US-09).

# **Herramientas para el Testing:** {#herramientas-para-el-testing:}

## **Pruebas individuales:** {#pruebas-individuales:}

**Descripción:**  
Se utilizará Postman para pruebas de API, permitiendo validar que cada endpoint responda correctamente a los requerimientos de las User Stories.

**Funcionalidades Principales:**

* Validación de endpoints de gestión académica y créditos.  
* Verificación de persistencia de recursos y notas del alumno.  
* Pruebas de flujo de registro y setup inicial del perfil.

## **Pruebas Masivas:** {#pruebas-masivas:}

**Descripción:**  
Se utilizará Vitest para la validación continua de los algoritmos de cálculo matemático y lógico (Promedio, Velocidad de Avance y recomendaciones).

**Funcionalidades Principales:**

* Testeo de algoritmos de proyección de fecha de graduación.  
* Verificación de consistencia del camino crítico transitivo.  
* Análisis automático de estados de materias y recursadas.

# **Casos de Prueba:** {#casos-de-prueba:}

1. ### **Pruebas de Autenticación y Onboarding:** {#pruebas-de-autenticación-y-onboarding:}

##### **Caso de Prueba 1: Registro de usuario y selección de carrera** {#caso-de-prueba-1:-registro-de-usuario-y-selección-de-carrera}

* Ejecutar carga inicial seleccionando una carrera de la UNAHUR.  
* Verificar que el dashboard se inicialice con el plan de estudios cargado (US-07).

##### **Caso de Prueba 2: Login con credenciales inválidas** {#caso-de-prueba-2:-login-con-credenciales-inválidas}

* Ingresar credenciales erróneas en el panel de acceso.  
* Verificar la denegación de servicio y mensaje de error adecuado.

2. ### **Pruebas de Gestión Académica y Estados:** {#pruebas-de-gestión-académica-y-estados:}

##### **Caso de Prueba 3: Cursar con correlativa regularizada** {#caso-de-prueba-3:-cursar-con-correlativa-regularizada}

* Registrar inscripción a materia con correlativa previa en estado "Regularizada".  
* Verificar que el sistema permita la inscripción según RN2 (US-02).

##### **Caso de Prueba 4: Cerrar materia sin final de la correlativa** {#caso-de-prueba-4:-cerrar-materia-sin-final-de-la-correlativa}

* Intentar registrar aprobación final de una materia sin examen final de su correlativa.  
* Verificar que el sistema bloquee el cierre preventivamente según RN8 (US-02).

##### **Caso de Prueba 11: Registrar materias desaprobadas e intentos** {#caso-de-prueba-11:-registrar-materias-desaprobadas-e-intentos}

* Cargar una nota inferior a 4 en un examen final.  
* Verificar que el sistema incremente el contador de intentos y actualice el estado a "Recursando" o "Desaprobada" (US-09).

3. ### **Pruebas de Seguimiento y Proyección:** {#pruebas-de-seguimiento-y-proyección:}

##### **Caso de Prueba 7: Visualización del avance general y Dashboard** {#caso-de-prueba-7:-visualización-del-avance-general-y-dashboard}

* Cambiar estados de varias materias a "Aprobada" desde el panel.  
* Verificar que la barra de progreso y el porcentaje total de carrera se actualicen visualmente (US-01).

##### **Caso de Prueba 8: Generación de recomendaciones automáticas** {#caso-de-prueba-8:-generación-de-recomendaciones-automáticas}

* Consultar el panel de recomendaciones con materias pendientes.  
* Verificar que el sistema sugiera las materias que desbloquean mayor cantidad de cuatrimestres futuros (US-03).

##### **Caso de Prueba 9: Cálculo de fecha estimada de graduación** {#caso-de-prueba-9:-cálculo-de-fecha-estimada-de-graduación}

* Registrar aprobación de nuevas materias y observar la métrica de proyección.  
* Verificar que la fecha estimada se recalcule basada en el ritmo histórico de aprobación del usuario (US-06).

4. ### **Pruebas de Inteligencia y Recursos:** {#pruebas-de-inteligencia-y-recursos:}

##### **Caso de Prueba 5: Registrar actividad extracurricular** {#caso-de-prueba-5:-registrar-actividad-extracurricular}

* Añadir un curso externo con carga horaria en el panel de créditos.  
* Verificar que el total acumulado de créditos extracurriculares aumente (US-05).

##### **Caso de Prueba 6: Adjuntar link y nota a materia** {#caso-de-prueba-6:-adjuntar-link-y-nota-a-materia}

* Guardar una nota de texto y un link URL en el detalle técnico de una materia.  
* Verificar la persistencia y visibilidad de los recursos adjuntos (US-04).

##### **Caso de Prueba 10: Simulación gráfica de escenarios futuros** {#caso-de-prueba-10:-simulación-gráfica-de-escenarios-futuros}

* Utilizar el modo simulador para marcar la aprobación hipotética de una materia llave.  
* Verificar que el sistema muestre gráficamente (sin persistir datos) cómo se desbloquearía el resto de la carrera (US-08).

# **Plan de Ejecución:** {#plan-de-ejecución:}

1. Configurar entorno de pruebas local con datos semilla reales de UNAHUR.  
2. Ejecutar manualmente la batería de pruebas CP-01 a CP-11.  
3. Registrar cualquier bug encontrado en el respectivo Documento de Seguimiento.  
4. Validar la precisión de los cálculos automáticos mediante revisión manual de fórmulas.  
5. Confirmar la estabilidad del sistema tras la aplicación de correcciones.