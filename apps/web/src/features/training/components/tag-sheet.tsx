import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

import { useTagUiStore } from '../stores/tag-ui.store';
import { TagForm } from './tag-form';

// Bottom sheet hosting the create/edit form. Open state and the target row come
// from the UI store. The form is keyed by the editing id so it remounts with
// fresh defaults each time the sheet opens for a different tag.
export function TagSheet() {
  const open = useTagUiStore((s) => s.open);
  const editing = useTagUiStore((s) => s.editing);
  const close = useTagUiStore((s) => s.close);

  return (
    <Sheet open={open} onOpenChange={(next) => !next && close()}>
      <SheetContent side="bottom" className="gap-0">
        <SheetHeader>
          <SheetTitle>{editing ? 'Edit tag' : 'New tag'}</SheetTitle>
          <SheetDescription>
            {editing ? 'Update the name or color.' : 'Add a tag to label your workouts.'}
          </SheetDescription>
        </SheetHeader>

        <TagForm key={editing?.id ?? 'new'} editing={editing} onSuccess={close} />
      </SheetContent>
    </Sheet>
  );
}
