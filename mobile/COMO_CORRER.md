# 📱 Cómo Correr la App Móvil

## 🚀 Opción 1: En el Navegador (MÁS FÁCIL para empezar)

1. **Abre una terminal** y ve a la carpeta mobile:
```bash
cd /home/franco/Documents/Personal/Recents/property-recommenderv2/property-recommenderv2/mobile
```

2. **Asegúrate de que el backend esté corriendo** en otra terminal:
```bash
cd ../backend
npm run dev
```

3. **En la terminal de mobile, ejecuta:**
```bash
npm start
```

4. **Presiona `w`** en la terminal para abrir en el navegador web

5. **La app se abrirá en:** `http://localhost:8081` o similar

---

## 📱 Opción 2: En tu Teléfono (MEJOR EXPERIENCIA)

### Requisitos:
- Tu teléfono y computadora en la misma red WiFi
- App **Expo Go** instalada en tu teléfono:
  - Android: [Google Play - Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent)
  - iPhone: [App Store - Expo Go](https://apps.apple.com/app/expo-go/id982107779)

### Pasos:

1. **Obtén la IP de tu computadora:**
```bash
hostname -I
# O en Linux:
ip addr show | grep "inet " | grep -v 127.0.0.1
```
Ejemplo: `192.168.1.100`

2. **Crea/edita el archivo `.env` en la carpeta `mobile/`:**
```bash
cd mobile
echo "EXPO_PUBLIC_API_URL=http://TU_IP_AQUI:8000" > .env
```

Por ejemplo, si tu IP es `192.168.1.100`:
```
EXPO_PUBLIC_API_URL=http://192.168.1.100:8000
```

3. **Inicia la app:**
```bash
npm start
```

4. **Verás un QR code en la terminal**

5. **Escanea el QR code:**
   - **Android:** Abre Expo Go → Toca "Scan QR code"
   - **iPhone:** Abre la app Cámara → Apunta al QR → Toca la notificación

6. **¡La app se cargará en tu teléfono!**

---

## 💻 Opción 3: Emulador Android

1. **Abre Android Studio** y crea/inicia un emulador Android

2. **En la terminal, desde la carpeta mobile:**
```bash
npm start
```

3. **Presiona `a`** para abrir en Android emulator

---

## 🍎 Opción 4: Simulador iOS (Solo macOS)

1. **Asegúrate de tener Xcode instalado**

2. **En la terminal, desde la carpeta mobile:**
```bash
npm start
```

3. **Presiona `i`** para abrir en iOS Simulator

---

## 🎮 Comandos Útiles (mientras `npm start` está corriendo)

- `r` - Recargar la app
- `m` - Abrir menú de desarrollador
- `w` - Abrir en navegador web
- `a` - Abrir en Android emulator
- `i` - Abrir en iOS simulator
- `s` - Mostrar QR code
- `?` - Ver todos los comandos

---

## 🔐 Credenciales de Prueba

Para el tenant "demo":
- **Email:** `admin@demo.com`
- **Password:** `admin123`
- **Inmobiliaria (slug):** `demo`

---

## ⚠️ Problemas Comunes

### "Cannot connect to backend"
- Verifica que el backend esté corriendo en `http://localhost:8000`
- Si estás en teléfono, usa la IP de tu computadora en `.env`
- Verifica que el firewall no esté bloqueando el puerto 8000

### "Network request failed"
- En dispositivo físico, asegúrate de usar la IP correcta en `.env`
- Verifica que tu teléfono y computadora estén en la misma red WiFi

### La app no carga / Pantalla en blanco
- Presiona `r` en la terminal de Expo para recargar
- Cierra y vuelve a abrir Expo Go
- Verifica que no haya errores en la terminal

---

## ✅ Checklist Rápido

- [ ] Backend corriendo en puerto 8000
- [ ] App iniciada con `npm start`
- [ ] Puedo ver la pantalla de login
- [ ] Puedo iniciar sesión
- [ ] Veo la lista de propiedades

¡Listo! 🎉


