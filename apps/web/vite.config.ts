import { fileURLToPath } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  // tanstackRouter must precede the React plugin. It generates
  // src/routeTree.gen.ts from the files in src/routes and enables per-route
  // code-splitting.
  plugins: [tanstackRouter({ target: 'react', autoCodeSplitting: true }), react(), tailwindcss()],
  resolve: {
    // Mirrors the tsconfig "@/*" -> "./src/*" path alias for the bundler.
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    // Proxy API calls to the local backend so the browser uses same-origin,
    // relative "/api/..." URLs in dev — mirroring production on Netlify, where
    // the same paths hit the Netlify Function. Keeps the auth cookie same-origin.
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
