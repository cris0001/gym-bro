import { EXERCISE_CATEGORIES, type ExerciseCategory } from '@gym-bro/shared';

import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  value: ExerciseCategory | null;
  onChange: (value: ExerciseCategory | null) => void;
}

const chipClass = (active: boolean): string =>
  cn(
    'h-9 shrink-0 rounded-full border px-3 text-sm whitespace-nowrap transition-colors',
    active ? 'bg-primary text-primary-foreground border-transparent' : 'text-muted-foreground',
  );

// Horizontal, scrollable category chips for the exercise library. Leading "All"
// clears the filter (the default = show everything).
export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto px-4 pb-2">
      <button type="button" onClick={() => onChange(null)} className={chipClass(value === null)}>
        All
      </button>
      {EXERCISE_CATEGORIES.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => onChange(category)}
          className={chipClass(value === category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
