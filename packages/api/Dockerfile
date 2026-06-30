FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package.json files to their proper locations
COPY packages/database/package.json ./packages/database/
COPY packages/shared/package.json ./packages/shared/
COPY packages/api/package.json ./packages/api/

# Install dependencies in each package
RUN cd packages/database && npm install
RUN cd packages/shared && npm install
RUN cd packages/api && npm install

# Copy source
COPY packages/shared/src ./packages/shared/src
COPY packages/database/prisma ./packages/database/prisma
COPY packages/database/src ./packages/database/src
COPY packages/api/src ./packages/api/src
COPY packages/api/tsconfig.json ./packages/api/

# Generate Prisma client
RUN cd packages/database && ./node_modules/.bin/prisma generate

EXPOSE 3001
CMD ["npx", "tsx", "packages/api/src/index.ts"]
