import { Pencil, Plus, Tag, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ListSkeleton } from '@/components/list-skeleton';
import { Button } from '@/components/ui/button';
import { useConfirm } from '@/stores/confirm.store';
import type { WorkoutTag } from '@gym-bro/shared';

import { useDeleteTag } from '../hooks/use-delete-tag';
import { useTags } from '../hooks/use-tags';
import { useTagUiStore } from '../stores/tag-ui.store';

// The workout-tag list: read state via TanStack Query, edit through the UI
// store's Sheet, delete with a confirm. Add is owned by the page header.
export function TagList() {
  const { data: tags, isPending, isError, error, refetch } = useTags();
  const openEdit = useTagUiStore((s) => s.openEdit);
  const openCreate = useTagUiStore((s) => s.openCreate);
  const remove = useDeleteTag();
  const confirm = useConfirm();

  if (isPending) {
    return <ListSkeleton />;
  }

  if (isError) {
    return <ErrorState message={error.message} onRetry={() => void refetch()} />;
  }

  if (tags.length === 0) {
    return (
      <EmptyState
        icon={<Tag className="size-6" />}
        title="No tags yet"
        description="Add tags to label and color-code your workouts on the calendar."
        action={
          <Button type="button" className="h-11" onClick={openCreate}>
            <Plus className="size-4" />
            Add tag
          </Button>
        }
      />
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
