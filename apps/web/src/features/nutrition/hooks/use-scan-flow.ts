import { toast } from 'sonner';

import type { Food } from '@gym-bro/shared';

import { useFoodUiStore, type ScanPrefill } from '../stores/food-ui.store';
import { globalToInput } from '../utils/global-to-input';
import { useCreateFood } from './use-create-food';
import { useEanLookup } from './use-ean-lookup';

interface ResolvedItem {
  kind: 'food';
  id: string;
  name: string;
}

function blankPrefill(ean: string): ScanPrefill {
  return {
    ean,
    name: '',
    brand: null,
    kcal: null,
    proteinG: null,
    carbsG: null,
    fatG: null,
    servingGrams: null,
    unitGrams: null,
    imageUrl: null,
  };
}

// Ties a scanned barcode to the next step:
// - in our catalog → add the pantry copy immediately (no form);
// - only on OpenFoodFacts / nowhere → open the form to confirm/fill.
// When `onResolved` is given (the diary), it fires with the resulting food so the
// caller can select it to log; otherwise the product just lands in your foods.
export function useScanFlow(onResolved?: (item: ResolvedItem) => void) {
  const lookup = useEanLookup();
  const createFood = useCreateFood();
  const openScanned = useFoodUiStore((s) => s.openScanned);

  function resolved(food: Food) {
    if (onResolved) onResolved({ kind: 'food', id: food.id, name: food.name });
    else toast.success(`Added ${food.name} to your foods.`);
  }

  async function handleEan(ean: string) {
    try {
      const result = await lookup.mutateAsync(ean);
      if (result.status === 'found') {
        if (result.inPantry && result.foodId) {
          if (onResolved)
            onResolved({ kind: 'food', id: result.foodId, name: result.product.name });
          else toast.info('This product is already in your foods.');
          return;
        }
        resolved(await createFood.mutateAsync(globalToInput(result.product)));
        return;
      }
      const prefill =
        result.status === 'off' ? { ...result.draft, unitGrams: null } : blankPrefill(result.ean);
      openScanned(prefill, onResolved ? resolved : undefined);
    } catch {
      toast.error('Barcode lookup failed. Try again.');
    }
  }

  return { handleEan, isPending: lookup.isPending || createFood.isPending };
}
