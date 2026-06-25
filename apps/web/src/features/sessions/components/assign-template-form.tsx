import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { planQueryOptions, plansQueryOptions, activePlanQueryOptions } from '@/features/training';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { useCreatePlannedSession } from '../hooks/use-create-planned-session';

interface AssignTemplateFormProps {
  date: string;
  onDone: () => void;
}

// Assigns a template to a date. Any plan's templates are assignable (per the
// calendar model), so the user picks a plan — defaulting to the active one —
// then a template. Plain useState rather than RHF: the only inputs are choices
// constrained to server lists, with no field-level validation.
export function AssignTemplateForm({ date, onDone }: AssignTemplateFormProps) {
  const { data: plans = [] } = useQuery(plansQueryOptions());
  const { data: activePlan } = useQuery(activePlanQueryOptions());

  const [planIdOverride, setPlanIdOverride] = useState<string | null>(null);
  const [templateId, setTemplateId] = useState<string | null>(null);

  // Effective plan = explicit pick, else active plan, else the first plan.
  const planId = planIdOverride ?? activePlan?.id ?? plans[0]?.id ?? null;

  const { data: plan } = useQuery({
    ...planQueryOptions(planId ?? ''),
    enabled: planId !== null,
  });
  const templates = plan?.templates ?? [];

  const createMutation = useCreatePlannedSession();

  function handleAssign() {
    if (!templateId) return;
    createMutation.mutate(
      { workoutTemplateId: templateId, scheduledDate: date },
      { onSuccess: onDone },
    );
  }

  if (plans.length === 0) {
    return (
      <p className="text-muted-foreground p-4 text-sm">
        Create a plan with templates first, then assign it here.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      <label className="flex flex-col gap-1 text-sm font-medium">
        Plan
        <select
          value={planId ?? ''}
          onChange={(e) => {
            setPlanIdOverride(e.target.value);
            setTemplateId(null);
          }}
          className="border-input bg-background h-9 rounded-md border px-2 text-sm"
        >
          {plans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>

      {templates.length === 0 ? (
        <p className="text-muted-foreground text-sm">This plan has no templates yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {templates.map((template) => (
            <li key={template.id}>
              <button
                type="button"
                onClick={() => setTemplateId(template.id)}
                className={cn(
                  'flex min-h-11 w-full items-center rounded-md border px-3 text-left text-sm transition-colors',
                  'hover:bg-accent',
                  templateId === template.id && 'border-primary bg-accent',
                )}
              >
                {template.name}
              </button>
            </li>
          ))}
        </ul>
      )}

      {createMutation.isError && (
        <p className="text-destructive text-sm">{createMutation.error.message}</p>
      )}

      <Button onClick={handleAssign} disabled={!templateId || createMutation.isPending}>
        {createMutation.isPending ? 'Assigning…' : 'Assign'}
      </Button>
    </div>
  );
}
