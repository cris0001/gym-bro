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
// link behave like the mobile pages. The open plan shows its edit / delete under the
// name, so names can wrap at full width and the list stays calm. Create lives in the
// page header.
export function PlansColumn({ plans, activePlanId, selectedPlanId }: PlansColumnProps) {
  const openEdit = usePlanUiStore((s) => s.openEdit);
  const { deletePlan, isPending: deleting } = useDeletePlanFlow();
  const ordered = [
    ...plans.filter((plan) => plan.id === activePlanId),
    ...plans.filter((plan) => plan.id !== activePlanId),
  ];

  return (
    <div className="border-border flex flex-col gap-1 border-r p-3">
      <span className="text-muted-foreground px-2 pb-2 text-[11px] font-medium tracking-[0.08em] uppercase">
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
                'flex flex-col rounded-lg transition-colors',
                isSelected ? 'bg-accent ring-primary/35 ring-1 ring-inset' : 'hover:bg-muted',
              )}
            >
              <Link
                to="/plans/$planId"
                params={{ planId: plan.id }}
                className={cn(
                  'flex min-w-0 flex-col gap-0.5 px-2.5 pt-2.5',
                  !isSelected && 'pb-2.5',
                )}
              >
                <span className="font-heading flex min-w-0 items-start gap-1.5 text-[16px] leading-snug font-semibold">
                  {isActive ? (
                    <Star
                      className="text-primary mt-1 size-3.5 shrink-0 fill-current"
                      aria-label="Active plan"
                    />
                  ) : null}
                  <span
                    className={cn('min-w-0 break-words', isSelected && 'text-accent-foreground')}
                  >
                    {plan.name}
                  </span>
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
              {/* Edit / delete sit under the name (so long names keep the full width),
                  only on the selected plan — no row-height jump on hover. */}
              {isSelected && (
                <div className="flex items-center justify-end gap-0.5 px-1.5 pb-1.5">
                  <EditIconButton aria-label={`Edit ${plan.name}`} onClick={() => openEdit(plan)} />
                  <DeleteIconButton
                    aria-label={`Delete ${plan.name}`}
                    disabled={deleting}
                    onClick={() => void deletePlan(plan)}
                  />
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
