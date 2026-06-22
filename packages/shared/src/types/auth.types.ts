import type { z } from 'zod';

import type {
  loginSchema,
  onboardingSchema,
  registerSchema,
  updateProfileSchema,
} from '../schemas/auth.schema';

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;

export type Sex = NonNullable<UpdateProfileInput['sex']>;

// The user as it crosses the wire: password-stripped, with every date/timestamp
// serialized to an ISO string by JSON (birthdate is YYYY-MM-DD, the rest are
// full ISO-8601). The API's in-memory row type uses Date objects; this is the
// shape the client receives.
export interface PublicUser {
  id: string;
  email: string;
  birthdate: string | null;
  sex: Sex | null;
  // null until the user finishes or skips onboarding.
  onboardedAt: string | null;
  heightCm: number | null;
  createdAt: string;
  updatedAt: string;
}
