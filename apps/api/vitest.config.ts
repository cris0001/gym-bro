import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // env.ts validates these at import time. Provide safe dummy values so unit
    // tests need neither a real .env nor a live database.
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: 'postgres://test:test@localhost:5432/test',
      JWT_SECRET: 'test-secret-at-least-32-characters-long-000000',
      CORS_ORIGIN: 'http://localhost:5173',
    },
  },
});
