import { EXERCISE_CATEGORIES, type ExerciseCategory } from '@gym-bro/shared';

import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  value: ExerciseCategory | null;
  onChange: (value: ExerciseCategory | null) => void;
}

const chipClass = (active: boolean): string =>
  cn(
    'inline-flex h-8 shrink-0 items-center rounded-full px-3.5 text-[13px] font-semibold whitespace-nowrap transition-colors',
    active
      ? 'bg-primary text-primary-foreground'
      : 'bg-secondary text-subtle-foreground hover:bg-muted',
  );

// Category chips for the exercise library: a swipeable row on touch screens (bleeding
// to the page edge), wrapped onto extra lines on desktop (a mouse can't swipe a
// hidden-scrollbar row). Leading "All" clears the filter (the default).
export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  return (
    <div className="no-scrollbar -mx-3 flex gap-1.5 overflow-x-auto px-3 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
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
