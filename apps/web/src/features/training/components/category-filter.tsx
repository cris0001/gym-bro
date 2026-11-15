import { EXERCISE_CATEGORIES, type ExerciseCategory } from '@gym-bro/shared';

import { cn } from '@/lib/utils';
import { useHScroll } from '@/hooks/use-h-scroll';
import { useTrainingTranslation } from '../i18n';

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

// Category chips for the exercise library: one hidden-scrollbar row on every width —
// swipe on touch, wheel or drag with a mouse (useHScroll), the active chip centred.
// Leading "All" clears the filter (the default).
export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  const t = useTrainingTranslation();
  const scrollRef = useHScroll<HTMLDivElement>(value);
  return (
    <div
      ref={scrollRef}
      className="no-scrollbar -mx-3 flex gap-1.5 overflow-x-auto px-3 md:mx-0 md:px-0"
    >
      <button
        type="button"
        aria-pressed={value === null}
        onClick={() => onChange(null)}
        className={chipClass(value === null)}
      >
        {t.common.all}
      </button>
      {EXERCISE_CATEGORIES.map((category) => (
        <button
          key={category}
          type="button"
          aria-pressed={value === category}
          onClick={() => onChange(category)}
          className={chipClass(value === category)}
        >
          {t.categories[category]}
        </button>
      ))}
    </div>
  );
}
