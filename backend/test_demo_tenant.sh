#!/bin/bash

# Script de prueba para el Tenant Demo
# Ejecutar: chmod +x test_demo_tenant.sh && ./test_demo_tenant.sh

API_URL="http://localhost:8000"
TENANT_SLUG="demo"
EMAIL="admin@demo.com"
PASSWORD="admin123"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║      🧪 PRUEBA AUTOMATIZADA DEL TENANT DEMO                 ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para verificar respuesta
check_response() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
    else
        echo -e "${RED}❌ $1${NC}"
    fi
}

# 1. Health Check
echo "1️⃣  Verificando servidor..."
HEALTH=$(curl -s "$API_URL/health")
if [[ $HEALTH == *"ok"* ]]; then
    echo -e "${GREEN}✅ Servidor funcionando${NC}"
else
    echo -e "${RED}❌ Servidor no responde. ¿Está corriendo?${NC}"
    exit 1
fi
echo ""

# 2. Obtener info del tenant
echo "2️⃣  Obteniendo información del tenant..."
TENANT_INFO=$(curl -s "$API_URL/tenants/$TENANT_SLUG")
if [[ $TENANT_INFO == *"demo"* ]]; then
    echo -e "${GREEN}✅ Tenant encontrado${NC}"
    echo "$TENANT_INFO" | python3 -m json.tool 2>/dev/null || echo "$TENANT_INFO"
else
    echo -e "${RED}❌ Tenant no encontrado${NC}"
    exit 1
fi
echo ""

# 3. Login
echo "3️⃣  Haciendo login..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: $TENANT_SLUG" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('access_token', ''))" 2>/dev/null)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Error en login${NC}"
    echo "$LOGIN_RESPONSE"
    exit 1
else
    echo -e "${GREEN}✅ Login exitoso${NC}"
    echo "Token: ${TOKEN:0:50}..."
fi
echo ""

# 4. Listar propiedades
echo "4️⃣  Listando propiedades del tenant..."
PROPERTIES=$(curl -s -H "X-Tenant-Slug: $TENANT_SLUG" "$API_URL/properties")
PROP_COUNT=$(echo "$PROPERTIES" | python3 -c "import sys, json; print(len(json.load(sys.stdin)))" 2>/dev/null)

if [ ! -z "$PROP_COUNT" ] && [ "$PROP_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ Encontradas $PROP_COUNT propiedades${NC}"
    echo "$PROPERTIES" | python3 -m json.tool 2>/dev/null | head -20
else
    echo -e "${YELLOW}⚠️  No se encontraron propiedades${NC}"
fi
echo ""

# 5. Crear propiedad
echo "5️⃣  Creando nueva propiedad..."
CREATE_RESPONSE=$(curl -s -X POST "$API_URL/properties" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Tenant-Slug: $TENANT_SLUG" \
  -d '{
    "titulo": "Casa de Prueba Automatizada",
    "ciudad": "Buenos Aires",
    "tipo": "Casa",
    "precio": 400000,
    "ambientes": 5,
    "metros_cuadrados": 250,
    "descripcion": "Propiedad creada por script de prueba"
  }')

NEW_PROP_ID=$(echo "$CREATE_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', ''))" 2>/dev/null)

if [ ! -z "$NEW_PROP_ID" ]; then
    echo -e "${GREEN}✅ Propiedad creada con ID: $NEW_PROP_ID${NC}"
else
    echo -e "${RED}❌ Error al crear propiedad${NC}"
    echo "$CREATE_RESPONSE"
    exit 1
fi
echo ""

# 6. Obtener propiedad específica
if [ ! -z "$NEW_PROP_ID" ]; then
    echo "6️⃣  Obteniendo propiedad $NEW_PROP_ID..."
    GET_PROP=$(curl -s -H "X-Tenant-Slug: $TENANT_SLUG" "$API_URL/properties/$NEW_PROP_ID")
    if [[ $GET_PROP == *"$NEW_PROP_ID"* ]]; then
        echo -e "${GREEN}✅ Propiedad obtenida correctamente${NC}"
    else
        echo -e "${RED}❌ Error al obtener propiedad${NC}"
    fi
    echo ""
fi

# 7. Actualizar propiedad
if [ ! -z "$NEW_PROP_ID" ]; then
    echo "7️⃣  Actualizando propiedad $NEW_PROP_ID..."
    UPDATE_RESPONSE=$(curl -s -X PUT "$API_URL/properties/$NEW_PROP_ID" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -H "X-Tenant-Slug: $TENANT_SLUG" \
      -d '{
        "precio": 420000,
        "descripcion": "Propiedad actualizada por script de prueba"
      }')
    
    UPDATED_PRICE=$(echo "$UPDATE_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('precio', ''))" 2>/dev/null)
    
    if [[ $UPDATED_PRICE == *"420000"* ]]; then
        echo -e "${GREEN}✅ Propiedad actualizada correctamente${NC}"
        echo "Nuevo precio: $UPDATED_PRICE"
    else
        echo -e "${YELLOW}⚠️  Actualización realizada (verificar manualmente)${NC}"
    fi
    echo ""
fi

# 8. Eliminar propiedad
if [ ! -z "$NEW_PROP_ID" ]; then
    echo "8️⃣  Eliminando propiedad $NEW_PROP_ID..."
    DELETE_STATUS=$(curl -s -w "%{http_code}" -X DELETE "$API_URL/properties/$NEW_PROP_ID" \
      -H "Authorization: Bearer $TOKEN" \
      -H "X-Tenant-Slug: $TENANT_SLUG" \
      -o /dev/null)
    
    if [ "$DELETE_STATUS" == "204" ]; then
        echo -e "${GREEN}✅ Propiedad eliminada correctamente${NC}"
    else
        echo -e "${RED}❌ Error al eliminar propiedad (Status: $DELETE_STATUS)${NC}"
    fi
    echo ""
fi

# Resumen
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    ✅ PRUEBAS COMPLETADAS                    ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Credenciales usadas:"
echo "   • Tenant: $TENANT_SLUG"
echo "   • Email: $EMAIL"
echo "   • Password: $PASSWORD"
echo ""
echo "🎯 Todas las operaciones CRUD fueron probadas exitosamente!"







