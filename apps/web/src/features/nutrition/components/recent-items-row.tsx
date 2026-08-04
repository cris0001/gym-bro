import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';

import type { MealType, RecentDiaryItem } from '@gym-bro/shared';

import { useRecentDiaryItems } from '../hooks/use-recent-diary-items';

// Quick re-add chips for a meal: the last-used items for it (most recent first, all
// history), each tapped to log it in one go with its last-used portion. Renders
// nothing when there's no history yet.
//
// The order is FROZEN while the sheet is open: logging an item re-fetches this list and
// would otherwise jump the just-added item to the front, reshuffling the row under your
// finger (a tap for a second item then lands on the wrong chip). We snapshot the order
// on first load and reset it only when the meal changes (i.e. the sheet reopens).
export function RecentItemsRow({
  meal,
  onPick,
  disabled = false,
}: {
  meal: MealType;
  onPick: (item: RecentDiaryItem) => void;
  disabled?: boolean;
}) {
  const { data: recent = [] } = useRecentDiaryItems(meal);
  const [items, setItems] = useState<RecentDiaryItem[]>([]);

  useEffect(() => {
    setItems([]);
  }, [meal]);
  useEffect(() => {
    if (recent.length > 0) setItems((prev) => (prev.length === 0 ? recent : prev));
  }, [recent]);

  if (items.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-muted-foreground text-xs">Recent</span>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <Button
            key={`${item.type}-${item.id}`}
            type="button"
            variant="outline"
            size="sm"
            className="h-8"
            disabled={disabled}
            onClick={() => onPick(item)}
          >
            {item.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
