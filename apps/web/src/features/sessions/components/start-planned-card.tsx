import { useQuery } from '@tanstack/react-query';
import { parseISO } from 'date-fns';
import { Play } from 'lucide-react';

import type { PlannedSessionWithTemplate } from '@gym-bro/shared';

import { templateQueryOptions, usePlans } from '@/features/training';
import { cn } from '@/lib/utils';

import { useSessionsTranslation } from '../i18n';
import { formatDate } from '@/lib/i18n/date-format';

// How many exercises the card lists before "+N more".
const PREVIEW = 4;

interface StartPlannedCardProps {
  session: PlannedSessionWithTemplate;
  // 'today' = the primary-filled hero; 'upcoming' = the next planned session on a
  // later day, shown as a plain card so it reads as a suggestion, not today's plan.
  tone: 'today' | 'upcoming';
  onStart: () => void;
}

// The start screen's planned-session card. Phones: a compact row (label, name,
// plan · count, Start on the right). From lg up: the left-hand hero with the
// exercise list and a full-width Start.
export function StartPlannedCard({ session, tone, onStart }: StartPlannedCardProps) {
  const { data: template } = useQuery(templateQueryOptions(session.template.id));
  const { data: plans } = usePlans();
  const t = useSessionsTranslation();
  const today = tone === 'today';

  const planName = plans?.find((plan) => plan.id === template?.trainingPlanId)?.name;
  const names = template?.exercises.map((item) => item.exercise.name) ?? [];

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl p-3.5 lg:flex-col lg:items-stretch lg:gap-3.5 lg:p-5',
        today ? 'bg-primary text-primary-foreground' : 'bg-card border',
      )}
    >
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'text-[11px] font-medium tracking-[0.08em] uppercase',
            today ? 'opacity-75' : 'text-muted-foreground',
          )}
        >
          {today
            ? t.activeSession.plannedForToday
            : t.startWorkout.nextUp(formatDate(parseISO(session.scheduledDate), 'EEE, MMM d'))}
        </p>
        <p className="font-heading mt-0.5 truncate text-[19px] font-bold lg:mt-1 lg:text-2xl">
          {session.template.name}
        </p>
        {template && (
          <p className={cn('text-[13px]', today ? 'opacity-80' : 'text-muted-foreground')}>
            {planName && `${planName} · `}
            {t.startWorkout.exercises(names.length)}
          </p>
        )}
      </div>

      {names.length > 0 && (
        <ol className={cn('hidden flex-col gap-1 text-[13.5px] lg:flex', today && 'opacity-90')}>
          {names.slice(0, PREVIEW).map((name, i) => (
            <li key={i} className="flex gap-2">
              <span
                className={cn(
                  'w-3 shrink-0 tabular-nums',
                  today ? 'opacity-70' : 'text-faint-foreground',
                )}
              >
                {i + 1}
              </span>
              <span className="truncate">{name}</span>
            </li>
          ))}
          {names.length > PREVIEW && (
            <li className={cn('pl-5', today ? 'opacity-70' : 'text-muted-foreground')}>
              {t.startWorkout.moreExercises(names.length - PREVIEW)}
            </li>
          )}
        </ol>
      )}

      <button
        type="button"
        onClick={onStart}
        className={cn(
          'flex h-9.5 shrink-0 items-center justify-center gap-1.5 rounded-full px-4 text-sm font-bold transition-opacity hover:opacity-90 lg:h-10',
          today ? 'bg-primary-foreground text-primary' : 'bg-accent text-accent-foreground',
        )}
      >
        <Play className="size-4 fill-current" />
        <span className="lg:hidden">{t.startWorkout.start}</span>
        <span className="hidden lg:inline">
          {today ? t.startWorkout.startAria(session.template.name) : t.startWorkout.startNow}
        </span>
      </button>
    </div>
  );
}
