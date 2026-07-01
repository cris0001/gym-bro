import { z } from 'zod';

// --- Shared field helpers ---

// A weight or circumference measurement: numeric(5,2), non-negative, up to 999.99.
const measurementValue = z.number().min(0, 'Must be 0 or more').max(999.99, 'Too large');
// Body fat percentage: numeric(4,2), 0–100.
const bodyFatValue = z.number().min(0, 'Must be 0 or more').max(100, 'Must be 100 or less');

// The measurement fields, shared by the upsert shape. Each is nullable AND
// optional, which the merge upsert relies on to tell three cases apart:
//   - omitted (undefined) → leave that column untouched on an existing day
//   - null                → explicitly clear that column
//   - a number            → set it
// This is what makes the prominent quick-add weight form non-destructive: it
// sends only weightKg, so a same-day biceps/waist already logged is preserved.
const measurementFields = {
  weightKg: measurementValue.nullable().optional(),
  bodyFatPct: bodyFatValue.nullable().optional(),
  bicepsCm: measurementValue.nullable().optional(),
  chestCm: measurementValue.nullable().optional(),
  waistCm: measurementValue.nullable().optional(),
  hipCm: measurementValue.nullable().optional(),
  thighCm: measurementValue.nullable().optional(),
};

// Create / edit a day's entry — one shape, since one row per date is an upsert
// keyed on (user, measuredDate). On an existing day the service MERGES: only the
// fields present in the payload change (null clears, a number sets), omitted
// fields are left as they were. The user picks the date (the UI defaults to today
// but allows back-filling). At least one field must be present in the payload.
export const upsertBodyMeasurementSchema = z
  .object({
    measuredDate: z.iso.date(),
    ...measurementFields,
    // Free-text info / feedback. Nullable + optional like the measurements, so it
    // merges the same way (null clears, omitted leaves, a string sets). It does
    // NOT satisfy the "at least one measurement" rule below — a note only
    // accompanies measurements, it can't create an entry on its own.
    notes: z.string().max(500, 'Too long (max 500 characters)').nullable().optional(),
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
