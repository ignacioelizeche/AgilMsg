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
COPY packages/api/public ./packages/api/public
COPY packages/api/tsconfig.json ./packages/api/

# Generate Prisma client
RUN cd packages/database && npx prisma generate

EXPOSE 3001
CMD ["npx", "tsx", "packages/api/src/index.ts"]
