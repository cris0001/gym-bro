import { Pencil, Plus } from 'lucide-react';

import { useNutritionTranslation } from '../i18n';
import { type AddEntryRow, defaultPortion } from '../utils/add-entry-list';

// One row of the results list: photo, name, meta line, and a split pill — the left half
// logs the portion it names (the one this item was last logged at, else its default),
// the pencil half opens the portion editor. Tapping the row body opens the editor too.
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
  const portion = defaultPortion(row);
  const portionLabel = `${Number(portion.quantity.toFixed(2))} ${t.addEntry.unitShort[portion.unit]}`;

  return (
    <div className="flex items-center gap-3 px-3.5 py-3">
      <button
        type="button"
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
        onClick={onEditPortion}
      >
        {row.imageUrl ? (
          <img
            src={row.imageUrl}
            alt=""
            className="border-border size-[38px] shrink-0 rounded-[10px] border object-cover"
          />
        ) : (
          <span className="size-[38px] shrink-0 rounded-[10px] bg-gradient-to-br from-[#efe0e4] to-[#cbaab3] dark:from-[#2c1f25] dark:to-[#3d363a]" />
        )}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13.5px] leading-tight font-semibold">
            {row.name}
          </span>
          <span className="text-muted-foreground mt-0.5 block truncate text-[11.5px]">
            {row.meta}
          </span>
        </span>
      </button>

      <div className="bg-accent text-primary flex h-[30px] shrink-0 items-stretch overflow-hidden rounded-full">
        <button
          type="button"
          aria-label={t.addEntry.addItemAria(row.name, portionLabel)}
          className="hover:bg-primary/10 flex items-center gap-[3px] pr-2 pl-2.5 text-[12px] font-bold whitespace-nowrap transition-colors disabled:opacity-50"
          disabled={disabled}
          onClick={onAdd}
        >
          <Plus className="size-3" strokeWidth={2.6} />
          {portionLabel}
        </button>
        <span aria-hidden className="bg-primary/20 my-[7px] w-px" />
        <button
          type="button"
          aria-label={t.addEntry.choosePortionAria(row.name)}
          className="hover:bg-primary/10 flex items-center pr-[9px] pl-[7px] transition-colors"
          onClick={onEditPortion}
        >
          <Pencil className="size-[13px]" />
        </button>
      </div>
    </div>
  );
}
