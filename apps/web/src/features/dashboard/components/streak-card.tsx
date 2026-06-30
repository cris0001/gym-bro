import { Flame } from 'lucide-react';

import { MIN_WORKOUTS_PER_WEEK } from '../utils/compute-weekly-streak';

interface StreakCardProps {
  streak: number;
  thisWeekCount: number;
}

// Weekly workout streak: consecutive weeks with ≥2 workouts, plus this week's
// progress toward keeping it alive.
export function StreakCard({ streak, thisWeekCount }: StreakCardProps) {
  return (
    <div className="bg-card flex flex-col gap-2 rounded-xl border p-4">
      <div className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
        <Flame className="size-5 text-orange-500" />
        Streak
      </div>
      <span className="text-3xl font-bold">
        {streak} {streak === 1 ? 'week' : 'weeks'}
      </span>
      <span className="text-muted-foreground text-xs">
        {thisWeekCount >= MIN_WORKOUTS_PER_WEEK
          ? `${thisWeekCount} workouts this week — keep it going!`
          : `This week: ${thisWeekCount}/${MIN_WORKOUTS_PER_WEEK} to keep your streak`}
      </span>
    </div>
  );
}
