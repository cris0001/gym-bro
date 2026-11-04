import { Link } from '@tanstack/react-router';
import { Star } from 'lucide-react';

import type { PlanListItem } from '@gym-bro/shared';

import { cn } from '@/lib/utils';

interface PlansColumnProps {
  plans: PlanListItem[];
  activePlanId: string | null;
  selectedPlanId: string | null;
}

// First column of the desktop plans workspace: every plan (active first, starred)
// as a link to /plans/$planId — selecting is plain navigation, so the URL, Back and
// a shared link all behave like the mobile pages. Create lives in the page header.
export function PlansColumn({ plans, activePlanId, selectedPlanId }: PlansColumnProps) {
  const ordered = [
    ...plans.filter((plan) => plan.id === activePlanId),
    ...plans.filter((plan) => plan.id !== activePlanId),
  ];

  return (
    <div className="border-border flex flex-col gap-1 border-r p-3">
      <span className="text-muted-foreground px-2 pb-2 text-[11px] font-bold tracking-[0.08em] uppercase">
        Plans
      </span>

      {ordered.length === 0 ? (
        <p className="text-muted-foreground px-2 text-[13px]">No plans yet.</p>
      ) : (
        ordered.map((plan) => {
          const isActive = plan.id === activePlanId;
          const isSelected = plan.id === selectedPlanId;
          return (
            <Link
              key={plan.id}
              to="/plans/$planId"
              params={{ planId: plan.id }}
              className={cn(
                'flex flex-col gap-0.5 rounded-xl px-2.5 py-2.5 transition-colors',
                isSelected ? 'bg-accent' : 'hover:bg-muted',
              )}
            >
              <span className="font-heading flex min-w-0 items-center gap-1.5 text-[16px] font-semibold">
                {isActive ? (
                  <Star
                    className="text-primary size-3.5 shrink-0 fill-current"
                    aria-label="Active plan"
                  />
                ) : null}
                <span className="truncate">{plan.name}</span>
              </span>
              <span
                className={cn(
                  'text-[12px]',
                  isSelected ? 'text-accent-foreground' : 'text-muted-foreground',
                )}
              >
                {plan.templateCount} {plan.templateCount === 1 ? 'template' : 'templates'}
                {isActive ? ' · active' : ''}
              </span>
            </Link>
          );
        })
      )}
    </div>
  );
}
