import { z } from 'zod';

import { env } from '../../lib/env';

const OFF_BASE_URL = 'https://world.openfoodfacts.org/api/v2/product';

// The subset we read from an OpenFoodFacts product. Macros per 100g; anything OFF
// didn't provide comes back null. `raw` is the whole product payload, stored on the
// global for later backfill.
export interface OffProductData {
  ean: string;
  name: string;
  brand: string | null;
  kcal: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  servingGrams: number | null;
  imageUrl: string | null;
  raw: unknown;
}

// OFF values arrive as numbers or numeric strings; coerce, and drop anything that
// isn't a finite non-negative number. `.catch` keeps a weird value from throwing.
const offNumber = z.coerce.number().finite().nonnegative().nullish().catch(null);

// Lenient shape — OFF products are sparse and inconsistent, so every field is optional
// and unknown keys pass through.
const offResponseSchema = z.object({
  status: z.number().optional(),
  product: z
    .object({
      product_name: z.string().optional(),
      brands: z.string().optional(),
      serving_quantity: offNumber,
      image_front_small_url: z.string().optional(),
      image_small_url: z.string().optional(),
      nutriments: z
        .object({
          'energy-kcal_100g': offNumber,
          proteins_100g: offNumber,
          carbohydrates_100g: offNumber,
          fat_100g: offNumber,
        })
        .partial()
        .passthrough()
        .optional(),
    })
    .passthrough()
    .optional(),
});

function firstBrand(brands: string | undefined): string | null {
  const first = brands?.split(',')[0]?.trim();
  return first && first.length > 0 ? first : null;
}

// Fetch a product from OpenFoodFacts by barcode. Returns null when the request fails,
// the product doesn't exist (status !== 1), or the payload can't be parsed — callers
// treat all of those as "not found on OFF".
export async function fetchOffProduct(ean: string): Promise<OffProductData | null> {
  let res: Response;
  try {
    res = await fetch(`${OFF_BASE_URL}/${ean}.json`, {
      headers: { 'User-Agent': env.OFF_USER_AGENT },
    });
  } catch {
    return null;
  }
  if (!res.ok) return null;

  const parsed = offResponseSchema.safeParse(await res.json().catch(() => null));
  if (!parsed.success || parsed.data.status !== 1 || !parsed.data.product) return null;

  const p = parsed.data.product;
  const n = p.nutriments ?? {};
  const name = p.product_name?.trim();
  return {
    ean,
    // Fall back to the barcode when OFF has no (or a blank) product name.
    name: name && name.length > 0 ? name : ean,
    brand: firstBrand(p.brands),
    kcal: n['energy-kcal_100g'] ?? null,
    proteinG: n.proteins_100g ?? null,
    carbsG: n.carbohydrates_100g ?? null,
    fatG: n.fat_100g ?? null,
    servingGrams: p.serving_quantity ?? null,
    imageUrl: p.image_front_small_url ?? p.image_small_url ?? null,
    raw: p,
  };
}
