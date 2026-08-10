import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

// Generates the PWA icon set from a single source (public/logo.svg) via
// `pnpm gen:pwa-assets`. The output PNGs/ICO are committed to public/ so the
// production build never needs sharp — vite-plugin-pwa only references them.
//
// The source logo is already a full cream tile. The default maskable/apple padding left
// a transparent margin that the OS composites over WHITE, so the PWA splash showed a
// white ring around the glyph after masking. Fill that canvas with the brand cream
// (#faf5ee, same as manifest background_color) and trim the padding so the mask only
// ever reveals cream — no white edge.
export default defineConfig({
  preset: {
    ...minimal2023Preset,
    maskable: {
      sizes: [512],
      padding: 0.1,
      resizeOptions: { background: '#faf5ee' },
    },
    apple: {
      sizes: [180],
      padding: 0.1,
      resizeOptions: { background: '#faf5ee' },
    },
  },
  images: ['public/logo.svg'],
});
