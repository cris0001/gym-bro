import { Link, useNavigate } from '@tanstack/react-router';
import { ChevronLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';

import type { PlanWithTemplates } from '@gym-bro/shared';

import { useDeletePlan } from '../hooks/use-delete-plan';
import { usePlan } from '../hooks/use-plan';
import { usePlanUiStore } from '../stores/plan-ui.store';
import { PlanSheet } from './plan-sheet';

interface PlanDetailProps {
  planId: string;
}

// Plan detail: header (name/description + edit/delete) and a read-only list of
// the plan's templates. Template create/edit/delete/reorder arrives in the
// templates slice, layered onto this same templates section.
export function PlanDetail({ planId }: PlanDetailProps) {
  const { data: plan, isPending, isError, error } = usePlan(planId);
  const openEdit = usePlanUiStore((s) => s.openEdit);
  const remove = useDeletePlan();
  const navigate = useNavigate();

  if (isPending) {
    return <p className="text-muted-foreground p-4 text-sm">Loading plan…</p>;
  }

  if (isError) {
    return (
      <p role="alert" className="text-destructive p-4 text-sm">
        {error.message}
      </p>
    );
  }

  function onDelete(target: PlanWithTemplates) {
    if (window.confirm(`Delete "${target.name}"? This also removes all of its templates.`)) {
      remove.mutate(target.id, { onSuccess: () => void navigate({ to: '/plans' }) });
    }
  }

  return (
    <div className="flex flex-col">
      <div className="px-4 py-4">
        <Link
          to="/plans"
          className="text-muted-foreground hover:text-foreground mb-3 inline-flex items-center gap-1 text-sm"
        >
          <ChevronLeft className="size-4" />
          Plans
        </Link>

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold break-words">{plan.name}</h1>
            {plan.description ? (
              <p className="text-muted-foreground mt-1 text-sm">{plan.description}</p>
            ) : null}
          </div>
          <div className="flex shrink-0 gap-2">
            <Button type="button" variant="outline" className="h-11" onClick={() => openEdit(plan)}>
              Edit
            </Button>
            <Button
              type="button"
              variant="outline"
              className="text-destructive h-11"
              disabled={remove.isPending}
              onClick={() => onDelete(plan)}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4">
        <h2 className="text-muted-foreground mb-1 text-xs font-semibold tracking-wide uppercase">
          Templates
        </h2>
      </div>

      {plan.templates.length === 0 ? (
        <p className="text-muted-foreground px-4 py-3 text-sm">No templates yet.</p>
      ) : (
        <ul className="divide-y border-t">
          {plan.templates.map((template) => (
            <li key={template.id} className="px-4 py-3">
              <p className="truncate font-medium">{template.name}</p>
              {template.description ? (
                <p className="text-muted-foreground truncate text-sm">{template.description}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <PlanSheet />
    </div>
  );
}
