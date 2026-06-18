import { describe, expect, it } from 'vitest';

import { hashPassword, verifyPassword } from './password';

describe('password', () => {
  it('hashes a password to a 60-char bcrypt string, not the plaintext', async () => {
    const hash = await hashPassword('correct-horse');

    expect(hash).not.toBe('correct-horse');
    expect(hash).toHaveLength(60);
  });

  it('verifies a correct password', async () => {
    const hash = await hashPassword('correct-horse');

    await expect(verifyPassword('correct-horse', hash)).resolves.toBe(true);
  });

  it('rejects an incorrect password', async () => {
    const hash = await hashPassword('correct-horse');

    await expect(verifyPassword('wrong', hash)).resolves.toBe(false);
  });

  it('produces a different hash each time (random salt)', async () => {
    const a = await hashPassword('same-input');
    const b = await hashPassword('same-input');

    expect(a).not.toBe(b);
  });
});
