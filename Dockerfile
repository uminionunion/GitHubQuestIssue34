# syntax=docker/dockerfile:1

# ---- builder stage (with native toolchain) ----
FROM node:20-alpine AS builder

RUN apk add --no-cache python3 make g++ musl-dev linux-headers sqlite-dev

WORKDIR /app

COPY package*.json ./
COPY package-lock.json ./

RUN npm ci

COPY . .

# Clean TypeScript and build caches
RUN rm -rf node_modules/.vite node_modules/.tsc dist tsconfig.tsbuildinfo 2>/dev/null || true

ENV NODE_ENV=production
RUN npm run build

# ---- runtime stage (production) ----
FROM node:20-alpine AS runtime

WORKDIR /app

RUN apk add --no-cache sqlite

COPY package*.json ./
COPY package-lock.json ./

RUN npm ci --omit=dev

RUN mkdir -p /app/data

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/node_modules ./node_modules

ENV NODE_ENV=production
ENV PORT=4001
ENV DATA_DIRECTORY=/app/data

EXPOSE 4001

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4001', (r) => { if (r.statusCode !== 200) throw new Error(r.statusCode) })"

CMD ["node", "dist/server/index.js"]
