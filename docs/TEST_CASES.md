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
| **BUG-001** | **Error en cálculo de camino.** | 1. Aprobar materias previas 2. Ver dashboard 3. La profundidad no descuenta aprobadas | Alta | Resuelto | **Leandro** | **2026-02-15** | **2026-02-16** | Se añadió filtro approvedSubjects |
| **BUG-002** | **Proyección muestra "Invalid Date"** | 1. Usuario nuevo sin materias aprobadas 2. Ver dashboard 3. Fecha de graduación es NaN/Invalid | Media | Resuelto | **Leandro** | **2026-02-22** | **2026-02-23** | Añadido default state para usuarios nuevos |
| **BUG-003** | **Duplicidad en Calendario** | 1. Crear examen 2. Editar fecha repetidamente 3. Se crean múltiples eventos | Media | Resuelto | **Leandro** | **2026-02-22** | **2026-02-22** | Validación por eventId antes de upsert |
| **BUG-004** | **Filtro de materias "Aprobadas" incluye desaprobadas** | 1. Ver lista de materias 2. Filtrar por estado 3. Salen las de nota < 4 | Media | Resuelto | **Leandro** | **2026-02-28** | **2026-02-28** | Corregida query de filtrado en el service |
| **BUG-005** | **Error visual en alertas de advertencia al cambiar estado** | 1. Enviar un texto largo a la API para la extracción de entidades 2. Observar el tiempo de respuesta | Media | Resuelto | **Leandro** | **2026-03-06** | **2026-03-06** | - |
| **BUG-006** | **Error al calcular promedio general** | 1. Cargar materia por equivalencia 2. Ver dashboard 3. El promedio no cambia | Alta | Resuelto | **Leandro** | **2026-03-06** | **2026-03-06** | Se incluyeron materias con estado EQUIVALENCIA |
| **BUG-007** | **Nodo de materia no cambia de color al promocionar** | 1. Promocionar materia 2. Ir al Mapa 3. Ver color del nodo | Baja | Resuelto | **Leandro** | **2026-03-06** | **2026-03-06** | Actualizado selector de color en SubjectNode |