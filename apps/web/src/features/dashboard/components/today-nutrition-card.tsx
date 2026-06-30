import { Link } from '@tanstack/react-router';
import { UtensilsCrossed } from 'lucide-react';

import { Progress } from '@/components/ui/progress';
import { useCurrentTarget, useDailyFoodLog } from '@/features/nutrition';

// Today's calories against the current target, with a quick prompt to set one if
// there's no target yet.
export function TodayNutritionCard({ date }: { date: string }) {
  const { data: day } = useDailyFoodLog(date);
  const { data: target } = useCurrentTarget();

  const kcal = Math.round(day?.totals.kcal ?? 0);
  const targetKcal = target?.kcal ?? null;
  const pct = targetKcal ? Math.min(100, (kcal / targetKcal) * 100) : 0;

  return (
    <div className="bg-card flex flex-col gap-2 rounded-xl border p-4 transition-shadow hover:shadow-md">
      <div className="flex items-center gap-2 text-sm font-medium">
        <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
          <UtensilsCrossed className="size-4" />
        </span>
        <span className="text-muted-foreground">Today</span>
      </div>
      <span className="text-3xl font-bold">
        {kcal}
        <span className="text-muted-foreground text-base font-normal"> kcal</span>
      </span>
      {targetKcal !== null ? (
        <div className="flex flex-col gap-1">
          <Progress value={pct} className="bg-sky-500/15" indicatorClassName="bg-sky-500" />
          <span className="text-muted-foreground text-xs">
            {kcal} / {targetKcal} kcal
          </span>
        </div>
      ) : (
        <Link to="/targets" className="text-primary text-sm underline">
          Set a target
        </Link>
      )}
    </div>
  );
}
