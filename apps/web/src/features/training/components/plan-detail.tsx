import { Link, useNavigate } from '@tanstack/react-router';
import { ChevronLeft, Star } from 'lucide-react';
import { toast } from 'sonner';

import { ErrorState } from '@/components/error-state';
import { SkeletonList } from '@/components/skeletons';
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
        <SkeletonList rows={3} />
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
    <div className="mx-auto lg:col-span-3 flex w-full max-w-2xl flex-col gap-[14px] px-5 py-5 text-foreground">
      <Link
        to="/plans"
        className="text-muted-foreground inline-flex items-center gap-1 self-start text-[13px] font-semibold"
      >
        <ChevronLeft className="size-[15px]" />
        Plans
      </Link>

      <header className="flex flex-col gap-2.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-heading text-[26px] font-semibold break-words">{plan.name}</h1>
            {plan.description ? (
              <p className="font-heading text-muted-foreground text-[13px] italic">
                {plan.description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            className="border-border bg-card text-primary h-9 shrink-0 rounded-full border px-4 text-[13px] font-semibold"
            onClick={() => openEdit(plan)}
          >
            Edit
          </button>
        </div>

        {activePlan?.id === plan.id ? (
          <span className="text-primary inline-flex items-center gap-1.5 self-start text-[13px] font-semibold">
            <Star className="size-4 fill-current" />
            Active plan
          </span>
        ) : (
          <button
            type="button"
            className="border-border bg-card text-muted-foreground inline-flex h-9 items-center gap-1.5 self-start rounded-full border px-3.5 text-[13px] font-semibold disabled:opacity-50"
            disabled={setActive.isPending}
            onClick={() => setActive.mutate(plan.id)}
          >
            <Star className="size-4" />
            Set as active plan
          </button>
        )}
      </header>

      <section className="border-border bg-card rounded-[20px] border px-[18px] py-4">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-[11px] font-bold tracking-[0.08em] uppercase">
            Templates
          </span>
          <button
            type="button"
            onClick={() => openCreateTemplate(plan.id)}
            className="text-primary text-[12.5px] font-bold"
          >
            + Add
          </button>
        </div>

        {plan.templates.length === 0 ? (
          <p className="text-muted-foreground mt-2 text-[13px]">No templates yet.</p>
        ) : (
          <TemplateList planId={plan.id} templates={plan.templates} />
        )}
      </section>

      <button
        type="button"
        onClick={() => openCreateTemplate(plan.id)}
        className="text-primary rounded-[18px] border border-dashed border-[#d6c8bd] p-[13px] text-center text-[13px] font-bold dark:border-[#4b3f47]"
      >
        + Add template
      </button>

      {plan.templates.length > 1 ? (
        <p className="font-heading text-muted-foreground text-center text-[12.5px] italic">
          drag rows to reorder
        </p>
      ) : null}

      <button
        type="button"
        className="self-center text-[13px] font-semibold text-[#75394c] disabled:opacity-50 dark:text-[#d9a4b3]"
        disabled={remove.isPending}
        onClick={() => void onDelete(plan)}
      >
        Delete plan
      </button>

      <PlanSheet />
      <TemplateSheet />
    </div>
  );
}
