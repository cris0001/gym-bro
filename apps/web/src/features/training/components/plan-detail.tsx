import { Link, useNavigate } from '@tanstack/react-router';
import { ChevronLeft, Plus, Star } from 'lucide-react';
import { toast } from 'sonner';

import { ErrorState } from '@/components/error-state';
import { ListSkeleton } from '@/components/list-skeleton';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useConfirm } from '@/stores/confirm.store';

import type { PlanWithTemplates } from '@gym-bro/shared';

import { useActivePlan } from '../hooks/use-active-plan';
import { useDeletePlan } from '../hooks/use-delete-plan';
import { usePlan } from '../hooks/use-plan';
import { useSetActivePlan } from '../hooks/use-set-active-plan';
import { usePlanUiStore } from '../stores/plan-ui.store';
import { useTemplateUiStore } from '../stores/template-ui.store';
import { PlanSheet } from './plan-sheet';
import { TemplateList } from './template-list';
import { TemplateSheet } from './template-sheet';

interface PlanDetailProps {
  planId: string;
}

// Plan detail: header (name/description + edit/delete) and the plan's templates
// with create/edit/delete and drag-to-reorder.
export function PlanDetail({ planId }: PlanDetailProps) {
  const { data: plan, isPending, isError, error, refetch } = usePlan(planId);
  const { data: activePlan } = useActivePlan();
  const setActive = useSetActivePlan();
  const openEdit = usePlanUiStore((s) => s.openEdit);
  const openCreateTemplate = useTemplateUiStore((s) => s.openCreate);
  const remove = useDeletePlan();
  const confirm = useConfirm();
  const navigate = useNavigate();

  if (isPending) {
    return (
      <div className="mx-auto lg:col-span-3 flex w-full max-w-2xl flex-col gap-4 p-3 md:p-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
        <ListSkeleton rows={3} />
      </div>
    );
  }

  if (isError) {
    return <ErrorState message={error.message} onRetry={() => void refetch()} />;
  }

  async function onDelete(target: PlanWithTemplates) {
    const ok = await confirm({
      title: `Delete "${target.name}"?`,
      description: 'This also removes all of its templates.',
      confirmText: 'Delete',
      destructive: true,
    });
    if (ok) {
      remove.mutate(target.id, {
        onSuccess: () => {
          toast.success('Plan deleted');
          void navigate({ to: '/plans' });
        },
      });
    }
  }

  return (
    <div className="mx-auto lg:col-span-3 flex w-full max-w-2xl flex-col">
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
            <h1 className="font-heading text-[28px] font-medium break-words">{plan.name}</h1>
            {plan.description ? (
              <p className="text-muted-foreground mt-1 text-sm">{plan.description}</p>
            ) : null}
          </div>
          <Button
            type="button"
            variant="ghost"
            className="bg-accent text-primary hover:bg-accent/70 h-11 shrink-0 rounded-full px-5"
            onClick={() => openEdit(plan)}
          >
            Edit
          </Button>
        </div>

        <div className="mt-3">
          {activePlan?.id === plan.id ? (
            <span className="text-primary inline-flex items-center gap-1.5 text-sm font-medium">
              <Star className="size-4 fill-current" />
              Active plan
            </span>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 rounded-full"
              disabled={setActive.isPending}
              onClick={() => setActive.mutate(plan.id)}
            >
              <Star className="size-4" />
              Set as active plan
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between px-4">
        <h2 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
          Templates
        </h2>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-9"
          onClick={() => openCreateTemplate(plan.id)}
        >
          <Plus className="size-4" />
          Add
        </Button>
      </div>

      {plan.templates.length === 0 ? (
        <p className="text-muted-foreground px-4 py-3 text-sm">No templates yet.</p>
      ) : (
        <TemplateList planId={plan.id} templates={plan.templates} />
      )}

      <div className="flex justify-center p-4">
        <button
          type="button"
          className="text-sm font-medium text-[#b04e2f] disabled:opacity-50"
          disabled={remove.isPending}
          onClick={() => void onDelete(plan)}
        >
          Delete plan
        </button>
      </div>

      <PlanSheet />
      <TemplateSheet />
    </div>
  );
}
