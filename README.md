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

- [Node.js](https://nodejs.org/) (v18 o superior)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (opcional, para la base de datos)
- Git

---

## 🚀 Guía de Inicio Rápido (Paso a Paso)

Sigue estos pasos para levantar todo el entorno de desarrollo desde cero.

### 1. Clonar el repositorio e instalar dependencias

```bash
# Clonar proyecto
git clone <url-del-repo>
cd CursApp

# Instalar dependencias del Backend
cd backend
npm install

# Instalar dependencias del Frontend
cd ../frontend
npm install
```

### 2. Configuración del Entorno (.env)

#### Backend (`/backend/.env`)
Crea el archivo `.env` en la carpeta backend:
```env
DATABASE_URL="postgresql://user:admin@localhost:5432/cursapp?schema=public"
JWT_SECRET="tu_clave_secreta_para_desarrollo"
PORT=3001
NODE_ENV=development
```

#### Frontend (`/frontend/.env`)
Crea el archivo `.env` en la carpeta frontend:
```env
VITE_API_URL=http://localhost:5173/api/v1
VITE_APP_ENV=development
```

### 3. Configuración de la Base de Datos

#### Opción A: Docker (Recomendado)
Utilizamos Docker para gestionar PostgreSQL y pgAdmin rápidamente.
```bash
# En la raíz del proyecto
docker-compose up -d
```
> **Nota:** Esto levantará Postgres en el puerto `5432` y pgAdmin en `http://localhost:8080`.

#### Opción B: PostgreSQL Local (Sin Docker)
Si ya tienes PostgreSQL instalado en tu sistema:
1. Crea una base de datos llamada `cursapp`.
2. Edita el archivo `backend/.env` y ajusta la URL:
```env
DATABASE_URL="postgresql://USUARIO:PASSWORD@localhost:5432/cursapp?schema=public"
```

### 4. Configuración y Migraciones (Backend)
Configura la base de datos y carga los datos iniciales (Institutos y Carreras).

```bash
cd backend

# 1. Crear estructura de tablas
npx prisma migrate dev --name init

# 2. Cargar datos base (Carreras y Usuario Admin)
npx prisma db seed
```

### 5. Carga de Planes de Estudio 📄
El `seed` básico crea las carreras pero **no** las materias. Para cargar el plan de estudios completo (ej: Lic. en Informática) con sus correlatividades, ejecutamos el script de importación:

```bash
# Estando en la carpeta /backend
npx ts-node --transpile-only scripts/test-import.ts
```
> ✅ Esto cargará ~50 materias de Informática y establecerá sus correlatividades en el usuario `admin`.

### 6. Ejecutar la Aplicación

#### Backend (API)
```bash
# Terminal 1 - Carpeta /backend
npm run start:dev
# La API correrá en http://localhost:3001
```

#### Frontend (UI)
```bash
# Terminal 2 - Carpeta /frontend
npm run dev
# La App correrá en http://localhost:5173 (o similar)
```

---

## 📂 Estructura del Proyecto
- `backend/prisma/plans/`: PDFs originales de los planes de estudio.
- `backend/prisma/careers/`: JSONs procesados listos para importar.
- `backend/src/import/`: Módulo de NestJS encargado de la lógica de ingestión.

## 🤝 Contribución
1. Fork del proyecto.
2. Crea tu Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit de tus cambios (`git commit -m 'Add some AmazingFeature'`).
4. Push a la rama (`git push origin feature/AmazingFeature`).
5. Abre un Pull Request.

---
*Desarrollado para la comunidad UNAHUR - 2026*
