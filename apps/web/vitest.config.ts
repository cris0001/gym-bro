import { defineConfig } from 'vitest/config';

// Stage 2 switches the environment to jsdom and wires Testing Library + MSW
// once the React app is scaffolded.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
