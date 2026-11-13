import { Skeleton } from '@/components/ui/skeleton';

import { PlanTemplatesColumnSkeleton } from './plan-templates-column-skeleton';
import { TemplateExercisesPanelSkeleton } from './template-exercises-panel-skeleton';

// Loading state for the desktop plans workspace, in its real three-column card: the
// plans list, the selected plan's header + template cards, and the open template's
// header + exercise cards. Section labels stay real text; values pulse.
export function PlansWorkspaceSkeleton() {
  return (
    <div
      aria-hidden
      className="border-border bg-card grid min-h-[560px] grid-cols-[240px_280px_minmax(0,1fr)] overflow-hidden rounded-[20px] border"
    >
      <div className="border-border flex flex-col gap-1 border-r p-3">
        <span className="text-muted-foreground px-2 pb-2 text-[11px] font-bold tracking-[0.08em] uppercase">
          Plans
        </span>
        {['w-3/5', 'w-1/2', 'w-2/3'].map((width) => (
          <div key={width} className="flex flex-col gap-0.5 py-2.5 pl-2.5">
            <div className="flex h-6 items-center">
              <Skeleton className={`h-4 ${width}`} />
            </div>
            <div className="flex h-[18px] items-center">
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>

      <PlanTemplatesColumnSkeleton />

      <div className="min-w-0 p-5">
        <TemplateExercisesPanelSkeleton />
      </div>
    </div>
  );
}
