import { Hono, type Context } from 'hono';
import { z } from 'zod';
import { upsertBodyMeasurementSchema } from '@gym-bro/shared';

import { NotFoundError } from '../../lib/errors';
import { parseJson } from '../../lib/validate';
import { requireAuth, type AppEnv } from '../../middleware/auth';
import * as bodyService from './body.service';

// Thin handlers: authenticate, validate, delegate, format. requireAuth per route
// (same as the other feature modules). Every handler scopes to c.get('userId').
export const bodyRoutes = new Hono<AppEnv>();

// A non-uuid path param can't reference a real row — treat it as not found rather
// than letting Postgres raise an invalid-uuid error (500).
function parseUuidParam(c: Context<AppEnv>, name: string): string {
  const result = z.uuid().safeParse(c.req.param(name));
  if (!result.success) {
    throw new NotFoundError();
  }
  return result.data;
}

// History, newest first.
bodyRoutes.get('/body-measurements', requireAuth, async (c) => {
  const entries = await bodyService.listBodyMeasurements(c.get('userId'));
  return c.json({ data: entries });
});

// Upsert the entry for its date — a same-day re-save merges (PUT, since the date
// is the key, not a generated id).
bodyRoutes.put('/body-measurements', requireAuth, async (c) => {
  const input = await parseJson(c, upsertBodyMeasurementSchema);
  const entry = await bodyService.upsertBodyMeasurement(c.get('userId'), input);
  return c.json({ data: entry });
});

bodyRoutes.delete('/body-measurements/:id', requireAuth, async (c) => {
  const id = parseUuidParam(c, 'id');
  await bodyService.deleteBodyMeasurement(c.get('userId'), id);
  return c.json({ data: { success: true } });
});
