import { Link } from '@tanstack/react-router';
import { Star } from 'lucide-react';

import type { PlanListItem } from '@gym-bro/shared';

import { DeleteIconButton } from '@/components/delete-icon-button';
import { EditIconButton } from '@/components/edit-icon-button';
import { cn } from '@/lib/utils';

import { useDeletePlanFlow } from '../hooks/use-delete-plan-flow';
import { usePlanUiStore } from '../stores/plan-ui.store';

interface PlansColumnProps {
  plans: PlanListItem[];
  activePlanId: string | null;
  selectedPlanId: string | null;
}

// First column of the desktop plans workspace: every plan (active first, starred) as a
// link to /plans/$planId — selecting is plain navigation, so the URL, Back and a shared
// link behave like the mobile pages. Each row carries its own edit / delete, the same
// way template and exercise rows do in the next columns (shown on the open plan, and on
// hover/focus for the rest so the list stays calm). Create lives in the page header.
export function PlansColumn({ plans, activePlanId, selectedPlanId }: PlansColumnProps) {
  const openEdit = usePlanUiStore((s) => s.openEdit);
  const { deletePlan, isPending: deleting } = useDeletePlanFlow();
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
            <div
              key={plan.id}
              className={cn(
                'group flex items-center gap-0.5 rounded-xl pr-1 transition-colors',
                isSelected ? 'bg-accent' : 'hover:bg-muted',
              )}
            >
              <Link
                to="/plans/$planId"
                params={{ planId: plan.id }}
                className="flex min-w-0 flex-1 flex-col gap-0.5 py-2.5 pl-2.5"
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
              <div
                className={cn(
                  'flex shrink-0 items-center transition-opacity',
                  !isSelected && 'opacity-0 group-focus-within:opacity-100 group-hover:opacity-100',
                )}
              >
                <EditIconButton aria-label={`Edit ${plan.name}`} onClick={() => openEdit(plan)} />
                <DeleteIconButton
                  aria-label={`Delete ${plan.name}`}
                  disabled={deleting}
                  onClick={() => void deletePlan(plan)}
                />
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
