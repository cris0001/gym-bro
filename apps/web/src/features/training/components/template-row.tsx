import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Link } from '@tanstack/react-router';
import { GripVertical, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { useConfirm } from '@/stores/confirm.store';
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
  const confirm = useConfirm();

  async function onDelete() {
    const ok = await confirm({
      title: `Delete "${template.name}"?`,
      description: 'This removes its exercises too.',
      confirmText: 'Delete',
      destructive: true,
    });
    if (ok) remove.mutate(template.id, { onSuccess: () => toast.success('Template deleted') });
  }

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'flex items-center gap-2.5 border-t border-dashed border-[#e5d9c6] bg-card py-[11px] dark:border-[#41362a]',
        isDragging && 'opacity-50',
      )}
    >
      <button
        type="button"
        className="shrink-0 cursor-grab touch-none p-1 text-[#c9bda9] active:cursor-grabbing dark:text-[#5b4e3e]"
        aria-label={`Reorder ${template.name}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-[15px]" />
      </button>

      <Link
        to="/templates/$templateId"
        params={{ templateId: template.id }}
        className="min-w-0 flex-1"
      >
        <p className="truncate text-[13.5px] font-semibold">{template.name}</p>
        {template.description ? (
          <p className="text-muted-foreground truncate text-[11.5px]">{template.description}</p>
        ) : null}
      </Link>

      <button
        type="button"
        className="shrink-0 p-1.5 text-[#c9bda9] dark:text-[#5b4e3e]"
        aria-label={`Edit ${template.name}`}
        onClick={() => openEdit(template)}
      >
        <Pencil className="size-[14px]" />
      </button>
      <button
        type="button"
        className="shrink-0 p-1.5 text-[#c9bda9] disabled:opacity-50 dark:text-[#5b4e3e]"
        aria-label={`Delete ${template.name}`}
        disabled={remove.isPending}
        onClick={() => void onDelete()}
      >
        <Trash2 className="size-[14px]" />
      </button>
    </li>
  );
}
