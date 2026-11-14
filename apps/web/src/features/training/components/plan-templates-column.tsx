import { Star } from 'lucide-react';

import { usePlan } from '../hooks/use-plan';
import { useSetActivePlan } from '../hooks/use-set-active-plan';
import { useTemplateUiStore } from '../stores/template-ui.store';
import { PlanTemplatesColumnSkeleton } from './plan-templates-column-skeleton';
import { TemplateList } from './template-list';

interface PlanTemplatesColumnProps {
  planId: string;
  isActive: boolean;
  selectedTemplateId: string | null;
}

// Second column of the desktop plans workspace: the selected plan's header (with Set as
// active) and its templates as a drag-to-reorder list linking to /templates/$id, the
// open one highlighted. Editing / deleting the plan itself sits on its row in the
// first column, like every other row's actions.
export function PlanTemplatesColumn({
  planId,
  isActive,
  selectedTemplateId,
}: PlanTemplatesColumnProps) {
  const { data: plan, isPending } = usePlan(planId);
  const setActive = useSetActivePlan();
  const openCreateTemplate = useTemplateUiStore((s) => s.openCreate);

  if (isPending || !plan) {
    return <PlanTemplatesColumnSkeleton />;
  }

  return (
    <div className="border-border flex flex-col gap-3 border-r p-4">
      <header className="flex flex-col gap-1">
        <h2 className="font-heading text-[20px] leading-tight font-semibold break-words">
          {plan.name}
        </h2>
        {plan.description ? (
          <p className="text-muted-foreground text-[12.5px]">{plan.description}</p>
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
        <span className="text-muted-foreground text-[11px] font-medium tracking-[0.08em] uppercase">
          Templates
        </span>
        <button
          type="button"
          onClick={() => openCreateTemplate(plan.id)}
          className="bg-accent text-accent-foreground hover:bg-accent/70 h-8 rounded-full px-3 text-[12.5px] font-semibold transition-colors"
        >
          + Add
        </button>
      </div>

      {plan.templates.length === 0 ? (
        <p className="text-muted-foreground text-[13px]">No templates yet.</p>
      ) : (
        <TemplateList
          planId={plan.id}
          templates={plan.templates}
          selectedId={selectedTemplateId}
          variant="column"
        />
      )}
    </div>
  );
}
