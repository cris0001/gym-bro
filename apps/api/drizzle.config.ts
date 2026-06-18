import { defineConfig } from 'drizzle-kit';

// drizzle-kit doesn't load .env itself. Node 22's loadEnvFile reads
// apps/api/.env (the cwd when run via the package scripts). Wrapped so a
// missing file (e.g. CI, or commands that don't touch the DB) won't crash
// config parsing.
try {
  process.loadEnvFile();
} catch {
  // No .env present — fall back to the real process environment.
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is required for drizzle-kit (set it in apps/api/.env)');
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema',
  out: './src/db/migrations',
  dbCredentials: { url: databaseUrl },
  // Generate plain SQL migration files (the generate + migrate workflow),
  // never auto-push schema changes to the database.
  strict: true,
  verbose: true,
});
