import { ChevronRight, Dumbbell, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { DeleteIconButton } from '@/components/delete-icon-button';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { SkeletonList } from '@/components/skeletons';
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
    return <SkeletonList />;
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

  // Mobile: a divided list. Desktop: a grid of cards. Tapping a row/card opens the edit
  // sheet; delete lives in that sheet on mobile, and appears on hover on desktop.
  return (
    <ul className="divide-y divide-dashed divide-[#e4dad2] md:grid md:grid-cols-2 md:gap-3 md:divide-y-0 lg:grid-cols-3 dark:divide-[#40353c]">
      {filtered.map((exercise) => (
        <li
          key={exercise.id}
          className="group hover:bg-muted/50 relative flex items-center transition-colors md:bg-card md:rounded-2xl md:border md:hover:border-[#d6c8bd] md:hover:bg-card"
        >
          <button
            type="button"
            className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3 text-left md:py-4"
            onClick={() => openEdit(exercise)}
          >
            {/* Only useful under "All", where rows mix categories. */}
            {category === null ? (
              <span className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-full">
                <CategoryIcon category={exercise.category} className="size-4" />
              </span>
            ) : null}
            <span className="min-w-0 flex-1">
              <span className="md:font-heading block truncate font-semibold md:text-base">
                {exercise.name}
              </span>
              <span className="text-muted-foreground block text-xs">{exercise.category}</span>
            </span>
            <ChevronRight className="text-muted-foreground hidden size-4 shrink-0 md:block" />
          </button>
          <DeleteIconButton
            className="mr-2 hidden transition-[opacity,background-color,color] group-hover:opacity-100 focus-visible:opacity-100 md:inline-flex md:opacity-0"
            aria-label={`Delete ${exercise.name}`}
            disabled={remove.isPending}
            onClick={() => void onDelete(exercise)}
          />
        </li>
      ))}
    </ul>
  );
}
