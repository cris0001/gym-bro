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
    <div className="mx-auto flex w-full max-w-2xl flex-col">
      <div className="flex items-center justify-between px-4 py-4">
        <h1 className="text-2xl font-bold">Tags</h1>
        <Button type="button" className="h-11" onClick={openCreate}>
          <Plus className="size-4" />
          Add
        </Button>
      </div>

      <TagList />
      <TagSheet />
    </div>
  );
}
