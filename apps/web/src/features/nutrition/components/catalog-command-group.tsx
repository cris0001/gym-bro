import { Apple } from 'lucide-react';
import { toast } from 'sonner';

import { CommandGroup, CommandItem } from '@/components/ui/command';
import { Skeleton } from '@/components/ui/skeleton';

import type { Food } from '@gym-bro/shared';

import { useAddFoodFromGlobal } from '../hooks/use-add-food-from-global';
import { useFoodNameLang } from '../hooks/use-food-name-lang';
import { useGlobalProductSearch } from '../hooks/use-global-product-search';
import { useNutritionTranslation } from '../i18n';
import { catalogFoodName } from '../utils/product-name';

interface CatalogCommandGroupProps {
  search: string;
  // Catalog products you already have are left out — your own copy is listed above.
  ownedGlobalIds: Set<string | null>;
  onSelect: (food: Food) => void;
}

// Catalog matches under your own foods in a food picker. Picking one adds it to your
// foods first and hands the resulting food on, so the caller only ever sees foods.
export function CatalogCommandGroup({
  search,
  ownedGlobalIds,
  onSelect,
}: CatalogCommandGroupProps) {
  const t = useNutritionTranslation();
  const locale = useFoodNameLang();
  const { products, isSearching } = useGlobalProductSearch(search);
  const addFromGlobal = useAddFoodFromGlobal();

  const visible = products.filter((p) => !ownedGlobalIds.has(p.id));
  if (isSearching) {
    return (
      <div aria-hidden className="flex flex-col gap-1 p-1">
        {[0, 1].map((i) => (
          <div key={i} className="flex items-center gap-2.5 px-2 py-2">
            <Skeleton className="size-8 shrink-0 rounded-lg" />
            <Skeleton className="h-3.5 flex-1" />
            <Skeleton className="h-3 w-12 shrink-0" />
          </div>
        ))}
      </div>
    );
  }
  if (visible.length === 0) return null;

  async function handleSelect(globalProductId: string, name: string) {
    try {
      onSelect(await addFromGlobal.mutateAsync({ globalProductId, name }));
    } catch {
      toast.error(t.addEntry.catalogAddFailed);
    }
  }

  return (
    <CommandGroup heading={t.addEntry.fromCatalog}>
      {visible.map((product) => {
        const name = catalogFoodName(product, locale);
        return (
          <CommandItem
            key={product.id}
            value={`catalog-${product.id}`}
            // The server already matched these (in either language), so they must
            // survive the picker's own filter even when the shown name differs from
            // what was typed ("banana" → "Banan").
            keywords={[search, product.name, product.namePl ?? '', product.nameEn ?? '']}
            disabled={addFromGlobal.isPending}
            onSelect={() => void handleSelect(product.id, name)}
            className="gap-2.5 rounded-[10px] px-2 py-2"
          >
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt=""
                className="bg-muted size-8 shrink-0 rounded-lg object-cover"
              />
            ) : (
              <span className="bg-muted flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground">
                <Apple className="size-4" />
              </span>
            )}
            <span className="min-w-0 flex-1 truncate text-[14px] font-medium">{name}</span>
            <span className="text-muted-foreground shrink-0 text-[12px]">{product.kcal} kcal</span>
          </CommandItem>
        );
      })}
    </CommandGroup>
  );
}
