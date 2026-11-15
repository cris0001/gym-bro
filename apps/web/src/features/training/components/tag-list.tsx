import { Plus, Tag } from 'lucide-react';
import { toast } from 'sonner';

import { DeleteIconButton } from '@/components/delete-icon-button';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { SkeletonList } from '@/components/skeletons';
import { Button } from '@/components/ui/button';
import { useConfirm } from '@/stores/confirm.store';
import type { WorkoutTag } from '@gym-bro/shared';

import { useDeleteTag } from '../hooks/use-delete-tag';
import { useTags } from '../hooks/use-tags';
import { useTagUiStore } from '../stores/tag-ui.store';
import { useTrainingTranslation } from '../i18n';

// The workout-tag list: read state via TanStack Query, tap a row to edit it in the
// UI store's Sheet, delete with a confirm. Add is owned by the page header.
export function TagList() {
  const t = useTrainingTranslation();
  const { data: tags, isPending, isError, error, refetch } = useTags();
  const openEdit = useTagUiStore((s) => s.openEdit);
  const openCreate = useTagUiStore((s) => s.openCreate);
  const remove = useDeleteTag();
  const confirm = useConfirm();

  if (isPending) {
    return <SkeletonList />;
  }

  if (isError) {
    return <ErrorState message={error.message} onRetry={() => void refetch()} />;
  }

  if (tags.length === 0) {
    return (
      <EmptyState
        icon={<Tag className="size-6" />}
        title={t.tags.emptyTitle}
        description={t.tags.emptyBody}
        action={
          <Button type="button" className="h-9.5 rounded-full px-5" onClick={openCreate}>
            <Plus className="size-4" />
            {t.tags.add}
          </Button>
        }
      />
    );
  }

  async function onDelete(tag: WorkoutTag) {
    const ok = await confirm({
      title: t.common.deleteTitle(tag.name),
      description: t.tags.deleteBody,
      confirmText: t.common.delete,
      destructive: true,
    });
    if (ok) remove.mutate(tag.id, { onSuccess: () => toast.success(t.tags.deleted) });
  }

  return (
    // From lg (with the sidebar): a plain two-column grid of separate rows.
    <ul className="divide-y divide-border lg:grid lg:grid-cols-2 lg:gap-2 lg:divide-y-0">
      {tags.map((tag) => (
        <li
          key={tag.id}
          className="flex items-center gap-3 py-1 pr-4 transition-colors hover:bg-muted/50 lg:bg-card lg:rounded-lg lg:border"
        >
          {/* The whole row body opens the edit sheet; only delete stays a separate
              control. */}
          <button
            type="button"
            className="flex min-h-11 min-w-0 flex-1 cursor-pointer items-center gap-3 py-2 pl-4 text-left"
            aria-label={`Edit ${tag.name}`}
            onClick={() => openEdit(tag)}
          >
            <span
              className="size-4 shrink-0 rounded-full border"
              style={{ backgroundColor: tag.color }}
              aria-hidden
            />
            <span className="min-w-0 flex-1 truncate font-semibold">{tag.name}</span>
          </button>
          <DeleteIconButton
            aria-label={`Delete ${tag.name}`}
            disabled={remove.isPending}
            onClick={() => void onDelete(tag)}
          />
        </li>
      ))}
    </ul>
  );
}
