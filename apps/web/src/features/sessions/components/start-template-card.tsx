import { useQuery } from '@tanstack/react-query';
import { Play } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { templateQueryOptions } from '@/features/training';

import { useSessionsTranslation } from '../i18n';

// How many exercise names the preview shows before collapsing the rest into "+N".
const PREVIEW = 4;

interface StartTemplateCardProps {
  template: { id: string; name: string };
  onStart: () => void;
}

// Mobile start-screen card for one template (the whole card starts it): name,
// exercise count, a round Start, and a wrapped preview of the exercises.
export function StartTemplateCard({ template, onStart }: StartTemplateCardProps) {
  const { data } = useQuery(templateQueryOptions(template.id));
  const t = useSessionsTranslation();
  const names = data?.exercises.map((item) => item.exercise.name);

  return (
    <button
      type="button"
      aria-label={t.startWorkout.startAria(template.name)}
      onClick={onStart}
      className="bg-card active:bg-muted/50 flex flex-col gap-2 rounded-xl border p-3.5 text-left transition-colors"
    >
      <span className="flex w-full items-center gap-3">
        <span className="min-w-0 flex-1">
          <span className="font-heading block truncate text-[17px] font-bold">{template.name}</span>
          <span className="text-muted-foreground block text-xs">
            {names ? t.startWorkout.exercises(names.length) : '…'}
          </span>
        </span>
        <span className="bg-accent text-accent-foreground flex size-9.5 shrink-0 items-center justify-center rounded-full">
          <Play className="size-4 fill-current" />
        </span>
      </span>
      {!names ? (
        <Skeleton className="h-3.5 w-3/4" />
      ) : names.length > 0 ? (
        <span className="text-subtle-foreground text-[12.5px] leading-normal">
          {names.slice(0, PREVIEW).join(' · ')}
          {names.length > PREVIEW && ` · ${t.startWorkout.more(names.length - PREVIEW)}`}
        </span>
      ) : null}
    </button>
  );
}
