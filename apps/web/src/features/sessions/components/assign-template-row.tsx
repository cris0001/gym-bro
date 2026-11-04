import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';

interface AssignTemplateRowProps {
  index: number;
  name: string;
  // The exercise-count label, or undefined while the template detail loads.
  meta: string | undefined;
  selected: boolean;
  onSelect: () => void;
}

// One pickable template in the assign form — numbered like the planned card's exercise
// rows, tinted with a check when selected.
export function AssignTemplateRow({
  index,
  name,
  meta,
  selected,
  onSelect,
}: AssignTemplateRowProps) {
  return (
    <li className={cn(index > 0 && 'border-t border-dashed border-border')}>
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className={cn(
          'my-1 flex min-h-11 w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors',
          selected ? 'bg-accent' : 'hover:bg-muted',
        )}
      >
        <span className="font-heading w-4 shrink-0 text-center text-sm text-[#c9bcb2] italic">
          {index + 1}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-semibold">{name}</span>
          <span className="text-muted-foreground block text-[10.5px] font-medium tracking-wide uppercase">
            {meta ?? '…'}
          </span>
        </span>
        {selected && <Check className="text-primary size-4 shrink-0" />}
      </button>
    </li>
  );
}
