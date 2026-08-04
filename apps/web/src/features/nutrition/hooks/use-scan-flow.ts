import { toast } from 'sonner';

import type { Food, GlobalProduct } from '@gym-bro/shared';

import { useFoodUiStore, type ScanPrefill } from '../stores/food-ui.store';
import { globalToInput } from '../utils/global-to-input';
import { useCreateFood } from './use-create-food';
import { useEanLookup } from './use-ean-lookup';

// The food a scan resolves to — enough for the caller to log it or add it as a recipe
// ingredient without another fetch.
export interface ResolvedFood {
  id: string;
  name: string;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  servingGrams: number | null;
  unitGrams: number | null;
}

function fromFood(f: Food): ResolvedFood {
  return {
    id: f.id,
    name: f.name,
    kcal: f.kcal,
    proteinG: f.proteinG,
    carbsG: f.carbsG,
    fatG: f.fatG,
    servingGrams: f.servingGrams,
    unitGrams: f.unitGrams,
  };
}

// A found-in-pantry global: the pantry food shares the global's macros, so build the
// resolved food from the global product + the existing pantry food id.
function fromGlobal(p: GlobalProduct, foodId: string): ResolvedFood {
  return {
    id: foodId,
    name: p.name,
    kcal: p.kcal,
    proteinG: p.proteinG,
    carbsG: p.carbsG,
    fatG: p.fatG,
    servingGrams: p.servingGrams,
    unitGrams: p.unitGrams,
  };
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

// Ties a scanned barcode to the next step. In every case the product ends up in your
// foods/pantry (created from the catalog / OpenFoodFacts, or via the form when the data
// is incomplete). When `onResolved` is given, it fires with the resulting food so the
// caller can act on it in context — the diary logs it to the meal, the recipe builder
// adds it as an ingredient. Without it (the Foods page), the product just lands in your
// foods with a toast.
export function useScanFlow(onResolved?: (food: ResolvedFood) => void) {
  const lookup = useEanLookup();
  const createFood = useCreateFood();
  const openScanned = useFoodUiStore((s) => s.openScanned);

  function resolved(food: Food) {
    if (onResolved) onResolved(fromFood(food));
    else toast.success(`Added ${food.name} to your foods.`);
  }

  async function handleEan(ean: string) {
    try {
      const result = await lookup.mutateAsync(ean);
      if (result.status === 'found') {
        if (result.inPantry && result.foodId) {
          if (onResolved) onResolved(fromGlobal(result.product, result.foodId));
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
