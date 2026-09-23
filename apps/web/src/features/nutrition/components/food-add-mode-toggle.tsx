import { Barcode, Pencil } from 'lucide-react';

import { cn } from '@/lib/utils';

import { useNutritionTranslation } from '../i18n';

export type FoodAddMode = 'manual' | 'scan';

interface FoodAddModeToggleProps {
  value: FoodAddMode;
  onChange: (mode: FoodAddMode) => void;
}

// Segmented switch at the top of the add-food sheet: type the food in by hand, or
// scan its barcode right there in the sheet.
export function FoodAddModeToggle({ value, onChange }: FoodAddModeToggleProps) {
  const t = useNutritionTranslation();
  const options = [
    { mode: 'manual', label: t.barcode.modeManual, Icon: Pencil },
    { mode: 'scan', label: t.barcode.modeScan, Icon: Barcode },
  ] as const;

  return (
    <div role="tablist" className="grid grid-cols-2 gap-1 rounded-full bg-secondary p-1">
      {options.map(({ mode, label, Icon }) => {
        const selected = value === mode;
        return (
          <button
            key={mode}
            type="button"
            role="tab"
            aria-selected={selected}
            className={cn(
              'inline-flex h-[38px] items-center justify-center gap-2 rounded-full text-[13.5px] transition-colors',
              selected
                ? 'bg-card dark:bg-border font-bold text-foreground shadow-[0_1px_3px_rgba(43,33,38,0.12)]'
                : 'font-semibold text-[#7a6c72] dark:text-[#9c9097]',
            )}
            onClick={() => onChange(mode)}
          >
            <Icon className="size-3.5" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
