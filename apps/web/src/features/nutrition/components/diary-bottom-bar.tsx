import type { MacroTotals } from '@gym-bro/shared';

import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

import { useCurrentTarget } from '../hooks/use-current-target';
import { MACRO_BAR, MACRO_TRACK, type MacroKey } from '../utils/macro-colors';

function MiniMacro({
  label,
  macro,
  current,
  target,
}: {
  label: string;
  macro: MacroKey;
  current: number;
  target: number;
}) {
  const percent = target > 0 ? Math.min(100, (current / target) * 100) : 0;
  return (
    <div className="flex w-14 flex-col gap-0.5">
      <div className="flex justify-between text-[10px] leading-none">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {Math.round(current)}/{Math.round(target)}
        </span>
      </div>
      <Progress
        value={percent}
        className={cn('h-1', MACRO_TRACK[macro])}
        indicatorClassName={MACRO_BAR[macro]}
      />
    </div>
  );
}

// Compact day summary pinned to the bottom on mobile (above the tab bar), like
// Fitatu's running total: calories vs target plus mini P/C/F bars. Desktop uses
// the sidebar summary instead, so this is hidden there. Renders nothing until a
// target is set (the page nudges to set one).
export function DiaryBottomBar({ totals }: { totals: MacroTotals }) {
  const { data: target } = useCurrentTarget();
  if (!target) return null;

  const kcalPercent = target.kcal > 0 ? Math.min(100, (totals.kcal / target.kcal) * 100) : 0;

  return (
    <div className="bg-background/95 fixed inset-x-0 bottom-14 z-20 border-t px-3 py-2.5 backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-2xl items-center gap-3">
        <div className="flex min-w-0 flex-col">
          <span className="text-sm leading-tight font-semibold">
            {Math.round(totals.kcal)}
            <span className="text-muted-foreground text-xs font-normal">
              {' '}
              / {Math.round(target.kcal)} kcal
            </span>
          </span>
          <Progress
            value={kcalPercent}
            className={cn('mt-0.5 h-1 w-24', MACRO_TRACK.kcal)}
            indicatorClassName={MACRO_BAR.kcal}
          />
        </div>
        <div className="ml-auto flex gap-2.5">
          <MiniMacro label="P" macro="protein" current={totals.proteinG} target={target.proteinG} />
          <MiniMacro label="C" macro="carbs" current={totals.carbsG} target={target.carbsG} />
          <MiniMacro label="F" macro="fat" current={totals.fatG} target={target.fatG} />
        </div>
      </div>
    </div>
  );
}
