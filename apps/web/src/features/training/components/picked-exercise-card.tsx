import type { ExerciseCategory } from '@gym-bro/shared';

import { useTrainingTranslation } from '../i18n';
import { CategoryIcon } from '../utils/category-icon';

interface PickedExerciseCardProps {
  name: string;
  category: ExerciseCategory;
  // Reopens the picker; omitted when the exercise is fixed (editing targets).
  onChange?: () => void;
}

// The chosen exercise as a read-only card — its body-part tile, name and category,
// with an optional "Change" back to the picker.
export function PickedExerciseCard({ name, category, onChange }: PickedExerciseCardProps) {
  const t = useTrainingTranslation();
  return (
    <div className="bg-card flex items-center gap-3 rounded-xl border px-3 py-2.5">
      <span className="bg-accent text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
        <CategoryIcon category={category} className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold">{name}</p>
        <p className="text-muted-foreground text-xs">{t.categories[category]}</p>
      </div>
      {onChange ? (
        <button
          type="button"
          className="bg-secondary text-foreground h-8 shrink-0 rounded-full px-3.5 text-[12.5px] font-semibold"
          onClick={onChange}
        >
          {t.common.change}
        </button>
      ) : null}
    </div>
  );
}
