import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Link } from '@tanstack/react-router';
import { GripVertical, Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { WorkoutTemplate } from '@gym-bro/shared';

import { useDeleteTemplate } from '../hooks/use-delete-template';
import { useTemplateUiStore } from '../stores/template-ui.store';

interface TemplateRowProps {
  template: WorkoutTemplate;
}

// One sortable template row. The grip is the only drag affordance (so taps and
// list scrolling on touch don't start a drag); edit/delete sit on the right.
export function TemplateRow({ template }: TemplateRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: template.id,
  });
  const openEdit = useTemplateUiStore((s) => s.openEdit);
  const remove = useDeleteTemplate();

  function onDelete() {
    if (window.confirm(`Delete "${template.name}"? This removes its exercises too.`)) {
      remove.mutate(template.id);
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
        aria-label={`Reorder ${template.name}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="mx-auto size-4" />
      </button>

      <Link
        to="/templates/$templateId"
        params={{ templateId: template.id }}
        className="min-w-0 flex-1"
      >
        <p className="truncate font-medium">{template.name}</p>
        {template.description ? (
          <p className="text-muted-foreground truncate text-sm">{template.description}</p>
        ) : null}
      </Link>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-11 shrink-0"
        aria-label={`Edit ${template.name}`}
        onClick={() => openEdit(template)}
      >
        <Pencil className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-destructive size-11 shrink-0"
        aria-label={`Delete ${template.name}`}
        disabled={remove.isPending}
        onClick={onDelete}
      >
        <Trash2 className="size-4" />
      </Button>
    </li>
  );
}
