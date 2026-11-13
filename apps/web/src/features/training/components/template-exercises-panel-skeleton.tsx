import { Skeleton } from '@/components/ui/skeleton';

import { TemplateRowsSkeleton } from './template-rows-skeleton';

// The open template's exercises while it loads, in the panel's shape: the title (with
// the Edit pill in the desktop column), then exercise rows — cards in the workspace,
// dashed rows inside one card on the mobile page.
export function TemplateExercisesPanelSkeleton({
  variant = 'column',
}: {
  variant?: 'column' | 'page';
}) {
  const isColumn = variant === 'column';
  return (
    <div aria-hidden className="flex flex-col gap-[14px]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-[30px] min-w-0 flex-1 items-center">
          <Skeleton className="h-6 w-2/5" />
        </div>
        {isColumn ? <Skeleton className="h-9 w-[62px] shrink-0 rounded-full" /> : null}
      </div>
      {isColumn ? (
        <TemplateRowsSkeleton rows={5} />
      ) : (
        <div className="border-border bg-card rounded-[20px] border px-[18px] py-4">
          <span className="text-muted-foreground text-[11px] font-bold tracking-[0.08em] uppercase">
            Exercises
          </span>
          <TemplateRowsSkeleton rows={4} variant="list" />
        </div>
      )}
    </div>
  );
}
