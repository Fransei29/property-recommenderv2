# Sistema de Recomendación de Propiedades

Un sistema completo y profesional de recomendación de propiedades desarrollado con Next.js 15, TypeScript y SCSS modular.

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
- **TypeScript** para tipado completo
- **SCSS modular** sin dependencias de CSS-in-JS
- **Arquitectura modular** y escalable
- **Hooks personalizados** para lógica reutilizable
- **Componentes reutilizables** y bien tipados
- **Testing automatizado** con Jest y React Testing Library

## 📁 Estructura del Proyecto

```
property-recommender/
├── src/
│   ├── app/                    # App Router de Next.js
│   │   ├── layout.tsx         # Layout principal
│   │   ├── page.tsx           # Página principal
│   │   └── globals.scss       # Estilos globales
│   ├── components/            # Componentes reutilizables
│   │   ├── PropertyCard/      # Tarjeta de propiedad
│   │   │   ├── PropertyCard.tsx
│   │   │   ├── PropertyCard.module.scss
│   │   │   └── PropertyCard.test.tsx
│   │   ├── SearchBar/         # Barra de búsqueda
│   │   ├── Filters/           # Filtros de propiedades
│   │   ├── RecommendationList/# Lista de recomendaciones
│   │   ├── Pagination/        # Componente de paginación
│   │   ├── Navbar/            # Barra de navegación
│   │   ├── Footer/            # Pie de página
│   │   ├── PropertyDetail/    # Detalle de propiedad
│   │   ├── LayoutWrapper/     # Wrapper de layout
│   │   ├── Providers/         # Proveedores de contexto
│   │   └── AuthGuard/         # Guardia de autenticación
│   ├── hooks/                 # Hooks personalizados
│   │   ├── useFavorites.ts    # Gestión de favoritos
│   │   └── useRecommendations.ts # Lógica de recomendaciones
│   ├── utils/                 # Utilidades
│   │   └── compare.ts         # Funciones de comparación y filtrado
│   ├── types/                 # Tipos TypeScript
│   │   └── types.ts           # Definiciones de tipos
│   ├── data/                  # Datos
│   │   ├── properties.json    # Propiedades de ejemplo
│   │   └── loadProperties.ts  # Cargador de datos
│   ├── lib/                   # Librerías y configuraciones
│   └── styles/                # Estilos adicionales
├── public/                    # Archivos estáticos
├── jest.config.js            # Configuración de Jest
├── jest.setup.js             # Setup de testing
├── next.config.ts            # Configuración de Next.js
├── tsconfig.json             # Configuración de TypeScript
├── package.json              # Dependencias y scripts
└── README.md                 # Documentación
```

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

### Ejemplo de Test
```typescript
// PropertyCard.test.tsx
describe('PropertyCard', () => {
  it('should display the property title', () => {
    render(<PropertyCard {...defaultProps} />);
    expect(screen.getByText('Hermosa casa en el centro')).toBeInTheDocument();
  });

  it('should display the property city', () => {
    render(<PropertyCard {...defaultProps} />);
    expect(screen.getByText('Madrid')).toBeInTheDocument();
  });

  it('should display the property image with correct alt attribute', () => {
    render(<PropertyCard {...defaultProps} />);
    const image = screen.getByAltText('Hermosa casa en el centro');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/casa.jpg');
  });
});
```

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
- **Simplicidad**: Interfaz limpia y fácil de usar
- **Consistencia**: Componentes reutilizables con estilos coherentes
- **Accesibilidad**: Navegación por teclado y ARIA labels
- **Responsive**: Funciona perfectamente en móvil, tablet y desktop

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
# No se requieren variables de entorno para el funcionamiento básico
```

### Personalización
- **Colores**: Modifica las variables CSS en `src/app/globals.scss`
- **Datos**: Reemplaza `src/data/properties.json` con tus propios datos
- **Componentes**: Personaliza los componentes en `src/components/`

## 📊 Rendimiento

### Optimizaciones Implementadas
- **Lazy loading** de imágenes
- **Memoización** de cálculos costosos
- **Debounce** en búsquedas
- **Paginación** para listas grandes
- **Componentes optimizados** con React.memo
- **Testing automatizado** para prevenir regresiones

### Métricas Objetivo
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1

## 🚀 Despliegue

### Vercel (Recomendado)
1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno si es necesario
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

## 🤝 Contribución

### Guías de Contribución
1. **Fork** el repositorio
2. **Crea** una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abre** un Pull Request

### Estándares de Código
- **TypeScript**: Tipado estricto obligatorio
- **ESLint**: Configuración estándar de Next.js
- **Prettier**: Formateo automático
- **Commits**: Mensajes descriptivos en español
- **Testing**: Cobertura mínima del 80%

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**Franco**
- GitHub: [@Fransei29](https://github.com/Fransei29)

## 🙏 Agradecimientos

- **Next.js** por el framework increíble
- **Vercel** por la plataforma de despliegue
- **React Testing Library** por las herramientas de testing
- **Comunidad** de desarrolladores por el apoyo

---

**Estado del Proyecto**: ✅ Completado con testing implementado
**Última actualización**: Junio 2024
