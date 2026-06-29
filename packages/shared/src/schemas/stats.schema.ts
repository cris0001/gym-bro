import { z } from 'zod';

// --- Training stats query ---

// Optional inclusive date window shared by the progress and rating-trend stat
// endpoints. Both omitted = all history. Query params arrive as strings, but
// z.iso.date() already expects 'YYYY-MM-DD' strings, so no coercion is needed.
// When both are present the window must be ordered; the service relies on this.
export const statsRangeQuerySchema = z
  .object({
    from: z.iso.date().optional(),
    to: z.iso.date().optional(),
  })
  .refine((v) => v.from === undefined || v.to === undefined || v.from <= v.to, {
    message: 'from must be on or before to',
  });
