import type { Context } from 'hono';
import { z, type ZodType } from 'zod';

import { ValidationError } from './errors';

// Parse and validate a JSON request body against a Zod schema. On failure it
// throws our ValidationError (with field-level details) so the global handler
// renders the standard envelope; on success it returns the typed, validated
// data. A missing/non-JSON body is treated as a validation failure, not a 500.
export async function parseJson<S extends ZodType>(c: Context, schema: S): Promise<z.infer<S>> {
  const body: unknown = await c.req.json().catch(() => undefined);
  const result = schema.safeParse(body);
  if (!result.success) {
    // Typed schemas give a partial map (string[] | undefined per known key);
    // undefined entries simply drop out when serialized to JSON.
    const { fieldErrors } = z.flattenError(result.error);
    throw new ValidationError('Validation failed', fieldErrors as Record<string, string[]>);
  }
  return result.data;
}
