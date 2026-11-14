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
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { SELECT_TRIGGER_CLASS } from '@/lib/form-styles';

import { useStatExercises } from '../hooks/use-stats';
import { useStatsTranslation } from '../i18n';

import { EXERCISE_CATEGORIES, type StatExercise } from '@gym-bro/shared';

interface ExerciseStatPickerProps {
  value: StatExercise | null;
  onSelect: (exercise: StatExercise) => void;
}

// Searchable picker for the progress chart (a 36px select with small corners). Lists
// only exercises the user has logged (from /stats/exercises), so every choice yields
// a non-empty chart. Nothing is picked by default.
// Exercises are grouped by category (in the canonical category order; names are
// already sorted within each from the backend) so the list reads by muscle group.
export function ExerciseStatPicker({ value, onSelect }: ExerciseStatPickerProps) {
  const t = useStatsTranslation();
  const [open, setOpen] = useState(false);
  const { data: exercises = [], isPending } = useStatExercises();

  const groups = EXERCISE_CATEGORIES.map((category) => ({
    category,
    items: exercises.filter((exercise) => exercise.category === category),
  })).filter((group) => group.items.length > 0);

  function handleSelect(exercise: StatExercise) {
    onSelect(exercise);
    setOpen(false);
  }

  // Until the logged exercises arrive the picker has nothing to offer — hold its
  // place with a skeleton the trigger's exact size.
  if (isPending) {
    return <Skeleton className="h-9 w-60 max-w-full rounded-md" />;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            SELECT_TRIGGER_CLASS,
            'w-60 max-w-full font-semibold',
            !value && 'text-muted-foreground',
          )}
        >
          <span className="truncate">{value ? value.name : t.picker.placeholder}</span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) min-w-64 p-0" align="start">
        <Command>
          <CommandInput placeholder={t.picker.search} />
          <CommandList>
            <CommandEmpty>{isPending ? t.picker.loading : t.picker.empty}</CommandEmpty>
            {groups.map((group) => (
              <CommandGroup key={group.category} heading={group.category}>
                {group.items.map((exercise) => (
                  <CommandItem
                    key={exercise.id}
                    value={exercise.name}
                    onSelect={() => handleSelect(exercise)}
                  >
                    <Check
                      className={cn(
                        'size-4',
                        exercise.id === value?.id ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    <span className="truncate">{exercise.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
