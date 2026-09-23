import { useNutritionTranslation } from '../i18n';
import { useFoodUiStore } from '../stores/food-ui.store';
import { FoodForm } from './food-form';

// Desktop-only right pane of the Foods master-detail: an always-visible form card. With
// no row selected it's a blank "New food" form (the default); selecting a food in the
// list loads it here for editing. Mobile uses FoodSheet (a bottom-sheet modal) instead
// — both read the same food UI store, so a row's openEdit drives whichever is mounted.
export function FoodDetailPanel() {
  const t = useNutritionTranslation();
  const editing = useFoodUiStore((s) => s.editing);
  const prefill = useFoodUiStore((s) => s.prefill);
  const close = useFoodUiStore((s) => s.close);

  return (
    <div className="sticky top-4 overflow-hidden rounded-[20px] border border-border bg-card">
      {/* Keyed so switching rows (or back to "new") resets the form's default values.
          The panel layout renders its own header (photo + title) inside the form. */}
      <FoodForm
        key={editing?.id ?? prefill?.ean ?? 'new'}
        editing={editing}
        prefill={prefill}
        onSuccess={close}
        layout="panel"
        panelTitle={editing ? t.foods.editFood : t.foods.newFood}
        panelDescription={editing ? t.foods.editDesc : t.foods.newDesc}
      />
    </div>
  );
}
