# Use Node.js 20 LTS as base image
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage with nginx
FROM nginx:alpine AS production

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Create a non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership of nginx files
RUN chown -R nextjs:nodejs /usr/share/nginx/html
RUN chown -R nextjs:nodejs /var/cache/nginx
RUN chown -R nextjs:nodejs /var/log/nginx
RUN chown -R nextjs:nodejs /etc/nginx/conf.d

# Create nginx pid directory and set permissions
RUN mkdir -p /var/run && chown -R nextjs:nodejs /var/run

# Switch to non-root user
USER nextjs

# Expose port 8080 (Cloud Run default)
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
