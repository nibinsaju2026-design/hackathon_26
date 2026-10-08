FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies for both apps
COPY package.json package-lock.json* ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY prisma ./prisma/

RUN npm install

# Build frontend and backend
COPY . .

# Generate Prisma client
RUN npx prisma generate

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
COPY --from=base /app/prisma ./prisma

EXPOSE 8080
ENV PORT=8080
ENV NODE_ENV=production

# Run migrations and start server
CMD node apps/api/dist/server.js
