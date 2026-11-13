import { z } from 'zod';

import { FOOD_NAME_LANGS, SEX_OPTIONS } from '@gym-bro/shared';

// The auth contracts (schemas, inferred inputs, the user shape) live in
// @gym-bro/shared so the web and API can't drift. Re-exported here under the
// feature's local type barrel — PublicUser is surfaced as User for the client.
export { loginSchema, registerSchema, SEX_OPTIONS, FOOD_NAME_LANGS } from '@gym-bro/shared';
export type {
  LoginInput,
  RegisterInput,
  UpdateProfileInput,
  Sex,
  FoodNameLang,
  PublicUser as User,
} from '@gym-bro/shared';

// UI-only: the profile form (onboarding + Settings) binds to string inputs where ''
// means "unset", so the segmented toggles can deselect and empty number/date fields
// stay valid. For foodNameLang, '' = follow the UI language. This never crosses the
// wire — the form's submit maps it to UpdateProfileInput.
export const onboardingFormSchema = z.object({
  birthdate: z.string(),
  sex: z.union([z.literal(''), z.enum(SEX_OPTIONS)]),
  foodNameLang: z.union([z.literal(''), z.enum(FOOD_NAME_LANGS)]),
  heightCm: z
    .string()
    .refine((v) => v === '' || (/^\d+$/.test(v) && Number(v) >= 50 && Number(v) <= 300), {
      message: 'Enter a height between 50 and 300 cm',
    }),
});

export type OnboardingFormValues = z.infer<typeof onboardingFormSchema>;
