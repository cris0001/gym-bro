import { describe, expect, it } from 'vitest';

import { SEX_OPTIONS, registerSchema } from './index';

describe('shared public interface', () => {
  it('exports the sex options constant', () => {
    expect(SEX_OPTIONS).toEqual(['male', 'female']);
  });

  it('accepts a valid registration', () => {
    const result = registerSchema.safeParse({ email: 'a@b.com', password: 'password1' });
    expect(result.success).toBe(true);
  });

  it('rejects a short password', () => {
    const result = registerSchema.safeParse({ email: 'a@b.com', password: 'short' });
    expect(result.success).toBe(false);
  });
});
