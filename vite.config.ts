import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { createApiConfiguration } from './src/api/config';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const api = createApiConfiguration(env);

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      proxy: api.useProxy ? {
        '/api': {
          target: api.baseUrl,
          changeOrigin: true,
        },
      } : undefined,
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
  };
});
