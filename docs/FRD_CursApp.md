# Functional Requirements Document (FRD)
**CursApp - Study Tracker**

---

## 1. Introducción
Este documento detalla el comportamiento funcional y técnico de los algoritmos y reglas de negocio del sistema CursApp. Complementa al BRD definiendo "cómo" el sistema resuelve las necesidades del usuario.

## 2. Definición Técnica de Reglas de Negocio

### 2.1. Gestión de Estados y Transiciones (RN1)
El sistema controla el flujo de vida de una materia mediante un autómata de estados:

| Estado Actual | Transiciones Permitidas | Acción Requerida |
| :--- | :--- | :--- |
| **PENDIENTE** | EN_CURSO | Inscripción |
| **EN_CURSO** | REGULARIZADA, PROMOCIONADA, DESAPROBADA | Cierre de cursada |
| **REGULARIZADA** | PROMOCIONADA, DESAPROBADA, RECURSANDO | Aprobación de Final |
| **DESAPROBADA** | RECURSANDO, EN_CURSO | Reintento |
| **RECURSANDO** | REGULARIZADA, PROMOCIONADA, DESAPROBADA | Segundo Intento |
| **PROMOCIONADA** | - | Estado Final (Aprobada) |

### 2.2. Validación de Correlatividades (RN2, RN8)
El motor de validación verifica dos niveles de dependencia:
1. **Para Cursar:** La materia previa debe estar en estado `>= REGULARIZADA`.
2. **Para Cerrar (Final/Promoción):** La materia previa debe estar en estado `PROMOCIONADA` (Aprobada definitivamente).

### 2.3. Algoritmo de Recomendación "Impacto Transitivo" (RN5)
A diferencia de un conteo simple, el sistema utiliza un algoritmo recursivo para puntuar materias:
- **Puntaje Base:** Cantidad de materias directas que desbloquea.
- **Bonus Transitivo:** Suma de todas las materias en la cadena de desbloqueo (hijos, nietos, etc.).
- **Estacionalidad:** Multiplicador (+2) si la materia se dicta en el cuatrimestre actual (basado en el campo `period`).
- **Carga Horaria:** Factor de balanceo para no sugerir exceder la capacidad del alumno.
- **Regla de Recomendación Estricta:** Una materia solo se recomienda (`isRecommended`) si el 100% de sus correlativas directas están en estado `PROMOCIONADA`. Si están solo `REGULARIZADA`, la materia se desbloquea para cursar pero no califica para recomendación destacada.

### 2.4. Proyección de Graduación (RN9)
Cálculo basado en dos métricas concurrentes:
1. **Velocidad de Avance (V):** `V = MateriasAprobadas / CuatrimestresCursados`.
2. **Profundidad del Camino Crítico (P):** Longitud de la cadena más larga de correlatividades pendientes.
- **Resultado:** `Max((MateriasRestantes / V), P)` cuatrimestres restantes.

### 2.5. Lógica del Simulador (RN7) - Bidireccional y Persistente
El simulador opera íntegramente en el cliente mediante **React Flow** y el estado local de React:
- **Bidireccionalidad:** Permite al usuario "pintar" estados (`PROMOCIONADA`) o "despintarlos" (`PENDIENTE`), recalculando en cascada el impacto en materias futuras y recomendaciones actuales.
- **Layout por Cuatrimestre:** Organiza las materias en columnas verticales según su cuatrimestre cronológico (`year` y `period`). Esto permite visualizar el avance real sobre el plan de estudios original.
- **Headers Dinámicos:** Cada columna cuenta con un encabezado funcional que indica el cuatrimestre y año correspondientes.
- **Visualización de Estados:** Soporta visualmente todos los estados del sistema, incluyendo `REGULARIZADA` (azul) y `RECOMENDADA` (ámbar con efecto de brillo).
- **Libre Movimiento:** El usuario puede arrastrar nodos para ajustar la vista, aunque el sistema inicializa el layout de forma estructurada.
- **Limpieza Visual:** Utiliza conectores (Handles) laterales e invisibles para reducir la carga cognitiva, enfocándose en bloques de color sólido.
- No utiliza persistencia en DB; al recargar la página, el estado vuelve a sincronizarse con el backend oficial.

## 3. Cálculos Académicos (RN6)

### 3.1. Promedio Real
- **Fórmula:** `Sum(NotasFinales + NotasPromocionadas) / CantidadMateriasAprobadas`.
- No incluye notas de cursada (parciales) ni materias regularizadas pendientes de final.

### 3.2. Porcentaje de Avance
- **Cálculo:** `(MateriasAprobadas / TotalMateriasPlan) * 100`.
- Se actualiza en tiempo real cada vez que una materia transiciona a `PROMOCIONADA`.

## 4. Interfaces y Endpoints Relacionados
- `GET /recommendations`: Ejecuta Algoritmo RN5.
- `GET /users/graduation-date`: Ejecuta Algoritmo RN9.
- `Simulación Local`: Realizada en `CareerMapPage` (Frontend).

---
**Autor:** Cantero, Leandro  
**Fecha:** 25/02/2026
