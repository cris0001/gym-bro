import bcrypt from 'bcrypt';

// Work factor for bcrypt. 12 is the common 2026 baseline: meaningfully harder
// to brute-force than the default 10, with login latency that is irrelevant for
// a single-user app.
const BCRYPT_COST = 12;

// Hash a plaintext password for storage. bcrypt embeds the salt and cost in the
// returned 60-char string, so no separate salt column is needed.
export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_COST);
}

// Verify a plaintext password against a stored hash.
export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
