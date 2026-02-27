# CursApp - Sistema de Seguimiento Académico 🎓🚀

Sistema de seguimiento académico diseñado para estudiantes de la UNAHUR. Permite centralizar el progreso de la carrera, ofreciendo una visión clara de materias aprobadas, pendientes, promedios y correlatividades.

- **Dashboard Inteligente:** Métricas de avance, promedio real y **proyección de graduación** basada en ritmo histórico y camino crítico.
- **Sugerencias Avanzadas:** Algoritmo de recomendación por impacto transitivo y estacionalidad.
- **Gestión de Exámenes:** Registro de parciales y notas con **sincronización automática al calendario**.
- **Historial Académico:** Registro detallado de notas y seguimiento de intentos (recursadas).
- **Simulador:** Proyectá el impacto de aprobar o desaprobar materias antes de que suceda.

## 🛠️ Tecnologías

### Backend
- **Framework:** NestJS
- **Base de Datos:** PostgreSQL
- **ORM:** Prisma
- **Lenguaje:** TypeScript

### Frontend
- **Framework:** React + Vite
- **Lenguaje:** TypeScript
- **Estilos:** TailwindCSS
- **Visualización:** React Flow (Mapa de Carrera Interactivo)

---

## 📋 Requisitos Previos

Antes de empezar, asegurate de tener instalado lo siguiente:

1.  **[Node.js](https://nodejs.org/)** (v18 o superior)
    *   *Para verificar:* Abre una terminal y escribe `node -v`.
2.  **[PostgreSQL](https://www.postgresql.org/download/)**
    *   Podés instalarlo localmente o usar [Docker Desktop](https://www.docker.com/products/docker-desktop/)
3.  **[Git](https://git-scm.com/downloads)**
    *   Para clonar el repositorio.

---

## 🚀 Guía de Inicio

### 1. Inicialización
```bash
git clone <url-del-repo>
cd CursApp
npm install
```

### 2. Levantar el Proyecto

#### Opción A: Con Docker (Recomendado para la DB)
Si tenés Docker, es la forma más rápida de arrancar:
```bash
docker-compose up -d    # Levanta la base de datos
npm run db:setup        # Configura tablas y datos iniciales
npm start               # Inicia Frontend y Backend
```

#### Opción B: Instalación Manual
Si preferís no usar Docker, asegurate de tener PostgreSQL corriendo y ejecutá:
```bash
# Copia y configurá tus variables de entorno (.env)
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env

npm run db:setup        # Sincroniza y carga datos
npm start               # Inicia el sistema
```

---
*Desarrollado para la comunidad UNAHUR - 2026*
