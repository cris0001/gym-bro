import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
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

  const { exercise } = templateExercise;
  const targets = formatTargets(templateExercise);

  function onDelete() {
    if (window.confirm(`Remove "${exercise.name}" from this template?`)) {
      remove.mutate({ id: templateExercise.id, templateId: templateExercise.workoutTemplateId });
    }
  }

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn('bg-background flex items-center gap-2 px-4 py-3', isDragging && 'opacity-50')}
    >
      <button
        type="button"
        className="text-muted-foreground size-11 shrink-0 cursor-grab touch-none active:cursor-grabbing"
        aria-label={`Reorder ${exercise.name}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="mx-auto size-4" />
      </button>

      <div className={cn('min-w-0 flex-1', !exercise.isActive && 'opacity-50')}>
        <p className="truncate font-medium">
          {exercise.name}
          {!exercise.isActive ? (
            <span className="text-muted-foreground font-normal"> (deleted)</span>
          ) : null}
        </p>
        <p className="text-muted-foreground text-sm">
          {[exercise.category, targets].filter(Boolean).join(' · ')}
        </p>
        {templateExercise.notes ? (
          <p className="text-muted-foreground truncate text-sm italic">{templateExercise.notes}</p>
        ) : null}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-11 shrink-0"
        aria-label={`Edit ${exercise.name}`}
        onClick={() => openEdit(templateExercise)}
      >
        <Pencil className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-destructive size-11 shrink-0"
        aria-label={`Remove ${exercise.name}`}
        disabled={remove.isPending}
        onClick={onDelete}
      >
        <Trash2 className="size-4" />
      </Button>
    </li>
  );
}
