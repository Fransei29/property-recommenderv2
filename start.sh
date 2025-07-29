#!/bin/bash

echo "🚀 Iniciando Property Recommender..."

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor instala Docker primero."
    exit 1
fi

# Verificar si Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado. Por favor instala Docker Compose primero."
    exit 1
fi

# Crear archivos de entorno si no existen
if [ ! -f "backend/.env" ]; then
    echo "📝 Creando archivo .env para backend..."
    cp backend/env.example backend/.env
fi

if [ ! -f "frontend/.env.local" ]; then
    echo "📝 Creando archivo .env.local para frontend..."
    cp frontend/env.example frontend/.env.local
fi

# Construir y levantar los servicios
echo "🔨 Construyendo y levantando servicios..."
docker-compose up --build -d

# Esperar a que los servicios estén listos
echo "⏳ Esperando a que los servicios estén listos..."
sleep 10

# Verificar el estado de los servicios
echo "📊 Estado de los servicios:"
docker-compose ps

echo ""
echo "✅ ¡Servicios iniciados correctamente!"
echo ""
echo "🌐 Accede a las aplicaciones:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "📝 Comandos útiles:"
echo "   Ver logs: docker-compose logs -f"
echo "   Parar servicios: docker-compose down"
echo "   Reconstruir: docker-compose up --build" 