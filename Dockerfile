# Multi-stage build for React/Vite application
FROM node:20.0.0-bullseye AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies (including dev dependencies needed for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine AS production

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Install envsubst for environment variable substitution
RUN apk add --no-cache gettext

# Create env.js file that will be populated at runtime
RUN echo 'window.__ENV__ = {};' > /usr/share/nginx/html/env.js

# Copy entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expose port that will be set by PORT environment variable (default 80, Cloud Run uses 8080)
EXPOSE $PORT

# Use custom entrypoint
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
