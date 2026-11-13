import { useQuery } from '@tanstack/react-query';

import type { GlobalProduct } from '@gym-bro/shared';

import { searchGlobalProducts } from '../api/products';
import { useDebouncedValue } from './use-debounced-value';

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 300;
// One stable empty list, so memoised consumers don't recompute on every render.
const NO_PRODUCTS: GlobalProduct[] = [];

// Name search over the shared catalog, shown under your own matches in the pickers.
// Waits for a pause in typing and runs only for 2+ chars; cached briefly so retyping
// the same term is instant. Offline the request just pauses — the pickers keep
// showing your own foods.
export function useGlobalProductSearch(query: string, enabled = true) {
  const q = query.trim();
  const debounced = useDebouncedValue(q, DEBOUNCE_MS);
  const active = enabled && q.length >= MIN_QUERY_LENGTH;

  const search = useQuery({
    queryKey: ['products', 'search', debounced],
    queryFn: () => searchGlobalProducts(debounced),
    enabled: enabled && debounced.length >= MIN_QUERY_LENGTH,
    staleTime: 60_000,
  });

  return {
    // Only results for what's typed now — never a previous term's while the next
    // one is pending.
    products: active && debounced === q ? (search.data ?? NO_PRODUCTS) : NO_PRODUCTS,
    // Covers the debounce wait too, so the skeleton shows from the first keystroke.
    // A paused (offline) request isn't loading, so it never spins forever.
    isSearching: active && (debounced !== q || search.isLoading),
  };
}
