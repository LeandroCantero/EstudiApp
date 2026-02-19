# CursApp - Sistema de Seguimiento Académico 🎓🚀

Sistema de seguimiento académico diseñado para estudiantes de la UNAHUR. Permite centralizar el progreso de la carrera, ofreciendo una visión clara de materias aprobadas, pendientes, promedios y correlatividades.

## 🌟 Características Principales
- **Gestión de Planes de Estudio:** Soporte para múltiples carreras de la UNAHUR (Informática, Biotecnología, Educación, etc.).
- **Control de Correlatividades:** Validación automática de materias habilitadas para cursar.
- **Historial Académico:** Registro de notas, fechas de aprobación y estado (En Curso, Final, Promoción).
- **Dashboard Personalizado:** Métricas de avance y promedio en tiempo real.

## 🛠️ Tecnologías

### Backend
- **Framework:** NestJS
- **Base de Datos:** PostgreSQL
- **ORM:** Prisma
- **Lenguaje:** TypeScript

### Frontend
- **Framework:** React + Vite
- **Lenguaje:** TypeScript
- **Estilos:** TailwindCSS (Previsto)


- **Estilos:** TailwindCSS (Previsto)

---

## 📋 Requisitos Previos

Antes de empezar, asegúrate de tener instalado lo siguiente:

1.  **[Node.js](https://nodejs.org/)** (v18 o superior)
    *   *Para verificar:* Abre una terminal y escribe `node -v`.
2.  **[PostgreSQL](https://www.postgresql.org/download/)**
    *   Puedes instalarlo localmente o usar [Docker Desktop](https://www.docker.com/products/docker-desktop/) (recomendado si no quieres configurar servicios manuales).
3.  **[Git](https://git-scm.com/downloads)**
    *   Para clonar el repositorio.

---

## 🚀 Guía de Inicio Rápido (Método Simplificado)

Hemos creado scripts automáticos para facilitar la instalación.

### 1. Inicialización
```bash
# 1. Clonar
git clone <url-del-repo>
cd CursApp

# 2. Instalar dependencias
npm install
```

### 2. Configuración (Variables de Entorno)
Copia los archivos de ejemplo para tener tu configuración lista:

```bash
# Copiar .env del backend (Windows)
copy backend\.env.example backend\.env

# Copiar .env del frontend (Windows)
copy frontend\.env.example frontend\.env
```
*(Si usas Mac/Linux, usa `cp` en lugar de `copy`)*

> 📝 **Nota:** El archivo `.env` del backend asume que tu base de datos usuario/pass es `postgres`/`admin`. Si es diferente, edita `backend/.env`.

### 3. Base de Datos
Asegúrate de que tu PostgreSQL esté corriendo. Luego ejecuta:

```bash
# Configura las tablas y carga los datos de prueba
npm run db:setup
```

### 4. ¡Arrancar! 🏁
```bash
# Inicia Backend y Frontend en paralelo
npm start
```
- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend: [http://localhost:3001](http://localhost:3001)

---

## ⚙️ Configuración Manual (Detallada)

Si prefieres tener el control total o el método simplificado falla.

### 1. Variables de Entorno (.env)

**Backend (`/backend/.env`)**
```env
DATABASE_URL="postgresql://postgres:admin@localhost:5432/cursapp?schema=public"
JWT_SECRET="secreto_desarrollo"
PORT=3001
```

**Frontend (`/frontend/.env`)**
```env
VITE_API_URL=http://localhost:3001/api/v1
```

### 2. Backend Setup
```bash
cd backend
npm install
npx prisma db push    # Sincronizar DB
npx prisma db seed    # Cargar datos (Carreras y Materias)
npm run start:dev     # Iniciar servidor
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 📂 Estructura del Proyecto
- `backend/`: API NestJS + Prisma ORM.
  - `prisma/plans/`: PDFs originales.
  - `src/careers/`: Lógica de carreras e importación.
  - `src/subjects/`: Motor de correlatividades y sugerencias.
- `frontend/`: UI React + Vite.

## 🤝 Contribución
1. Fork & Branch (`feature/NuevaFuncionalidad`).
2. Pull Request.

---
*Desarrollado para la comunidad UNAHUR - 2026*
