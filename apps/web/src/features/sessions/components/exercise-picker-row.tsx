import { ArrowLeftRight, Plus } from 'lucide-react';

import type { ExerciseCategory } from '@gym-bro/shared';

import { CategoryIcon } from '@/features/training';

export interface PickableExercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  isActive: boolean;
}

interface ExercisePickerRowProps {
  exercise: PickableExercise;
  categoryLabel: string;
  // Set when the exercise is already in the running workout (shown as a note, not
  // blocked — doing an exercise twice is legitimate).
  inWorkoutLabel: string | null;
  isSwap: boolean;
  onSelect: () => void;
}

// One pickable exercise: its body-part glyph on a tinted tile, the name, the category
// (+ "in workout" when already added), and a round add / swap affordance. The whole
// row is the tap target (56px, one-handed friendly).
export function ExercisePickerRow({
  exercise,
  categoryLabel,
  inWorkoutLabel,
  isSwap,
  onSelect,
}: ExercisePickerRowProps) {
  const ActionIcon = isSwap ? ArrowLeftRight : Plus;

  return (
    <li className="border-border border-t first:border-t-0">
      <button
        type="button"
        onClick={onSelect}
        className="hover:bg-muted active:bg-muted flex min-h-14 w-full items-center gap-3 px-3.5 py-2.5 text-left transition-colors"
      >
        <span className="bg-accent text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
          <CategoryIcon category={exercise.category} className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[14.5px] font-semibold">{exercise.name}</span>
          <span className="text-muted-foreground block truncate text-xs">
            {categoryLabel}
            {inWorkoutLabel ? (
              <span className="text-primary font-medium"> · {inWorkoutLabel}</span>
            ) : null}
          </span>
        </span>
        <span className="bg-secondary text-foreground flex size-8 shrink-0 items-center justify-center rounded-full">
          <ActionIcon className="size-4" />
        </span>
      </button>
    </li>
  );
}
