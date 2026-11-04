import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Link } from '@tanstack/react-router';
import { ChevronRight, GripVertical, Pencil } from 'lucide-react';
import { toast } from 'sonner';

import { DeleteIconButton } from '@/components/delete-icon-button';
import { cn } from '@/lib/utils';
import { useConfirm } from '@/stores/confirm.store';
import type { WorkoutTemplate } from '@gym-bro/shared';

import { useDeleteTemplate } from '../hooks/use-delete-template';
import { useTemplateUiStore } from '../stores/template-ui.store';

interface TemplateRowProps {
  template: WorkoutTemplate;
  // Desktop workspace: the template whose exercises are open in the next column.
  selected?: boolean;
  // 'list' (mobile plan page): dashed-divider rows on the card. 'column' (desktop
  // workspace): each template its own bordered card on the tinted column; the open one
  // gets an accent border, a lift and a chevron pointing at its exercises.
  variant?: 'list' | 'column';
}

// One sortable template row. The grip is the only drag affordance (so taps and
// list scrolling on touch don't start a drag); edit/delete sit on the right.
export function TemplateRow({ template, selected = false, variant = 'list' }: TemplateRowProps) {
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
        'flex items-center gap-2.5',
        variant === 'list'
          ? 'border-t border-dashed border-border bg-card py-[11px] first:border-t-0'
          : 'rounded-xl border px-2 py-2.5 transition-colors',
        variant === 'column' &&
          (selected
            ? 'border-primary/45 bg-card shadow-[0_1px_3px_rgb(43_33_38/0.08)]'
            : 'border-border bg-card/70 hover:bg-card'),
        isDragging && 'opacity-50',
      )}
    >
      <button
        type="button"
        className="shrink-0 cursor-grab touch-none p-1 text-faint-foreground active:cursor-grabbing"
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
        <p className="flex min-w-0 items-center gap-1.5 text-[13.5px] font-semibold">
          <span className="truncate">{template.name}</span>
          {template.shortName ? (
            <span
              className={cn(
                'shrink-0 rounded-md px-1.5 py-px text-[10px] font-bold',
                selected ? 'bg-accent text-accent-foreground' : 'bg-muted text-subtle-foreground',
              )}
            >
              {template.shortName}
            </span>
          ) : null}
        </p>
        {template.description ? (
          <p className="text-muted-foreground truncate text-[11.5px]">{template.description}</p>
        ) : null}
      </Link>

      {/* Desktop column: the template is edited from its Edit pill in the next column. */}
      {variant === 'list' ? (
        <button
          type="button"
          className="shrink-0 p-1.5 text-faint-foreground"
          aria-label={`Edit ${template.name}`}
          onClick={() => openEdit(template)}
        >
          <Pencil className="size-[14px]" />
        </button>
      ) : null}
      <DeleteIconButton
        aria-label={`Delete ${template.name}`}
        disabled={remove.isPending}
        onClick={() => void onDelete()}
      />
      {variant === 'column' && selected ? (
        <ChevronRight className="text-primary size-4 shrink-0" />
      ) : null}
    </li>
  );
}
