# 🧪 Cómo Probar el Tenant Demo

## 📋 Credenciales del Tenant Demo

### Tenant
- **Slug**: `demo`
- **Nombre**: Inmobiliaria Demo
- **Email**: demo@inmobiliaria.com

### Usuario Admin
- **Email**: `admin@demo.com`
- **Password**: `admin123`
- **Rol**: `tenant_admin` (puede gestionar propiedades del tenant)

---

## 🚀 Pasos para Probar

### 1. Verificar que el servidor esté corriendo

```bash
curl http://localhost:8000/health
```

Deberías ver: `{"status":"ok"}`

### 2. Ver información del tenant

```bash
curl http://localhost:8000/tenants/demo
```

### 3. Hacer Login

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: demo" \
  -d '{"email":"admin@demo.com","password":"admin123"}'
```

**Respuesta esperada:**
```json
{
  "access_token": "eyJhbGci...",
  "token_type": "bearer",
  "tenant_id": 6,
  "user": {
    "id": 4,
    "username": "admin_demo",
    "email": "admin@demo.com",
    "role": "tenant_admin"
  }
}
```

**⚠️ IMPORTANTE**: Guarda el `access_token` para los siguientes pasos.

### 4. Listar Propiedades del Tenant

```bash
curl -H "X-Tenant-Slug: demo" http://localhost:8000/properties
```

Deberías ver las 3 propiedades de ejemplo que se crearon.

### 5. Obtener una Propiedad Específica

```bash
# Reemplaza :id con el ID de una propiedad (ej: 17, 18, 19)
curl -H "X-Tenant-Slug: demo" http://localhost:8000/properties/17
```

### 6. Crear una Nueva Propiedad

```bash
# Reemplaza YOUR_TOKEN con el access_token del paso 3
curl -X POST http://localhost:8000/properties \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Tenant-Slug: demo" \
  -d '{
    "titulo": "Mi Nueva Casa",
    "ciudad": "Buenos Aires",
    "tipo": "Casa",
    "precio": 350000,
    "ambientes": 4,
    "metros_cuadrados": 180,
    "descripcion": "Hermosa casa para probar el sistema"
  }'
```

### 7. Actualizar una Propiedad

```bash
# Reemplaza YOUR_TOKEN y :id con valores reales
curl -X PUT http://localhost:8000/properties/17 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Tenant-Slug: demo" \
  -d '{
    "precio": 280000,
    "descripcion": "Precio actualizado!"
  }'
```

### 8. Eliminar una Propiedad

```bash
# Reemplaza YOUR_TOKEN y :id con valores reales
curl -X DELETE http://localhost:8000/properties/17 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Tenant-Slug: demo"
```

---

## 🔑 Puntos Clave

1. **Siempre incluye el header `X-Tenant-Slug: demo`** en todas las peticiones
2. **El token expira en 60 minutos** (configurable en `.env`)
3. **Solo puedes ver/modificar propiedades del tenant `demo`**
4. **El aislamiento funciona**: si cambias el header a otro tenant, verás datos diferentes

---

## 🧪 Script de Prueba Automatizado

Puedes usar el script `test_demo_tenant.sh` para probar todo automáticamente:

```bash
cd backend
chmod +x test_demo_tenant.sh
./test_demo_tenant.sh
```

---

## 🌐 Probar desde el Frontend

Si quieres probar desde el navegador, necesitarás:

1. Configurar el frontend para enviar el header `X-Tenant-Slug: demo`
2. Usar las credenciales: `admin@demo.com` / `admin123`
3. El frontend debería hacer login y luego usar el token en todas las peticiones

---

## ❓ Troubleshooting

### Error: "Tenant no especificado"
- Asegúrate de incluir el header `X-Tenant-Slug: demo`

### Error: "Token inválido o expirado"
- Haz login de nuevo para obtener un nuevo token

### Error: "Property not found"
- Verifica que el ID de la propiedad pertenezca al tenant `demo`
- Lista las propiedades primero para ver los IDs disponibles

### Error: "Se requiere rol de administrador"
- Asegúrate de usar las credenciales de `admin@demo.com`, no de otro usuario







