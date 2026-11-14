import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { toast } from 'sonner';

import { DeleteIconButton } from '@/components/delete-icon-button';
import { EditIconButton } from '@/components/edit-icon-button';
import { cn } from '@/lib/utils';
import { useConfirm } from '@/stores/confirm.store';
import type { TemplateExerciseWithExercise } from '@gym-bro/shared';

import { useDeleteTemplateExercise } from '../hooks/use-delete-template-exercise';
import { useTemplateExerciseUiStore } from '../stores/template-exercise-ui.store';

// Human-readable target summary, e.g. "4 sets · 8–12 reps". Returns '' when no
// targets are set so the row just shows the exercise name.
function formatTargets(te: TemplateExerciseWithExercise): string {
  const parts: string[] = [];
  if (te.targetSets != null) parts.push(`${te.targetSets} sets`);
  if (te.targetRepsMin != null && te.targetRepsMax != null) {
    parts.push(`${te.targetRepsMin}–${te.targetRepsMax} reps`);
  } else if (te.targetRepsMin != null) {
    parts.push(`${te.targetRepsMin} reps`);
  } else if (te.targetRepsMax != null) {
    parts.push(`${te.targetRepsMax} reps`);
  }
  return parts.join(' · ');
}

// The desktop table's Target cell: "3 × 6–10", "3 sets", "8–12 reps", or "—".
function compactTarget(te: TemplateExerciseWithExercise): string {
  const min = te.targetRepsMin;
  const max = te.targetRepsMax;
  const reps = min != null && max != null && min !== max ? `${min}–${max}` : (min ?? max);
  if (te.targetSets != null && reps != null) return `${te.targetSets} × ${reps}`;
  if (te.targetSets != null) return `${te.targetSets} sets`;
  if (reps != null) return `${reps} reps`;
  return '—';
}

interface TemplateExerciseRowProps {
  templateExercise: TemplateExerciseWithExercise;
  // 'table' (desktop workspace): targets move into their own serif Target column.
  variant?: 'list' | 'table';
}

export function TemplateExerciseRow({
  templateExercise,
  variant = 'list',
}: TemplateExerciseRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: templateExercise.id,
  });
  const openEdit = useTemplateExerciseUiStore((s) => s.openEdit);
  const remove = useDeleteTemplateExercise();
  const confirm = useConfirm();

  const { exercise } = templateExercise;
  const targets = formatTargets(templateExercise);
  const meta = [exercise.category, variant === 'list' ? targets : ''].filter(Boolean).join(' · ');

  async function onDelete() {
    const ok = await confirm({
      title: `Remove "${exercise.name}"?`,
      description: 'It will be removed from this template.',
      confirmText: 'Remove',
      destructive: true,
    });
    if (ok) {
      remove.mutate(
        { id: templateExercise.id, templateId: templateExercise.workoutTemplateId },
        { onSuccess: () => toast.success('Exercise removed') },
      );
    }
  }

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'flex items-center gap-2.5',
        // List: dividers in one card. Table (desktop workspace): each row its
        // own small card, matching the template rows in the middle column.
        variant === 'list'
          ? 'border-t border-border bg-card py-[11px] first:border-t-0'
          : 'border-border bg-card/70 hover:bg-card rounded-lg border px-2 py-2.5 transition-colors',
        isDragging && 'opacity-50',
      )}
    >
      <button
        type="button"
        className="shrink-0 cursor-grab touch-none p-1 text-faint-foreground active:cursor-grabbing"
        aria-label={`Reorder ${exercise.name}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-[15px]" />
      </button>

      <div className={cn('min-w-0 flex-1', !exercise.isActive && 'opacity-50')}>
        <p className="truncate text-[13.5px] font-semibold">
          {exercise.name}
          {!exercise.isActive ? (
            <span className="text-muted-foreground font-normal"> (deleted)</span>
          ) : null}
        </p>
        {meta ? <p className="text-muted-foreground text-[11.5px]">{meta}</p> : null}
        {templateExercise.notes ? (
          <p className="text-muted-foreground truncate text-[11.5px] italic">
            {templateExercise.notes}
          </p>
        ) : null}
      </div>

      {variant === 'table' ? (
        // Hidden under 1250px: the column is narrow there and would truncate names.
        <span className="font-heading hidden w-24 shrink-0 text-[15px] font-semibold tabular-nums min-[1250px]:block">
          {compactTarget(templateExercise)}
        </span>
      ) : null}

      {/* Edit + delete as one tight pair (the row's own gap would space them apart). */}
      <div className="flex shrink-0 items-center gap-0.5">
        <EditIconButton
          aria-label={`Edit ${exercise.name}`}
          onClick={() => openEdit(templateExercise)}
        />
        <DeleteIconButton
          aria-label={`Remove ${exercise.name}`}
          disabled={remove.isPending}
          onClick={() => void onDelete()}
        />
      </div>
    </li>
  );
}
