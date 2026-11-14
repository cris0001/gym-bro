import { cn } from '@/lib/utils';

// One headline number above the progress chart: a big value with a small unit and a
// caption; a change tints green (up) or red (down).
export function ProgressFigure({
  value,
  unit,
  label,
  tone,
}: {
  value: string;
  unit: string;
  label: string;
  tone?: 'up' | 'down' | undefined;
}) {
  return (
    <div>
      <p
        className={cn(
          'font-heading text-2xl leading-tight font-bold tabular-nums',
          tone === 'up' && 'text-[#4a6943] dark:text-[#8fae85]',
          tone === 'down' && 'text-destructive',
        )}
      >
        {value}
        <span className="text-muted-foreground text-[13px] font-medium">{unit}</span>
      </p>
      <p className="text-muted-foreground text-xs">{label}</p>
    </div>
  );
}
