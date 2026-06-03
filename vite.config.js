import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import path from 'path';

// Proxy is only for standalone `vite` (e.g. port 5173). `npm run dev` uses Express
// middleware mode and serves /api on the same port — no proxy needed.
const useDevProxy = process.env.VITE_STANDALONE === 'true';

export default defineConfig({
  logLevel: 'error',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
  server: useDevProxy
    ? {
        proxy: {
          '/api': { target: 'http://127.0.0.1:3000', changeOrigin: true },
          '/uploads': { target: 'http://127.0.0.1:3000', changeOrigin: true },
        },
      }
    : undefined,
});
