import { useState } from 'react';

import type { PlanListItem, PlanWithTemplates } from '@gym-bro/shared';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useHScroll } from '@/hooks/use-h-scroll';

import { useSessionsTranslation } from '../i18n';
import { StartTemplateCard } from './start-template-card';

interface StartMobilePickerProps {
  // Ordered active-first; `details[i]` is plans[i]'s loaded detail (or undefined).
  plans: PlanListItem[];
  details: (PlanWithTemplates | undefined)[];
  activeId: string | undefined;
  onSelectTemplate: (template: { id: string; name: string }) => void;
}

// The phone start picker: a pill row to switch plan (active preselected, skipped
// with a single plan) over the selected plan's templates as cards.
export function StartMobilePicker({
  plans,
  details,
  activeId,
  onSelectTemplate,
}: StartMobilePickerProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const scrollRef = useHScroll<HTMLDivElement>(selectedId);
  const t = useSessionsTranslation();

  const index = Math.max(
    0,
    plans.findIndex((plan) => plan.id === selectedId),
  );
  const templates = details[index]?.templates;

  return (
    <div className="flex flex-col gap-3">
      {plans.length > 1 && (
        <div className="flex flex-col gap-2">
          <p className="text-muted-foreground px-0.5 text-[11px] font-medium tracking-[0.08em] uppercase">
            {t.startWorkout.plans}
          </p>
          <div ref={scrollRef} className="no-scrollbar -mx-3 flex gap-1.5 overflow-x-auto px-3">
            {plans.map((plan, i) => (
              <button
                key={plan.id}
                type="button"
                aria-pressed={i === index}
                onClick={() => setSelectedId(plan.id)}
                className={cn(
                  'flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-semibold whitespace-nowrap transition-colors',
                  i === index
                    ? 'bg-foreground text-background border-transparent'
                    : 'bg-card border-border-strong text-foreground/80 active:bg-muted',
                )}
              >
                {plan.name}
                {plan.id === activeId && (
                  <span className="rounded-full bg-current/15 px-1.5 text-[10px] font-medium">
                    {t.startWorkout.activeBadge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {!templates ? (
        <Skeleton className="h-24 rounded-xl" />
      ) : templates.length === 0 ? (
        <p className="text-muted-foreground py-6 text-center text-sm">
          {t.startWorkout.noTemplates}
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {templates.map((template) => (
            <StartTemplateCard
              key={template.id}
              template={template}
              onStart={() => onSelectTemplate({ id: template.id, name: template.name })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
