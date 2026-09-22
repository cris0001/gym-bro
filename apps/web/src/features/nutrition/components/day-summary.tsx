import { Link } from '@tanstack/react-router';

import type { MacroTotals } from '@gym-bro/shared';

import { useTargetForDate } from '../hooks/use-target-for-date';
import { useNutritionTranslation } from '../i18n';
import { MacroProgress } from './macro-progress';
import { MacrosSummary } from './macros-summary';

interface DaySummaryProps {
  totals: MacroTotals;
  date: string;
}

const fmt = (n: number): string => Math.round(n).toLocaleString('en-US');

// The day's totals against the target that applied on that day: a calorie ring + "N left"
// and the three macro bars. With no target set, shows the raw totals and a nudge to set one.
export function DaySummary({ totals, date }: DaySummaryProps) {
  const t = useNutritionTranslation();
  const target = useTargetForDate(date);

  if (!target) {
    return (
      <div className="grid gap-2">
        <MacrosSummary macros={totals} label={t.common.today} />
        <Link to="/targets" className="text-primary text-sm underline">
          {t.diary.setDailyTarget}
        </Link>
      </div>
    );
  }

  const kcal = Math.round(totals.kcal);
  const left = Math.round(target.kcal - kcal);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <CalorieRing kcal={kcal} target={target.kcal} />
        <div className="flex flex-col gap-0.5">
          <p className="font-heading text-xl font-semibold">
            {fmt(kcal)}
            <span className="text-muted-foreground text-base font-normal">
              {' '}
              / {fmt(target.kcal)}
            </span>
          </p>
          <p className="text-primary text-sm font-medium">
            {left >= 0 ? t.daySummary.left(fmt(left)) : t.daySummary.over(fmt(-left))}
          </p>
        </div>
      </div>
      <div className="grid gap-3">
        <MacroProgress
          label={t.common.macroProtein}
          current={totals.proteinG}
          target={target.proteinG}
          macro="protein"
        />
        <MacroProgress
          label={t.common.macroCarbs}
          current={totals.carbsG}
          target={target.carbsG}
          macro="carbs"
        />
        <MacroProgress
          label={t.common.macroFat}
          current={totals.fatG}
          target={target.fatG}
          macro="fat"
        />
      </div>
    </div>
  );
}

function CalorieRing({ kcal, target }: { kcal: number; target: number }) {
  const t = useNutritionTranslation();
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const pct = target > 0 ? Math.min(1, kcal / target) : 0;

  return (
    <svg
      viewBox="0 0 120 120"
      className="size-24 shrink-0"
      role="img"
      aria-label={t.daySummary.caloriesAria}
    >
      <circle cx="60" cy="60" r={radius} fill="none" strokeWidth="11" className="stroke-muted" />
      <circle
        cx="60"
        cy="60"
        r={radius}
        fill="none"
        strokeWidth="11"
        strokeLinecap="round"
        className="stroke-primary"
        strokeDasharray={`${circumference * pct} ${circumference}`}
        transform="rotate(-90 60 60)"
      />
      <text
        x="60"
        y="66"
        textAnchor="middle"
        className="fill-foreground font-heading text-xl font-semibold"
      >
        {Math.round(pct * 100)}%
      </text>
    </svg>
  );
}
