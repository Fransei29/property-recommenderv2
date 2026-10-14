# Backend - Property Recommender API

Backend migrado de Python/FastAPI a Node.js/Express con soporte **Multi-Tenant**.

## 🏢 Arquitectura Multi-Tenant

El sistema ahora soporta múltiples inmobiliarias (tenants) en una sola instancia:
- Cada inmobiliaria tiene sus propios usuarios y propiedades
- Aislamiento completo de datos entre tenants
- Branding personalizable por tenant (colores, logo)
- Detección automática de tenant por subdominio o header

## Estructura

```
backend/
├── src/
│   ├── config/          # Configuración (database, config)
│   ├── middleware/      # Middleware (auth, tenant)
│   │   ├── auth.js      # Autenticación JWT
│   │   └── tenant.js    # Detección de tenant
│   ├── routes/         # Rutas de la API
│   │   ├── auth.js      # Autenticación (register, login)
│   │   ├── properties.js # CRUD de propiedades
│   │   ├── admin.js     # Panel de administración
│   │   └── tenants.js   # Gestión de tenants (CRUD)
│   ├── utils/          # Utilidades (security)
│   └── index.js        # Punto de entrada
├── uploads/            # Directorio para imágenes subidas
├── package.json
├── Dockerfile
├── init.sql            # Script de inicialización de BD (multi-tenant)
└── migrate_to_multitenant.sql # Script de migración para bases existentes
```

## Instalación

```bash
npm install
```

## Configuración

Crear archivo `.env`:

```env
PORT=8000
DB_HOST=localhost
DB_USER=usuario
DB_PASSWORD=contraseña
DB_NAME=inmobiliaria_db
SECRET_KEY=esta_es_una_clave_muy_secreta_y_larga
ACCESS_TOKEN_EXPIRE_MINUTES=60
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

## Desarrollo

```bash
npm run dev
```

## Producción

```bash
npm start
```

## Endpoints

### Autenticación (requiere tenant)
- `POST /auth/register` - Registrar nuevo usuario (requiere `X-Tenant-Slug` header)
- `POST /auth/login` - Iniciar sesión (requiere `X-Tenant-Slug` header)

### Propiedades (filtradas por tenant)
- `GET /properties` - Listar propiedades del tenant actual
- `GET /properties/:id` - Obtener una propiedad del tenant actual
- `POST /properties` - Crear propiedad (requiere tenant_admin o admin)
- `PUT /properties/:id` - Actualizar propiedad (requiere tenant_admin o admin)
- `DELETE /properties/:id` - Eliminar propiedad (requiere tenant_admin o admin)

### Gestión de Tenants (solo admin global)
- `GET /tenants` - Listar todos los tenants
- `GET /tenants/:slug` - Obtener información de un tenant
- `POST /tenants` - Crear nuevo tenant
- `PUT /tenants/:id` - Actualizar tenant
- `DELETE /tenants/:id` - Eliminar tenant (elimina en cascada usuarios y propiedades)

### Administración
- `GET /admin/properties` - Listar propiedades (filtradas por tenant si se especifica)
- `POST /admin/properties` - Crear propiedad con imagen (requiere tenant)
- `PUT /admin/properties/:id` - Actualizar propiedad (requiere tenant)
- `DELETE /admin/properties/:id` - Eliminar propiedad (requiere tenant)
- `GET /admin/stats` - Estadísticas del sistema (filtradas por tenant si se especifica)

## Detección de Tenant

El sistema detecta el tenant de tres formas (en orden de prioridad):

1. **Header HTTP**: `X-Tenant-Slug: premium`
2. **Subdominio**: `premium.tudominio.com`
3. **Query parameter** (solo desarrollo): `?tenant=premium`

### Ejemplo de uso con header:
```bash
curl -H "X-Tenant-Slug: premium" http://localhost:8000/properties
```

### Ejemplo de uso con subdominio:
```bash
curl http://premium.localhost:8000/properties
```

## Base de Datos

La base de datos MySQL se inicializa automáticamente con `init.sql` cuando se usa Docker Compose.

### Migración a Multi-Tenant

Si ya tienes una base de datos existente con datos, ejecuta el script de migración:

```bash
mysql -u usuario -p inmobiliaria_db < migrate_to_multitenant.sql
```

Este script:
- Crea la tabla `tenants`
- Crea un tenant por defecto (`default`)
- Asigna todos los usuarios y propiedades existentes al tenant por defecto
- Agrega las columnas `tenant_id` necesarias
- Actualiza los índices y constraints

### Roles de Usuario

- **admin**: Administrador global (puede gestionar todos los tenants)
- **tenant_admin**: Administrador de un tenant específico
- **user**: Usuario regular de un tenant

## Docker

```bash
docker-compose up
```



