import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

import { useFoodUiStore } from '../stores/food-ui.store';
import { FoodForm } from './food-form';

// Bottom-sheet host for the food create/edit form. The form is keyed by the
// edited id (or 'new') so switching rows resets its default values.
export function FoodSheet() {
  const open = useFoodUiStore((s) => s.open);
  const editing = useFoodUiStore((s) => s.editing);
  const close = useFoodUiStore((s) => s.close);

  return (
    <Sheet open={open} onOpenChange={(next) => !next && close()}>
      <SheetContent side="bottom" className="gap-0">
        <SheetHeader>
          <SheetTitle>{editing ? 'Edit food' : 'New food'}</SheetTitle>
          <SheetDescription>
            {editing
              ? 'Update the name or macros.'
              : 'Add a food to your dictionary. Macros are per 100g.'}
          </SheetDescription>
        </SheetHeader>
        <FoodForm key={editing?.id ?? 'new'} editing={editing} onSuccess={close} />
      </SheetContent>
    </Sheet>
  );
}
