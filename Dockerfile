# Stage 1: Build the React App
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci --production=false

COPY . .
RUN npm run build

# Stage 2: Production Node.js server
FROM node:18-alpine

WORKDIR /app

# Copy server files
COPY server/package*.json ./server/
RUN cd server && npm ci --production

# Copy server source and built frontend
COPY server/ ./server/
COPY --from=build /app/dist ./dist

# Copy env file if present (Cloud Run uses env vars instead)
COPY .env* ./

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# Start the Express server (serves API + static files)
CMD ["node", "server/index.js"]
