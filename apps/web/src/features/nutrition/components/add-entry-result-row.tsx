import { Pencil, Plus, RotateCcw } from 'lucide-react';

import { useNutritionTranslation } from '../i18n';
import {
  type AddEntryRow,
  defaultPortion,
  portionLabel as formatPortion,
  rowMeta,
} from '../utils/add-entry-list';
import { FoodThumb } from './food-thumb';

// One row of the results list: photo, name, meta line, and a split pill — the left half
// logs the portion it names (the one this item was last logged at, else its default),
// the pencil half opens the portion editor. Tapping the row body opens the editor too.
// The meta line describes the portion last logged (a small "repeat" arrow, no amount),
// else 100 g / one serving: its kcal everywhere, its macros from 470px up. Under 470px
// the add half is an icon only — the same "repeat" arrow when it re-adds the
// last-logged portion, a plus otherwise.
export function AddEntryResultRow({
  row,
  onAdd,
  onEditPortion,
  disabled = false,
}: {
  row: AddEntryRow;
  onAdd: () => void;
  onEditPortion: () => void;
  disabled?: boolean;
}) {
  const t = useNutritionTranslation();
  const portionLabel = formatPortion(defaultPortion(row), t.addEntry.unitShort);
  const AddIcon = row.lastUsed ? RotateCcw : Plus;
  const meta = rowMeta(row, t.addEntry.unitShort);

  return (
    <div className="flex items-center gap-2.5 px-3 py-2.5 min-[400px]:gap-3 min-[400px]:px-3.5 min-[400px]:py-3">
      <button
        type="button"
        className="flex min-w-0 flex-1 items-center gap-2.5 text-left min-[400px]:gap-3"
        onClick={onEditPortion}
      >
        <FoodThumb
          imageUrl={row.imageUrl}
          kind={row.kind === 'recipe' ? 'recipe' : 'food'}
          className="size-[38px]"
        />
        <span className="min-w-0 flex-1">
          {/* The whole name, wrapped — truncating hid what tells similar products apart. */}
          <span className="block text-[13.5px] leading-tight font-semibold [overflow-wrap:anywhere]">
            {row.name}
          </span>
          <span className="text-muted-foreground mt-0.5 block truncate text-[11.5px]">
            {/* Not in your foods yet — the first log adds it there. */}
            {row.kind === 'catalog' ? (
              <span className="text-primary font-semibold">{t.addEntry.fromCatalog} · </span>
            ) : null}
            {meta.fromLast ? (
              <RotateCcw
                aria-hidden
                className="mr-[3px] inline size-[11px] -translate-y-px"
                strokeWidth={2.4}
              />
            ) : null}
            {/* The last-logged portion is shown by the arrow alone, then its kcal; any
                other row names its 100 g / one-serving base. */}
            {meta.fromLast && meta.kcal
              ? meta.kcal
              : `${meta.portion}${meta.kcal ? ` · ${meta.kcal}` : ''}`}
            {meta.macros ? (
              <span className="hidden min-[470px]:inline"> · {meta.macros}</span>
            ) : null}
          </span>
        </span>
      </button>

      <div className="bg-accent text-primary flex h-[26px] shrink-0 items-stretch overflow-hidden rounded-full sm:h-[30px]">
        <button
          type="button"
          aria-label={t.addEntry.addItemAria(row.name, portionLabel)}
          title={portionLabel}
          className="hover:bg-primary/10 flex items-center gap-[2px] px-2 text-[11px] font-bold whitespace-nowrap transition-colors disabled:opacity-50 min-[470px]:pr-1.5 sm:gap-[3px] sm:pr-2 sm:pl-2.5 sm:text-[12px]"
          disabled={disabled}
          onClick={onAdd}
        >
          <AddIcon className="size-3.5 min-[470px]:hidden" strokeWidth={2.4} />
          <Plus className="hidden size-2.5 min-[470px]:block sm:size-3" strokeWidth={2.6} />
          <span className="hidden min-[470px]:inline">{portionLabel}</span>
        </button>
        <span aria-hidden className="bg-primary/20 my-[6px] w-px sm:my-[7px]" />
        <button
          type="button"
          aria-label={t.addEntry.choosePortionAria(row.name)}
          className="hover:bg-primary/10 flex items-center pr-[7px] pl-[5px] transition-colors sm:pr-[9px] sm:pl-[7px]"
          onClick={onEditPortion}
        >
          <Pencil className="size-[11px] sm:size-[13px]" />
        </button>
      </div>
    </div>
  );
}
