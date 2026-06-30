import { Button } from '@/components/ui/button';

import type { MealType, RecentDiaryItem } from '@gym-bro/shared';

import { useRecentDiaryItems } from '../hooks/use-recent-diary-items';

// Quick re-add chips for the meal being added to: the items logged most often for
// it lately, tapped to pre-select the source. Renders nothing when there's no
// history yet.
export function RecentItemsRow({
  meal,
  onPick,
}: {
  meal: MealType;
  onPick: (item: RecentDiaryItem) => void;
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
            onClick={() => onPick(item)}
          >
            {item.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
