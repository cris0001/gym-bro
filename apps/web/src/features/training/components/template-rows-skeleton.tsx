import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const NAME_WIDTHS = ['w-1/2', 'w-2/5', 'w-3/5', 'w-1/3', 'w-[45%]'];

// Loading rows for the template and template-exercise lists, in their real shape:
// grip | name | 32px action. 'card' = the desktop workspace's separate small cards;
// 'list' = the mobile rows inside one card, split by dashed rules.
export function TemplateRowsSkeleton({
  rows = 3,
  variant = 'card',
}: {
  rows?: number;
  variant?: 'card' | 'list';
}) {
  return (
    <ul aria-hidden className={cn('flex flex-col', variant === 'card' && 'gap-1.5')}>
      {Array.from({ length: rows }, (_, i) => (
        <li
          key={i}
          className={cn(
            'flex items-center gap-2.5',
            variant === 'card'
              ? 'border-border bg-card/70 rounded-xl border px-2 py-2.5'
              : 'border-border border-t border-dashed py-[11px] first:border-t-0',
          )}
        >
          <span className="flex w-[23px] shrink-0 justify-center">
            <Skeleton className="size-[15px] rounded-[4px]" />
          </span>
          <div className="flex h-5 min-w-0 flex-1 items-center">
            <Skeleton className={cn('h-3.5', NAME_WIDTHS[i % NAME_WIDTHS.length])} />
          </div>
          <Skeleton className="size-8 shrink-0 rounded-[10px]" />
        </li>
      ))}
    </ul>
  );
}
