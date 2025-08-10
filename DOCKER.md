# Docker Setup for AERS Reporting Agent

This directory contains Docker configurations for the AERS Reporting Agent application.

## Files Overview

- `Dockerfile` - Multi-stage production build
- `Dockerfile.dev` - Development environment with hot reload
- `docker-compose.yml` - Orchestration for both production and development
- `nginx.conf` - Nginx configuration for production
- `docker-entrypoint.sh` - Runtime environment variable injection
- `.dockerignore` - Files to exclude from Docker build context

## Quick Start

### Production Build

```bash
# Build and run production container
docker-compose up --build

# Or build manually
docker build -t aers-reporting-agent .
docker run -p 3000:80 \
  -e VITE_SUPABASE_URL=your_supabase_url \
  -e VITE_SUPABASE_ANON_KEY=your_supabase_key \
  -e GEMINI_API_KEY=your_gemini_key \
  aers-reporting-agent
```

### Development Environment

```bash
# Run development server with hot reload
docker-compose --profile dev up aers-dev

# Or build manually
docker build -f Dockerfile.dev -t aers-reporting-agent-dev .
docker run -p 5173:5173 -v $(pwd):/app aers-reporting-agent-dev
```

## Environment Variables

The application supports the following environment variables:

- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `API_KEY` - General API key
- `GEMINI_API_KEY` - Google Gemini API key
- `PUBLIC_URL` - Public URL for the application (auto-detected in browser)

## Production Features

- **Multi-stage build** for optimized image size
- **Nginx** reverse proxy with compression and caching
- **Runtime environment injection** - Environment variables are injected at container startup
- **Health check endpoint** - Available at `/health`
- **API proxying** - MedDRA API requests are proxied through Nginx
- **Security headers** - Standard security headers included
- **Client-side routing support** - SPA routing handled by Nginx

## Build Arguments

The Dockerfile uses Node.js 18 Alpine for smaller image size. If you need a different Node version:

```bash
# Build with different Node version
docker build --build-arg NODE_VERSION=20 -t aers-reporting-agent .
```

## Health Check

The application includes a health check endpoint:

```bash
curl http://localhost:3000/health
```

## Troubleshooting

1. **Build fails**: Ensure you have Docker and sufficient disk space
2. **Environment variables not working**: Check that variables are set in your shell or .env file
3. **Port conflicts**: Change the port mapping in docker-compose.yml if port 3000 is in use
4. **API proxy issues**: Verify the MedDRA service URL in nginx.conf

## Security Notes

- Environment variables are injected at runtime, not build time
- Nginx is configured with standard security headers
- No sensitive data is baked into the image
