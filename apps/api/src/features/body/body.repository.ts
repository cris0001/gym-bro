import { and, desc, eq } from 'drizzle-orm';

import type { UpsertBodyMeasurementInput } from '@gym-bro/shared';

import { db } from '../../db/client';
import { bodyMeasurements } from '../../db/schema/body-measurements';

// Drizzle queries for the body-measurements domain — plain rows, no business
// logic. The numeric columns come back as strings (or null when not recorded) and
// are coerced to number | null at this boundary. Every query is scoped by userId.

// The seven measurement columns, by their JS property name. Used to build a
// merge-friendly partial set object from a (possibly partial) input.
const MEASUREMENT_KEYS = [
  'weightKg',
  'bodyFatPct',
  'bicepsCm',
  'chestCm',
  'waistCm',
  'hipCm',
  'thighCm',
] as const;

type MeasurementKey = (typeof MEASUREMENT_KEYS)[number];

// A numeric column comes back as a string, or null when not recorded that day.
function num(value: string | null): number | null {
  return value === null ? null : Number(value);
}

// Coerce each numeric column to number | null, preserving null (= not recorded);
// timestamps stay Date (Hono serializes them to ISO strings).
function mapRow(row: typeof bodyMeasurements.$inferSelect) {
  return {
    ...row,
    weightKg: num(row.weightKg),
    bodyFatPct: num(row.bodyFatPct),
    bicepsCm: num(row.bicepsCm),
    chestCm: num(row.chestCm),
    waistCm: num(row.waistCm),
    hipCm: num(row.hipCm),
    thighCm: num(row.thighCm),
  };
}

export type BodyMeasurementRow = ReturnType<typeof mapRow>;

// Caller passes the already-validated entry plus the owner. A measurement field
// that is:
//   - absent (undefined) → not touched on an existing day (merge)
//   - null               → explicitly cleared
//   - a number           → set
export interface BodyMeasurementUpsert extends UpsertBodyMeasurementInput {
  userId: string;
}

// Translate the present measurement fields to their numeric-column form (number →
// string for the driver, null stays null). Omitted fields are skipped, so they
// neither insert a value nor appear in the conflict-update set — that's the merge.
function toColumnValues(
  data: BodyMeasurementUpsert,
): Partial<Record<MeasurementKey, string | null>> {
  const values: Partial<Record<MeasurementKey, string | null>> = {};
  for (const key of MEASUREMENT_KEYS) {
    const value = data[key];
    if (value !== undefined) {
      values[key] = value === null ? null : value.toString();
    }
  }
  return values;
}

// History for the table + charts, newest first. (Chart consumers that need
// chronological order reverse client-side — the dataset is one row per day.)
export async function listBodyMeasurements(userId: string): Promise<BodyMeasurementRow[]> {
  const rows = await db
    .select()
    .from(bodyMeasurements)
    .where(eq(bodyMeasurements.userId, userId))
    .orderBy(desc(bodyMeasurements.measuredDate));
  return rows.map(mapRow);
}

export async function findBodyMeasurementById(
  userId: string,
  id: string,
): Promise<BodyMeasurementRow | undefined> {
  const [row] = await db
    .select()
    .from(bodyMeasurements)
    .where(and(eq(bodyMeasurements.id, id), eq(bodyMeasurements.userId, userId)))
    .limit(1);
  return row ? mapRow(row) : undefined;
}

// Upsert the entry for (user, measuredDate). A same-day re-save MERGES via the
// unique index: only the columns present in `data` are updated (null clears, a
// number sets), omitted columns keep their existing value — prior days stay as
// history.
export async function upsertBodyMeasurement(
  data: BodyMeasurementUpsert,
): Promise<BodyMeasurementRow> {
  const values = toColumnValues(data);
  const [row] = await db
    .insert(bodyMeasurements)
    .values({ userId: data.userId, measuredDate: data.measuredDate, ...values })
    .onConflictDoUpdate({
      target: [bodyMeasurements.userId, bodyMeasurements.measuredDate],
      set: { ...values, updatedAt: new Date() },
    })
    .returning();
  if (!row) {
    throw new Error('Body measurement upsert returned no row');
  }
  return mapRow(row);
}

// Hard delete — a measurement entry is leaf data, fully self-contained.
export async function deleteBodyMeasurement(
  userId: string,
  id: string,
): Promise<BodyMeasurementRow | undefined> {
  const [row] = await db
    .delete(bodyMeasurements)
    .where(and(eq(bodyMeasurements.id, id), eq(bodyMeasurements.userId, userId)))
    .returning();
  return row ? mapRow(row) : undefined;
}
