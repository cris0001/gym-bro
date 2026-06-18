import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { z, ZodError } from 'zod';

import { AppError, ValidationError } from '../lib/errors';

// The single response shape for every error: { error: { message, code } }, with
// optional field-level `details` for validation failures.
interface ErrorBody {
  error: {
    message: string;
    code: string;
    details?: Record<string, string[]>;
  };
}

// Registered via app.onError — Hono routes every thrown/rejected error here.
export function errorHandler(err: Error, c: Context): Response {
  // Expected, handled errors carry their own status + code.
  if (err instanceof AppError) {
    const body: ErrorBody = { error: { message: err.message, code: err.code } };
    if (err instanceof ValidationError && err.details) {
      body.error.details = err.details;
    }
    return c.json(body, err.statusCode as ContentfulStatusCode);
  }

  // Safety net for validation errors thrown outside the route validators.
  if (err instanceof ZodError) {
    const { fieldErrors } = z.flattenError(err);
    return c.json(
      {
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: fieldErrors,
        },
      } satisfies ErrorBody,
      400,
    );
  }

  // Unexpected: log the real error server-side, return a generic 500 so we
  // never leak internals to the client.
  console.error('Unhandled error:', err);
  return c.json({ error: { message: 'Internal server error', code: 'INTERNAL' } }, 500);
}
