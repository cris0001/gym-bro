import { useFoodUiStore } from '../stores/food-ui.store';
import { FoodForm } from './food-form';

// Desktop-only right pane of the Foods master-detail: an always-visible form. With no
// row selected it's a blank "New food" form (the default); selecting a food in the
// list loads it here for editing. Mobile uses FoodSheet (a bottom-sheet modal) instead
// — both read the same food UI store, so a row's openEdit drives whichever is mounted.
export function FoodDetailPanel() {
  const editing = useFoodUiStore((s) => s.editing);
  const prefill = useFoodUiStore((s) => s.prefill);
  const close = useFoodUiStore((s) => s.close);

  return (
    <div className="bg-card sticky top-4 overflow-hidden rounded-2xl border">
      <div className="border-b p-4">
        <h2 className="font-heading text-lg font-semibold">{editing ? 'Edit food' : 'New food'}</h2>
        <p className="text-muted-foreground text-sm">
          {editing
            ? 'Update the name or macros.'
            : 'Add a food to your dictionary. Macros are per 100g.'}
        </p>
      </div>
      {/* Keyed so switching rows (or back to "new") resets the form's default values. */}
      <FoodForm
        key={editing?.id ?? prefill?.ean ?? 'new'}
        editing={editing}
        prefill={prefill}
        onSuccess={close}
      />
    </div>
  );
}
