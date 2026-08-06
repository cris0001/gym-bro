import { Link } from '@tanstack/react-router';

import { useCurrentTarget, useDailyFoodLog } from '@/features/nutrition';
import { MACRO_BAR, type MacroKey } from '@/features/nutrition/utils/macro-colors';
import { cn } from '@/lib/utils';

// The dashboard's nutrition hero: a calorie ring against today's target plus the three
// macro bars, replacing the old plain calorie card. Read-only summary of the diary.
export function TodayNutritionCard({ date }: { date: string }) {
  const { data: day } = useDailyFoodLog(date);
  const { data: target } = useCurrentTarget();

  const kcal = Math.round(day?.totals.kcal ?? 0);
  const targetKcal = target?.kcal ?? null;
  const left = targetKcal !== null ? Math.round(targetKcal - kcal) : null;

  return (
    <div className="bg-card flex flex-col gap-4 rounded-2xl border p-5">
      <p className="text-muted-foreground text-[11px] font-medium tracking-[0.08em] uppercase">
        Today&apos;s plate
      </p>

      {targetKcal === null ? (
        <div className="flex flex-col gap-2">
          <p className="font-heading text-2xl font-semibold">{kcal} kcal</p>
          <Link to="/targets" className="text-primary text-sm underline">
            Set a target
          </Link>
        </div>
      ) : (
        <div className="flex items-center gap-5">
          <CalorieRing kcal={kcal} target={targetKcal} />
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <MacroBar
              label="Protein"
              macro="protein"
              value={day?.totals.proteinG ?? 0}
              target={target?.proteinG ?? 0}
            />
            <MacroBar
              label="Carbs"
              macro="carbs"
              value={day?.totals.carbsG ?? 0}
              target={target?.carbsG ?? 0}
            />
            <MacroBar
              label="Fat"
              macro="fat"
              value={day?.totals.fatG ?? 0}
              target={target?.fatG ?? 0}
            />
            {left !== null ? (
              <span className="bg-accent text-accent-foreground w-fit rounded-full px-3 py-1 text-xs font-medium">
                {left >= 0 ? `${left} kcal left` : `${-left} kcal over`}
              </span>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

function CalorieRing({ kcal, target }: { kcal: number; target: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const pct = target > 0 ? Math.min(1, kcal / target) : 0;

  return (
    <svg
      viewBox="0 0 120 120"
      className="size-28 shrink-0 lg:size-32"
      role="img"
      aria-label="Calories"
    >
      <circle cx="60" cy="60" r={radius} fill="none" strokeWidth="10" className="stroke-muted" />
      <circle
        cx="60"
        cy="60"
        r={radius}
        fill="none"
        strokeWidth="10"
        strokeLinecap="round"
        className="stroke-primary"
        strokeDasharray={`${circumference * pct} ${circumference}`}
        transform="rotate(-90 60 60)"
      />
      <text
        x="60"
        y="60"
        textAnchor="middle"
        className="fill-foreground font-heading text-2xl font-semibold"
      >
        {kcal}
      </text>
      <text x="60" y="78" textAnchor="middle" className="fill-muted-foreground text-[11px]">
        / {target} kcal
      </text>
    </svg>
  );
}

function MacroBar({
  label,
  macro,
  value,
  target,
}: {
  label: string;
  macro: MacroKey;
  value: number;
  target: number;
}) {
  const pct = target > 0 ? Math.min(100, (value / target) * 100) : 0;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between text-xs">
        <span className="text-foreground font-medium">{label}</span>
        <span className="text-muted-foreground">
          {Math.round(value)} / {Math.round(target)} g
        </span>
      </div>
      <div className="bg-muted h-1.5 overflow-hidden rounded-full">
        <div className={cn('h-full rounded-full', MACRO_BAR[macro])} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
