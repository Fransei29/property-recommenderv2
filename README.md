# Property Recommender - Monorepo

Un sistema completo de recomendación de propiedades con frontend en Next.js y backend en FastAPI.

## 🏗️ Arquitectura

- **Frontend**: Next.js 15 + TypeScript + NextAuth
- **Backend**: FastAPI + SQLAlchemy + MySQL
- **Base de Datos**: MySQL 8.0
- **Contenedores**: Docker + Docker Compose

## 🚀 Inicio Rápido

### Prerrequisitos

- Docker
- Docker Compose

### Ejecutar el Proyecto Completo

1. **Clonar el repositorio**
```bash
git clone <tu-repositorio>
cd property-recommenderv2
```

2. **Configurar variables de entorno**
```bash
# Backend
cp backend/env.example backend/.env

# Frontend
cp frontend/env.example frontend/.env.local
```

3. **Levantar todos los servicios**
```bash
docker-compose up --build
```

4. **Acceder a las aplicaciones**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Base de datos: localhost:3306

## 📁 Estructura del Proyecto

```
property-recommenderv2/
├── frontend/                 # Aplicación Next.js
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── backend/                  # API FastAPI
│   ├── app/
│   ├── Dockerfile
│   └── requirements.txt
├── docker-compose.yml        # Orquestación de servicios
└── README.md
```

## 🔧 Servicios

### Frontend (Puerto 3000)
- Next.js con TypeScript
- NextAuth para autenticación
- SASS para estilos
- Testing con Jest

### Backend (Puerto 8000)
- FastAPI con documentación automática
- SQLAlchemy ORM
- JWT Authentication
- CORS configurado

### Base de Datos (Puerto 3306)
- MySQL 8.0
- Base de datos: `inmobiliaria_db`
- Usuario: `usuario`
- Contraseña: `contraseña`

## 🛠️ Comandos Útiles

### Desarrollo
```bash
# Levantar solo el backend
docker-compose up backend

# Levantar solo el frontend
docker-compose up frontend

# Ver logs de un servicio específico
docker-compose logs -f backend

# Reconstruir un servicio
docker-compose up --build backend
```

### Producción
```bash
# Levantar en modo producción
docker-compose -f docker-compose.prod.yml up -d

# Parar todos los servicios
docker-compose down

# Parar y eliminar volúmenes
docker-compose down -v
```

## 🔗 Integración Frontend-Backend

### Variables de Entorno Frontend
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu_secret_aqui
```

### Variables de Entorno Backend
```env
DATABASE_URL=mysql+aiomysql://usuario:contraseña@mysql:3306/inmobiliaria_db
SECRET_KEY=tu_secret_key_aqui
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

## 📊 Endpoints Principales

### Autenticación
- `POST /auth/register` - Registro de usuarios
- `POST /auth/login` - Login de usuarios
- `GET /auth/me` - Obtener usuario actual

### Propiedades
- `GET /properties` - Listar propiedades
- `GET /properties/{id}` - Obtener propiedad específica
- `POST /properties` - Crear nueva propiedad
- `PUT /properties/{id}` - Actualizar propiedad
- `DELETE /properties/{id}` - Eliminar propiedad

## 🧪 Testing

```bash
# Frontend tests
cd frontend && npm test

# Backend tests
cd backend && python -m pytest
```

## 🚀 Deployment

### Desarrollo Local
```bash
docker-compose up --build
```

### Producción
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🔒 Seguridad

- JWT tokens para autenticación
- CORS configurado
- Contraseñas hasheadas con bcrypt
- Variables de entorno para configuración sensible

## 📝 Notas

- El backend incluye documentación automática en `/docs`
- La base de datos se inicializa automáticamente con datos de ejemplo
- Los volúmenes de Docker persisten los datos entre reinicios
- El frontend está configurado para hot-reload en desarrollo 