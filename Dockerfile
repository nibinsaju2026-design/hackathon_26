FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies for both apps
COPY package.json package-lock.json* ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/database/package.json ./packages/database/
COPY packages/database/prisma ./packages/database/prisma/

RUN npm install

# Build frontend and backend
COPY . .

# Generate Prisma client
RUN npm run db:generate

# Build Web (Frontend)
RUN cd apps/web && npm run build

# Build API (Backend)
RUN cd apps/api && npm run build

# Production image
FROM node:20-alpine
WORKDIR /app

RUN apk add --no-cache openssl

# Copy production dependencies
COPY --from=base /app/package.json ./
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/apps/api/package.json ./apps/api/
COPY --from=base /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=base /app/apps/api/dist ./apps/api/dist
COPY --from=base /app/apps/web/dist ./apps/web/dist
COPY --from=base /app/packages/database/package.json ./packages/database/
COPY --from=base /app/packages/database/prisma ./packages/database/prisma
COPY --from=base /app/packages/database/node_modules ./packages/database/node_modules

EXPOSE 8080
ENV PORT=8080
ENV NODE_ENV=production

# Run migrations and start server
CMD npm run db:deploy && node apps/api/dist/server.js
