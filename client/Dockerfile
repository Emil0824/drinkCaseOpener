# Build stage
FROM node:22-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

RUN apk add --no-cache python3 make g++

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Accept build arguments
ARG NODE_ENV=production
ARG VITE_API_URL=http://localhost:3000/api

# Set build-time environment variables from args
ENV NODE_ENV=$NODE_ENV
ENV VITE_API_URL=$VITE_API_URL

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 5050
EXPOSE 5050

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
