import { z } from 'zod';

// --- Shared field helpers ---

// A weight or circumference measurement: numeric(5,2), non-negative, up to 999.99.
const measurementValue = z.number().min(0, 'Must be 0 or more').max(999.99, 'Too large');
// Body fat percentage: numeric(4,2), 0–100.
const bodyFatValue = z.number().min(0, 'Must be 0 or more').max(100, 'Must be 100 or less');

// The optional measurement fields, shared by the upsert shape. All optional —
// an entry just needs at least one value (enforced by the refine below).
const measurementFields = {
  weightKg: measurementValue.optional(),
  bodyFatPct: bodyFatValue.optional(),
  bicepsCm: measurementValue.optional(),
  chestCm: measurementValue.optional(),
  waistCm: measurementValue.optional(),
  hipCm: measurementValue.optional(),
  thighCm: measurementValue.optional(),
};

// Create / edit a day's entry — one shape, since one row per date is an upsert
// keyed on (user, measuredDate): re-saving the same date replaces it. The user
// picks the date (the UI defaults to today but allows back-filling). At least one
// measurement must be present so we never store an all-null row.
export const upsertBodyMeasurementSchema = z
  .object({
    measuredDate: z.iso.date(),
    ...measurementFields,
  })
  .refine(
    (v) =>
      v.weightKg !== undefined ||
      v.bodyFatPct !== undefined ||
      v.bicepsCm !== undefined ||
      v.chestCm !== undefined ||
      v.waistCm !== undefined ||
      v.hipCm !== undefined ||
      v.thighCm !== undefined,
    { message: 'Enter at least one measurement' },
  );
