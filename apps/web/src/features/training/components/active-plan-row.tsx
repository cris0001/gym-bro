import { useQueries } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { ChevronDown, ChevronRight, GripVertical, Pencil } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/utils';

import { usePlan } from '../hooks/use-plan';
import { templateQueryOptions } from '../hooks/use-template';

interface ActivePlanRowProps {
  planId: string;
  name: string;
}

// The active plan as its own card: an expandable header (open by default) revealing its
// templates as rows (drag handle, name, exercise count, chevron → the template builder).
// Edit reaches the plan detail. Read-only reorder here — reordering lives on the detail.
export function ActivePlanRow({ planId, name }: ActivePlanRowProps) {
  const [expanded, setExpanded] = useState(true);
  const { data: plan } = usePlan(planId);
  const templates = plan?.templates ?? [];
  // One detail query per template for its exercise count; cached so opening the builder
  // reuses them.
  const templateQueries = useQueries({
    queries: templates.map((t) => templateQueryOptions(t.id)),
  });

  return (
    <div className="bg-card overflow-hidden rounded-2xl border">
      <div className="flex items-center gap-2 p-4">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
          aria-expanded={expanded}
        >
          <span className="font-heading truncate text-lg font-semibold">{name}</span>
          <span className="bg-accent text-accent-foreground shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-[0.08em] uppercase">
            Active
          </span>
        </button>
        <Link
          to="/plans/$planId"
          params={{ planId }}
          aria-label={`Edit ${name}`}
          className="text-muted-foreground flex size-8 shrink-0 items-center justify-center"
        >
          <Pencil className="size-4" />
        </Link>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-label={expanded ? 'Collapse' : 'Expand'}
          className="text-muted-foreground flex size-8 shrink-0 items-center justify-center"
        >
          <ChevronDown className={cn('size-4 transition-transform', !expanded && '-rotate-90')} />
        </button>
      </div>

      {expanded &&
        (templates.length === 0 ? (
          <p className="text-muted-foreground border-t border-dashed border-[#e4dad2] px-4 py-3 text-sm dark:border-[#40353c]">
            This plan has no templates yet.
          </p>
        ) : (
          <ul className="divide-y divide-dashed divide-[#e4dad2] border-t border-dashed border-[#e4dad2] dark:divide-[#40353c] dark:border-[#40353c]">
            {templates.map((template, i) => {
              const count = templateQueries[i]?.data?.exercises.length ?? 0;
              return (
                <li
                  key={template.id}
                  className="hover:bg-accent flex items-center gap-2 px-4 py-2.5 transition-colors"
                >
                  <GripVertical className="size-4 shrink-0 text-[#c9bcb2] dark:text-[#5a4d55]" />
                  <Link
                    to="/templates/$templateId"
                    params={{ templateId: template.id }}
                    className="min-w-0 flex-1"
                  >
                    <p className="truncate text-sm font-semibold">{template.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {count} {count === 1 ? 'exercise' : 'exercises'}
                    </p>
                  </Link>
                  <ChevronRight className="size-4 shrink-0 text-[#c9bcb2] dark:text-[#5a4d55]" />
                </li>
              );
            })}
          </ul>
        ))}
    </div>
  );
}
