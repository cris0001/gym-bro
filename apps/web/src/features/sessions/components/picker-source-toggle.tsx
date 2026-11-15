import { cn } from '@/lib/utils';

type Source = 'template' | 'all';

const OPTIONS: Source[] = ['template', 'all'];

// The picker's "Template / All" switch, styled like the other segmented controls in
// the app (Stats and Strava period switches).
export function PickerSourceToggle({
  value,
  onChange,
  labels,
}: {
  value: Source;
  onChange: (next: Source) => void;
  labels: Record<Source, string>;
}) {
  return (
    <div className="bg-secondary flex h-9 shrink-0 rounded-md p-[3px]">
      {OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={value === option}
          onClick={() => onChange(option)}
          className={cn(
            'h-full flex-1 rounded-sm text-[13px] font-semibold transition-colors',
            value === option
              ? 'bg-card text-accent-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {labels[option]}
        </button>
      ))}
    </div>
  );
}
