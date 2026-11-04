import { CloudUpload } from 'lucide-react';

import { useNutritionTranslation } from '../i18n';
import type { CreateFoodLogVariables } from '../hooks/use-create-food-log-entry';

// A diary row for an entry that's queued to sync: its name and portion (from the
// preview stamped at add time), muted, with a "waiting to sync" note instead of
// macros — those are snapshotted server-side when it arrives.
export function PendingFoodLogRow({ variables }: { variables: CreateFoodLogVariables }) {
  const t = useNutritionTranslation();
  const name =
    variables.preview?.name ??
    (variables.type === 'custom' ? variables.name : t.addEntry.pendingItem);

  return (
    <li className="flex items-center gap-3 py-2.5 opacity-70">
      <CloudUpload className="text-muted-foreground size-4 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] font-semibold">{name}</p>
        <p className="text-muted-foreground text-[11.5px]">
          {variables.preview?.portion ? `${variables.preview.portion} · ` : ''}
          {t.addEntry.pendingSync}
        </p>
      </div>
    </li>
  );
}
