#!/bin/sh

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
