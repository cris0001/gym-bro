import { useQueries, useQuery } from '@tanstack/react-query';
import { CalendarDays, ChevronLeft, ChevronRight, ClipboardList, Play } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  activePlanQueryOptions,
  planQueryOptions,
  templateQueryOptions,
  usePlans,
} from '@/features/training';

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
        <button
          key={plan.id}
          type="button"
          className="bg-card hover:bg-muted/50 flex items-center gap-3 rounded-2xl border p-4 text-left transition-colors"
          onClick={() => setSelectedPlanId(plan.id)}
        >
          <span className="bg-accent text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
            <ClipboardList className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="font-heading block truncate text-[17px] font-semibold">
              {plan.name}
            </span>
            <span className="text-muted-foreground block text-xs">
              {plan.templateCount} {plan.templateCount === 1 ? 'template' : 'templates'}
              {plan.id === activePlan?.id && ' · active'}
            </span>
          </span>
          <ChevronRight className="size-5 shrink-0 text-[#c9bda9] dark:text-[#5b4e3e]" />
        </button>
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

// The chosen plan's templates as start-cards (icon, name, exercise count, start arrow).
// Loaded on demand (shares the plan-detail cache); one detail query per template
// resolves its exercise count (cached, so starting reuses it).
function TemplatePicker({ planId, showBack, onBack, onSelectTemplate }: TemplatePickerProps) {
  const { data: plan, isPending } = useQuery(planQueryOptions(planId));
  const templates = plan?.templates ?? [];
  const templateQueries = useQueries({
    queries: templates.map((t) => templateQueryOptions(t.id)),
  });

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
        templates.map((template, i) => {
          const count = templateQueries[i]?.data?.exercises.length;
          return (
            <button
              key={template.id}
              type="button"
              className="bg-card hover:bg-muted/50 flex items-center gap-3 rounded-2xl border p-4 text-left transition-colors"
              onClick={() => onSelectTemplate({ id: template.id, name: template.name })}
            >
              <span className="bg-accent text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
                <CalendarDays className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="font-heading block truncate text-[17px] font-semibold">
                  {template.name}
                </span>
                <span className="text-muted-foreground block text-xs">
                  {count === undefined ? '…' : `${count} ${count === 1 ? 'exercise' : 'exercises'}`}
                </span>
              </span>
              <Play className="text-primary size-4 shrink-0 fill-current" />
            </button>
          );
        })
      )}
    </div>
  );
}
