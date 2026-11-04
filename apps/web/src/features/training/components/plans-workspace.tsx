import { useQuery } from '@tanstack/react-query';
import { ClipboardList, Plus } from 'lucide-react';

import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { SkeletonList } from '@/components/skeletons';
import { Button } from '@/components/ui/button';

import { useActivePlan } from '../hooks/use-active-plan';
import { usePlans } from '../hooks/use-plans';
import { templateQueryOptions } from '../hooks/use-template';
import { usePlanUiStore } from '../stores/plan-ui.store';
import { PlanSheet } from './plan-sheet';
import { PlanTemplatesColumn } from './plan-templates-column';
import { PlansColumn } from './plans-column';
import { TemplateExercisesPanel } from './template-exercises-panel';
import { TemplateSheet } from './template-sheet';

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
  const { data: plans, isPending, isError, error, refetch } = usePlans();
  const { data: activePlan } = useActivePlan();
  const { data: template } = useQuery({
    ...templateQueryOptions(templateId ?? ''),
    enabled: !!templateId,
  });
  const openCreate = usePlanUiStore((s) => s.openCreate);

  // A template URL selects its own plan (nothing until it loads, so the active plan
  // doesn't flash first); a plan URL selects that plan; bare /plans → active, else first.
  const selectedPlanId = templateId
    ? (template?.trainingPlanId ?? null)
    : (planId ?? activePlan?.id ?? plans?.[0]?.id ?? null);

  let body;
  if (isPending) {
    body = <SkeletonList rows={4} />;
  } else if (isError) {
    body = <ErrorState message={error.message} onRetry={() => void refetch()} />;
  } else if (plans.length === 0) {
    body = (
      <EmptyState
        icon={<ClipboardList className="size-6" />}
        title="No plans yet"
        description="Create a plan (e.g. PPL, Upper/Lower) to organize your workout templates."
      />
    );
  } else {
    body = (
      <div className="border-border bg-card grid min-h-[560px] grid-cols-[240px_280px_minmax(0,1fr)] overflow-hidden rounded-[20px] border">
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
            <TemplateExercisesPanel template={template} />
          ) : (
            <p className="font-heading text-muted-foreground flex h-full items-center justify-center text-[14px] italic">
              {templateId ? 'Loading…' : 'Pick a template to see its exercises'}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-4 p-4 lg:col-span-3 lg:py-6">
      <div className="flex items-center justify-between gap-2">
        <h1 className="font-heading text-[30px] leading-none font-medium">Plans</h1>
        <Button type="button" className="h-10 rounded-full px-5" onClick={openCreate}>
          <Plus className="size-4" />
          New plan
        </Button>
      </div>
      {body}
      <PlanSheet />
      <TemplateSheet />
    </div>
  );
}
