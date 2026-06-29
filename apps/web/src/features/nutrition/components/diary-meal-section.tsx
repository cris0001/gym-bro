import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { sumMacros } from '@gym-bro/shared';
import type { FoodLogEntry, MealType } from '@gym-bro/shared';

import { useDiaryUiStore } from '../stores/diary-ui.store';
import { DiaryEntryRow } from './diary-entry-row';

interface MealSectionProps {
  meal: MealType;
  label: string;
  entries: FoodLogEntry[];
}

// One meal's section of the diary: a header with the meal's kcal subtotal and an
// add button (presets this meal), then its entries.
export function MealSection({ meal, label, entries }: MealSectionProps) {
  const openAdd = useDiaryUiStore((s) => s.openAdd);
  const kcal = Math.round(sumMacros(entries).kcal);

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <h2 className="font-semibold">{label}</h2>
          <span className="text-muted-foreground text-sm">{kcal} kcal</span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-9"
          aria-label={`Add to ${label}`}
          onClick={() => openAdd(meal)}
        >
          <Plus className="size-5" />
        </Button>
      </div>
      {entries.length === 0 ? (
        <p className="text-muted-foreground py-2 text-sm">Nothing logged.</p>
      ) : (
        <ul className="divide-y">
          {entries.map((entry) => (
            <DiaryEntryRow key={entry.id} entry={entry} />
          ))}
        </ul>
      )}
    </div>
  );
}
