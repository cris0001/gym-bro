import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

import { MACRO_BAR, MACRO_TRACK, type MacroKey } from '../utils/macro-colors';

interface MacroProgressProps {
  label: string;
  current: number;
  target: number;
  unit?: string;
  // Tints the bar with the macro's accent color; over-target switches to red.
  macro?: MacroKey;
}

// One macro's progress toward its daily target. The bar caps at 100%; going over
// tints it red so it reads as "past target" without breaking the layout.
export function MacroProgress({ label, current, target, unit = 'g', macro }: MacroProgressProps) {
  const percent = target > 0 ? Math.min(100, (current / target) * 100) : 0;
  const over = current > target;

  return (
    <div className="grid gap-1">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className={cn('text-muted-foreground', over && 'text-destructive')}>
          {Math.round(current)} / {Math.round(target)} {unit}
        </span>
      </div>
      <Progress
        value={percent}
        className={over ? 'bg-destructive/20' : macro ? MACRO_TRACK[macro] : undefined}
        indicatorClassName={over ? 'bg-destructive' : macro ? MACRO_BAR[macro] : undefined}
      />
    </div>
  );
}
