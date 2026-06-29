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

import type { RecipeListItem } from '@gym-bro/shared';

import { useRecipes } from '../hooks/use-recipes';

interface RecipeComboboxProps {
  selectedId: string | null;
  selectedName: string | null;
  onSelect: (recipe: RecipeListItem) => void;
}

// Searchable recipe picker for logging a recipe to the diary.
export function RecipeCombobox({ selectedId, selectedName, onSelect }: RecipeComboboxProps) {
  const [open, setOpen] = useState(false);
  const { data: recipes = [] } = useRecipes();

  function handleSelect(recipe: RecipeListItem) {
    onSelect(recipe);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-11 w-full justify-between font-normal">
          <span className={cn('truncate', !selectedName && 'text-muted-foreground')}>
            {selectedName ?? 'Select a recipe'}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
        <Command>
          <CommandInput placeholder="Search recipes" />
          <CommandList>
            <CommandEmpty>No recipes yet.</CommandEmpty>
            <CommandGroup>
              {recipes.map((recipe) => (
                <CommandItem
                  key={recipe.id}
                  value={recipe.name}
                  onSelect={() => handleSelect(recipe)}
                >
                  <Check
                    className={cn('size-4', recipe.id === selectedId ? 'opacity-100' : 'opacity-0')}
                  />
                  <span className="truncate">{recipe.name}</span>
                  <span className="text-muted-foreground ml-auto text-xs">
                    {Math.round(recipe.perServing.kcal)} kcal/serving
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
