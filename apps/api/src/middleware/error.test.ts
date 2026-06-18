import { Hono } from 'hono';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { ConflictError, ValidationError } from '../lib/errors';
import { errorHandler } from './error';

interface ErrorResponse {
  error: { message: string; code: string; details?: Record<string, string[]> };
}

function makeApp() {
  const app = new Hono();
  app.onError(errorHandler);
  return app;
}

describe('errorHandler', () => {
  it('maps an AppError to its status and code', async () => {
    const app = makeApp();
    app.get('/boom', () => {
      throw new ConflictError('Email already in use');
    });

    const res = await app.request('/boom');

    expect(res.status).toBe(409);
    await expect(res.json()).resolves.toEqual({
      error: { message: 'Email already in use', code: 'CONFLICT' },
    });
  });

  it('includes field details for a ValidationError', async () => {
    const app = makeApp();
    app.get('/invalid', () => {
      throw new ValidationError('Validation failed', {
        email: ['Invalid email'],
      });
    });

    const res = await app.request('/invalid');
    const body = (await res.json()) as ErrorResponse;

    expect(res.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.details).toEqual({ email: ['Invalid email'] });
  });

  it('maps an uncaught ZodError to 400 with field details', async () => {
    const app = makeApp();
    app.get('/zod', (c) => {
      z.object({ email: z.email() }).parse({ email: 'nope' });
      return c.json({ data: null });
    });

    const res = await app.request('/zod');
    const body = (await res.json()) as ErrorResponse;

    expect(res.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(Object.keys(body.error.details ?? {})).toContain('email');
  });

  it('maps an unexpected error to a generic 500 without leaking internals', async () => {
    const app = makeApp();
    app.get('/unexpected', () => {
      throw new Error('secret internal details');
    });
    // Silence (and assert) the server-side log for the unexpected error.
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const res = await app.request('/unexpected');
    const body = (await res.json()) as ErrorResponse;

    expect(res.status).toBe(500);
    expect(body).toEqual({
      error: { message: 'Internal server error', code: 'INTERNAL' },
    });
    expect(JSON.stringify(body)).not.toContain('secret internal details');
    expect(errorSpy).toHaveBeenCalledOnce();

    errorSpy.mockRestore();
  });
});
