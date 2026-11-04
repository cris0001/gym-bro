import { afterEach, describe, expect, it, vi } from 'vitest';

import { ApiError, apiFetch } from './api-client';

function respond(status: number, body: unknown, headers: Record<string, string> = {}) {
  return vi.fn().mockResolvedValue(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'content-type': 'application/json', ...headers },
    }),
  );
}

async function failure(promise: Promise<unknown>): Promise<ApiError> {
  try {
    await promise;
  } catch (error) {
    if (error instanceof ApiError) return error;
    throw error;
  }
  throw new Error('expected the request to fail');
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('apiFetch', () => {
  it('unwraps the data envelope on success', async () => {
    vi.stubGlobal('fetch', respond(200, { data: { id: 'x' } }));
    await expect(apiFetch('/api/thing')).resolves.toEqual({ id: 'x' });
  });

  it('marks a dropped connection on a GET as a retryable NETWORK_ERROR', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    const error = await failure(apiFetch('/api/thing'));
    expect(error).toMatchObject({ status: 0, code: 'NETWORK_ERROR', retryable: true });
  });

  it('never marks a plain POST retryable — it could double-write', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    const error = await failure(apiFetch('/api/thing', { method: 'POST' }));
    expect(error).toMatchObject({ code: 'NETWORK_ERROR', retryable: false });
  });

  it('marks a POST retryable when the caller made it idempotent', async () => {
    vi.stubGlobal('fetch', respond(503, { error: { message: 'down', code: 'X' } }));
    const error = await failure(apiFetch('/api/thing', { method: 'POST', idempotent: true }));
    expect(error).toMatchObject({ status: 503, retryable: true });
  });

  it('treats a 5xx on a GET as retryable and a 4xx as final', async () => {
    vi.stubGlobal('fetch', respond(500, { error: { message: 'boom', code: 'INTERNAL' } }));
    expect(await failure(apiFetch('/api/thing'))).toMatchObject({ retryable: true });

    vi.stubGlobal('fetch', respond(404, { error: { message: 'nope', code: 'NOT_FOUND' } }));
    expect(await failure(apiFetch('/api/thing'))).toMatchObject({
      status: 404,
      code: 'NOT_FOUND',
      message: 'nope',
      retryable: false,
    });
  });

  it('reads Retry-After from a 429', async () => {
    vi.stubGlobal(
      'fetch',
      respond(
        429,
        { error: { message: 'slow down', code: 'RATE_LIMITED' } },
        { 'retry-after': '7' },
      ),
    );
    expect(await failure(apiFetch('/api/thing'))).toMatchObject({
      retryable: true,
      retryAfterSeconds: 7,
    });
  });

  it('turns a request that outlives the timeout into a TIMEOUT', async () => {
    // Stand in for the 15s timer: a signal the test fires itself.
    const timer = new AbortController();
    vi.spyOn(AbortSignal, 'timeout').mockReturnValue(timer.signal);
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url: string, init: RequestInit) =>
          new Promise((_resolve, reject) => {
            init.signal?.addEventListener('abort', () =>
              reject(new DOMException('aborted', 'TimeoutError')),
            );
          }),
      ),
    );
    const pending = failure(apiFetch('/api/thing'));
    timer.abort();
    expect(await pending).toMatchObject({ status: 0, code: 'TIMEOUT', retryable: true });
    vi.restoreAllMocks();
  });
});
