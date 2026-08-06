import type { MacroTotals } from '@gym-bro/shared';

import { useCurrentTarget } from '../hooks/use-current-target';

const fmt = (n: number): string => Math.round(n).toLocaleString('en-US');

// Compact running total pinned above the mobile tab bar, like Fitatu's: an inverted
// bar with calories, the P/C/F line, and percent of target. Desktop uses the sidebar
// summary instead, so this is hidden there. Nothing until a target is set.
export function DiaryBottomBar({ totals }: { totals: MacroTotals }) {
  const { data: target } = useCurrentTarget();
  if (!target) return null;

  const pct = target.kcal > 0 ? Math.round((totals.kcal / target.kcal) * 100) : 0;

  return (
    <div className="fixed inset-x-0 bottom-[3.75rem] z-20 px-3 lg:hidden">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 rounded-2xl bg-[#2c241d] px-4 py-2.5 text-[#fff7f0]">
        <span className="font-heading text-lg font-semibold">{fmt(totals.kcal)} kcal</span>
        <span className="text-[11px] text-[#fff7f0]/75">
          P {Math.round(totals.proteinG)} · C {Math.round(totals.carbsG)} · F{' '}
          {Math.round(totals.fatG)}
        </span>
        <span className="text-xs font-medium text-[#e8a188]">{pct}% of target</span>
      </div>
    </div>
  );
}
