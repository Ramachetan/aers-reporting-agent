import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath, URL } from 'url';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    
    return {
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': fileURLToPath(new URL('.', import.meta.url)),
        }
      },
      server: {
        proxy: {
          '/api/meddra': {
            target: 'https://meddra-lite-1036646057438.europe-west1.run.app',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api\/meddra/, ''),
            secure: true
          }
        }
      }
    };
});