# Property Recommender - Mobile App

Aplicación móvil desarrollada con Expo y React Native para el sistema de recomendación de propiedades inmobiliarias.

## 🚀 Características

- ✅ Autenticación (Login/Registro)
- ✅ Lista de propiedades
- ✅ Detalle de propiedad
- ✅ Sistema de favoritos
- ✅ Multi-tenant support
- ✅ Navegación con Expo Router

## 📋 Requisitos Previos

- Node.js 18+ instalado
- npm o yarn
- Expo CLI (se instala automáticamente)
- Backend corriendo en `http://localhost:8000`

## 🛠️ Instalación

1. Navega a la carpeta del proyecto:
```bash
cd mobile
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura la URL del backend (opcional):
Crea un archivo `.env` con:
```
EXPO_PUBLIC_API_URL=http://localhost:8000
```

## 🏃 Ejecutar la App

### Desarrollo

```bash
npm start
```

Esto abrirá Expo DevTools. Puedes:
- Presionar `a` para abrir en Android emulator
- Presionar `i` para abrir en iOS simulator (solo macOS)
- Escanear el QR code con la app Expo Go en tu teléfono

### Android

```bash
npm run android
```

### iOS (solo macOS)

```bash
npm run ios
```

### Web

```bash
npm run web
```

## 📱 Estructura del Proyecto

```
mobile/
├── app/                    # Rutas con Expo Router
│   ├── (auth)/            # Pantallas de autenticación
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/            # Pantallas principales
│   │   ├── index.tsx     # Home - Lista de propiedades
│   │   └── property/     # Detalle de propiedad
│   └── _layout.tsx        # Layout principal
├── components/            # Componentes reutilizables
├── lib/                   # Lógica de negocio
│   └── api.ts            # Cliente API
├── utils/                 # Utilidades
└── assets/                # Imágenes y recursos
```

## 🔐 Autenticación

La app usa JWT tokens almacenados en AsyncStorage. El token se incluye automáticamente en todas las peticiones API.

### Credenciales de prueba

Para el tenant "demo":
- Email: `admin@demo.com`
- Password: `admin123`

## 🌐 Multi-Tenant

La app soporta múltiples inmobiliarias. El tenant se especifica en el login mediante el campo "Inmobiliaria (slug)". Por defecto usa "demo".

## 📡 API

La app se conecta al backend en `http://localhost:8000`. Asegúrate de que:
1. El backend esté corriendo
2. CORS esté configurado para permitir requests desde la app móvil
3. La URL en `.env` sea correcta

## 🎨 Estilos

Los estilos están definidos usando StyleSheet de React Native. El diseño sigue un estilo minimalista y moderno.

## 📦 Próximas Funcionalidades

- [ ] Búsqueda y filtros
- [ ] Perfil de usuario
- [ ] Reviews de propiedades
- [ ] Página de inmobiliaria
- [ ] Panel de administración móvil
- [ ] Notificaciones push
- [ ] Subida de imágenes desde el teléfono

## 🐛 Troubleshooting

### Error de conexión al backend
- Verifica que el backend esté corriendo
- Verifica la URL en `.env`
- En dispositivos físicos, usa la IP de tu máquina en lugar de `localhost`

### Error de autenticación
- Verifica que el tenant slug sea correcto
- Asegúrate de que el backend esté configurado para aceptar el tenant

### Problemas con imágenes
- Las imágenes deben estar accesibles desde la red
- Usa URLs completas o rutas relativas al backend

## 📝 Notas

- Para desarrollo en dispositivo físico, asegúrate de que tu teléfono y computadora estén en la misma red WiFi
- Para Android, puedes usar `adb reverse tcp:8000 tcp:8000` para redirigir el puerto
- Para iOS, necesitarás configurar la IP de tu máquina en el `.env`




