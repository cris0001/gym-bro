import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

// Generates the PWA icon set from a single source (public/logo.svg) via
// `pnpm gen:pwa-assets`. The output PNGs/ICO are committed to public/ so the
// production build never needs sharp — vite-plugin-pwa only references them.
//
// The source logo is already a full white tile (blue biceps on #ffffff). The default
// maskable/apple padding left a transparent margin that the OS composites over its own
// colour, which showed as a ring around the glyph after masking. Fill that canvas with
// the tile colour (#ffffff) and trim the padding so the mask only ever reveals the tile.
export default defineConfig({
  preset: {
    ...minimal2023Preset,
    maskable: {
      sizes: [512],
      padding: 0.1,
      resizeOptions: { background: '#ffffff' },
    },
    apple: {
      sizes: [180],
      padding: 0.1,
      resizeOptions: { background: '#ffffff' },
    },
  },
  images: ['public/logo.svg'],
});
