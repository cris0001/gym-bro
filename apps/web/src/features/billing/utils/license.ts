import type { PublicUser } from '@gym-bro/shared';

// A licence is expired only when it has an explicit end date in the past. null =
// perpetual/unlimited (the default for everyone today), so it never locks.
export function isLicenseExpired(user: Pick<PublicUser, 'licenseExpiresAt'>): boolean {
  return user.licenseExpiresAt !== null && new Date(user.licenseExpiresAt).getTime() <= Date.now();
}
