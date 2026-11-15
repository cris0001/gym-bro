import { Skeleton } from '@/components/ui/skeleton';

import { TemplateRowsSkeleton } from './template-rows-skeleton';
import { useTrainingTranslation } from '../i18n';

// The open template's exercises while it loads, in the panel's shape: the title, then
// exercise rows — cards in the workspace, divided rows inside one card on the mobile
// page.
export function TemplateExercisesPanelSkeleton({
  variant = 'column',
}: {
  variant?: 'column' | 'page';
}) {
  const t = useTrainingTranslation();
  const isColumn = variant === 'column';
  return (
    <div aria-hidden className="flex flex-col gap-[14px]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-[30px] min-w-0 flex-1 items-center">
          <Skeleton className="h-6 w-2/5" />
        </div>
      </div>
      {isColumn ? (
        <TemplateRowsSkeleton rows={5} />
      ) : (
        <div className="border-border bg-card rounded-xl border px-[18px] py-4">
          <span className="text-muted-foreground text-[11px] font-medium tracking-[0.08em] uppercase">
            {t.templateExercises.title}
          </span>
          <TemplateRowsSkeleton rows={4} variant="list" />
        </div>
      )}
    </div>
  );
}
