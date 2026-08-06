import { Dumbbell, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ListSkeleton } from '@/components/list-skeleton';
import { Button } from '@/components/ui/button';
import { useConfirm } from '@/stores/confirm.store';
import type { Exercise, ExerciseCategory } from '@gym-bro/shared';

import { useDeleteExercise } from '../hooks/use-delete-exercise';
import { useExercises } from '../hooks/use-exercises';
import { useExerciseUiStore } from '../stores/exercise-ui.store';
import { CategoryIcon } from '../utils/category-icon';

interface ExerciseListProps {
  // null = all categories.
  category: ExerciseCategory | null;
  search: string;
}

// The exercise library list: read state via TanStack Query (filtered by the
// page's category), then name-filtered client-side by the search box. Edit through
// the UI store's Sheet, delete with a confirm. Add is owned by the page header.
export function ExerciseList({ category, search }: ExerciseListProps) {
  const {
    data: exercises,
    isPending,
    isError,
    error,
    refetch,
  } = useExercises(category ?? undefined);
  const openEdit = useExerciseUiStore((s) => s.openEdit);
  const openCreate = useExerciseUiStore((s) => s.openCreate);
  const remove = useDeleteExercise();
  const confirm = useConfirm();

  if (isPending) {
    return <ListSkeleton />;
  }

  if (isError) {
    return <ErrorState message={error.message} onRetry={() => void refetch()} />;
  }

  if (exercises.length === 0) {
    return (
      <EmptyState
        icon={<Dumbbell className="size-6" />}
        title={category ? `No ${category} exercises yet` : 'No exercises yet'}
        description="Add exercises to your library to start building workout templates."
        action={
          <Button type="button" className="h-11" onClick={openCreate}>
            <Plus className="size-4" />
            Add exercise
          </Button>
        }
      />
    );
  }

  async function onDelete(exercise: Exercise) {
    const ok = await confirm({
      title: `Delete "${exercise.name}"?`,
      description: 'It will be removed from your library.',
      confirmText: 'Delete',
      destructive: true,
    });
    if (ok) remove.mutate(exercise.id, { onSuccess: () => toast.success('Exercise deleted') });
  }

  const query = search.trim().toLowerCase();
  const filtered = exercises.filter((exercise) => exercise.name.toLowerCase().includes(query));

  if (filtered.length === 0) {
    return <p className="text-muted-foreground p-4 text-sm">No exercises match your search.</p>;
  }

  return (
    <ul className="divide-y">
      {filtered.map((exercise) => (
        <li
          key={exercise.id}
          className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
        >
          {/* Only useful under "All", where rows mix categories. */}
          {category === null ? (
            <span className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-full">
              <CategoryIcon category={exercise.category} className="size-4" />
            </span>
          ) : null}
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{exercise.name}</p>
            <p className="text-muted-foreground text-sm">{exercise.category}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-11 shrink-0"
            aria-label={`Edit ${exercise.name}`}
            onClick={() => openEdit(exercise)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-destructive size-11 shrink-0"
            aria-label={`Delete ${exercise.name}`}
            disabled={remove.isPending}
            onClick={() => void onDelete(exercise)}
          >
            <Trash2 className="size-4" />
          </Button>
        </li>
      ))}
    </ul>
  );
}
