import { useQueries, useQuery } from '@tanstack/react-query';

import {
  activePlanQueryOptions,
  planQueryOptions,
  plansQueryOptions,
  templateQueryOptions,
} from '@/features/training';

// Everything the "Add session" form needs — the plans, the active plan, the effective
// plan's templates and each template's exercise count — as one loading flag. The day
// view calls it too (with no override) so the data is already cached when the form
// opens, instead of the form stepping through four requests on screen.
export function useAssignTemplateData(planIdOverride: string | null) {
  const { data: plans = [], isPending: plansPending } = useQuery(plansQueryOptions());
  const { data: activePlan, isPending: activePending } = useQuery(activePlanQueryOptions());

  // Effective plan = the active plan, else an explicit pick, else the first plan.
  const planId = activePlan?.id ?? planIdOverride ?? plans[0]?.id ?? null;

  // isLoading (not isPending) for the dependent queries: a disabled one stays pending.
  const { data: plan, isLoading: planLoading } = useQuery({
    ...planQueryOptions(planId ?? ''),
    enabled: planId !== null,
  });
  const templates = plan?.templates ?? [];
  const templateQueries = useQueries({
    queries: templates.map((tpl) => templateQueryOptions(tpl.id)),
  });

  return {
    plans,
    activePlan,
    planId,
    templates,
    exerciseCounts: templateQueries.map((q) => q.data?.exercises.length),
    loading:
      plansPending || activePending || planLoading || templateQueries.some((q) => q.isLoading),
  };
}
