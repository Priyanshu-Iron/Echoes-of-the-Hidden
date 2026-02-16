# ============================================
# Stage 1: Build the React frontend
# ============================================
FROM node:18-alpine AS build

WORKDIR /app

# Install frontend dependencies (leverages Docker layer caching)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# ============================================
# Stage 2: Production Node.js server
# ============================================
FROM node:18-alpine

WORKDIR /app

# Install dumb-init for proper signal handling (graceful shutdowns)
RUN apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Install server dependencies (leverages Docker layer caching)
COPY server/package.json server/package-lock.json ./server/
RUN cd server && npm ci --omit=dev

# Copy server source code
COPY server/ ./server/

# Copy built frontend from Stage 1
COPY --from=build /app/dist ./dist

# Set ownership to non-root user
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Environment
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/health || exit 1

# Use dumb-init to handle PID 1 and forward signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server/index.js"]
