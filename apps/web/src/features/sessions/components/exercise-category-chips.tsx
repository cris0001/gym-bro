import type { ExerciseCategory } from '@gym-bro/shared';

import { CategoryIcon } from '@/features/training';
import { useHScroll } from '@/hooks/use-h-scroll';
import { cn } from '@/lib/utils';

const CHIP =
  'flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[13px] font-semibold whitespace-nowrap transition-colors';

interface ExerciseCategoryChipsProps {
  categories: ExerciseCategory[];
  value: ExerciseCategory | null;
  onChange: (category: ExerciseCategory | null) => void;
  labels: Record<ExerciseCategory, string>;
  allLabel: string;
}

// The picker's category filter: "All" + one chip per category present in the list,
// scrolling sideways on phones (no wrap, so the list keeps its height).
export function ExerciseCategoryChips({
  categories,
  value,
  onChange,
  labels,
  allLabel,
}: ExerciseCategoryChipsProps) {
  const scrollRef = useHScroll<HTMLDivElement>(value);
  const chipClass = (active: boolean) =>
    cn(
      CHIP,
      active
        ? 'bg-foreground text-background border-foreground'
        : 'bg-card border-border text-muted-foreground hover:bg-muted',
    );

  return (
    <div ref={scrollRef} className="no-scrollbar -mx-4 flex shrink-0 gap-1.5 overflow-x-auto px-4">
      <button
        type="button"
        aria-pressed={value === null}
        onClick={() => onChange(null)}
        className={chipClass(value === null)}
      >
        {allLabel}
      </button>
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          aria-pressed={value === category}
          onClick={() => onChange(value === category ? null : category)}
          className={chipClass(value === category)}
        >
          <CategoryIcon category={category} className="size-3.5" />
          {labels[category]}
        </button>
      ))}
    </div>
  );
}
