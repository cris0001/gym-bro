import { z } from 'zod';

// Request validation schemas for the auth endpoints. Stage 3 moves these to
// packages/shared so the frontend and backend share one source of truth.

export const registerSchema = z.object({
  email: z.email(),
  // Min 8 — usable baseline; not draconian for a personal app.
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1, 'Password is required'),
});

// Profile fields editable via PATCH /me. Each is optional (partial update) and
// nullable (null clears the value). birthdate is an ISO date (YYYY-MM-DD).
export const updateProfileSchema = z.object({
  birthdate: z.iso.date().nullable().optional(),
  sex: z.enum(['male', 'female']).nullable().optional(),
  heightCm: z.number().int().min(50).max(300).nullable().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
