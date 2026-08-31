import { Camera, Plus } from 'lucide-react';

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

// One meal's section of the diary: a header with the meal's kcal subtotal and add
// actions (camera → photo estimate, plus → add sheet), then its entries separated by
// dashed rules. An empty meal reads as a dashed-outline "nothing yet" card.
export function MealSection({ meal, label, entries }: MealSectionProps) {
  const openAdd = useDiaryUiStore((s) => s.openAdd);
  const openPhoto = useDiaryUiStore((s) => s.openPhoto);
  const kcal = Math.round(sumMacros(entries).kcal);

  const actions = (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-primary hover:bg-accent size-9"
        aria-label={`Add to ${label} from a photo`}
        onClick={() => openPhoto(meal)}
      >
        <Camera className="size-5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-primary hover:bg-accent size-9"
        aria-label={`Add to ${label}`}
        onClick={() => openAdd(meal)}
      >
        <Plus className="size-5" />
      </Button>
    </div>
  );

  if (entries.length === 0) {
    return (
      <div className="bg-card flex items-center justify-between gap-2 rounded-2xl border border-dashed border-[#d6c8bd] p-4 dark:border-[#4b3f47]">
        <div className="flex items-baseline gap-2">
          <h2 className="font-heading text-lg font-semibold">{label}</h2>
          <span className="text-muted-foreground font-heading text-sm italic">nothing yet</span>
        </div>
        {actions}
      </div>
    );
  }

  return (
    <div className="bg-card flex flex-col rounded-2xl border p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <h2 className="font-heading text-lg font-semibold">{label}</h2>
          <span className="text-primary text-sm font-medium">{kcal} kcal</span>
        </div>
        {actions}
      </div>
      <ul className="mt-1 flex flex-col divide-y divide-dashed divide-[#d6c8bd] dark:divide-[#40353c]">
        {entries.map((entry) => (
          <DiaryEntryRow key={entry.id} entry={entry} />
        ))}
      </ul>
    </div>
  );
}
