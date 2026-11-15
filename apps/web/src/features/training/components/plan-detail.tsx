import { Link } from '@tanstack/react-router';
import { ChevronLeft, Star } from 'lucide-react';

import { DeleteButton } from '@/components/delete-button';
import { ErrorState } from '@/components/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { PageTitle } from '@/components/page-title';

import { useActivePlan } from '../hooks/use-active-plan';
import { useDeletePlanFlow } from '../hooks/use-delete-plan-flow';
import { usePlan } from '../hooks/use-plan';
import { useSetActivePlan } from '../hooks/use-set-active-plan';
import { usePlanUiStore } from '../stores/plan-ui.store';
import { useTemplateUiStore } from '../stores/template-ui.store';
import { PlanSheet } from './plan-sheet';
import { TemplateRowsSkeleton } from './template-rows-skeleton';
import { TemplateList } from './template-list';
import { TemplateSheet } from './template-sheet';
import { useTrainingTranslation } from '../i18n';

interface PlanDetailProps {
  planId: string;
}

// Plan detail: header (name/description + edit/delete) and the plan's templates
// with create/edit/delete and drag-to-reorder.
export function PlanDetail({ planId }: PlanDetailProps) {
  const t = useTrainingTranslation();
  const { data: plan, isPending, isError, error, refetch } = usePlan(planId);
  const { data: activePlan } = useActivePlan();
  const setActive = useSetActivePlan();
  const openEdit = usePlanUiStore((s) => s.openEdit);
  const openCreateTemplate = useTemplateUiStore((s) => s.openCreate);
  const { deletePlan, isPending: deleting } = useDeletePlanFlow();

  // Same container, gaps and blocks as the loaded page below: back link, title +
  // Edit pill, the active line, then the Templates card.
  if (isPending) {
    return (
      <div
        aria-hidden
        className="mx-auto lg:col-span-3 flex w-full max-w-2xl flex-col gap-[14px] p-3 md:p-4"
      >
        <div className="flex h-5 items-center">
          <Skeleton className="h-3.5 w-14" />
        </div>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex h-[39px] flex-1 items-center">
              <Skeleton className="h-7 w-1/2" />
            </div>
            <Skeleton className="h-9 w-[62px] shrink-0 rounded-full" />
          </div>
          <Skeleton className="h-9 w-44 rounded-full" />
        </div>
        <div className="border-border bg-card rounded-xl border px-[18px] py-4">
          <span className="text-muted-foreground text-[11px] font-medium tracking-[0.08em] uppercase">
            {t.templates.title}
          </span>
          <TemplateRowsSkeleton rows={3} variant="list" />
        </div>
        <Skeleton className="h-[41px] w-full rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return <ErrorState message={error.message} onRetry={() => void refetch()} />;
  }

  return (
    <div className="mx-auto lg:col-span-3 flex w-full max-w-2xl flex-col gap-[14px] p-3 md:p-4 text-foreground">
      <Link
        to="/plans"
        className="text-muted-foreground inline-flex items-center gap-1 self-start text-[13px] font-semibold"
      >
        <ChevronLeft className="size-[15px]" />
        {t.plans.title}
      </Link>

      <header className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <PageTitle className="font-heading text-[26px] font-bold tracking-tight break-words">
              {plan.name}
            </PageTitle>
            {plan.description ? (
              <p className="text-muted-foreground text-[13px]">{plan.description}</p>
            ) : null}
          </div>
          <button
            type="button"
            className="bg-primary text-primary-foreground hover:bg-primary-hover h-9.5 shrink-0 rounded-full px-5 text-[13px] font-semibold transition-colors"
            onClick={() => openEdit(plan)}
          >
            {t.common.edit}
          </button>
        </div>

        {activePlan?.id === plan.id ? (
          <span className="text-primary inline-flex items-center gap-1.5 self-start text-[13px] font-semibold">
            <Star className="size-4 fill-current" />
            {t.plans.activePlan}
          </span>
        ) : (
          <button
            type="button"
            className="bg-secondary text-muted-foreground hover:text-foreground inline-flex h-9 items-center gap-1.5 self-start rounded-full px-3.5 text-[13px] font-semibold transition-colors disabled:opacity-50"
            disabled={setActive.isPending}
            onClick={() => setActive.mutate(plan.id)}
          >
            <Star className="size-4" />
            {t.plans.setAsActivePlan}
          </button>
        )}
      </header>

      <section className="border-border bg-card rounded-xl border px-[18px] py-4">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-[11px] font-medium tracking-[0.08em] uppercase">
            {t.templates.title}
          </span>
          <button
            type="button"
            onClick={() => openCreateTemplate(plan.id)}
            className="bg-accent text-accent-foreground hover:bg-accent/70 h-8 rounded-full px-3 text-[12.5px] font-semibold transition-colors"
          >
            {t.common.addShort}
          </button>
        </div>

        {plan.templates.length === 0 ? (
          <p className="text-muted-foreground mt-2 text-[13px]">{t.templates.emptyShort}</p>
        ) : (
          <TemplateList planId={plan.id} templates={plan.templates} />
        )}
      </section>

      <button
        type="button"
        onClick={() => openCreateTemplate(plan.id)}
        className="bg-accent text-accent-foreground hover:bg-accent/70 rounded-xl px-[13px] py-2.5 text-center text-[13px] font-semibold transition-colors"
      >
        {t.templates.addTemplate}
      </button>

      {plan.templates.length > 1 ? (
        <p className="text-muted-foreground text-center text-[12.5px]">{t.common.dragToReorder}</p>
      ) : null}

      <DeleteButton
        className="self-center"
        disabled={deleting}
        onClick={() => void deletePlan(plan)}
      >
        {t.plans.deletePlan}
      </DeleteButton>

      <PlanSheet />
      <TemplateSheet />
    </div>
  );
}
