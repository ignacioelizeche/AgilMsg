#!/bin/bash
set -e

echo "🚀 AgilMsg — Setup inicial"
echo ""

# Check .env
if [ ! -f .env ]; then
    echo "📝 Creando .env desde .env.example..."
    cp .env.example .env
    echo "⚠️  Edita .env con tus datos de Meta antes de continuar"
    echo ""
fi

# Start Docker services (DB + Redis)
echo "🐳 Iniciando PostgreSQL y Redis..."
docker compose up -d postgres redis

echo "⏳ Esperando a que PostgreSQL este listo..."
for i in $(seq 1 30); do
    if docker compose exec -T postgres pg_isready -U postgres -q 2>/dev/null; then
        echo "   PostgreSQL listo"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "   Error: PostgreSQL no responde"
        exit 1
    fi
    sleep 1
done

echo "⏳ Esperando a que Redis este listo..."
for i in $(seq 1 15); do
    if docker compose exec -T redis redis-cli ping 2>/dev/null | grep -q PONG; then
        echo "   Redis listo"
        break
    fi
    if [ $i -eq 15 ]; then
        echo "   Error: Redis no responde"
        exit 1
    fi
    sleep 1
done

# Install dependencies in database package
echo "📦 Instalando dependencias de Prisma..."
docker compose run --rm -w /app/packages/database api sh -c "npm install --silent 2>/dev/null; ./node_modules/.bin/prisma generate"

# Run Prisma migrations
echo "🗄️  Ejecutando migraciones de Prisma..."
docker compose run --rm -w /app/packages/database api sh -c "./node_modules/.bin/prisma migrate dev --name init"

echo ""
echo "✅ Base de datos creada y migrada!"
echo ""
echo "Para iniciar todos los servicios:"
echo "  docker compose up -d"
echo ""
echo "Para ver los logs:"
echo "  docker compose logs -f api"
