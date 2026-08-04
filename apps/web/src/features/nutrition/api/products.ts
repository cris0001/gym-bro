import { apiFetch } from '@/lib/api-client';

import type { EanLookupResult } from '@gym-bro/shared';

// Barcode lookup: our catalog first, then OpenFoodFacts, else "not found". The pantry
// copy is created via the normal createFood call (barcode-aware when `ean` is set).
export function lookupEan(ean: string): Promise<EanLookupResult> {
  return apiFetch<EanLookupResult>(`/api/products/by-ean/${encodeURIComponent(ean)}`);
}
