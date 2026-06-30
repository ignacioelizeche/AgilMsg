FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY packages/database/package.json packages/shared/package.json packages/worker/package.json ./
RUN npm install

# Copy source
COPY packages/shared/src ./packages/shared/src
COPY packages/database/prisma ./packages/database/prisma
COPY packages/database/src ./packages/database/src
COPY packages/worker/src ./packages/worker/src

# Generate Prisma client
RUN cd packages/database && npx prisma generate

CMD ["npx", "tsx", "packages/worker/src/index.ts"]
