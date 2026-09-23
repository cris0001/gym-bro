import { Link } from '@tanstack/react-router';
import { Search } from 'lucide-react';
import { useState } from 'react';

import { Input } from '@/components/ui/input';
import { FIELD_CLASS } from '@/lib/form-styles';
import { cn } from '@/lib/utils';

import { useExercises } from '../hooks/use-exercises';
import { PickedExerciseCard } from './picked-exercise-card';

interface ExercisePickerProps {
  // Currently selected exercise id, or '' if none.
  value: string;
  onChange: (exerciseId: string) => void;
}

// Filterable list of the user's exercise library for picking one to add to a
// template. Once an exercise is chosen the list collapses to that pick (with a
// "Change" to reopen), so the rest of the form isn't buried under the full list.
// Empty library points the user to the exercise library to add some.
export function ExercisePicker({ value, onChange }: ExercisePickerProps) {
  const { data: exercises, isPending, isError, error } = useExercises();
  const [query, setQuery] = useState('');
  const [changing, setChanging] = useState(false);

  if (isPending) {
    return <p className="text-muted-foreground text-sm">Loading exercises…</p>;
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
        No exercises in your library yet.{' '}
        <Link to="/exercises" className="text-foreground underline">
          Add some first
        </Link>
        .
      </p>
    );
  }

  const selected = exercises.find((e) => e.id === value);

  // Collapsed state: an exercise is picked and we're not actively changing it.
  if (selected && !changing) {
    return <PickedExerciseCard name={selected.name} onChange={() => setChanging(true)} />;
  }

  const filtered = exercises.filter((e) =>
    e.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const pick = (exerciseId: string) => {
    onChange(exerciseId);
    setChanging(false);
    setQuery('');
  };

  return (
    <div className="grid gap-2">
      <div className="relative">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
        <Input
          placeholder="Search exercises…"
          className={cn(FIELD_CLASS, 'pl-10')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <ul className="max-h-48 divide-y divide-[#efe8e2] overflow-y-auto rounded-xl border border-[#e8e1da] bg-[#fdfbf9] dark:divide-[#2f292d] dark:border-[#2f292d] dark:bg-[#171316]">
        {filtered.length === 0 ? (
          <li className="text-muted-foreground px-3.5 py-3 text-sm">No matches.</li>
        ) : (
          filtered.map((exercise) => (
            <li key={exercise.id}>
              <button
                type="button"
                aria-pressed={value === exercise.id}
                className={cn(
                  'flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-left text-[13.5px] transition-colors',
                  value === exercise.id ? 'bg-accent font-semibold' : 'hover:bg-muted/60',
                )}
                onClick={() => pick(exercise.id)}
              >
                <span className="truncate">{exercise.name}</span>
                <span
                  className={cn(
                    'shrink-0 text-[11px]',
                    value === exercise.id ? 'text-accent-foreground' : 'text-muted-foreground',
                  )}
                >
                  {exercise.category}
                </span>
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
