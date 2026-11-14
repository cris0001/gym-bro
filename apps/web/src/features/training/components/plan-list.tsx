import { Link } from '@tanstack/react-router';
import { format, parseISO } from 'date-fns';
import { ClipboardList, Plus } from 'lucide-react';

import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { Button } from '@/components/ui/button';

import { useActivePlan } from '../hooks/use-active-plan';
import { usePlans } from '../hooks/use-plans';
import { useSetActivePlan } from '../hooks/use-set-active-plan';
import { usePlanUiStore } from '../stores/plan-ui.store';
import { PlanCardsSkeleton } from './plan-cards-skeleton';

// The plans grid: every plan is an equal card (active first, marked with a badge),
// the whole card linking to its detail page for templates and edit/delete. "Set active" flips the
// active plan inline. One column on phones, up to three on desktop. Create lives in
// the page header.
export function PlanList() {
  const { data: plans, isPending, isError, error, refetch } = usePlans();
  const { data: activePlan } = useActivePlan();
  const setActive = useSetActivePlan();
  const openCreate = usePlanUiStore((s) => s.openCreate);

  if (isPending) {
    return <PlanCardsSkeleton />;
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
          <Button type="button" className="h-9.5 rounded-full px-5" onClick={openCreate}>
            <Plus className="size-4" />
            New plan
          </Button>
        }
      />
    );
  }

  // Active plan first, the rest in their existing order.
  const ordered = [
    ...plans.filter((plan) => plan.id === activePlan?.id),
    ...plans.filter((plan) => plan.id !== activePlan?.id),
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {ordered.map((plan) => {
        const isActive = plan.id === activePlan?.id;
        return (
          // The whole card opens the plan: the name link's ::after stretches over the
          // card (a "stretched link"), so it stays one real <a> — no button nested
          // inside it — while "Set active" sits above it and keeps its own click.
          <div
            key={plan.id}
            className="bg-card hover:border-border-strong hover:bg-muted/40 relative flex flex-col gap-2 rounded-xl border p-4 transition-colors has-[a:focus-visible]:ring-3 has-[a:focus-visible]:ring-ring/50 lg:min-h-[150px] lg:gap-3 lg:p-5"
          >
            <div className="flex items-start justify-between gap-2">
              <Link
                to="/plans/$planId"
                params={{ planId: plan.id }}
                className="font-heading min-w-0 flex-1 truncate text-lg font-semibold outline-none after:absolute after:inset-0 after:rounded-xl lg:text-xl"
              >
                {plan.name}
              </Link>
              {isActive ? (
                <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold tracking-[0.06em] text-accent-foreground uppercase">
                  Active
                </span>
              ) : (
                <button
                  type="button"
                  className="text-primary relative z-10 -my-2 shrink-0 cursor-pointer px-1 py-2 text-xs font-semibold disabled:opacity-50"
                  disabled={setActive.isPending}
                  onClick={() => setActive.mutate(plan.id)}
                >
                  Set active
                </button>
              )}
            </div>

            {plan.description ? (
              <p className="text-muted-foreground line-clamp-2 text-sm">{plan.description}</p>
            ) : null}

            <p className="text-muted-foreground mt-auto text-xs">
              {plan.templateCount} {plan.templateCount === 1 ? 'template' : 'templates'} · started{' '}
              {format(parseISO(plan.createdAt), 'MMM d')}
            </p>
          </div>
        );
      })}
    </div>
  );
}
