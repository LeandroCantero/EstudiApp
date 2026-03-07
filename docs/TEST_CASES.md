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
| **BUG-004** | **Proyección muestra "Invalid Date"** | 1. Usuario nuevo sin materias aprobadas 2. Ver dashboard 3. Fecha de graduación es NaN/Invalid | Media | Resuelto | **Leandro** | **2026-02-22** | **2026-02-23** | Añadido default state para usuarios nuevos |
| **BUG-005** | **Botón "Adjuntar" no responde en mobile** | 1. Abrir detalle materia en celular 2. Click en "+" de recursos 3. No abre el modal | Baja | Abierto | **Leandro** | **2026-02-24** | - | Pendiente ajuste de z-index y event bubbling |
| **BUG-006** | **Duplicidad en Calendario** | 1. Crear examen 2. Editar fecha repetidamente 3. Se crean múltiples eventos | Media | Resuelto | **Leandro** | **2026-02-22** | **2026-02-22** | Validación por eventId antes de upsert |
| **BUG-007** | **Promedio no se actualiza al borrar nota** | 1. Borrar una nota desaprobada 2. El promedio sigue igual 3. Requiere F5 para ver cambio | Alta | En Proceso | **Leandro** | **2026-02-26** | - | Investigando trigger de re-fetch en el hook |
| **BUG-008** | **Error 500 al cargar crédito sin categoría** | 1. Ir a sección Recursos 2. Cargar crédito con campo categoría vacío 3. Crash del backend | Crítica | Resuelto | **Leandro** | **2026-02-27** | **2026-02-27** | Añadido Zod schema validation en el controller |
| **BUG-009** | **Filtro de materias "Aprobadas" incluye desaprobadas** | 1. Ver lista de materias 2. Filtrar por estado 3. Salen las de nota < 4 | Media | Resuelto | **Leandro** | **2026-02-28** | **2026-03-01** | Corregida query de filtrado en el service |
| **BUG-010** | **(V1.1) Expiración de sesión en Simulador** | 1. Estar en modo simulación por > 1 hora 2. API devuelve 401 3. No auto-refresh | Media | Abierto | **Leandro** | **2026-03-05** | - | Bug detectado en test case CP-12 previo |
| **BUG-011** | **Flash visual en alertas de advertencia al cambiar estado** | 1. Cambiar estado de materia (ej: Aprobada → Cursando) 2. Las advertencias desaparecen y reaparecen rápidamente creando flash visual | Alta | Resuelto | **Leandro** | **2026-03-06** | **2026-03-06** | El problema era que `setTransitionWarnings([])` se ejecutaba ANTES del request, causando unmount/remount del componente de alertas. Se eliminó el clear previo, ahora las advertencias persisten hasta que llega la nueva respuesta. |
| **BUG-012** | **Flash visual al entrar a la ruta /calendario desde otra página** | 1. Navegar desde otra ruta (ej: Dashboard) a /calendario 2. Se ve un flash de contenido vacío antes de mostrar el skeleton de carga | Alta | Resuelto | **Leandro** | **2026-03-06** | **2026-03-06** | Dos causas: `isLoading` iniciaba en `false` mostrando contenido vacío en el primer render antes del useEffect, y React Router remontaba el componente. Se agregó `isLoading: true` inicial, flag `hasLoadedOnce`, y estado `showContent` con delay de 50ms para transición suave. |