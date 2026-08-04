import { apiFetch } from '@/lib/api-client';

import type { EanLookupResult, GlobalProduct } from '@gym-bro/shared';

// Barcode lookup: our catalog first, then OpenFoodFacts, else "not found". The pantry
// copy is created via the normal createFood call (barcode-aware when `ean` is set).
export function lookupEan(ean: string): Promise<EanLookupResult> {
  return apiFetch<EanLookupResult>(`/api/products/by-ean/${encodeURIComponent(ean)}`);
}

// Name search over the shared catalog (the "All products" picker tab).
export function searchGlobalProducts(q: string): Promise<GlobalProduct[]> {
  return apiFetch<GlobalProduct[]>(`/api/products/search?q=${encodeURIComponent(q)}`);
}
