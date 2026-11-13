import type { Locale } from '@/stores/locale.store';

import type { GlobalProduct } from '@gym-bro/shared';

// How a catalog product is named in the pickers and in your foods once added: a generic
// food (no barcode) in the UI language, a packaged one by its name with the brand.
export function catalogFoodName(product: GlobalProduct, locale: Locale): string {
  if (product.ean === null) {
    return (locale === 'pl' ? product.namePl : product.nameEn) ?? product.name;
  }
  return scannedFoodName(product.name, product.brand);
}

// Prefix the brand onto a scanned product's name when it helps identify it — OFF names
// are often terse ("Zero", "Classic"), and the producer makes them recognisable.
// Skips it when the brand is already part of the name, to avoid "Coca-Cola Coca-Cola".
export function scannedFoodName(name: string, brand: string | null): string {
  const n = name.trim();
  const b = brand?.trim();
  if (!b || n.toLowerCase().includes(b.toLowerCase())) return n;
  return `${b} ${n}`;
}
