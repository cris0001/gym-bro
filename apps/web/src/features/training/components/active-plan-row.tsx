import { useQueries } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { ChevronDown, Pencil, Star } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/utils';

import type { TemplateExerciseWithExercise } from '@gym-bro/shared';

import { usePlan } from '../hooks/use-plan';
import { templateQueryOptions } from '../hooks/use-template';

interface ActivePlanRowProps {
  planId: string;
  name: string;
}

// A compact "N×min–max" target label for a template exercise, or null when it has no
// targets set (so the row just shows the name).
function targetLabel(ex: TemplateExerciseWithExercise): string | null {
  const { targetSets, targetRepsMin, targetRepsMax } = ex;
  const reps =
    targetRepsMin != null && targetRepsMax != null
      ? targetRepsMin === targetRepsMax
        ? `${targetRepsMin}`
        : `${targetRepsMin}–${targetRepsMax}`
      : targetRepsMin != null
        ? `${targetRepsMin}`
        : null;
  if (targetSets != null && reps) return `${targetSets}×${reps}`;
  if (targetSets != null) return `${targetSets} sets`;
  if (reps) return `${reps} reps`;
  return null;
}

// The active plan's row in the plans list: an expandable header (open by default) that
// reveals each template and its exercises, read-only, so the page shows the current
// plan at a glance. Editing is via the "Open plan" link (the plan's detail route).
export function ActivePlanRow({ planId, name }: ActivePlanRowProps) {
  const [expanded, setExpanded] = useState(true);
  const { data: plan } = usePlan(planId);
  const templates = plan?.templates ?? [];
  // One detail query per template (dynamic length is fine via useQueries) for its
  // exercises; cached under templateKeys.detail, so opening the builder reuses them.
  const templateQueries = useQueries({
    queries: templates.map((t) => templateQueryOptions(t.id)),
  });

  return (
    <li className="bg-primary/5">
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex min-w-0 flex-1 items-center gap-3 py-3 pr-2 pl-4 text-left"
          aria-expanded={expanded}
        >
          <Star className="text-primary size-4 shrink-0 fill-current" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{name}</p>
            <p className="text-primary/80 text-xs font-medium">
              Active plan · {templates.length} {templates.length === 1 ? 'template' : 'templates'}
            </p>
          </div>
          <ChevronDown
            className={cn(
              'text-muted-foreground size-4 shrink-0 transition-transform',
              !expanded && '-rotate-90',
            )}
          />
        </button>
        <Link
          to="/plans/$planId"
          params={{ planId }}
          aria-label={`Edit ${name}`}
          className="text-muted-foreground flex size-11 shrink-0 items-center justify-center"
        >
          <Pencil className="size-4" />
        </Link>
      </div>

      {expanded && (
        <div className="px-4 pb-4">
          {templates.length === 0 ? (
            <p className="text-muted-foreground text-sm">This plan has no templates yet.</p>
          ) : (
            // A board of template columns: as many across as fit, wrapping to new rows
            // on narrow screens so the section stays short instead of one tall stack.
            <div className="grid grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] gap-x-6 gap-y-4">
              {templates.map((template, i) => {
                const detail = templateQueries[i]?.data;
                return (
                  <div key={template.id} className="min-w-0">
                    <p className="text-foreground mb-1.5 border-b pb-1 text-xs font-semibold tracking-wide uppercase">
                      {template.name}
                    </p>
                    {!detail ? (
                      <p className="text-muted-foreground text-sm">Loading…</p>
                    ) : detail.exercises.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No exercises yet.</p>
                    ) : (
                      <ul className="flex flex-col gap-0.5 text-sm">
                        {detail.exercises.map((ex) => {
                          const target = targetLabel(ex);
                          return (
                            <li key={ex.id} className="flex items-baseline justify-between gap-2">
                              <span className="min-w-0 truncate">{ex.exercise.name}</span>
                              {target ? (
                                <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                                  {target}
                                </span>
                              ) : null}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </li>
  );
}
