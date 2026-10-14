# 🚀 Guía para Probar la App Móvil

## 📋 Antes de Empezar

### 1. Verificar que el Backend esté corriendo

Primero, asegúrate de que tu backend esté corriendo en el puerto 8000:

```bash
# Desde la carpeta raíz del proyecto
cd backend
npm run dev
```

Deberías ver algo como: `Server running on port 8000`

### 2. Verificar que tienes Node.js instalado

Ya verificamos que tienes Node.js v22.18.0 ✅

---

## 🌐 Opción 1: Probar en el Navegador (MÁS FÁCIL)

Esta es la forma más rápida de probar la app sin instalar nada extra.

### Pasos:

1. **Abre una nueva terminal** (deja el backend corriendo en otra)

2. **Navega a la carpeta mobile:**
```bash
cd /home/franco/Documents/Personal/Recents/property-recommenderv2/property-recommenderv2/mobile
```

3. **Inicia la app:**
```bash
npm start
```

4. **Presiona `w`** para abrir en el navegador web

5. **La app se abrirá en:** `http://localhost:8081` o similar

### ⚠️ Nota para Web:
- En el navegador, las imágenes pueden no cargar si usas `localhost:8000`
- Para web, puedes cambiar temporalmente en `lib/api.ts` la URL a tu IP local

---

## 📱 Opción 2: Probar en tu Teléfono (RECOMENDADO)

Esta es la mejor experiencia, ya que es una app móvil real.

### Requisitos:
- Un teléfono Android o iPhone
- Que tu teléfono y computadora estén en la misma red WiFi

### Pasos:

1. **Instala Expo Go en tu teléfono:**
   - **Android:** [Google Play Store - Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - **iPhone:** [App Store - Expo Go](https://apps.apple.com/app/expo-go/id982107779)

2. **Abre una nueva terminal** (deja el backend corriendo en otra)

3. **Navega a la carpeta mobile:**
```bash
cd /home/franco/Documents/Personal/Recents/property-recommenderv2/property-recommenderv2/mobile
```

4. **Inicia la app:**
```bash
npm start
```

5. **Verás un QR code en la terminal**

6. **Escanea el QR code:**
   - **Android:** Abre Expo Go → Toca "Scan QR code"
   - **iPhone:** Abre la app Cámara → Apunta al QR → Toca la notificación

7. **La app se cargará en tu teléfono**

### ⚠️ Problema común: "No puede conectar al backend"

Si ves errores de conexión en el teléfono:

1. **Obtén la IP de tu computadora:**
```bash
hostname -I
# O en Linux:
ip addr show | grep "inet " | grep -v 127.0.0.1
```

2. **Crea/edita el archivo `.env` en la carpeta `mobile/`:**
```bash
cd mobile
echo "EXPO_PUBLIC_API_URL=http://TU_IP_AQUI:8000" > .env
```

   Por ejemplo, si tu IP es `192.168.1.100`:
```
EXPO_PUBLIC_API_URL=http://192.168.1.100:8000
```

3. **Reinicia la app Expo:**
   - Presiona `r` en la terminal donde corre `npm start`
   - O cierra y vuelve a abrir Expo Go en tu teléfono

---

## 💻 Opción 3: Emulador Android (Para desarrollo avanzado)

Si quieres probar en un emulador Android sin usar tu teléfono.

### Requisitos:
- Android Studio instalado
- Un emulador Android creado y corriendo

### Pasos:

1. **Abre Android Studio y inicia un emulador**

2. **En la terminal, desde la carpeta mobile:**
```bash
npm start
```

3. **Presiona `a`** para abrir en Android

---

## 🍎 Opción 4: Simulador iOS (Solo macOS)

Si tienes una Mac y quieres probar en iOS.

### Pasos:

1. **Asegúrate de tener Xcode instalado**

2. **En la terminal, desde la carpeta mobile:**
```bash
npm start
```

3. **Presiona `i`** para abrir en iOS Simulator

---

## 🧪 Probar la App

Una vez que la app esté corriendo:

### 1. **Pantalla de Login**

Verás la pantalla de inicio de sesión. Usa estas credenciales:

- **Email:** `admin@demo.com`
- **Password:** `admin123`
- **Inmobiliaria (slug):** `demo`

### 2. **Home - Lista de Propiedades**

Después de iniciar sesión, verás la lista de propiedades.

- Puedes hacer **pull to refresh** (arrastra hacia abajo) para actualizar
- Toca una propiedad para ver el detalle

### 3. **Detalle de Propiedad**

- Verás la imagen, precio, detalles
- Puedes agregar/quitar de favoritos tocando el corazón ❤️

### 4. **Cerrar Sesión**

Toca "Salir" en la parte superior derecha del home

---

## 🐛 Solución de Problemas

### Error: "Cannot connect to backend"

**Solución:**
1. Verifica que el backend esté corriendo: `http://localhost:8000`
2. Si estás en teléfono, usa la IP de tu computadora (ver Opción 2)
3. Verifica que el firewall no esté bloqueando el puerto 8000

### Error: "Network request failed"

**Solución:**
- En dispositivo físico, asegúrate de usar la IP correcta en `.env`
- Verifica que tu teléfono y computadora estén en la misma red WiFi

### La app no carga / Pantalla en blanco

**Solución:**
1. Presiona `r` en la terminal de Expo para recargar
2. Cierra y vuelve a abrir Expo Go
3. Verifica que no haya errores en la terminal

### Error: "Module not found"

**Solución:**
```bash
cd mobile
rm -rf node_modules
npm install
```

### El QR code no aparece

**Solución:**
1. Verifica que estés en la carpeta `mobile`
2. Asegúrate de que `npm start` esté corriendo
3. Intenta presionar `s` para ver el QR code de nuevo

---

## 📝 Comandos Útiles

Mientras `npm start` está corriendo, puedes presionar:

- `r` - Recargar la app
- `m` - Abrir menú de desarrollador
- `w` - Abrir en navegador web
- `a` - Abrir en Android emulator
- `i` - Abrir en iOS simulator
- `s` - Mostrar QR code
- `?` - Ver todos los comandos

---

## ✅ Checklist de Prueba

- [ ] Backend corriendo en puerto 8000
- [ ] App iniciada con `npm start`
- [ ] Puedo ver la pantalla de login
- [ ] Puedo iniciar sesión con `admin@demo.com` / `admin123`
- [ ] Veo la lista de propiedades
- [ ] Puedo ver el detalle de una propiedad
- [ ] Puedo agregar/quitar favoritos
- [ ] Puedo cerrar sesión

---

## 🎉 ¡Listo!

Si puedes hacer todo lo del checklist, ¡la app está funcionando correctamente!




