import { describe, expect, it } from 'vitest';

import { API_PACKAGE } from './index';

describe('api package', () => {
  it('exposes its package name placeholder', () => {
    expect(API_PACKAGE).toBe('@gym-bro/api');
  });
});
