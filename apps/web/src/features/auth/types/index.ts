import { z } from 'zod';

import { SEX_OPTIONS } from '@gym-bro/shared';

// The auth contracts (schemas, inferred inputs, the user shape) live in
// @gym-bro/shared so the web and API can't drift. Re-exported here under the
// feature's local type barrel — PublicUser is surfaced as User for the client.
export { loginSchema, registerSchema, SEX_OPTIONS } from '@gym-bro/shared';
export type {
  LoginInput,
  RegisterInput,
  UpdateProfileInput,
  Sex,
  PublicUser as User,
} from '@gym-bro/shared';

// UI-only: the onboarding form binds to string inputs where '' means "unset",
// so the segmented sex toggle can deselect and empty number/date fields stay
// valid. This never crosses the wire — onSave maps it to UpdateProfileInput.
export const onboardingFormSchema = z.object({
  birthdate: z.string(),
  sex: z.union([z.literal(''), z.enum(SEX_OPTIONS)]),
  heightCm: z
    .string()
    .refine((v) => v === '' || (/^\d+$/.test(v) && Number(v) >= 50 && Number(v) <= 300), {
      message: 'Enter a height between 50 and 300 cm',
    }),
});

export type OnboardingFormValues = z.infer<typeof onboardingFormSchema>;
