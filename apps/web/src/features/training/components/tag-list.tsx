import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { useConfirm } from '@/stores/confirm.store';
import type { WorkoutTag } from '@gym-bro/shared';

import { useDeleteTag } from '../hooks/use-delete-tag';
import { useTags } from '../hooks/use-tags';
import { useTagUiStore } from '../stores/tag-ui.store';

// The workout-tag list: read state via TanStack Query, edit through the UI
// store's Sheet, delete with a confirm. Add is owned by the page header.
export function TagList() {
  const { data: tags, isPending, isError, error } = useTags();
  const openEdit = useTagUiStore((s) => s.openEdit);
  const remove = useDeleteTag();
  const confirm = useConfirm();

  if (isPending) {
    return <p className="text-muted-foreground p-4 text-sm">Loading tags…</p>;
  }

  if (isError) {
    return (
      <p role="alert" className="text-destructive p-4 text-sm">
        {error.message}
      </p>
    );
  }

  if (tags.length === 0) {
    return (
      <p className="text-muted-foreground p-4 text-sm">
        No tags yet. Add one to label and color-code your workouts.
      </p>
    );
  }

  async function onDelete(tag: WorkoutTag) {
    const ok = await confirm({
      title: `Delete "${tag.name}"?`,
      description: 'It will be removed from your tags.',
      confirmText: 'Delete',
      destructive: true,
    });
    if (ok) remove.mutate(tag.id, { onSuccess: () => toast.success('Tag deleted') });
  }

  return (
    <ul className="divide-y">
      {tags.map((tag) => (
        <li
          key={tag.id}
          className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
        >
          <span
            className="size-4 shrink-0 rounded-full border"
            style={{ backgroundColor: tag.color }}
            aria-hidden
          />
          <p className="min-w-0 flex-1 truncate font-medium">{tag.name}</p>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-11 shrink-0"
            aria-label={`Edit ${tag.name}`}
            onClick={() => openEdit(tag)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-destructive size-11 shrink-0"
            aria-label={`Delete ${tag.name}`}
            disabled={remove.isPending}
            onClick={() => void onDelete(tag)}
          >
            <Trash2 className="size-4" />
          </Button>
        </li>
      ))}
    </ul>
  );
}
