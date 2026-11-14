import { useQueries, useQuery } from '@tanstack/react-query';
import { Star } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { activePlanQueryOptions, planQueryOptions, usePlans } from '@/features/training';
import { cn } from '@/lib/utils';

import { useSessionsTranslation } from '../i18n';
import { StartMobilePicker } from './start-mobile-picker';
import { StartTemplateRow } from './start-template-row';

interface StartWorkoutPickerProps {
  onSelectTemplate: (template: { id: string; name: string }) => void;
}

// The start screen's template picker. From lg up: every plan's templates at once,
// grouped under the plan name (active plan first, then alphabetical). On phones:
// StartMobilePicker (plan pills over template cards). Plan details share the /plans cache.
export function StartWorkoutPicker({ onSelectTemplate }: StartWorkoutPickerProps) {
  const { data: plans = [], isPending } = usePlans();
  const { data: activePlan } = useQuery(activePlanQueryOptions());
  const t = useSessionsTranslation();

  const ordered = [...plans].sort((a, b) => {
    if (a.id === activePlan?.id) return -1;
    if (b.id === activePlan?.id) return 1;
    return a.name.localeCompare(b.name);
  });
  const details = useQueries({ queries: ordered.map((plan) => planQueryOptions(plan.id)) });

  if (isPending) return <GroupsSkeleton />;
  if (ordered.length === 0) {
    return (
      <p className="text-muted-foreground py-6 text-center text-sm">{t.startWorkout.noPlans}</p>
    );
  }

  return (
    <>
      <div className="lg:hidden">
        <StartMobilePicker
          plans={ordered}
          details={details.map((query) => query.data)}
          activeId={activePlan?.id}
          onSelectTemplate={onSelectTemplate}
        />
      </div>
      <div className="hidden flex-col gap-4 lg:flex">
        {ordered.map((plan, i) => {
          const templates = details[i]?.data?.templates;
          const active = plan.id === activePlan?.id;
          return (
            <section key={plan.id} className="flex flex-col gap-2">
              {/* The active plan stands out: star, primary name, ACTIVE badge. */}
              <h2
                className={cn(
                  'flex items-center gap-1.5 px-0.5 text-[11px] tracking-[0.08em] uppercase',
                  active ? 'text-primary font-bold' : 'text-muted-foreground font-medium',
                )}
              >
                {active && <Star className="size-3.5 fill-current" aria-hidden />}
                {plan.name}
                {active && (
                  <span className="bg-primary text-primary-foreground rounded-full px-1.5 py-px text-[9.5px] font-bold tracking-[0.06em] uppercase">
                    {t.startWorkout.activeBadge}
                  </span>
                )}
              </h2>
              {!templates ? (
                <Skeleton className="h-16 rounded-xl" />
              ) : templates.length === 0 ? (
                <p className="bg-card text-muted-foreground rounded-xl border px-3.5 py-3 text-sm">
                  {t.startWorkout.noTemplates}
                </p>
              ) : (
                <ul className="bg-card overflow-hidden rounded-xl border">
                  {templates.map((template) => (
                    <StartTemplateRow
                      key={template.id}
                      template={template}
                      onStart={() => onSelectTemplate({ id: template.id, name: template.name })}
                    />
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}

function GroupsSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-2">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-36 rounded-xl" />
    </div>
  );
}
