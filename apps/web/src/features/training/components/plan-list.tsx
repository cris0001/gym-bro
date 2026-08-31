import { Link } from '@tanstack/react-router';
import { ClipboardList, Plus } from 'lucide-react';

import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { SkeletonList } from '@/components/skeletons';
import { Button } from '@/components/ui/button';

import { useActivePlan } from '../hooks/use-active-plan';
import { usePlans } from '../hooks/use-plans';
import { useSetActivePlan } from '../hooks/use-set-active-plan';
import { usePlanUiStore } from '../stores/plan-ui.store';
import { ActivePlanRow } from './active-plan-row';

// The plans list. The active plan is pinned to the top as an expandable row (its
// templates and exercises, open by default); every other plan links to its detail
// page. Create lives in the page header; edit/delete live on the detail page.
export function PlanList() {
  const { data: plans, isPending, isError, error, refetch } = usePlans();
  const { data: activePlan } = useActivePlan();
  const setActive = useSetActivePlan();
  const openCreate = usePlanUiStore((s) => s.openCreate);

  if (isPending) {
    return <SkeletonList />;
  }

  if (isError) {
    return <ErrorState message={error.message} onRetry={() => void refetch()} />;
  }

  if (plans.length === 0) {
    return (
      <EmptyState
        icon={<ClipboardList className="size-6" />}
        title="No plans yet"
        description="Create a plan (e.g. PPL, Upper/Lower) to organize your workout templates."
        action={
          <Button type="button" className="h-11 rounded-full px-5" onClick={openCreate}>
            <Plus className="size-4" />
            New plan
          </Button>
        }
      />
    );
  }

  // The active plan is its own expandable card; the rest sit in a second card below.
  const activeItem = plans.find((plan) => plan.id === activePlan?.id);
  const others = plans.filter((plan) => plan.id !== activePlan?.id);

  return (
    <div className="flex flex-col gap-4">
      {activeItem ? <ActivePlanRow planId={activeItem.id} name={activeItem.name} /> : null}
      {others.length > 0 ? (
        <ul className="bg-card divide-y divide-dashed divide-[#e4dad2] dark:divide-[#40353c] overflow-hidden rounded-2xl border">
          {others.map((plan) => (
            <li
              key={plan.id}
              className="hover:bg-accent flex items-center gap-2 px-4 py-3 transition-colors"
            >
              <Link to="/plans/$planId" params={{ planId: plan.id }} className="min-w-0 flex-1">
                <p className="truncate font-semibold">{plan.name}</p>
                {plan.description ? (
                  <p className="text-muted-foreground truncate text-sm">{plan.description}</p>
                ) : null}
                <p className="text-muted-foreground text-xs">
                  {plan.templateCount} {plan.templateCount === 1 ? 'template' : 'templates'}
                </p>
              </Link>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-primary h-8 shrink-0"
                disabled={setActive.isPending}
                onClick={() => setActive.mutate(plan.id)}
              >
                Set active
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
