import type { CreateFoodInput, GlobalProduct } from '@gym-bro/shared';

import { scannedFoodName } from './product-name';

// A catalog product has complete data, so it can be turned into a createFood body
// directly (adds/links the pantry copy on the server via the barcode-aware path). The
// name gets the brand prefixed for recognisability.
export function globalToInput(p: GlobalProduct): CreateFoodInput {
  return {
    name: scannedFoodName(p.name, p.brand),
    kcal: p.kcal,
    proteinG: p.proteinG,
    carbsG: p.carbsG,
    fatG: p.fatG,
    ...(p.servingGrams !== null ? { servingGrams: p.servingGrams } : {}),
    ...(p.unitGrams !== null ? { unitGrams: p.unitGrams } : {}),
    ean: p.ean,
    ...(p.brand !== null ? { brand: p.brand } : {}),
    ...(p.imageUrl !== null ? { imageUrl: p.imageUrl } : {}),
  };
}
