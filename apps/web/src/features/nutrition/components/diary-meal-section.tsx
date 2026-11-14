import { Plus, WandSparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { sumMacros } from '@gym-bro/shared';
import type { FoodLogEntry, MealType } from '@gym-bro/shared';

import { useNutritionTranslation } from '../i18n';
import { useDiaryUiStore } from '../stores/diary-ui.store';
import { usePendingFoodLogEntries } from '../hooks/use-pending-food-log-entries';
import { DiaryEntryRow } from './diary-entry-row';
import { PendingFoodLogRow } from './pending-food-log-row';

interface MealSectionProps {
  meal: MealType;
  label: string;
  loggedDate: string;
  entries: FoodLogEntry[];
}

// One meal's section of the diary: a header with the meal's kcal subtotal and add
// actions (camera → photo estimate, plus → add sheet), then its entries separated by
// divider rules. An empty meal reads as an outlined "Nothing yet" card.
export function MealSection({ meal, label, loggedDate, entries }: MealSectionProps) {
  // Entries added offline / still retrying — shown under the synced ones until they land.
  const pending = usePendingFoodLogEntries(loggedDate, meal);
  const t = useNutritionTranslation();
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
        aria-label={t.addEntry.addFromPhoto(label)}
        onClick={() => openPhoto(meal)}
      >
        <WandSparkles className="size-5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-primary hover:bg-accent size-9"
        aria-label={t.addEntry.addTo(label)}
        onClick={() => openAdd(meal)}
      >
        <Plus className="size-5" />
      </Button>
    </div>
  );

  if (entries.length === 0 && pending.length === 0) {
    return (
      <div className="bg-card flex items-center justify-between gap-2 rounded-xl border border-border p-4">
        <div className="flex items-baseline gap-2">
          <h2 className="font-heading text-lg font-semibold">{label}</h2>
          <span className="text-muted-foreground text-sm">{t.diary.nothingYet}</span>
        </div>
        {actions}
      </div>
    );
  }

  return (
    <div className="bg-card flex flex-col rounded-xl border p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <h2 className="font-heading text-lg font-semibold">{label}</h2>
          {/* The meal kcal is hidden under 450px — long meal names need the room. */}
          <span className="text-primary hidden text-sm font-medium min-[450px]:inline">
            {kcal} kcal
          </span>
        </div>
        {actions}
      </div>
      <ul className="mt-1 flex flex-col divide-y divide-border">
        {entries.map((entry) => (
          <DiaryEntryRow key={entry.id} entry={entry} />
        ))}
        {pending.map((variables) => (
          <PendingFoodLogRow key={variables.id} variables={variables} />
        ))}
      </ul>
    </div>
  );
}
