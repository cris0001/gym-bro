import { Skeleton } from '@/components/ui/skeleton';

import { TemplateRowsSkeleton } from './template-rows-skeleton';

// The workspace's middle column while its plan loads, in the real column's shape:
// title, the active / set-active line, the Templates label, and template cards.
export function PlanTemplatesColumnSkeleton() {
  return (
    <div aria-hidden className="border-border bg-background/60 flex flex-col gap-3 border-r p-4">
      <div className="flex flex-col gap-1">
        <div className="flex h-[25px] items-center">
          <Skeleton className="h-5 w-3/5" />
        </div>
        <div className="flex h-[18px] items-center">
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <span className="text-muted-foreground text-[11px] font-medium tracking-[0.08em] uppercase">
        Templates
      </span>
      <TemplateRowsSkeleton rows={3} />
    </div>
  );
}
