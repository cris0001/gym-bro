import { Link } from '@tanstack/react-router';

import type { MacroTotals } from '@gym-bro/shared';

import { useCurrentTarget } from '../hooks/use-current-target';
import { MacroProgress } from './macro-progress';
import { MacrosSummary } from './macros-summary';

interface DaySummaryProps {
  totals: MacroTotals;
}

// The day's totals against the current target. With no target set, shows the raw
// totals and a nudge to set one.
export function DaySummary({ totals }: DaySummaryProps) {
  const { data: target } = useCurrentTarget();

  if (!target) {
    return (
      <div className="grid gap-2">
        <MacrosSummary macros={totals} label="Today" />
        <Link to="/targets" className="text-primary text-sm underline">
          Set a daily target
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      <MacroProgress label="Calories" current={totals.kcal} target={target.kcal} unit="kcal" />
      <MacroProgress label="Protein" current={totals.proteinG} target={target.proteinG} />
      <MacroProgress label="Carbs" current={totals.carbsG} target={target.carbsG} />
      <MacroProgress label="Fat" current={totals.fatG} target={target.fatG} />
    </div>
  );
}
