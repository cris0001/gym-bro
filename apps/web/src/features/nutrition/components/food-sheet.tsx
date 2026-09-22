import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

import { useNutritionTranslation } from '../i18n';
import { useFoodUiStore } from '../stores/food-ui.store';
import { FoodForm } from './food-form';

// Bottom-sheet host for the food create/edit form. The form is keyed by the
// edited id (or 'new') so switching rows resets its default values.
export function FoodSheet() {
  const t = useNutritionTranslation();
  const open = useFoodUiStore((s) => s.open);
  const editing = useFoodUiStore((s) => s.editing);
  const prefill = useFoodUiStore((s) => s.prefill);
  const onCreated = useFoodUiStore((s) => s.onCreated);
  const close = useFoodUiStore((s) => s.close);

  return (
    <Sheet open={open} onOpenChange={(next) => !next && close()}>
      <SheetContent side="bottom" className="gap-0">
        <SheetHeader>
          <SheetTitle>
            {editing ? t.foods.editFood : prefill ? t.foods.addProduct : t.foods.newFood}
          </SheetTitle>
          <SheetDescription>
            {editing ? t.foods.editDesc : prefill ? t.foods.prefillDesc : t.foods.newDesc}
          </SheetDescription>
        </SheetHeader>
        <FoodForm
          key={editing?.id ?? prefill?.ean ?? 'new'}
          editing={editing}
          prefill={prefill}
          onCreated={onCreated ?? undefined}
          onSuccess={close}
        />
      </SheetContent>
    </Sheet>
  );
}
