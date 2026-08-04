import { toast } from 'sonner';

import type { GlobalProduct } from '@gym-bro/shared';

import { useFoodUiStore, type ScanPrefill } from '../stores/food-ui.store';
import { useEanLookup } from './use-ean-lookup';

function fromGlobal(p: GlobalProduct): ScanPrefill {
  return {
    ean: p.ean,
    name: p.name,
    brand: p.brand,
    kcal: p.kcal,
    proteinG: p.proteinG,
    carbsG: p.carbsG,
    fatG: p.fatG,
    servingGrams: p.servingGrams,
    unitGrams: p.unitGrams,
    imageUrl: p.imageUrl,
  };
}

// Ties a scanned barcode to the next step: already in your foods → a toast; in our
// catalog or on OpenFoodFacts → open the form prefilled; nowhere → open a blank form
// with the barcode remembered.
export function useScanFlow() {
  const lookup = useEanLookup();
  const openScanned = useFoodUiStore((s) => s.openScanned);

  async function handleEan(ean: string) {
    try {
      const result = await lookup.mutateAsync(ean);
      if (result.status === 'found') {
        if (result.inPantry) {
          toast.info('This product is already in your foods.');
          return;
        }
        openScanned(fromGlobal(result.product));
      } else if (result.status === 'off') {
        openScanned({ ...result.draft, unitGrams: null });
      } else {
        openScanned({
          ean: result.ean,
          name: '',
          brand: null,
          kcal: null,
          proteinG: null,
          carbsG: null,
          fatG: null,
          servingGrams: null,
          unitGrams: null,
          imageUrl: null,
        });
      }
    } catch {
      toast.error('Barcode lookup failed. Try again.');
    }
  }

  return { handleEan, isPending: lookup.isPending };
}
