import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

// Generates the PWA icon set from a single source (public/logo.svg) via
// `pnpm gen:pwa-assets`. The output PNGs/ICO are committed to public/ so the
// production build never needs sharp — vite-plugin-pwa only references them.
export default defineConfig({
  preset: minimal2023Preset,
  images: ['public/logo.svg'],
});
