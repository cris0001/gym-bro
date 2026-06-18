import { z } from 'zod';

// Parsed once at import time so the process refuses to boot with a bad
// configuration instead of failing later at runtime. The rest of the app
// imports `env` from here and never touches `process.env` directly.
//
// Loading the .env file is the runner's job (node/tsx `--env-file`), not this
// module's — keeping this file pure validation. In production the platform
// injects real env vars, so no file is needed there.
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  // Coerce because every env var arrives as a string; default for local dev.
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.url(),
  // jose HS256 signing needs sufficient entropy; 32 chars is a sane floor.
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  CORS_ORIGIN: z.url().default('http://localhost:5173'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // prettifyError renders a readable, multi-line summary of exactly which
  // variables are missing or invalid before we abort startup.
  throw new Error(`Invalid environment configuration:\n${z.prettifyError(parsed.error)}`);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;
