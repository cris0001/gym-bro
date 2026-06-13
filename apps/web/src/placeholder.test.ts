import { describe, expect, it } from 'vitest';

import { WEB_PACKAGE } from './placeholder';

describe('web package', () => {
  it('exposes its package name placeholder', () => {
    expect(WEB_PACKAGE).toBe('@gym-bro/web');
  });
});
