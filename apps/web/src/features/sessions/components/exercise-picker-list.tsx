import { SearchX } from 'lucide-react';

import { useSessionsTranslation } from '../i18n';
import { type PickableExercise, ExercisePickerRow } from './exercise-picker-row';
import { ExercisePickerSkeleton } from './exercise-picker-skeleton';

interface ExercisePickerListProps {
  loading: boolean;
  exercises: PickableExercise[];
  inWorkoutIds: ReadonlySet<string>;
  isSwap: boolean;
  onSelect: (exercise: PickableExercise) => void;
}

// The picker's results: one bordered card of rows (scrolling inside the sheet), its
// skeleton while loading, or a short empty state when nothing matches.
export function ExercisePickerList({
  loading,
  exercises,
  inWorkoutIds,
  isSwap,
  onSelect,
}: ExercisePickerListProps) {
  const t = useSessionsTranslation();

  if (loading) return <ExercisePickerSkeleton />;

  if (exercises.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-center">
        <span className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full">
          <SearchX className="size-5" />
        </span>
        <p className="text-sm font-semibold">{t.picker.noMatches}</p>
        <p className="text-muted-foreground text-xs">{t.picker.noMatchesHint}</p>
      </div>
    );
  }

  return (
    <ul className="bg-card min-h-0 overflow-y-auto overscroll-contain rounded-xl border">
      {exercises.map((exercise) => (
        <ExercisePickerRow
          key={exercise.id}
          exercise={exercise}
          categoryLabel={t.picker.categories[exercise.category]}
          inWorkoutLabel={!isSwap && inWorkoutIds.has(exercise.id) ? t.picker.inWorkout : null}
          isSwap={isSwap}
          onSelect={() => onSelect(exercise)}
        />
      ))}
    </ul>
  );
}
