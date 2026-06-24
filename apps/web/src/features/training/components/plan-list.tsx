import { Link } from '@tanstack/react-router';
import { ChevronRight } from 'lucide-react';

import { usePlans } from '../hooks/use-plans';

// The plans list: each row links to the plan's detail page. Create lives in the
// page header; edit/delete live on the detail page.
export function PlanList() {
  const { data: plans, isPending, isError, error } = usePlans();

  if (isPending) {
    return <p className="text-muted-foreground p-4 text-sm">Loading plans…</p>;
  }

  if (isError) {
    return (
      <p role="alert" className="text-destructive p-4 text-sm">
        {error.message}
      </p>
    );
  }

  if (plans.length === 0) {
    return (
      <p className="text-muted-foreground p-4 text-sm">
        No plans yet. Create one to organize your workout templates.
      </p>
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
