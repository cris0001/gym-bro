import type { z } from 'zod';

import type { upsertBodyMeasurementSchema } from '../schemas/body.schema';

// --- Inferred request inputs ---

export type UpsertBodyMeasurementInput = z.infer<typeof upsertBodyMeasurementSchema>;

// --- Wire entity shape (numeric columns coerced to numbers by the service;
// measuredDate is a 'YYYY-MM-DD' string; timestamps are ISO strings) ---

// A day's body-measurement entry. Every measurement is optional, so each maps to
// `number | null` on read (null = not recorded that day). Weight + body fat are the
// primary metrics; the cm fields are the advanced ones (behind "show more" in UI).
export interface BodyMeasurement {
  id: string;
  userId: string;
  measuredDate: string;
  weightKg: number | null;
  bodyFatPct: number | null;
  bicepsCm: number | null;
  chestCm: number | null;
  waistCm: number | null;
  hipCm: number | null;
  thighCm: number | null;
  createdAt: string;
  updatedAt: string;
}
