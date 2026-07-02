import { useState } from 'react';
import { Link } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import { useExercises } from '../hooks/use-exercises';

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
    return (
      <div className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2">
        <span className="min-w-0 truncate font-medium">{selected.name}</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 shrink-0"
          onClick={() => setChanging(true)}
        >
          Change
        </Button>
      </div>
    );
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
      <Input
        placeholder="Search exercises…"
        className="h-11"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <ul className="max-h-48 overflow-y-auto rounded-lg border">
        {filtered.length === 0 ? (
          <li className="text-muted-foreground p-3 text-sm">No matches.</li>
        ) : (
          filtered.map((exercise) => (
            <li key={exercise.id}>
              <button
                type="button"
                aria-pressed={value === exercise.id}
                className={cn(
                  'flex w-full items-center justify-between gap-2 px-3 py-2 text-left',
                  value === exercise.id ? 'bg-accent' : 'hover:bg-accent/50',
                )}
                onClick={() => pick(exercise.id)}
              >
                <span className="truncate">{exercise.name}</span>
                <span className="text-muted-foreground shrink-0 text-xs">{exercise.category}</span>
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
