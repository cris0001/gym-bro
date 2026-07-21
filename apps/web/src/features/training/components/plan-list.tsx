import { Link } from '@tanstack/react-router';
import { ChevronRight, ClipboardList, Plus } from 'lucide-react';

import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ListSkeleton } from '@/components/list-skeleton';
import { Button } from '@/components/ui/button';

import { usePlans } from '../hooks/use-plans';
import { usePlanUiStore } from '../stores/plan-ui.store';

// The plans list: each row links to the plan's detail page. Create lives in the
// page header; edit/delete live on the detail page.
export function PlanList() {
  const { data: plans, isPending, isError, error, refetch } = usePlans();
  const openCreate = usePlanUiStore((s) => s.openCreate);

  if (isPending) {
    return <ListSkeleton />;
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
          <Button type="button" className="h-11" onClick={openCreate}>
            <Plus className="size-4" />
            New plan
          </Button>
        }
      />
    );
  }

  return (
    <ul className="divide-y">
      {plans.map((plan) => (
        <li key={plan.id}>
          <Link
            to="/plans/$planId"
            params={{ planId: plan.id }}
            className="hover:bg-accent flex items-center gap-3 px-4 py-3 transition-colors"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{plan.name}</p>
              {plan.description ? (
                <p className="text-muted-foreground truncate text-sm">{plan.description}</p>
              ) : null}
              <p className="text-muted-foreground text-xs">
                {plan.templateCount} {plan.templateCount === 1 ? 'template' : 'templates'}
              </p>
            </div>
            <ChevronRight className="text-muted-foreground size-5 shrink-0" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
