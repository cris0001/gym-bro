import { useQuery } from '@tanstack/react-query';
import { Play } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { templateQueryOptions } from '@/features/training';

import { useSessionsTranslation } from '../i18n';

interface StartTemplateRowProps {
  template: { id: string; name: string };
  onStart: () => void;
}

// One template in a plan group on the start screen; the whole row starts it. The
// exercise line comes from the template detail (shared cache, so starting reuses it).
export function StartTemplateRow({ template, onStart }: StartTemplateRowProps) {
  const { data } = useQuery(templateQueryOptions(template.id));
  const t = useSessionsTranslation();
  const names = data?.exercises.map((item) => item.exercise.name);

  return (
    <li className="border-t first:border-t-0">
      <button
        type="button"
        aria-label={t.startWorkout.startAria(template.name)}
        onClick={onStart}
        className="hover:bg-muted/50 flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors"
      >
        <span className="min-w-0 flex-1">
          <span className="font-heading block truncate text-[15px] font-bold">{template.name}</span>
          {names ? (
            <span className="text-muted-foreground block truncate text-xs">
              {names.length > 0 ? names.join(' · ') : t.startWorkout.exercises(0)}
            </span>
          ) : (
            <Skeleton className="mt-1 h-3 w-2/3" />
          )}
        </span>
        <span className="bg-accent text-accent-foreground flex size-9 shrink-0 items-center justify-center rounded-full">
          <Play className="size-3.5 fill-current" />
        </span>
      </button>
    </li>
  );
}
