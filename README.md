# AgilMsg — WhatsApp Business Platform

Plataforma SaaS para gestionar cuentas de WhatsApp Business como Tech Provider de Meta.

## Features

- **Embedded Signup** — Onboard clientes via el flujo de Meta
- **Multi-cuenta** — Cada cliente puede tener multiples WABAs
- **Multi-numero** — Cada WABA puede tener multiples numeros de telefono
- **Mensajes** — Enviar y recibir mensajes de texto, templates, media
- **Templates** — Crear, enviar a revision, y gestionar plantillas
- **Webhooks** — Recepcion y routing de eventos de Meta por cliente
- **Billing** — Tracking de uso por categoria (marketing, utility, auth)
- **Dashboard** — Panel web con el mismo estilo que Familiarte

## Stack

- **Backend:** Fastify 5 + TypeScript
- **Database:** PostgreSQL 16 + Prisma 6
- **Queue:** BullMQ + Redis
- **Frontend:** HTML + CSS + JS vanilla (Work Sans, mismo design system que Familiarte)
- **Infra:** Docker Compose

## Quick Start

```bash
# 1. Copiar y editar variables de entorno
cp .env.example .env
nano .env

# 2. Ejecutar setup
./scripts/setup.sh

# 3. Iniciar servicios
docker compose up -d

# 4. Abrir
open http://localhost:3001
```

## Variables de Entorno

| Variable | Descripcion |
|---|---|
| `META_APP_ID` | ID de tu app de Meta |
| `META_APP_SECRET` | Secret de tu app de Meta |
| `META_VERIFY_TOKEN` | Token de verificacion de webhooks |
| `META_SYSTEM_USER_ID` | ID del system user |
| `META_SYSTEM_USER_TOKEN` | Token del system user |
| `EMBEDDED_SIGNUP_CONFIG_ID` | ID de configuracion de Embedded Signup |
| `JWT_SECRET` | Secreto para firmar JWTs |
| `DB_PASSWORD` | Password de PostgreSQL |

## Estructura

```
AgilMsg/
├── docker-compose.yml
├── .env.example
├── nginx/nginx.conf
├── packages/
│   ├── shared/          # Tipos y constantes compartidas
│   ├── database/        # Prisma schema + client
│   ├── api/             # Fastify API + Frontend HTML
│   │   ├── src/         # Backend TypeScript
│   │   └── public/      # Frontend HTML/CSS/JS
│   └── worker/          # BullMQ workers
└── scripts/setup.sh
```

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Registro |
| POST | `/api/auth/login` | No | Login |
| GET | `/api/auth/me` | Si | Usuario actual |
| POST | `/api/onboarding/exchange` | Si | Embedded Signup |
| GET | `/api/whatsapp/accounts` | Si | Listar WABAs |
| GET | `/api/whatsapp/accounts/:id` | Si | Detalle WABA |
| DELETE | `/api/whatsapp/accounts/:id` | Si | Desconectar WABA |
| POST | `/api/whatsapp/accounts/:id/refresh` | Si | Refrescar numeros |
| POST | `/api/whatsapp/send` | Si | Enviar mensaje |
| GET | `/api/whatsapp/messages` | Si | Historial |
| GET | `/api/whatsapp/templates` | Si | Listar templates |
| POST | `/api/whatsapp/templates` | Si | Crear template |
| POST | `/api/whatsapp/templates/sync` | Si | Sync desde Meta |
| GET | `/api/billing/usage` | Si | Uso del mes |
| GET | `/api/billing/history` | Si | Historial |
| GET/POST | `/webhook/whatsapp` | No | Callback de Meta |

## Meta Setup

1. Crear app en [Meta Developer Console](https://developers.facebook.com)
2. Activar caso de uso WhatsApp
3. Crear System User con token permanente
4. Crear Embedded Signup Configuration
5. Configurar webhook URL: `https://tu-dominio.com/webhook/whatsapp`
6. Obtener App Review para `whatsapp_business_messaging` y `whatsapp_business_management`
