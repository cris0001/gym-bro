import { Dumbbell, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { DeleteIconButton } from '@/components/delete-icon-button';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useConfirm } from '@/stores/confirm.store';
import { EXERCISE_CATEGORIES, type Exercise, type ExerciseCategory } from '@gym-bro/shared';

import { useDeleteExercise } from '../hooks/use-delete-exercise';
import { useExercises } from '../hooks/use-exercises';
import { useExerciseUiStore } from '../stores/exercise-ui.store';
import { CategoryIcon } from '../utils/category-icon';
import { ExerciseListSkeleton } from './exercise-list-skeleton';

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
    return <ExerciseListSkeleton grouped={category === null} />;
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
          <Button type="button" className="h-9.5 rounded-full px-5" onClick={openCreate}>
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
    return (
      <p className="bg-card text-muted-foreground rounded-xl border p-4 text-sm">
        No exercises match your search.
      </p>
    );
  }

  // Under "All": one block per muscle group (canonical category order) so the
  // library reads by body part — two groups side by side from md, three from 1300px. A
  // picked category is a single block. Tap a row to edit; delete shows on hover (desktop).
  const groups = (category ? [category] : EXERCISE_CATEGORIES)
    .map((c) => ({ category: c, items: filtered.filter((exercise) => exercise.category === c) }))
    .filter((group) => group.items.length > 0);

  return (
    <div
      className={cn(
        'grid items-start gap-4',
        !category && 'md:grid-cols-2 min-[1300px]:grid-cols-3',
      )}
    >
      {groups.map((group) => (
        <section key={group.category} className="flex flex-col gap-2">
          <p className="text-subtle-foreground flex items-center gap-2 px-1 text-[13px] font-semibold tracking-[0.06em] uppercase">
            <CategoryIcon category={group.category} className="size-[18px]" />
            {group.category}
            <span className="text-muted-foreground font-medium">· {group.items.length}</span>
          </p>
          {/* Each exercise its own light row, spaced apart rather than divided. */}
          <ul className="flex flex-col gap-1.5">
            {group.items.map((exercise) => (
              <li
                key={exercise.id}
                className="group bg-card hover:border-border-strong flex items-center rounded-lg border pr-1.5 transition-colors"
              >
                <button
                  type="button"
                  className="min-w-0 flex-1 truncate px-3.5 py-2.5 text-left text-[15px] font-semibold"
                  onClick={() => openEdit(exercise)}
                >
                  {exercise.name}
                </button>
                <DeleteIconButton
                  className="hidden transition-[opacity,background-color,color] group-hover:opacity-100 focus-visible:opacity-100 md:inline-flex md:opacity-0"
                  aria-label={`Delete ${exercise.name}`}
                  disabled={remove.isPending}
                  onClick={() => void onDelete(exercise)}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
