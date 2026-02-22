# Test Plan
**CursApp - Study Tracker**

---

## 1. Objetivos del Testing
Garantizar la integridad de los datos académicos, el correcto funcionamiento del motor de correlatividades y la precisión de las proyecciones de graduación.

## 2. Alcance
- Autenticación y Seguridad (JWT).
- Gestión de Estados de Materias.
- Algoritmos de Recomendación y Proyección.
- Sincronización Examen-Calendario.
- Simulador.

## 3. Estrategia de Pruebas
- **Unit Testing (Backend):** Validación de servicios de cálculo (promedio, velocidad).
- **Integration Testing:** Flujos completos de inscripción y cierre de materias.
- **Manual Verification:** Verificación de interfaz de usuario y feedback visual.

## 4. Escenarios de Prueba

### 4.1. Autenticación
| Caso | Descripción | Resultado Esperado |
| :--- | :--- | :--- |
| TC-01 | Registro de usuario nuevo | Crea usuario y permite login |
| TC-02 | Login con credenciales inválidas | Error 401 Unauthorized |
| TC-03 | Acceso a dashboard sin token | Redirección a Login / Error 401 |

### 4.2. Gestión Académica (Motor de Reglas)
| Caso | Descripción | Resultado Esperado |
| :--- | :--- | :--- |
| TC-04 | Cursar con correlativa pendiente | El sistema debe rechazar la inscripción |
| TC-05 | Cursar con correlativa regularizada | Permite inscripción (Cumple RN2) |
| TC-06 | Cerrar materia sin final de la correlativa | Bloquea el cierre (Cumple RN8) |
| TC-07 | Registrar nota de final | Se recalcula el promedio automáticamente |

### 4.3. Inteligencia y Sincronización
| Caso | Descripción | Resultado Esperado |
| :--- | :--- | :--- |
| TC-08 | Generar recomendaciones | Lista priorizada por impacto transitivo |
| TC-09 | Cargar examen con fecha | Se crea evento automático en calendario |
| TC-10 | Editar fecha de examen | El evento del calendario se actualiza |
| TC-11 | Borrar examen vinculado | El evento del calendario se elimina |

### 4.4. Simulador
| Caso | Descripción | Resultado Esperado |
| :--- | :--- | : :--- |
| TC-12 | Simular aprobación de materia clave | Actualiza proyección de fecha sin persistir datos |

## 5. Herramientas
- **Postman:** Pruebas de API.
- **Vitest:** Testing unitario de servicios.
- **Browser Tools:** Verificación de persistencia en Frontend.

---
**Responsable:** Cantero, Leandro  
**Fecha:** 22/02/2026
