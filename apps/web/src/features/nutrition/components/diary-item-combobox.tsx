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

import { useFoods } from '../hooks/use-foods';
import { useRecipes } from '../hooks/use-recipes';

export interface DiaryItem {
  kind: 'food' | 'recipe';
  id: string;
  name: string;
}

// One searchable picker over both products (foods) and recipes, grouped. Used in the
// diary add sheet so a single field covers everything you can log.
export function DiaryItemCombobox({
  selected,
  onSelect,
}: {
  selected: DiaryItem | null;
  onSelect: (item: DiaryItem) => void;
}) {
  const [open, setOpen] = useState(false);
  const { data: foods = [] } = useFoods('');
  const { data: recipes = [] } = useRecipes();

  const pick = (item: DiaryItem) => {
    onSelect(item);
    setOpen(false);
  };
  const isPicked = (kind: DiaryItem['kind'], id: string) =>
    selected?.kind === kind && selected.id === id;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-11 w-full justify-between font-normal">
          <span className={cn('truncate', !selected && 'text-muted-foreground')}>
            {selected?.name ?? 'Select a product or recipe'}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
        <Command>
          <CommandInput placeholder="Search products & recipes" />
          <CommandList>
            <CommandEmpty>Nothing found.</CommandEmpty>
            {foods.length > 0 && (
              <CommandGroup heading="Products">
                {foods.map((food) => (
                  <CommandItem
                    key={food.id}
                    value={`${food.name} ${food.id}`}
                    onSelect={() => pick({ kind: 'food', id: food.id, name: food.name })}
                  >
                    <Check
                      className={cn(
                        'size-4',
                        isPicked('food', food.id) ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    <span className="truncate">{food.name}</span>
                    <span className="text-muted-foreground ml-auto text-xs">{food.kcal} kcal</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {recipes.length > 0 && (
              <CommandGroup heading="Recipes">
                {recipes.map((recipe) => (
                  <CommandItem
                    key={recipe.id}
                    value={`${recipe.name} ${recipe.id}`}
                    onSelect={() => pick({ kind: 'recipe', id: recipe.id, name: recipe.name })}
                  >
                    <Check
                      className={cn(
                        'size-4',
                        isPicked('recipe', recipe.id) ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    <span className="truncate">{recipe.name}</span>
                    <span className="text-muted-foreground ml-auto text-xs">
                      {Math.round(recipe.perServing.kcal)} kcal/serving
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
