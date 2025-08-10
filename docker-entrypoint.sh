#!/bin/sh

# Set default port if not provided
export PORT=${PORT:-80}

# Replace PORT placeholder in nginx config
envsubst '${PORT}' < /etc/nginx/nginx.conf > /tmp/nginx.conf && mv /tmp/nginx.conf /etc/nginx/nginx.conf

# Generate env.js at runtime with environment variables
cat > /usr/share/nginx/html/env.js << EOF
window.__ENV__ = {
  VITE_SUPABASE_URL: '${VITE_SUPABASE_URL:-}',
  VITE_SUPABASE_ANON_KEY: '${VITE_SUPABASE_ANON_KEY:-}',
  API_KEY: '${API_KEY:-}',
  GEMINI_API_KEY: '${GEMINI_API_KEY:-}',
  PUBLIC_URL: '${PUBLIC_URL:-}'
};
EOF

# Execute the CMD
exec "$@"
