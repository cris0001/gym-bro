import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { useTagUiStore } from '../stores/tag-ui.store';
import { TagList } from './tag-list';
import { TagSheet } from './tag-sheet';

// The Tags screen: a header with the Add action, the list, and the create/edit
// Sheet (which reads its own open state from the UI store).
export function TagsPage() {
  const openCreate = useTagUiStore((s) => s.openCreate);

  return (
    <div className="mx-auto lg:col-span-3 flex w-full max-w-4xl flex-col gap-4 p-3 md:p-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="font-heading text-[28px] leading-none font-medium">Tags</h1>
        <Button type="button" className="h-11 rounded-full px-5" onClick={openCreate}>
          <Plus className="size-4" />
          Add
        </Button>
      </div>

      <div className="bg-card overflow-hidden rounded-2xl border">
        <TagList />
      </div>
      <TagSheet />
    </div>
  );
}
