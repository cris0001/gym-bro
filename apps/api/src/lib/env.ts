import { z } from 'zod';

// Parsed once at import time so the process refuses to boot with a bad
// configuration instead of failing later at runtime. The rest of the app
// imports `env` from here and never touches `process.env` directly.
//
// Loading the .env file is the runner's job (node/tsx `--env-file`), not this
// module's — keeping this file pure validation. In production the platform
// injects real env vars, so no file is needed there.
const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    // Coerce because every env var arrives as a string; default for local dev.
    PORT: z.coerce.number().int().positive().default(3001),
    DATABASE_URL: z.url(),
    // jose HS256 signing needs sufficient entropy; 32 chars is a sane floor.
    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    CORS_ORIGIN: z.url().default('http://localhost:5173'),
    // When set (in the Fly container), the server also serves the built SPA from
    // this directory with an index.html fallback, so one app serves API + web on the
    // same origin. Unset in local dev, where Vite serves the SPA instead. Relative to
    // the process CWD (the container sets it to the copied apps/web/dist).
    STATIC_DIR: z.string().optional(),
    // Strava integration (optional — the app boots fine without it; the Strava
    // routes fail with a clear error if they're hit while unconfigured). Set all
    // three together (guarded below) once the Strava API app is registered.
    STRAVA_CLIENT_ID: z.string().optional(),
    STRAVA_CLIENT_SECRET: z.string().optional(),
    STRAVA_REDIRECT_URI: z.url().optional(),
  })
  // All-or-none: a half-configured Strava (e.g. id but no secret) is a silent
  // footgun, so fail fast at boot instead of at the first OAuth call.
  .refine(
    (e) => {
      const set = [e.STRAVA_CLIENT_ID, e.STRAVA_CLIENT_SECRET, e.STRAVA_REDIRECT_URI].filter(
        Boolean,
      ).length;
      return set === 0 || set === 3;
    },
    {
      message:
        'STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET and STRAVA_REDIRECT_URI must be set together (all or none)',
    },
  );

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // prettifyError renders a readable, multi-line summary of exactly which
  // variables are missing or invalid before we abort startup.
  throw new Error(`Invalid environment configuration:\n${z.prettifyError(parsed.error)}`);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;
