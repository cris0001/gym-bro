import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

// Stage 2 switches the environment to jsdom and wires Testing Library + MSW
// once the React app is scaffolded. The "@/*" alias mirrors tsconfig / vite.config
// so units that import app modules (e.g. lib/api-client) resolve in tests too.
export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
