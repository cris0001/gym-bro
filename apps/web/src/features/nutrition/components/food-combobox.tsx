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

import type { Food } from '@gym-bro/shared';

import { useFoods } from '../hooks/use-foods';

interface FoodComboboxProps {
  selectedId: string | null;
  selectedName: string | null;
  onSelect: (food: Food) => void;
}

// Searchable food picker for a recipe ingredient. Lists the active food
// dictionary; selectedName is shown on the trigger so a soft-deleted-but-still-
// referenced food still reads correctly.
export function FoodCombobox({ selectedId, selectedName, onSelect }: FoodComboboxProps) {
  const [open, setOpen] = useState(false);
  const { data: foods = [] } = useFoods('');

  function handleSelect(food: Food) {
    onSelect(food);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-11 w-full justify-between font-normal">
          <span className={cn('truncate', !selectedName && 'text-muted-foreground')}>
            {selectedName ?? 'Select a food'}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
        <Command>
          <CommandInput placeholder="Search foods" />
          <CommandList>
            <CommandEmpty>No foods yet.</CommandEmpty>
            <CommandGroup>
              {foods.map((food) => (
                <CommandItem key={food.id} value={food.name} onSelect={() => handleSelect(food)}>
                  <Check
                    className={cn('size-4', food.id === selectedId ? 'opacity-100' : 'opacity-0')}
                  />
                  <span className="truncate">{food.name}</span>
                  <span className="text-muted-foreground ml-auto text-xs">{food.kcal} kcal</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
