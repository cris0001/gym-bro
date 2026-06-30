import type { UpsertBodyMeasurementInput } from '@gym-bro/shared';

import { NotFoundError } from '../../lib/errors';
import * as bodyRepository from './body.repository';

// Business logic for the body-measurements domain — ownership checks, scoping to
// the user. No macro math here (measurements are stored as entered); the merge
// upsert itself lives in the repository. No Drizzle here.

export async function listBodyMeasurements(userId: string) {
  return bodyRepository.listBodyMeasurements(userId);
}

// Upsert the entry for its date. The input is already validated (at least one
// field present); the repository merges it into any existing same-day row. There's
// no unique-name conflict to map — the only uniqueness is (user, date), which the
// upsert handles by merging rather than erroring.
export async function upsertBodyMeasurement(userId: string, input: UpsertBodyMeasurementInput) {
  return bodyRepository.upsertBodyMeasurement({ userId, ...input });
}

export async function deleteBodyMeasurement(userId: string, id: string) {
  const entry = await bodyRepository.deleteBodyMeasurement(userId, id);
  if (!entry) {
    throw new NotFoundError('Measurement not found');
  }
  return entry;
}
