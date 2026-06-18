import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Mirrors the tsconfig "@/*" -> "./src/*" path alias for the bundler.
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    // Matches the API's CORS_ORIGIN so the auth cookie flows in dev.
    port: 5173,
  },
});
