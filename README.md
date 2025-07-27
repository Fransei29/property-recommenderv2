# Sistema de Recomendación de Propiedades

Sistema completo de recomendación de propiedades, construido con tecnologías modernas como Next.js 15, TypeScript y SCSS modular.
Diseñado con foco en rendimiento, arquitectura escalable y excelente experiencia de usuario.
Ideal para inmobiliarias, startups de real estate o como base para productos de recomendación personalizados.


## 🚀 Características

### Funcionalidades Principales
- **Listado de propiedades** con 100 propiedades de ejemplo
- **Sistema de recomendaciones** basado en similitud (ciudad, tipo, precio ±20%)
- **Sistema de autenticación completo** con NextAuth.js
- **Página de perfil** para gestionar favoritos
- **Favoritos persistentes** guardados en base de datos
- **Búsqueda y filtros** por ciudad, tipo y rango de precios
- **Paginación** del lado del cliente
- **Diseño responsive** y moderno
- **Optimización de imágenes** con Next.js Image
- **Testing completo** con React Testing Library y Jest

### Características Técnicas
- **Next.js 15** con App Router
- **Autenticación integrada** con NextAuth.js
- **TypeScript** para tipado completo
- **SCSS modular** sin dependencias de CSS-in-JS
- **Arquitectura modular** y escalable
- **Hooks personalizados** para lógica reutilizable
- **Componentes reutilizables** y bien tipados
- **Optimización de rendimiento** con Next.js Image
- **Testing** con Jest y React Testing Libraryx

## 🛠️ Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/Fransei29/property-recommender.git
   cd property-recommender/property-recommender
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   # Crear archivo .env.local
   NEXTAUTH_SECRET=tu_secret_aqui
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

5. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 🧪 Testing

### Ejecutar Tests
```bash
npm test                 # Ejecutar todas las pruebas
npm run test:watch       # Modo watch para desarrollo
```

### Configuración de Testing
- **Jest** como test runner
- **React Testing Library** para testing de componentes
- **jsdom** como entorno de testing
- **TypeScript** soporte completo

## 🎯 Uso


## 🔧 Metodología de trabajo para este proyecto

Este proyecto sigue una estructura clara y profesional pensada para facilitar la colaboración, la escalabilidad y futuras versiones con nuevas funcionalidades (como IA, scraping, etc.).  
A continuación, te comparto los pasos para contribuir correctamente:


### 🚀 Crear una nueva funcionalidad


# Crear una nueva rama a partir de main
```bash
git checkout -b feature/nombre-de-la-funcionalidad
```

# Agregar los cambios realizados
```bash
git add .
```

# Hacer commit con un mensaje claro
```bash
git commit -m "feat: agrega nueva funcionalidad"
```

# Actualizar tu rama con los últimos cambios de main
```bash
git pull origin main
```

# Subir tu rama al repositorio remoto
```bash
git push origin feature/nombre-de-la-funcionalidad
```

# Crear un Pull Request
Una vez subida tu rama, abrí un Pull Request en el repositorio de GitHub para que podamos revisar, testear y fusionar los cambios al entorno principal (main).


## 📁 Estructura propuesta y sugerida para la creacion del backend (Python / FastAPI)

```plaintext
backend/
├── app/
│   ├── api/                   # Endpoints REST (routers)
│   │   ├── auth.py            # Autenticación y autorización
│   │   ├── properties.py      # CRUD propiedades
│   │   ├── favorites.py       # Gestión favoritos
│   │   └── users.py           # Gestión usuarios y roles
│   │
│   ├── core/                  # Configuraciones centrales
│   │   ├── config.py          # Variables de entorno y settings
│   │   └── security.py        # Funciones de seguridad (JWT, hashing)
│   │
│   ├── db/                    # Conexión y modelos ORM
│   │   ├── base.py            # Base declarativa SQLAlchemy
│   │   ├── models.py          # Modelos de datos (Propiedades, Usuarios, etc)
│   │   └── session.py         # Sesión y conexión a la base de datos
│   │
│   ├── schemas/               # Esquemas Pydantic para validación y serialización
│   │   ├── property.py
│   │   ├── user.py
│   │   └── favorite.py
│   │
│   ├── services/              # Lógica de negocio, servicios auxiliares
│   │   └── recommendation.py # Algoritmos de recomendación
│   │
│   ├── main.py                # Punto de entrada de la aplicación FastAPI
│   └── dependencies.py        # Dependencias y middlewares
│
├── tests/                     # Pruebas unitarias e integradas
│   ├── test_auth.py
│   ├── test_properties.py
│   └── test_favorites.py
│
├── Dockerfile                 # Para contenerizar el backend
├── requirements.txt           # Dependencias Python
├── alembic.ini                # Configuración de migraciones
└── README.md                  # Documentación específica del backend
```


### Funcionalidades Principales

1. **Autenticación de Usuarios**
   - Sistema de login/logout integrado
   - Protección de rutas con AuthGuard
   - Sesiones persistentes
   - Página de perfil personalizada

2. **Explorar Propiedades**
   - Navega por las 100 propiedades disponibles
   - Usa la paginación para ver más propiedades
   - Haz clic en una propiedad para ver recomendaciones

3. **Sistema de Favoritos Avanzado**
   - Haz clic en el corazón para agregar/remover favoritos
   - Los favoritos se guardan en la base de datos del usuario
   - Accede a tus favoritos desde el perfil
   - Contador de favoritos en tiempo real

4. **Página de Perfil**
   - Vista dedicada para gestionar favoritos
   - Información del usuario autenticado
   - Navegación fácil entre favoritos
   - Diseño responsive y moderno

5. **Búsqueda y Filtros**
   - Usa la barra de búsqueda para buscar por título, ciudad o tipo
   - Aplica filtros por ciudad, tipo de propiedad y rango de precios
   - Limpia los filtros con el botón "Limpiar filtros"

6. **Recomendaciones Inteligentes**
   - Selecciona una propiedad para ver recomendaciones similares
   - Las recomendaciones se basan en ciudad, tipo y precio similar
   - Ve las razones de similitud para cada recomendación


## 🔧 Configuración

### Variables de Entorno
```env
# NextAuth Configuration
NEXTAUTH_SECRET=tu_secret_aqui
NEXTAUTH_URL=http://localhost:3000
```

## 📊 Rendimiento

### Optimizaciones Implementadas
- **Lazy loading** de imágenes
- **Next.js Image** para optimización automática
- **Memoización** de cálculos costosos
- **Debounce** en búsquedas
- **Paginación** para listas grandes
- **Componentes optimizados** con React.memo
- **Testing automatizado** para prevenir regresiones
- **Autenticación eficiente** con NextAuth.js

## 🚀 Despliegue

### Vercel
1. Conectando el tu repositorio a Vercel atraves de GitHub
2. Configura las variables de entorno
3. Despliega automáticamente

### Otros Proveedores
- **Netlify**: Compatible con Next.js
- **AWS Amplify**: Soporte nativo
- **Docker**: Imagen oficial de Next.js

## 🔮 Mejoras Futuras

### Funcionalidades Planificadas
- [x] **Sistema de autenticación** con NextAuth.js
- [x] **Página de perfil** para gestión de favoritos
- [x] **Optimización de imágenes** con Next.js Image
- [ ] **Base de datos real** (PostgreSQL/MongoDB)
- [ ] **API REST** para datos dinámicos
- [ ] **Mapas interactivos** con ubicaciones
- [ ] **Modo oscuro** toggle
- [ ] **Internacionalización** (i18n)
- [ ] **PWA** con funcionalidades offline
- [ ] **Chatbot** de asistencia
- [ ] **Notificaciones** push
- [ ] **Analytics** y métricas de uso

### Mejoras Técnicas
- [x] **Testing completo** con Jest y Testing Library
- [x] **Autenticación** integrada
- [x] **Optimización de imágenes** avanzada
- [ ] **Storybook** para documentación de componentes
- [ ] **CI/CD** automatizado
- [ ] **Monitoreo** de errores (Sentry)
- [ ] **Caching** inteligente

### Estándares de Código
- **TypeScript**: Tipado estricto obligatorio
- **ESLint**: Configuración estándar de Next.js
- **Prettier**: Formateo automático
- **Commits**: Mensajes descriptivos en español
- **Testing**: Cobertura mínima del 80%

## 👨‍💻 Autor

**Franco Seiler**
Full Stack Developer

www.francoseiler.com

- GitHub: [@Fransei29](https://github.com/Fransei29)

