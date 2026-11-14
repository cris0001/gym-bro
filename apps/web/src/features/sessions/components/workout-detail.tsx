import { Link, useNavigate } from '@tanstack/react-router';
import { parseISO } from 'date-fns';
import { ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';

import { DeleteButton } from '@/components/delete-button';
import { Button } from '@/components/ui/button';
import { useConfirm } from '@/stores/confirm.store';

import { useSessionsTranslation } from '../i18n';
import { useDeleteWorkoutSession } from '../hooks/use-delete-workout-session';
import { useEditWorkout } from '../hooks/use-edit-workout';
import { useWorkoutSession } from '../hooks/use-workout-session';
import { workoutTotals } from '../utils/workout-totals';
import { WorkoutDetailSkeleton, WorkoutNotFound } from './workout-detail-states';
import { WorkoutNote } from './workout-note';
import { WorkoutPerformances } from './workout-performances';
import { WorkoutStats } from './workout-stats';
import { WorkoutTagPills } from './workout-tag-pills';
import { formatDate } from '@/lib/i18n/date-format';

interface WorkoutDetailProps {
  sessionId: string;
}

// Detail view of a finished workout, one column on every screen: header (name with
// its Finished badge, date, a primary Edit) → stat tiles → tags + note → exercise rows
// (each with its note and a History toggle) → a quiet centered Delete. Activity
// sessions have no performances, so they skip the stats and Edit.
export function WorkoutDetail({ sessionId }: WorkoutDetailProps) {
  const navigate = useNavigate();
  const { data: session, isLoading, isError } = useWorkoutSession(sessionId);
  const deleteMutation = useDeleteWorkoutSession();
  const editWorkout = useEditWorkout();
  const confirm = useConfirm();
  const t = useSessionsTranslation();

  async function handleDelete() {
    const ok = await confirm({
      title: t.common.deleteWorkoutConfirm.title,
      description: t.common.deleteWorkoutConfirm.description,
      confirmText: t.common.deleteWorkoutConfirm.confirmText,
      destructive: true,
    });
    if (ok) {
      deleteMutation.mutate(sessionId, {
        onSuccess: () => {
          toast.success(t.common.workoutDeleted);
          void navigate({ to: '/calendar' });
        },
      });
    }
  }

  if (isLoading) return <WorkoutDetailSkeleton />;
  if (isError || !session) return <WorkoutNotFound />;

  const isStrength = session.sessionType === 'strength';
  const hasExercises = session.performances.length > 0;
  const totals = workoutTotals(session);
  const hasTagsOrNote = session.tags.length > 0 || session.notes !== null;

  return (
    <div className="flex w-full max-w-6xl flex-col gap-4 p-3.5 md:p-4 lg:col-start-2">
      {/* Desktop has the sidebar to get back, so the back link is phone/tablet only. */}
      <Link
        to="/calendar"
        className="text-muted-foreground hover:text-foreground inline-flex w-fit items-center gap-1 text-[13px] font-semibold lg:hidden"
      >
        <ChevronLeft className="size-[15px]" />
        {t.workoutDetail.calendarLink}
      </Link>

      <header className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          {/* The workout's own date sits above the name, like every page's date line. */}
          <p className="text-muted-foreground text-sm">
            {formatDate(parseISO(session.performedDate), 'EEEE, MMM d, yyyy')}
            {!hasExercises &&
              session.durationMinutes !== null &&
              ` · ${session.durationMinutes} min`}
            {!hasExercises && session.rating !== null && (
              <span className="text-primary ml-2">{'★'.repeat(session.rating)}</span>
            )}
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <h1 className="font-heading text-[30px] leading-[1.08] font-bold tracking-tight break-words lg:text-[36px]">
              {session.name}
            </h1>
            {isStrength ? (
              <span className="inline-flex h-[22px] items-center rounded-full bg-[#e8efe4] px-[9px] text-[10.5px] font-bold tracking-[0.08em] text-[#4a6943] uppercase dark:bg-[#2f3a2b] dark:text-[#8fae85]">
                {t.dayWorkout.finished}
              </span>
            ) : (
              <span className="bg-secondary text-subtle-foreground inline-flex h-[22px] items-center rounded-full px-[9px] text-[10.5px] font-bold tracking-[0.08em] uppercase">
                {t.workoutDetail.activity}
              </span>
            )}
          </div>
        </div>
        {isStrength && (
          <Button
            className="h-9.5 shrink-0 rounded-full px-5"
            onClick={() => void editWorkout(session)}
          >
            {t.common.edit}
          </Button>
        )}
      </header>

      {hasExercises && (
        <WorkoutStats
          durationMinutes={session.durationMinutes}
          volume={totals.volume}
          sets={totals.sets}
          rating={session.rating}
        />
      )}

      {hasTagsOrNote && (
        <div className="bg-card flex flex-col gap-3 rounded-xl border p-4">
          <WorkoutTagPills tags={session.tags} />
          {session.notes !== null && <WorkoutNote note={session.notes} variant="plain" />}
        </div>
      )}

      {hasExercises ? (
        <WorkoutPerformances
          performances={session.performances}
          performedDate={session.performedDate}
        />
      ) : (
        <p className="text-muted-foreground text-[13px]">{t.workoutDetail.noExercises}</p>
      )}

      <DeleteButton
        className="mt-2 self-center"
        onClick={() => void handleDelete()}
        disabled={deleteMutation.isPending}
      >
        {t.common.delete}
      </DeleteButton>
    </div>
  );
}
