import { Link } from '@tanstack/react-router';
import { Check, Search } from 'lucide-react';
import { useState } from 'react';

import type { ExerciseCategory } from '@gym-bro/shared';

import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { FIELD_CLASS } from '@/lib/form-styles';
import { cn } from '@/lib/utils';

import { useExercises } from '../hooks/use-exercises';
import { useTrainingTranslation } from '../i18n';
import { CategoryIcon } from '../utils/category-icon';
import { CategoryFilter } from './category-filter';
import { PickedExerciseCard } from './picked-exercise-card';

interface ExercisePickerProps {
  // Currently selected exercise id, or '' if none.
  value: string;
  onChange: (exerciseId: string) => void;
}

// Searchable, category-filtered list of the library for picking one exercise to add
// to a template — rows like the workout's exercise picker (body-part tile, name,
// category). Once picked the list collapses to that pick (with "Change" to reopen) so
// the targets below aren't buried. An empty library links to the exercise library.
export function ExercisePicker({ value, onChange }: ExercisePickerProps) {
  const t = useTrainingTranslation();
  const { data: exercises, isPending, isError, error } = useExercises();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<ExerciseCategory | null>(null);
  const [changing, setChanging] = useState(false);

  if (isPending) {
    return (
      <div aria-hidden className="bg-card overflow-hidden rounded-xl border">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-3 border-t px-3 py-2.5 first:border-t-0">
            <Skeleton className="size-9 rounded-lg" />
            <Skeleton className="h-4 w-36" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p role="alert" className="text-destructive text-sm">
        {error.message}
      </p>
    );
  }

  if (exercises.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        {t.templateExercises.emptyLibrary}{' '}
        <Link to="/exercises" className="text-primary font-semibold">
          {t.templateExercises.addSomeFirst}
        </Link>
      </p>
    );
  }

  const selected = exercises.find((e) => e.id === value);
  if (selected && !changing) {
    return (
      <PickedExerciseCard
        name={selected.name}
        category={selected.category}
        onChange={() => setChanging(true)}
      />
    );
  }

  const q = query.trim().toLowerCase();
  const filtered = exercises.filter(
    (e) =>
      e.isActive &&
      (category === null || e.category === category) &&
      e.name.toLowerCase().includes(q),
  );

  const pick = (exerciseId: string) => {
    onChange(exerciseId);
    setChanging(false);
    setQuery('');
  };

  return (
    <div className="grid gap-2.5">
      <div className="relative">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
        <Input
          placeholder={t.templateExercises.search}
          className={cn(FIELD_CLASS, 'pl-10')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <CategoryFilter value={category} onChange={setCategory} />
      <ul className="bg-card max-h-64 overflow-y-auto overscroll-contain rounded-xl border">
        {filtered.length === 0 ? (
          <li className="text-muted-foreground px-3.5 py-4 text-center text-sm">
            {t.templateExercises.noMatches}
          </li>
        ) : (
          filtered.map((exercise) => {
            const active = value === exercise.id;
            return (
              <li key={exercise.id} className="border-t first:border-t-0">
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => pick(exercise.id)}
                  className={cn(
                    'flex min-h-12 w-full items-center gap-3 px-3 py-2 text-left transition-colors',
                    active ? 'bg-accent' : 'hover:bg-muted active:bg-muted',
                  )}
                >
                  <span className="bg-accent text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
                    <CategoryIcon category={exercise.category} className="size-[18px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-semibold">
                      {exercise.name}
                    </span>
                    <span className="text-muted-foreground block text-[11.5px]">
                      {t.categories[exercise.category]}
                    </span>
                  </span>
                  {active ? <Check className="text-primary size-4 shrink-0" /> : null}
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
