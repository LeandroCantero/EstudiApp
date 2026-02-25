![][image1]

**Documento de Seguimiento de Testing:**   
CursApp - Study Tracker

Versión: 		1.0

Fecha: 	22/02/2026  
Sponsor Operación: UNAHUR  
Sponsor Organización: UNAHUR  
Autor:	Cantero, Leandro  
Tutor: 	Prof. Ciarallo, Cristian  
Release: Marzo 2026

**Tabla de contenidos**

[Objetivo:	3](#objetivo:)

[Formato del Documento:	3](#formato-del-documento:)

[Seguimiento y Gestión de Bugs:	3](#seguimiento-y-gestión-de-bugs:)

# 

# **Documento de Seguimiento de Testing**

# **Objetivo:** {#objetivo:}

El Documento de Seguimiento de Testing tiene como objetivo principal registrar y hacer seguimiento de los bugs encontrados durante el desarrollo y las pruebas de la plataforma CursApp. Proporciona una visión general de los problemas identificados, su estado actual, y las acciones tomadas para resolverlos.

# **Formato del Documento:** {#formato-del-documento:}

El Documento de Debugging se organizará en forma de tabla, con las siguientes columnas.

1. **ID del Bug:** Un identificador único para cada bug encontrado.  
2. **Descripción:** Una descripción breve del problema encontrado.  
3. **Pasos para Reproducir:** Los pasos detallados necesarios para reproducir el bug.  
4. **Prioridad:** La prioridad asignada al bug (alta, media, baja).  
5. **Estado:** El estado actual del bug (por ejemplo, abierto, en proceso, resuelto, cerrado).  
6. **Responsable:** El miembro del equipo responsable de solucionar el bug.  
7. **Fecha de Creación:** La fecha en que se identificó inicialmente el bug.  
8. **Fecha de Resolución:** La fecha en que se resolvió el bug, si corresponde.  
9. **Notas/Comentarios:** Cualquier información adicional relevante sobre el bug o su resolución.

# **Seguimiento y Gestión de Bugs:** {#seguimiento-y-gestión-de-bugs:}

* El Documento de Debugging se actualizará regularmente a medida que se identifiquen, resuelvan o se hagan progresos en la resolución de los bugs.  
* Se proporcionará retroalimentación sobre el estado de los bugs durante las reuniones de seguimiento del proyecto.  
* Se realizarán pruebas adicionales para verificar que los bugs resueltos no hayan reintroducido problemas en el software.

| ID de Bug | Descripción | Pasos para Reproducir | Prioridad | Estado | Responsable | Fecha de Creación | Fecha de Resolución | Comentarios |
| :---: | ----- | ----- | :---: | :---: | :---: | :---: | :---: | ----- |
| **BUG-001** | **Error en cálculo de camino crítico** | 1. Aprobar materias previas 2. Ver dashboard 3. La profundidad no descuenta aprobadas | Alta | Resuelto | **Leandro** | **2026-02-15** | **2026-02-16** | Se añadió filtro `approvedSubjects` |
| **BUG-002** | **Error de tipos Prisma (prerequisites)** | 1. Consultar materia con correlativas 2. Error de mapeo en objeto | Media | Resuelto | **Leandro** | **2026-02-18** | **2026-02-18** | Corregido typo CaseSensitive |
| **BUG-003** | **Simulador persiste cambios en DB** | 1. Activar modo simulación 2. Aprobar materia 3. El cambio queda guardado permanentemente | Crítica | Resuelto | **Leandro** | **2026-02-20** | **2026-02-21** | Implementado rollback en contexto de simulación |
| **BUG-006** | **Duplicidad en Calendario** | 1. Crear examen 2. Editar fecha repetidamente 3. Se crean múltiples eventos | Media | Resuelto | **Leandro** | **2026-02-22** | **2026-02-22** | Validación por eventId antes de upsert |