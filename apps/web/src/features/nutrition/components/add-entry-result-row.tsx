import { Plus } from 'lucide-react';

import type { AddEntryRow } from '../utils/add-entry-list';

// One row of the results list: photo, name (+ RECENT badge), meta line, and a round
// "+" that logs it with its default portion. Tapping the row body (not the +) opens the
// portion editor before adding.
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
          <span className="size-[38px] shrink-0 rounded-[10px] bg-gradient-to-br from-[#e7d9c2] to-[#cdb88f] dark:from-[#3a2f22] dark:to-[#4a3d2d]" />
        )}
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className="truncate text-[13.5px] leading-tight font-semibold">{row.name}</span>
            {row.isRecent ? (
              <span className="bg-primary text-primary-foreground shrink-0 rounded-[5px] px-[5px] py-0.5 text-[9px] font-extrabold tracking-wide uppercase">
                Recent
              </span>
            ) : null}
          </span>
          <span className="text-muted-foreground mt-0.5 block truncate text-[11.5px]">
            {row.meta}
          </span>
        </span>
      </button>
      <button
        type="button"
        aria-label={`Add ${row.name}`}
        className="bg-accent text-primary hover:bg-accent/70 flex size-[34px] shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-50"
        disabled={disabled}
        onClick={onAdd}
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
