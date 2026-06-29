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

import { useStatExercises } from '../hooks/use-stats';

import type { StatExercise } from '@gym-bro/shared';

interface ExerciseStatPickerProps {
  value: StatExercise | null;
  onSelect: (exercise: StatExercise) => void;
}

// Searchable picker for the progress chart. Lists only exercises the user has
// logged (from /stats/exercises), so every choice yields a non-empty chart. The
// category is shown as a muted suffix to disambiguate similarly-named exercises.
export function ExerciseStatPicker({ value, onSelect }: ExerciseStatPickerProps) {
  const [open, setOpen] = useState(false);
  const { data: exercises = [], isPending } = useStatExercises();

  function handleSelect(exercise: StatExercise) {
    onSelect(exercise);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-11 w-full justify-between font-normal">
          <span className={cn('truncate', !value && 'text-muted-foreground')}>
            {value ? value.name : 'Select an exercise'}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
        <Command>
          <CommandInput placeholder="Search exercises" />
          <CommandList>
            <CommandEmpty>{isPending ? 'Loading…' : 'No logged exercises yet.'}</CommandEmpty>
            <CommandGroup>
              {exercises.map((exercise) => (
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
                  <span className="text-muted-foreground ml-auto text-xs">{exercise.category}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
