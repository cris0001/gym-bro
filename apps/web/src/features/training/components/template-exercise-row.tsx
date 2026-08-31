import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

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

interface TemplateExerciseRowProps {
  templateExercise: TemplateExerciseWithExercise;
}

export function TemplateExerciseRow({ templateExercise }: TemplateExerciseRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: templateExercise.id,
  });
  const openEdit = useTemplateExerciseUiStore((s) => s.openEdit);
  const remove = useDeleteTemplateExercise();
  const confirm = useConfirm();

  const { exercise } = templateExercise;
  const targets = formatTargets(templateExercise);
  const meta = [exercise.category, targets].filter(Boolean).join(' · ');

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
        'flex items-center gap-2.5 border-t border-dashed border-[#e4dad2] bg-card py-[11px] dark:border-[#40353c]',
        isDragging && 'opacity-50',
      )}
    >
      <button
        type="button"
        className="shrink-0 cursor-grab touch-none p-1 text-[#c9bcb2] active:cursor-grabbing dark:text-[#5a4d55]"
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

      <button
        type="button"
        className="shrink-0 p-1.5 text-[#c9bcb2] dark:text-[#5a4d55]"
        aria-label={`Edit ${exercise.name}`}
        onClick={() => openEdit(templateExercise)}
      >
        <Pencil className="size-[14px]" />
      </button>
      <button
        type="button"
        className="shrink-0 p-1.5 text-[#c9bcb2] disabled:opacity-50 dark:text-[#5a4d55]"
        aria-label={`Remove ${exercise.name}`}
        disabled={remove.isPending}
        onClick={() => void onDelete()}
      >
        <Trash2 className="size-[14px]" />
      </button>
    </li>
  );
}
