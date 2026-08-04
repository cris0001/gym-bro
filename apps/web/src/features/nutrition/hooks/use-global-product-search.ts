import { useQuery } from '@tanstack/react-query';

import { searchGlobalProducts } from '../api/products';

// Name search over the shared catalog for the "All products" tab. Enabled only in that
// mode with a query of 2+ chars; cached briefly so retyping the same term is instant.
export function useGlobalProductSearch(query: string, enabled: boolean) {
  const q = query.trim();
  return useQuery({
    queryKey: ['products', 'search', q],
    queryFn: () => searchGlobalProducts(q),
    enabled: enabled && q.length >= 2,
    staleTime: 60_000,
  });
}
