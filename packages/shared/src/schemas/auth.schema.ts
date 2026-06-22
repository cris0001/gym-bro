import { z } from 'zod';

import { SEX_OPTIONS } from '../constants/auth.constants';

// Single source of truth for auth contracts. The API validates request bodies
// with these; the web infers form types from them so rules can't drift apart.

export const registerSchema = z.object({
  email: z.email('Enter a valid email'),
  // Min 8 — a usable baseline for a personal app, not draconian.
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  email: z.email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

// Profile fields editable via PATCH /me. Each is optional (partial update) and
// nullable (null clears the value). birthdate is an ISO date (YYYY-MM-DD).
export const updateProfileSchema = z.object({
  birthdate: z.iso.date().nullable().optional(),
  sex: z.enum(SEX_OPTIONS).nullable().optional(),
  heightCm: z.number().int().min(50).max(300).nullable().optional(),
});

// Onboarding takes the same optional profile fields; the route additionally
// stamps onboardedAt to mark the one-time flow done.
export const onboardingSchema = updateProfileSchema;
