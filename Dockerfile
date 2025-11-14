# MainUhubFeatureV001 - Multi-stage Docker Build
# Production-ready Dockerfile with optimized image size

FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Build the application (frontend + backend)
RUN npm run build

# Production stage - minimal runtime image
FROM node:22-alpine

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Create data directory for SQLite database
RUN mkdir -p /app/data && chmod 755 /app/data

# Expose application port (4000 for production)
EXPOSE 4000

# Health check configuration
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:4000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

# Set environment variables
ENV NODE_ENV=production
ENV PORT=4000
ENV DATA_DIRECTORY=/app/data

# Volume for persisting SQLite database
VOLUME ["/app/data"]

# Run the production server
CMD ["node", "dist/server/index.js"]
