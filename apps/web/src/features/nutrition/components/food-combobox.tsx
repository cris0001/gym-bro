import { Apple, Check, ChevronsUpDown, Plus } from 'lucide-react';
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
import { useNutritionTranslation } from '../i18n';

interface FoodComboboxProps {
  selectedId: string | null;
  selectedName: string | null;
  onSelect: (food: Food) => void;
  // Trigger text when nothing is selected (e.g. an "add ingredient" search).
  placeholder?: string;
  // 'add': a light "+ Search foods to add…" trigger with room on the right for an
  // overlaid action (the recipe builder's scan button).
  variant?: 'default' | 'add';
}

// Searchable food picker for a recipe ingredient. Lists the active food
// dictionary; selectedName is shown on the trigger so a soft-deleted-but-still-
// referenced food still reads correctly.
export function FoodCombobox({
  selectedId,
  selectedName,
  onSelect,
  placeholder,
  variant = 'default',
}: FoodComboboxProps) {
  const t = useNutritionTranslation();
  const [open, setOpen] = useState(false);
  const { data: foods = [] } = useFoods('');
  const triggerLabel = placeholder ?? t.foods.selectFood;

  function handleSelect(food: Food) {
    onSelect(food);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {variant === 'add' ? (
          <button
            type="button"
            className="border-border bg-card text-primary hover:bg-muted flex h-12 w-full items-center gap-2.5 rounded-[14px] border pr-14 pl-4 text-left text-[14px] font-semibold transition-colors"
          >
            <Plus className="size-4 shrink-0" />
            <span className="truncate">{triggerLabel}</span>
          </button>
        ) : (
          <Button variant="outline" className="h-11 w-full justify-between font-normal">
            <span className={cn('truncate', !selectedName && 'text-muted-foreground')}>
              {selectedName ?? triggerLabel}
            </span>
            <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent
        className="w-(--radix-popover-trigger-width) overflow-hidden rounded-[14px] border-[#e8e1da] p-0 shadow-lg dark:border-[#2f292d]"
        align="start"
      >
        <Command>
          {/* A roomier search field with a readable placeholder, so it's obvious you
              can type to filter. */}
          <CommandInput
            placeholder={t.foods.searchFoods}
            className="h-11 text-[14px] placeholder:text-[#7a6c72] dark:placeholder:text-[#9c9097]"
          />
          <CommandList className="max-h-72">
            <CommandEmpty className="text-muted-foreground py-6 text-center text-[13px]">
              {t.foods.noFoodsYet}
            </CommandEmpty>
            <CommandGroup>
              {foods.map((food) => (
                <CommandItem
                  key={food.id}
                  value={food.name}
                  onSelect={() => handleSelect(food)}
                  className="gap-2.5 rounded-[10px] px-2 py-2"
                >
                  {food.imageUrl ? (
                    <img
                      src={food.imageUrl}
                      alt=""
                      className="bg-muted size-8 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <span className="bg-muted flex size-8 shrink-0 items-center justify-center rounded-lg text-[#a8969d]">
                      <Apple className="size-4" />
                    </span>
                  )}
                  <span className="min-w-0 flex-1 truncate text-[14px] font-medium">
                    {food.name}
                  </span>
                  <span className="text-muted-foreground shrink-0 text-[12px]">
                    {food.kcal} kcal
                  </span>
                  <Check
                    className={cn(
                      'text-primary size-4 shrink-0',
                      food.id === selectedId ? 'opacity-100' : 'hidden',
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
