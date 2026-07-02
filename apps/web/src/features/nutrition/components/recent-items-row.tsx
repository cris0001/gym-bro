import { Button } from '@/components/ui/button';

import type { MealType, RecentDiaryItem } from '@gym-bro/shared';

import { useRecentDiaryItems } from '../hooks/use-recent-diary-items';

// Quick re-add chips for a meal: the items logged most often for it lately, each
// tapped to log it in one go with its last-used portion. Renders nothing when
// there's no history yet.
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
  if (recent.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-muted-foreground text-xs">Recent</span>
      <div className="flex flex-wrap gap-1.5">
        {recent.map((item) => (
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
