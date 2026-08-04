import { Check, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import type { GlobalProduct } from '@gym-bro/shared';

import { useCreateFood } from '../hooks/use-create-food';
import { useFoods } from '../hooks/use-foods';
import { useGlobalProductSearch } from '../hooks/use-global-product-search';
import { useRecipes } from '../hooks/use-recipes';
import { globalToInput } from '../utils/global-to-input';

export interface DiaryItem {
  kind: 'food' | 'recipe';
  id: string;
  name: string;
}

type Mode = 'mine' | 'all';

function detailLine(brand: string | null, kcal: number, p: number, c: number, f: number): string {
  const macros = `${kcal} kcal · P ${p} · C ${c} · F ${f} /100g`;
  return brand ? `${brand} · ${macros}` : macros;
}

function ItemRow({
  imageUrl,
  name,
  detail,
  picked,
}: {
  imageUrl?: string | null;
  name: string;
  detail: string;
  picked?: boolean;
}) {
  return (
    <>
      {picked !== undefined ? (
        <Check className={cn('size-4 shrink-0', picked ? 'opacity-100' : 'opacity-0')} />
      ) : null}
      {imageUrl ? (
        <img src={imageUrl} alt="" className="size-8 shrink-0 rounded object-cover" />
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="truncate">{name}</p>
        <p className="text-muted-foreground truncate text-xs">{detail}</p>
      </div>
    </>
  );
}

// One searchable picker over your foods + recipes ("Your products") and the shared
// catalog ("All products"). The typed query is shared across the two tabs, so
// switching after a miss keeps what you typed. Picking a catalog product adds it to
// your foods first, then selects it. Used in the diary add sheet.
export function DiaryItemCombobox({
  selected,
  onSelect,
}: {
  selected: DiaryItem | null;
  onSelect: (item: DiaryItem) => void;
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('mine');
  const [query, setQuery] = useState('');

  const { data: foods = [] } = useFoods('');
  const { data: recipes = [] } = useRecipes();
  const createFood = useCreateFood();
  const globalSearch = useGlobalProductSearch(query, mode === 'all' && open);

  const q = query.trim().toLowerCase();
  const myFoods = q ? foods.filter((food) => food.name.toLowerCase().includes(q)) : foods;
  const myRecipes = q ? recipes.filter((r) => r.name.toLowerCase().includes(q)) : recipes;
  const globals = globalSearch.data ?? [];

  const pick = (item: DiaryItem) => {
    onSelect(item);
    setOpen(false);
  };
  const isPicked = (kind: DiaryItem['kind'], id: string) =>
    selected?.kind === kind && selected.id === id;

  async function pickGlobal(product: GlobalProduct) {
    const food = await createFood.mutateAsync(globalToInput(product));
    pick({ kind: 'food', id: food.id, name: food.name });
  }

  return (
    // modal: the picker lives inside a bottom Sheet; without it the Sheet's scroll-lock
    // blocks wheel/touch scrolling on the portalled list.
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-11 w-full justify-between font-normal">
          <span className={cn('truncate', !selected && 'text-muted-foreground')}>
            {selected?.name ?? 'Select a product or recipe'}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
        <Command shouldFilter={false}>
          <div className="flex gap-0.5 border-b p-1">
            {(['mine', 'all'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={cn(
                  'h-8 flex-1 rounded text-sm font-medium',
                  mode === m ? 'bg-muted' : 'text-muted-foreground',
                )}
              >
                {m === 'mine' ? 'Your products' : 'All products'}
              </button>
            ))}
          </div>

          <CommandInput
            placeholder={mode === 'mine' ? 'Search your foods & recipes' : 'Search the catalog'}
            value={query}
            onValueChange={setQuery}
          />

          <CommandList>
            {mode === 'mine' ? (
              <>
                {myFoods.length === 0 && myRecipes.length === 0 ? (
                  <CommandEmpty>Nothing here — try “All products”.</CommandEmpty>
                ) : null}
                {myFoods.length > 0 && (
                  <CommandGroup heading="Products">
                    {myFoods.map((food) => (
                      <CommandItem
                        key={food.id}
                        value={food.id}
                        onSelect={() => pick({ kind: 'food', id: food.id, name: food.name })}
                      >
                        <ItemRow
                          imageUrl={food.imageUrl}
                          name={food.name}
                          picked={isPicked('food', food.id)}
                          detail={detailLine(
                            food.brand,
                            food.kcal,
                            food.proteinG,
                            food.carbsG,
                            food.fatG,
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                {myRecipes.length > 0 && (
                  <CommandGroup heading="Recipes">
                    {myRecipes.map((recipe) => (
                      <CommandItem
                        key={recipe.id}
                        value={recipe.id}
                        onSelect={() => pick({ kind: 'recipe', id: recipe.id, name: recipe.name })}
                      >
                        <ItemRow
                          name={recipe.name}
                          picked={isPicked('recipe', recipe.id)}
                          detail={`${Math.round(recipe.perServing.kcal)} kcal / serving`}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </>
            ) : (
              <>
                {q.length < 2 ? (
                  <p className="text-muted-foreground p-3 text-sm">Type at least 2 letters.</p>
                ) : globalSearch.isFetching ? (
                  <p className="text-muted-foreground p-3 text-sm">Searching…</p>
                ) : globals.length === 0 ? (
                  <CommandEmpty>Not in the catalog — scan its barcode to add it.</CommandEmpty>
                ) : (
                  <CommandGroup heading="Catalog">
                    {globals.map((product) => (
                      <CommandItem
                        key={product.id}
                        value={product.id}
                        disabled={createFood.isPending}
                        onSelect={() => void pickGlobal(product)}
                      >
                        <ItemRow
                          imageUrl={product.imageUrl}
                          name={product.name}
                          detail={detailLine(
                            product.brand,
                            product.kcal,
                            product.proteinG,
                            product.carbsG,
                            product.fatG,
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
