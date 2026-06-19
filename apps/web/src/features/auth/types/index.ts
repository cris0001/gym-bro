import { z } from 'zod';

// Local auth types for Stage 2. The API (apps/api) is the source of truth for
// these shapes today; Stage 3 moves the Zod schemas into packages/shared and
// these get inferred from there instead of being hand-written.

export type Sex = 'male' | 'female';

// Public user as returned by the API (never includes passwordHash). Date/time
// columns arrive as ISO strings over JSON: birthdate is YYYY-MM-DD, the
// timestamps are full ISO-8601.
export interface User {
  id: string;
  email: string;
  birthdate: string | null;
  sex: Sex | null;
  heightCm: number | null;
  createdAt: string;
  updatedAt: string;
}

// Client-side form validation, mirroring the API's auth.schema.ts so the rules
// match on both sides. Input types are inferred — never hand-written.
export const loginSchema = z.object({
  email: z.email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: z.email('Enter a valid email'),
  // Min 8 mirrors the API — a usable baseline for a personal app.
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

// Partial profile update. Each field is optional (omit to leave unchanged) and
// nullable (null clears it), mirroring the API's PATCH /me contract.
export interface UpdateProfileInput {
  birthdate?: string | null;
  sex?: Sex | null;
  heightCm?: number | null;
}
