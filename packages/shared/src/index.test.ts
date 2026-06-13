import { describe, expect, it } from 'vitest';

import { SHARED_PACKAGE } from './index';

describe('shared package', () => {
  it('exposes its package name placeholder', () => {
    expect(SHARED_PACKAGE).toBe('@gym-bro/shared');
  });
});
