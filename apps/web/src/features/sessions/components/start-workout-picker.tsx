import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { activePlanQueryOptions, planQueryOptions, usePlans } from '@/features/training';

interface StartWorkoutPickerProps {
  onSelectTemplate: (template: { id: string; name: string }) => void;
}

// Start-screen template browser (replaces the searchable select): lists the plans
// with the active one first, and picking a plan drills into its templates. With a
// single plan the plan list is skipped and its templates are the whole picker.
export function StartWorkoutPicker({ onSelectTemplate }: StartWorkoutPickerProps) {
  const { data: plans = [], isPending } = usePlans();
  const { data: activePlan } = useQuery(activePlanQueryOptions());
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  // Active plan first, then the rest alphabetically.
  const ordered = [...plans].sort((a, b) => {
    if (a.id === activePlan?.id) return -1;
    if (b.id === activePlan?.id) return 1;
    return a.name.localeCompare(b.name);
  });

  const singlePlan = ordered.length === 1;
  const firstPlan = ordered[0];
  // One plan: its templates are the whole picker; otherwise wait for a selection.
  const effectivePlanId = singlePlan && firstPlan ? firstPlan.id : selectedPlanId;

  if (isPending) {
    return <p className="text-muted-foreground text-center text-sm">Loading plans…</p>;
  }
  if (ordered.length === 0) {
    return (
      <p className="text-muted-foreground text-center text-sm">
        No training plans yet — create one to start from a template.
      </p>
    );
  }

  if (effectivePlanId) {
    return (
      <TemplatePicker
        planId={effectivePlanId}
        showBack={!singlePlan}
        onBack={() => setSelectedPlanId(null)}
        onSelectTemplate={onSelectTemplate}
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {ordered.map((plan) => (
        <Button
          key={plan.id}
          variant="outline"
          className="h-11 justify-between"
          onClick={() => setSelectedPlanId(plan.id)}
        >
          <span className="truncate">
            {plan.name}
            {plan.id === activePlan?.id && ' · active'}
          </span>
          <ChevronRight className="size-4 shrink-0 opacity-50" />
        </Button>
      ))}
    </div>
  );
}

interface TemplatePickerProps {
  planId: string;
  showBack: boolean;
  onBack: () => void;
  onSelectTemplate: (template: { id: string; name: string }) => void;
}

// The chosen plan's templates. Loaded on demand (shares the plan-detail cache).
function TemplatePicker({ planId, showBack, onBack, onSelectTemplate }: TemplatePickerProps) {
  const { data: plan, isPending } = useQuery(planQueryOptions(planId));
  const templates = plan?.templates ?? [];

  return (
    <div className="flex flex-col gap-2">
      {showBack && (
        <Button variant="ghost" size="sm" className="w-fit" onClick={onBack}>
          <ChevronLeft className="size-4" />
          All plans
        </Button>
      )}
      {isPending ? (
        <p className="text-muted-foreground text-center text-sm">Loading templates…</p>
      ) : templates.length === 0 ? (
        <p className="text-muted-foreground text-center text-sm">No templates in this plan.</p>
      ) : (
        templates.map((template) => (
          <Button
            key={template.id}
            variant="outline"
            className="h-11 justify-start"
            onClick={() => onSelectTemplate({ id: template.id, name: template.name })}
          >
            {template.name}
          </Button>
        ))
      )}
    </div>
  );
}
