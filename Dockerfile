# Multi-stage build for Vite React app -> static files served by Nginx

# -------- Builder --------
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Copy the rest of the source
COPY . .

# Build-time secrets (WARNING: embedding API keys into a static SPA exposes them publicly)
ARG GEMINI_API_KEY
ARG API_KEY
ENV GEMINI_API_KEY=${GEMINI_API_KEY}
ENV API_KEY=${API_KEY}

# Build the app (Vite outputs to dist/ by default)
RUN npm run build

# -------- Runner --------
FROM nginx:1.27-alpine AS runner

# Install envsubst to template PORT into nginx config
RUN apk add --no-cache gettext

# Prepare templated nginx config that honors $PORT
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Copy built static assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Default port (Cloud Run sets $PORT). We default to 8080 for local runs
ENV PORT=8080
EXPOSE 8080

# Render nginx config with $PORT and start nginx
CMD ["/bin/sh", "-c", "envsubst '$PORT' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;' "]
