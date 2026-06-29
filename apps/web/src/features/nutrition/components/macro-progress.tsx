import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface MacroProgressProps {
  label: string;
  current: number;
  target: number;
  unit?: string;
}

// One macro's progress toward its daily target. The bar caps at 100%; going over
// tints the track so it reads as "past target" without breaking the layout.
export function MacroProgress({ label, current, target, unit = 'g' }: MacroProgressProps) {
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
      <Progress value={percent} className={cn(over && 'bg-destructive/20')} />
    </div>
  );
}
