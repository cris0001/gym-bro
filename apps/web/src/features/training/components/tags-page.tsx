import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { PageTitle } from '@/components/page-title';

import { useTagUiStore } from '../stores/tag-ui.store';
import { TagList } from './tag-list';
import { TagSheet } from './tag-sheet';

// The Tags screen: a header with the Add action, the list, and the create/edit
// Sheet (which reads its own open state from the UI store).
export function TagsPage() {
  const openCreate = useTagUiStore((s) => s.openCreate);

  return (
    <div className="flex w-full flex-col gap-4 p-3 md:p-4 max-w-6xl lg:col-start-2">
      <div className="flex items-center justify-between gap-2">
        <PageTitle className="font-heading text-[28px] leading-none font-bold tracking-tight">
          Tags
        </PageTitle>
        <Button type="button" className="h-9.5 rounded-full px-5" onClick={openCreate}>
          <Plus className="size-4" />
          Add
        </Button>
      </div>

      <div className="bg-card overflow-hidden rounded-xl border lg:overflow-visible lg:rounded-none lg:border-0 lg:bg-transparent">
        <TagList />
      </div>
      <TagSheet />
    </div>
  );
}
