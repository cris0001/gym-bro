import { fileURLToPath } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig, type PluginOption } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

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
    // Installable PWA. autoUpdate: a new deploy's service worker takes over on the
    // next load (no update prompt). The app shell is precached for offline launch;
    // API calls are never cached — navigateFallbackDenylist keeps "/api/*" on the
    // network so live data and the auth cookie always hit the server.
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png', 'logo.svg'],
      workbox: {
        navigateFallbackDenylist: [/^\/api/],
        // The SPA can grow past the default 2 MiB precache ceiling; lift it a bit.
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
      manifest: {
        name: 'Gym Bro',
        short_name: 'Gym Bro',
        description: 'Personal fitness tracker — training, nutrition, and body metrics.',
        theme_color: '#ea580c',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
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
