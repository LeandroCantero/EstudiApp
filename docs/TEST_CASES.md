# Documento de Seguimiento de Testing (Test Cases & Bugs)
**CursApp - Study Tracker**

---

## 1. Registro de Bugs y Hallazgos

| ID | Descripción | Prioridad | Estado | Resolución |
| :--- | :--- | :--- | :--- | :--- |
| **BUG-001** | El cálculo de profundidad del Camino Crítico no filtraba materias aprobadas | Alta | Resuelto | Se añadió filtro `approvedSubjects` en `users.service.ts` |
| **BUG-002** | Error de tipos en `calculateCriticalPathDepth` (Prerequisites vs prerequisites) | Media | Resuelto | Corrección de typos en el mapeo de Prisma |
| **BUG-003** | El simulador persistía cambios en la base de datos por error de contexto | Crítica | Resuelto | Implementación de rollback automático en modo simulación |
| **BUG-014** | Badge de "INTENTO #X" no se mostraba para materias en curso | Baja | Resuelto | Cambio de lógica visual en `subjects-page.tsx` |
| **BUG-015** | Desajuste visual en Dashboard al mostrar promedio con muchos decimales | Muy Baja | Resuelto | Aplicación de `.toFixed(2)` en el frontend |
| **BUG-006** | Sincronización duplicaba eventos al editar un examen repetidas veces | Media | Resuelto | Se añadió verificación por `eventId` antes de crear nuevos eventos |

## 2. Ejecución de Casos de Prueba (Resumen)

| ID Caso | Descripción | Estado | Fecha | Notas |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Registro de usuario | ✅ PASSED | 20/02/2026 | Funcionamiento correcto con JWT |
| **TC-05** | Validación Correlativas | ✅ PASSED | 21/02/2026 | Respeta RN2 y RN8 rigurosamente |
| **TC-08** | Algoritmo Recomendación | ✅ PASSED | 22/02/2026 | El impacto transitivo funciona OK |
| **TC-09** | Sync Calendario | ✅ PASSED | 22/02/2026 | Eventos dinámicos verificados |
| **TC-12** | Modo Simulador | ✅ PASSED | 22/02/2026 | Proyección temporal sin persistencia |

---
**Responsable:** Cantero, Leandro  
**Fecha:** 22/02/2026
