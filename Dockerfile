# Stage 1: Build the React App
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port (Google Cloud Run typically expects 8080)
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
