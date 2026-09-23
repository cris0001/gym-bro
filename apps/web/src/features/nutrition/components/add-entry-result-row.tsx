import { Plus } from 'lucide-react';

import { cn } from '@/lib/utils';

import { useNutritionTranslation } from '../i18n';
import type { AddEntryRow } from '../utils/add-entry-list';

// One row of the results list: photo, name (+ RECENT badge), meta line, and a round
// "+" that logs it with its default portion. Tapping the row body (not the +) opens the
// portion editor before adding.
export function AddEntryResultRow({
  row,
  onAdd,
  onEditPortion,
  disabled = false,
  badgeTint = false,
}: {
  row: AddEntryRow;
  onAdd: () => void;
  onEditPortion: () => void;
  disabled?: boolean;
  // RECENT badge on the accent tint (desktop) instead of solid primary (mobile default).
  badgeTint?: boolean;
}) {
  const t = useNutritionTranslation();
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
          <span className="flex items-center gap-1.5">
            <span className="truncate text-[13.5px] leading-tight font-semibold">{row.name}</span>
            {row.isRecent ? (
              <span
                className={cn(
                  'shrink-0 rounded-[5px] px-[5px] py-0.5 text-[9px] font-extrabold tracking-wide uppercase',
                  badgeTint
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-primary text-primary-foreground',
                )}
              >
                {t.addEntry.recent}
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
        aria-label={t.addEntry.addItemAria(row.name)}
        className="bg-accent text-primary hover:bg-accent/70 flex size-[34px] shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-50"
        disabled={disabled}
        onClick={onAdd}
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
