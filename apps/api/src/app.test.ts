import { describe, expect, it } from 'vitest';

import { app } from './app';

describe('app', () => {
  it('GET /health returns ok in the success envelope', async () => {
    const res = await app.request('/health');

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ data: { status: 'ok' } });
  });
});
