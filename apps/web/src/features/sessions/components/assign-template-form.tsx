import { useQueries, useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  activePlanQueryOptions,
  planQueryOptions,
  plansQueryOptions,
  templateQueryOptions,
} from '@/features/training';
import { cn } from '@/lib/utils';

import { useSessionsTranslation } from '../i18n';
import { useCreatePlannedSession } from '../hooks/use-create-planned-session';
import { AssignTemplateRow } from './assign-template-row';

interface AssignTemplateFormProps {
  date: string;
  onDone: () => void;
}

// Assigns a template to a date, styled as a day card (same surface as the planned
// to-do card): a header, plan chips (active plan first; hidden with a single plan),
// the plan's templates as numbered rows with their exercise counts, then Assign /
// Cancel. Any plan's templates are assignable (per the calendar model). Plain
// useState rather than RHF: the inputs are choices constrained to server lists.
export function AssignTemplateForm({ date, onDone }: AssignTemplateFormProps) {
  const { data: plans = [] } = useQuery(plansQueryOptions());
  const { data: activePlan } = useQuery(activePlanQueryOptions());

  const [planIdOverride, setPlanIdOverride] = useState<string | null>(null);
  const [templateId, setTemplateId] = useState<string | null>(null);

  // Effective plan = explicit pick, else active plan, else the first plan.
  const planId = planIdOverride ?? activePlan?.id ?? plans[0]?.id ?? null;
  const ordered = [...plans].sort((a, b) =>
    a.id === activePlan?.id ? -1 : b.id === activePlan?.id ? 1 : a.name.localeCompare(b.name),
  );

  const { data: plan } = useQuery({
    ...planQueryOptions(planId ?? ''),
    enabled: planId !== null,
  });
  const templates = plan?.templates ?? [];
  const templateQueries = useQueries({
    queries: templates.map((tpl) => templateQueryOptions(tpl.id)),
  });

  const createMutation = useCreatePlannedSession();
  const t = useSessionsTranslation();

  function handleAssign() {
    if (!templateId) return;
    createMutation.mutate(
      { workoutTemplateId: templateId, scheduledDate: date },
      { onSuccess: onDone },
    );
  }

  return (
    <div className="bg-card flex flex-col gap-3 rounded-2xl border p-4">
      <div className="flex items-start gap-3">
        <span className="bg-accent text-primary flex size-10 shrink-0 items-center justify-center rounded-full">
          <Plus className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-heading text-lg font-semibold">{t.assign.title}</p>
          <p className="text-muted-foreground text-xs">{t.assign.subtitle}</p>
        </div>
      </div>

      {plans.length === 0 ? (
        <p className="text-muted-foreground text-sm">{t.assign.noPlans}</p>
      ) : (
        <>
          {ordered.length > 1 && (
            <div className="flex flex-wrap gap-1.5">
              {ordered.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setPlanIdOverride(p.id);
                    setTemplateId(null);
                  }}
                  className={cn(
                    'h-9 rounded-full border px-3.5 text-[13px] font-semibold transition-colors',
                    p.id === planId
                      ? 'border-primary bg-accent text-primary'
                      : 'border-border bg-card text-muted-foreground hover:bg-muted',
                  )}
                >
                  {p.name}
                </button>
              ))}
            </div>
          )}

          {templates.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t.assign.noTemplates}</p>
          ) : (
            <ul className="flex flex-col">
              {templates.map((template, index) => {
                const count = templateQueries[index]?.data?.exercises.length;
                return (
                  <AssignTemplateRow
                    key={template.id}
                    index={index}
                    name={template.name}
                    meta={count === undefined ? undefined : t.startWorkout.exercises(count)}
                    selected={templateId === template.id}
                    onSelect={() => setTemplateId(template.id)}
                  />
                );
              })}
            </ul>
          )}
        </>
      )}

      {createMutation.isError && (
        <p className="text-destructive text-sm">{createMutation.error.message}</p>
      )}

      <div className="flex items-center gap-2">
        <Button
          className="h-10 flex-1 rounded-full"
          onClick={handleAssign}
          disabled={!templateId || createMutation.isPending}
        >
          {createMutation.isPending ? t.assign.assigning : t.assign.assign}
        </Button>
        <Button
          variant="ghost"
          className="text-muted-foreground h-10 rounded-full px-4"
          onClick={onDone}
        >
          {t.assign.cancel}
        </Button>
      </div>
    </div>
  );
}
