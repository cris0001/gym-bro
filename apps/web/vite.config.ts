import { fileURLToPath } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig, type PluginOption } from 'vite';

// Set ANALYZE=true to emit a treemap of the bundle to dist/stats.html after a build
// (`ANALYZE=true pnpm build`). Off by default so normal builds are unaffected.
const analyze = process.env.ANALYZE === 'true';

export default defineConfig({
  // tanstackRouter must precede the React plugin. It generates
  // src/routeTree.gen.ts from the files in src/routes and enables per-route
  // code-splitting.
  plugins: [
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    ...(analyze
      ? [
          visualizer({
            filename: 'dist/stats.html',
            gzipSize: true,
            brotliSize: true,
          }) as PluginOption,
        ]
      : []),
  ],
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
