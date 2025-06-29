# Sistema de Recomendación de Propiedades

Sistema completo de recomendación de propiedades, construido con tecnologías modernas como Next.js 15, TypeScript y SCSS modular.
Diseñado con foco en rendimiento, arquitectura escalable y excelente experiencia de usuario.
Ideal para inmobiliarias, startups de real estate o como base para productos de recomendación personalizados.


## 🚀 Características

### Funcionalidades Principales
- **Listado de propiedades** con 100 propiedades de ejemplo
- **Sistema de recomendaciones** basado en similitud (ciudad, tipo, precio ±20%)
- **Favoritos** guardados en localStorage
- **Búsqueda y filtros** por ciudad, tipo y rango de precios
- **Paginación** del lado del cliente
- **Diseño responsive** y moderno
- **Testing completo** con React Testing Library y Jest

### Características Técnicas
- **Next.js 15** con App Router
- - Autenticación integrada con NextAuth
- **TypeScript** para tipado completo
- **SCSS modular** sin dependencias de CSS-in-JS
- **Arquitectura modular** y escalable
- **Hooks personalizados** para lógica reutilizable
- **Componentes reutilizables** y bien tipados
- **Testing** con Jest y React Testing Library

## 📁 Estructura del Proyecto
<details>
<summary>📁 Ver estructura del proyecto</summary>


```text
property-recommender/
├── 📁 src/ 
│ ├── 📁 app/ 
│ │ ├── 📁 api/ 
│ │ │ └── 📁 auth/ 
│ │ │ └── 📁 [...nextauth]/ # Configuración NextAuth
│ │ ├── 📁 auth/            # Páginas de autenticación
│ │ ├── 📄 layout.tsx       # Layout principal
│ │ ├── 📄 page.tsx         # Página principal
│ │ └── 📄 page.module.scss # Estilos de la página principal
│ │
│ ├── 📁 components/  
│ │ ├── 📁 AuthGuard/          # Componente de protección de rutas
│ │ ├── 📁 Filters/            # Sistema de filtros avanzado
│ │ ├── 📁 Footer/             # Pie de página
│ │ ├── 📁 LayoutWrapper/      # Wrapper de layout
│ │ ├── 📁 Navbar/             # Barra de navegación
│ │ ├── 📁 Pagination/         # Sistema de paginación
│ │ ├── 📁 PropertyCard/       # Tarjeta individual de propiedad
│ │ ├── 📁 PropertyDetail/     # Vista detallada de propiedad
│ │ ├── 📁 Providers/          # Proveedores de contexto
│ │ ├── 📁 RecommendationList/ # Lista de recomendaciones
│ │ └── 📁 SearchBar/          # Barra de búsqueda
│ │
│ ├── 📁 data/                # Datos y carga de información
│ │ ├── 📄 loadProperties.ts  # Cargador de propiedades
│ │ └── 📄 properties.json    # Datos de propiedades
│ │
│ ├── 📁 hooks/                  # Hooks personalizados
│ │ ├── 📄 useFavorites.ts       # Gestión de favoritos
│ │ └── 📄 useRecommendations.ts # Lógica de recomendaciones
│ │
│ ├── 📁 lib/              # Configuraciones y utilidades
│ │ └── 📄 auth.ts         # Configuración de autenticación
│ │
│ ├── 📁 styles/ 
│ │ └── 📄 globals.scss    # Variables CSS y estilos base
│ │
│ ├── 📁 types/             # Definiciones TypeScript
│ │ ├── 📄 next-auth.d.ts   # Tipos de NextAuth
│ │ └── 📄 types.ts         # Tipos principales de la aplicación
│ │
│ └── 📁 utils/             # Utilidades y algoritmos
│ ├── 📄 filterUtils.ts     # Lógica de filtrado
│ ├── 📄 formatUtils.ts     # Formateo de datos
│ ├── 📄 index.ts           # Exportaciones centralizadas
│ ├── 📄 searchUtils.ts     # Búsqueda semántica
│ └── �� similarityUtils.ts # Algoritmo de recomendaciones
│
├── 📁 public/ # Archivos estáticos
│
├── 📄 .gitignore         # Archivos ignorados por Git
├── 📄 eslint.config.mjs  # Configuración ESLint
├── 📄 jest.config.js     # Configuración de pruebas
├── 📄 jest.setup.js      # Setup de pruebas
├── 📄 next.config.ts     # Configuración Next.js
├── 📄 next-env.d.ts      # Tipos de Next.js
├── 📄 package.json       # Dependencias y scripts
├── 📄 package-lock.json  # Lock de dependencias
├── 📄 README.md          # Documentación del proyecto
└── 📄 tsconfig.json      # Configuración TypeScript
```
</details>

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

3. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

4. **Abrir en el navegador**
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

### Funcionalidades Principales

1. **Explorar Propiedades**
   - Navega por las 100 propiedades disponibles
   - Usa la paginación para ver más propiedades
   - Haz clic en una propiedad para ver recomendaciones

2. **Sistema de Favoritos**
   - Haz clic en el corazón para agregar/remover favoritos
   - Los favoritos se guardan automáticamente en localStorage
   - Ve el contador de favoritos en la barra lateral

3. **Búsqueda y Filtros**
   - Usa la barra de búsqueda para buscar por título, ciudad o tipo
   - Aplica filtros por ciudad, tipo de propiedad y rango de precios
   - Limpia los filtros con el botón "Limpiar filtros"

4. **Recomendaciones Inteligentes**
   - Selecciona una propiedad para ver recomendaciones similares
   - Las recomendaciones se basan en ciudad, tipo y precio similar
   - Ve las razones de similitud para cada recomendación

### Componentes Principales

#### PropertyCard
- Muestra información completa de una propiedad
- Manejo de errores de imagen con fallback
- Botón de favoritos integrado
- Indicador de selección para recomendaciones
- **Testing**: Verifica título, ciudad e imagen

#### SearchBar
- Búsqueda en tiempo real con debounce
- Botón de limpiar búsqueda
- Indicador de estado de búsqueda

#### Filters
- Filtros por ciudad y tipo de propiedad
- Rango de precios con inputs numéricos
- Filtros activos visibles
- Botón para limpiar todos los filtros

#### Pagination
- Navegación por páginas
- Botones anterior/siguiente
- Números de página con ellipsis
- Información de página actual

#### RecommendationList
- Lista de propiedades recomendadas
- Muestra puntuación de similitud
- Razones de recomendación
- Navegación fácil entre recomendaciones

## 🎨 Diseño y UX

### Principios de Diseño
- **Simplicidad**:    Interfaz limpia y fácil de usar
- **Consistencia**:   Componentes reutilizables con estilos coherentes
- **Accesibilidad**:  Navegación por teclado y ARIA labels
- **Responsive**:     Funciona perfectamente en móvil, tablet y desktop

### Sistema de Colores
- **Primario**: Azul (#2563eb)
- **Secundario**: Gris (#6b7280)
- **Éxito**: Verde (#10b981)
- **Error**: Rojo (#ef4444)
- **Advertencia**: Amarillo (#f59e0b)

### Tipografía
- **Fuente principal**: Inter (sans-serif)
- **Jerarquía clara**: Títulos, subtítulos, cuerpo y captions
- **Legibilidad**: Contraste adecuado y espaciado

## 🔧 Configuración

### Variables de Entorno
```env
# Se requiere la de Next Secret para authenticacion.
```

## 📊 Rendimiento

### Optimizaciones Implementadas
- **Lazy loading** de imágenes
- **Memoización** de cálculos costosos
- **Debounce** en búsquedas
- **Paginación** para listas grandes
- **Componentes optimizados** con React.memo
- **Testing automatizado** para prevenir regresiones

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
- [ ] **Base de datos real** (PostgreSQL/MongoDB)
- [ ] **API REST** para datos dinámicos
- [ ] **Autenticación** de usuarios
- [ ] **Mapas interactivos** con ubicaciones
- [ ] **Modo oscuro** toggle
- [ ] **Internacionalización** (i18n)
- [ ] **PWA** con funcionalidades offline
- [ ] **Chatbot** de asistencia
- [ ] **Notificaciones** push
- [ ] **Analytics** y métricas de uso

### Mejoras Técnicas
- [x] **Testing completo** con Jest y Testing Library
- [ ] **Storybook** para documentación de componentes
- [ ] **CI/CD** automatizado
- [ ] **Monitoreo** de errores (Sentry)
- [ ] **Optimización** de imágenes avanzada
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

