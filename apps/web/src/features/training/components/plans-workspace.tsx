import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ClipboardList, Plus } from 'lucide-react';
import { useEffect } from 'react';

import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { Button } from '@/components/ui/button';
import { PageTitle } from '@/components/page-title';

import { useActivePlan } from '../hooks/use-active-plan';
import { planQueryOptions } from '../hooks/use-plan';
import { usePlans } from '../hooks/use-plans';
import { templateQueryOptions } from '../hooks/use-template';
import { usePlanUiStore } from '../stores/plan-ui.store';
import { PlanSheet } from './plan-sheet';
import { PlanTemplatesColumn } from './plan-templates-column';
import { PlansColumn } from './plans-column';
import { PlansWorkspaceSkeleton } from './plans-workspace-skeleton';
import { TemplateExercisesPanel } from './template-exercises-panel';
import { TemplateExercisesPanelSkeleton } from './template-exercises-panel-skeleton';
import { TemplateSheet } from './template-sheet';
import { useTrainingTranslation } from '../i18n';

interface PlansWorkspaceProps {
  // From the URL: /plans/$planId or /templates/$templateId (neither on /plans).
  planId?: string;
  templateId?: string;
}

// Desktop (lg+) view of /plans, /plans/$planId and /templates/$templateId: one card
// with three columns — plans → the selected plan's templates → the open template's
// exercises. The URL decides the selection (a template implies its plan; bare /plans
// falls back to the active, else first, plan), and every pick is a link, so Back,
// refresh and shared links match the mobile pages, which stay one column per route.
export function PlansWorkspace({ planId, templateId }: PlansWorkspaceProps) {
  const t = useTrainingTranslation();
  const { data: plans, isPending, isError, error, refetch } = usePlans();
  const { data: activePlan } = useActivePlan();
  const { data: template } = useQuery({
    ...templateQueryOptions(templateId ?? ''),
    enabled: !!templateId,
  });
  const openCreate = usePlanUiStore((s) => s.openCreate);

  // A template URL selects its own plan; a plan URL selects that plan; bare /plans →
  // active, else first.
  const resolvedPlanId = templateId
    ? (template?.trainingPlanId ?? null)
    : (planId ?? activePlan?.id ?? plans?.[0]?.id ?? null);
  // While a newly picked template loads its plan is unknown, but it was picked from
  // the plan already on screen — keep that column (remembered in the UI store, since
  // the route change remounts this component) so only the right panel shows a
  // skeleton. On a cold /templates/$id load there's nothing remembered, so nothing
  // shows until it resolves (no flash of the active plan).
  const workspacePlanId = usePlanUiStore((s) => s.workspacePlanId);
  const setWorkspacePlanId = usePlanUiStore((s) => s.setWorkspacePlanId);
  useEffect(() => {
    if (resolvedPlanId !== null) setWorkspacePlanId(resolvedPlanId);
  }, [resolvedPlanId, setWorkspacePlanId]);
  // Only if that plan (cached) actually holds the template being opened — a template
  // reached from elsewhere (e.g. the calendar) must not flash an unrelated plan.
  const queryClient = useQueryClient();
  const rememberedPlan = workspacePlanId
    ? queryClient.getQueryData(planQueryOptions(workspacePlanId).queryKey)
    : undefined;
  const keepRemembered =
    templateId !== undefined && rememberedPlan?.templates.some((tpl) => tpl.id === templateId);
  const selectedPlanId = resolvedPlanId ?? (keepRemembered ? workspacePlanId : null);

  let body;
  if (isPending) {
    body = <PlansWorkspaceSkeleton />;
  } else if (isError) {
    body = <ErrorState message={error.message} onRetry={() => void refetch()} />;
  } else if (plans.length === 0) {
    body = (
      <EmptyState
        icon={<ClipboardList className="size-6" />}
        title={t.plans.emptyTitle}
        description={t.plans.emptyBody}
      />
    );
  } else {
    body = (
      <div className="border-border bg-card grid min-h-[560px] grid-cols-[200px_240px_minmax(0,1fr)] xl:grid-cols-[240px_280px_minmax(0,1fr)] overflow-hidden rounded-xl border">
        <PlansColumn
          plans={plans}
          activePlanId={activePlan?.id ?? null}
          selectedPlanId={selectedPlanId}
        />
        {selectedPlanId ? (
          <PlanTemplatesColumn
            planId={selectedPlanId}
            isActive={selectedPlanId === activePlan?.id}
            selectedTemplateId={templateId ?? null}
          />
        ) : (
          <div className="border-border border-r" />
        )}
        <div className="min-w-0 p-5">
          {templateId && template ? (
            <TemplateExercisesPanel template={template} variant="column" />
          ) : templateId ? (
            <TemplateExercisesPanelSkeleton />
          ) : (
            <p className="text-muted-foreground flex h-full items-center justify-center text-[14px]">
              {t.templates.pickTemplate}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4 p-3 md:p-4 max-w-6xl lg:col-start-2">
      <div className="flex items-center justify-between gap-2">
        <PageTitle className="font-heading text-[28px] leading-none font-bold tracking-tight">
          {t.plans.title}
        </PageTitle>
        <Button type="button" className="h-9.5 rounded-full px-5" onClick={openCreate}>
          <Plus className="size-4" />
          {t.plans.newPlan}
        </Button>
      </div>
      {body}
      <PlanSheet />
      <TemplateSheet />
    </div>
  );
}
