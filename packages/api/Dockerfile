FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY packages/database/package.json packages/shared/package.json packages/api/package.json ./
RUN npm install

# Copy source
COPY packages/shared/src ./packages/shared/src
COPY packages/database/prisma ./packages/database/prisma
COPY packages/database/src ./packages/database/src
COPY packages/api/src ./packages/api/src
COPY packages/api/tsconfig.json ./packages/api/

# Generate Prisma client (prisma binary is in root node_modules)
RUN npx prisma generate --schema=packages/database/prisma/schema.prisma

EXPOSE 3001
CMD ["npx", "tsx", "packages/api/src/index.ts"]
