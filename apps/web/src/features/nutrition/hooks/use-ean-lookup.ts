import { useMutation } from '@tanstack/react-query';

import { lookupEan } from '../api/products';

// On-demand barcode lookup (fired after a scan), so a mutation rather than a query.
export function useEanLookup() {
  return useMutation({ mutationFn: (ean: string) => lookupEan(ean) });
}
