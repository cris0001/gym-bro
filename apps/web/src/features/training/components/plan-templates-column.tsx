import { Star } from 'lucide-react';

import { SkeletonList } from '@/components/skeletons';

import { useDeletePlanFlow } from '../hooks/use-delete-plan-flow';
import { usePlan } from '../hooks/use-plan';
import { useSetActivePlan } from '../hooks/use-set-active-plan';
import { usePlanUiStore } from '../stores/plan-ui.store';
import { useTemplateUiStore } from '../stores/template-ui.store';
import { TemplateList } from './template-list';

interface PlanTemplatesColumnProps {
  planId: string;
  isActive: boolean;
  selectedTemplateId: string | null;
}

// Second column of the desktop plans workspace: the selected plan's header (edit,
// set active), its templates as a drag-to-reorder list linking to /templates/$id
// (the open one highlighted), "+ Add template", and Edit / Delete plan at the foot.
export function PlanTemplatesColumn({
  planId,
  isActive,
  selectedTemplateId,
}: PlanTemplatesColumnProps) {
  const { data: plan, isPending } = usePlan(planId);
  const setActive = useSetActivePlan();
  const openEdit = usePlanUiStore((s) => s.openEdit);
  const openCreateTemplate = useTemplateUiStore((s) => s.openCreate);
  const { deletePlan, isPending: deleting } = useDeletePlanFlow();

  if (isPending || !plan) {
    return (
      <div className="border-border border-r p-4">
        <SkeletonList rows={3} avatar={false} />
      </div>
    );
  }

  return (
    <div className="border-border flex flex-col gap-3 border-r p-4">
      <header className="flex flex-col gap-1">
        <h2 className="font-heading text-[20px] leading-tight font-semibold break-words">
          {plan.name}
        </h2>
        {plan.description ? (
          <p className="font-heading text-muted-foreground text-[12.5px] italic">
            {plan.description}
          </p>
        ) : null}
        {isActive ? (
          <span className="text-primary inline-flex items-center gap-1 text-[12px] font-semibold">
            <Star className="size-3.5 fill-current" />
            Active plan
          </span>
        ) : (
          <button
            type="button"
            className="text-primary inline-flex items-center gap-1 self-start text-[12px] font-semibold disabled:opacity-50"
            disabled={setActive.isPending}
            onClick={() => setActive.mutate(plan.id)}
          >
            <Star className="size-3.5" />
            Set as active
          </button>
        )}
      </header>

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
        <p className="text-muted-foreground text-[13px]">No templates yet.</p>
      ) : (
        <TemplateList planId={plan.id} templates={plan.templates} selectedId={selectedTemplateId} />
      )}

      <div className="border-border mt-auto flex gap-4 border-t border-dashed pt-3 text-[12.5px] font-semibold">
        <button type="button" className="text-primary" onClick={() => openEdit(plan)}>
          Edit plan
        </button>
        <button
          type="button"
          className="text-destructive disabled:opacity-50"
          disabled={deleting}
          onClick={() => void deletePlan(plan)}
        >
          Delete plan
        </button>
      </div>
    </div>
  );
}
