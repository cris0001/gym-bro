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

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
}

// Partial profile update. Each field is optional (omit to leave unchanged) and
// nullable (null clears it), mirroring the API's PATCH /me contract.
export interface UpdateProfileInput {
  birthdate?: string | null;
  sex?: Sex | null;
  heightCm?: number | null;
}
