FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package.json files to their proper locations
COPY packages/database/package.json ./packages/database/
COPY packages/shared/package.json ./packages/shared/
COPY packages/worker/package.json ./packages/worker/

# Install dependencies in each package
RUN cd packages/database && npm install
RUN cd packages/shared && npm install
RUN cd packages/worker && npm install

# Copy source
COPY packages/shared/src ./packages/shared/src
COPY packages/database/prisma ./packages/database/prisma
COPY packages/database/src ./packages/database/src
COPY packages/worker/src ./packages/worker/src

# Generate Prisma client
RUN cd packages/database && ./node_modules/.bin/prisma generate

CMD ["npx", "tsx", "packages/worker/src/index.ts"]
