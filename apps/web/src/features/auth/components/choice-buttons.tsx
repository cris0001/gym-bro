import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChoiceButtonsProps<T extends string> {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  // Tapping the selected option again resets to this value (e.g. '' = unset).
  deselectTo?: T;
  className?: string;
}

// A row of equal-width, 44px toggle buttons for a small closed choice (sex, food-name
// language) — big tap targets instead of a native select.
export function ChoiceButtons<T extends string>({
  options,
  value,
  onChange,
  deselectTo,
  className,
}: ChoiceButtonsProps<T>) {
  return (
    <div
      className={cn('grid gap-2', className)}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((opt) => (
        <Button
          key={opt.value || 'none'}
          type="button"
          variant={value === opt.value ? 'default' : 'outline'}
          className="h-11 px-2"
          onClick={() =>
            onChange(value === opt.value && deselectTo !== undefined ? deselectTo : opt.value)
          }
        >
          {opt.label}
        </Button>
      ))}
    </div>
  );
}
