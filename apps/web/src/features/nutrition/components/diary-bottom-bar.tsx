import type { MacroTotals } from '@gym-bro/shared';

import { useTargetForDate } from '../hooks/use-target-for-date';

const fmt = (n: number): string => Math.round(n).toLocaleString('en-US');
const r = (n: number): number => Math.round(n);

// One macro on the mobile bar: a colored dot, the eaten amount (bold, white), then
// "/{target}g {letter}" in a muted tone. No percentages.
function MacroPair({
  dot,
  eaten,
  target,
  letter,
}: {
  dot: string;
  eaten: number;
  target: number;
  letter: string;
}) {
  return (
    <span className="flex items-center gap-1">
      <span className="size-[7px] shrink-0 rounded-full" style={{ backgroundColor: dot }} />
      <span className="whitespace-nowrap">
        <span className="text-xs font-bold text-[#fdf6f5] dark:text-[#221a20]">{r(eaten)}</span>
        <span className="text-[10px] text-[#b9a8ad] dark:text-[#a8969d]">
          /{r(target)}g {letter}
        </span>
      </span>
    </span>
  );
}

// Compact running total pinned above the mobile tab bar, like Fitatu's: an inverted bar
// with calories and one dotted "eaten/target" pair per macro (P/C/F). Desktop uses the
// sidebar summary instead, so this is hidden there. Nothing until a target is set.
export function DiaryBottomBar({ totals, date }: { totals: MacroTotals; date: string }) {
  const target = useTargetForDate(date);
  if (!target) return null;

  return (
    <div className="fixed inset-x-0 bottom-[3.75rem] z-20 px-3 lg:hidden">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 rounded-2xl bg-[#2b2126] px-4 py-2.5 dark:bg-[#f0e7ea] text-[#fdf6f5] dark:text-[#221a20]">
        <span className="text-[13px] font-bold">{fmt(totals.kcal)} kcal</span>
        <MacroPair dot="#c98fa0" eaten={totals.proteinG} target={target.proteinG} letter="P" />
        <MacroPair dot="#d9a441" eaten={totals.carbsG} target={target.carbsG} letter="C" />
        <MacroPair dot="#8fae85" eaten={totals.fatG} target={target.fatG} letter="F" />
      </div>
    </div>
  );
}
