import { Link, useNavigate } from '@tanstack/react-router';
import { format, parseISO } from 'date-fns';
import { ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';

import { DeleteButton } from '@/components/delete-button';
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

interface WorkoutDetailProps {
  sessionId: string;
}

// Detail view of a finished workout. Mobile stacks header → stats strip → tags →
// note → exercise cards (each with its own note) → Delete. From lg the header spans
// the page and a sticky 320px sidebar (stats list, tags, note) sits beside the
// exercise cards. Actions follow the app's detail-page pattern (see PlanDetail): an
// outlined "Edit" pill in the header, a quiet centered Delete at the very bottom.
// Activity sessions have no performances, so they skip the stats and Edit.
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
  const stats = (variant: 'bar' | 'list') =>
    hasExercises ? (
      <WorkoutStats
        variant={variant}
        durationMinutes={session.durationMinutes}
        volume={totals.volume}
        sets={totals.sets}
        rating={session.rating}
      />
    ) : null;
  const tagsAndNote = (
    <>
      <WorkoutTagPills tags={session.tags} />
      {session.notes !== null && <WorkoutNote note={session.notes} />}
    </>
  );

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-3.5 p-3.5 md:p-4 lg:col-span-3 lg:max-w-[1040px] lg:py-6">
      <Link
        to="/calendar"
        className="text-muted-foreground hover:text-foreground inline-flex w-fit items-center gap-1 text-[13px] font-semibold"
      >
        <ChevronLeft className="size-[15px]" />
        {t.workoutDetail.calendarLink}
      </Link>

      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col items-start gap-2">
          {isStrength ? (
            <span className="inline-flex h-[22px] items-center rounded-full bg-[#e8efe4] px-[9px] text-[10.5px] font-bold tracking-[0.08em] text-[#5a7a52] uppercase dark:bg-[#2f3a2b] dark:text-[#8fae85]">
              {t.dayWorkout.finished}
            </span>
          ) : (
            <span className="bg-secondary text-subtle-foreground inline-flex h-[22px] items-center rounded-full px-[9px] text-[10.5px] font-bold tracking-[0.08em] uppercase">
              {t.workoutDetail.activity}
            </span>
          )}
          <h1 className="font-heading text-[30px] leading-[1.08] font-medium break-words lg:text-[36px]">
            {session.name}
          </h1>
          <p className="font-heading text-muted-foreground text-[14px] italic lg:text-[15px]">
            {format(parseISO(session.performedDate), 'EEEE, MMM d, yyyy')}
            {!hasExercises &&
              session.durationMinutes !== null &&
              ` · ${session.durationMinutes} min`}
            {!hasExercises && session.rating !== null && (
              <span className="text-primary ml-2 not-italic">{'★'.repeat(session.rating)}</span>
            )}
          </p>
        </div>
        {isStrength && (
          <button
            type="button"
            className="border-border bg-card text-primary h-9 shrink-0 rounded-full border px-4 text-[13px] font-semibold"
            onClick={() => void editWorkout(session)}
          >
            {t.common.edit}
          </button>
        )}
      </header>

      <div className="flex flex-col gap-3.5 lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-7">
        <div className="flex flex-col gap-3.5 lg:hidden">
          {stats('bar')}
          {tagsAndNote}
        </div>

        {hasExercises ? (
          <WorkoutPerformances
            performances={session.performances}
            performedDate={session.performedDate}
            className="xl:grid-cols-2"
          />
        ) : (
          <p className="text-muted-foreground text-[13px]">{t.workoutDetail.noExercises}</p>
        )}

        <aside className="hidden flex-col gap-3.5 lg:sticky lg:top-4 lg:flex">
          {stats('list')}
          {tagsAndNote}
        </aside>
      </div>

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
