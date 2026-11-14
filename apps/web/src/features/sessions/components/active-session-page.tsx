import { useNavigate } from '@tanstack/react-router';
import { format, parseISO } from 'date-fns';
import { CalendarDays, ChevronLeft, Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { BrandMark } from '@/components/brand-mark';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useConfirm } from '@/stores/confirm.store';

import { useSessionsTranslation } from '../i18n';
import { useLeaveEdit } from '../hooks/use-leave-edit';
import { usePlannedSessions } from '../hooks/use-planned-sessions';
import { useStartWorkout } from '../hooks/use-start-workout';
import { useWorkoutDraftStore } from '../stores/workout-draft.store';
import { ExercisePerformanceCard } from './exercise-performance-card';
import { ExercisePickerSheet } from './exercise-picker-sheet';
import { FinishSessionSheet } from './finish-session-sheet';
import { SessionHistoryPanel } from './session-history-panel';
import { StartWorkoutPicker } from './start-workout-picker';

// Elapsed workout time as "M:SS" (or "H:MM:SS" past an hour) for the running chip.
function formatElapsed(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

// Add a brand-new exercise, or swap the one at a given performance — both pick
// from the exercise library, so one picker sheet serves both via this mode.
export type PickerMode = { type: 'add' } | { type: 'swap'; performanceId: string };

// The active workout screen: the in-progress draft (from the persisted store)
// rendered as editable name + exercise cards + set logging, with a sticky
// finish/discard bar. No draft = nothing in progress. One-handed, mobile-first.
export function ActiveSessionPage() {
  const draft = useWorkoutDraftStore((s) => s.draft);
  const setName = useWorkoutDraftStore((s) => s.setName);
  const setPerformedDate = useWorkoutDraftStore((s) => s.setPerformedDate);
  const discard = useWorkoutDraftStore((s) => s.discard);
  const { startFromTemplate, startEmpty } = useStartWorkout();
  const confirm = useConfirm();
  const navigate = useNavigate();
  const leaveEdit = useLeaveEdit();
  const t = useSessionsTranslation();

  const todayIso = format(new Date(), 'yyyy-MM-dd');
  const { data: plannedToday = [] } = usePlannedSessions(todayIso, todayIso);
  const todaysPlanned = plannedToday.filter((session) => session.status === 'planned');

  const [picker, setPicker] = useState<PickerMode | null>(null);
  const [finishing, setFinishing] = useState(false);
  // The date field is hidden; the "edit date" link opens its native picker.
  const dateInputRef = useRef<HTMLInputElement>(null);
  // Ticks the running-time chip once a second.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!draft) {
    return (
      <div className="mx-auto flex w-full max-w-sm flex-col gap-4 p-6 pt-10 lg:col-span-3">
        <div className="flex flex-col items-center gap-2 text-center">
          <BrandMark className="size-14 rounded-xl" />
          <h1 className="font-heading text-[28px] leading-none font-bold tracking-tight">
            {t.activeSession.startTitle}
          </h1>
          <p className="text-muted-foreground text-sm">{format(new Date(), 'EEEE, MMMM d')}</p>
        </div>

        {todaysPlanned.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-muted-foreground px-1 text-[11px] font-medium tracking-[0.08em] uppercase">
              {t.activeSession.plannedForToday}
            </p>
            {todaysPlanned.map((session) => (
              <button
                key={session.id}
                type="button"
                className="bg-card hover:bg-muted/50 flex items-center gap-3 rounded-xl border p-4 text-left transition-colors"
                onClick={() =>
                  void startFromTemplate({
                    templateId: session.template.id,
                    templateName: session.template.name,
                    plannedSessionId: session.id,
                    scheduledDate: session.scheduledDate,
                  })
                }
              >
                <span className="bg-accent text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
                  <CalendarDays className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="font-heading block truncate text-[17px] font-semibold">
                    {session.template.name}
                  </span>
                  <span className="text-muted-foreground block text-xs">
                    {t.activeSession.plannedForTodayCaption}
                  </span>
                </span>
                <Play className="text-primary size-4 shrink-0 fill-current" />
              </button>
            ))}
            <div className="text-muted-foreground flex items-center gap-3 text-xs">
              <span className="bg-border h-px flex-1" />
              {t.activeSession.orPickTemplate}
              <span className="bg-border h-px flex-1" />
            </div>
          </div>
        )}

        <StartWorkoutPicker
          onSelectTemplate={(template) => {
            void startFromTemplate({ templateId: template.id, templateName: template.name });
          }}
        />
        <Button
          variant="ghost"
          className="text-muted-foreground h-10"
          onClick={() => void startEmpty()}
        >
          {t.activeSession.startEmpty}
        </Button>
      </div>
    );
  }

  const isEditing = draft.editingSessionId !== null;
  // A template-started session takes the template's name; only ad-hoc sessions
  // (started empty) get a free, editable name.
  const isTemplateBased = draft.workoutTemplateId !== null;

  async function handleDiscard() {
    const dc = t.activeSession.discardConfirm;
    const ok = await confirm({
      title: isEditing ? dc.stopTitle : dc.discardTitle,
      description: isEditing ? dc.stopDescription : dc.discardDescription,
      confirmText: isEditing ? dc.stopConfirm : dc.discardConfirm,
      destructive: true,
    });
    if (!ok || !draft) return;
    // `draft` is this render's snapshot, so it still holds returnTo after discard().
    discard();
    leaveEdit(draft);
  }

  // Opens the hidden date field's native picker (falls back to focusing it).
  function openDatePicker() {
    const el = dateInputRef.current;
    if (!el) return;
    if (typeof el.showPicker === 'function') el.showPicker();
    else el.focus();
  }

  const discardLabel = isEditing ? t.activeSession.cancel : t.activeSession.discard;
  const saveLabel = isEditing ? t.activeSession.saveChanges : t.activeSession.finishWorkout;

  return (
    <div className="flex w-full max-w-6xl flex-col gap-3 p-3 pb-28 md:p-4 md:pb-8 lg:col-start-2">
      {/* Mobile: minimize + running timer (desktop shows the timer in the header). */}
      <div className="flex items-center justify-between md:hidden">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground -ml-2 gap-1.5"
          aria-label={t.activeSession.minimizeAria}
          onClick={() => void navigate({ to: '/dashboard' })}
        >
          <ChevronLeft className="size-4" />
          {t.activeSession.minimize}
        </Button>
        {draft.startedAt && !isEditing ? (
          <span className="bg-accent text-primary rounded-full px-3 py-1 text-xs font-extrabold tabular-nums">
            {formatElapsed(now - new Date(draft.startedAt).getTime())}
          </span>
        ) : null}
      </div>

      <header className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          {/* Date line above the name, like every page's header. */}
          <p className="text-muted-foreground text-sm">
            {format(parseISO(draft.performedDate), 'EEEE, MMMM d')} ·{' '}
            {isTemplateBased ? t.activeSession.fromTemplate : t.activeSession.freestyle} ·{' '}
            <button
              type="button"
              className="hover:text-foreground underline underline-offset-2"
              onClick={openDatePicker}
            >
              {t.activeSession.editDate}
            </button>
          </p>
          {isTemplateBased ? (
            <h1 className="font-heading truncate text-[26px] font-bold tracking-tight md:text-[30px]">
              {draft.name}
            </h1>
          ) : (
            <Input
              aria-label={t.activeSession.workoutNameAria}
              className="font-heading h-auto border-transparent bg-transparent px-0 text-[26px] font-bold tracking-tight shadow-none focus-visible:ring-0 md:text-[30px]"
              value={draft.name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
          <input
            ref={dateInputRef}
            type="date"
            aria-label={t.activeSession.workoutDateAria}
            className="sr-only"
            value={draft.performedDate}
            onChange={(e) => e.target.value && setPerformedDate(e.target.value)}
          />
        </div>

        {/* Desktop: timer + actions in the header — no bottom bar, no minimize (the
            sidebar is right there). */}
        <div className="hidden shrink-0 items-center gap-2 md:flex">
          {draft.startedAt && !isEditing ? (
            <span className="bg-accent text-primary rounded-full px-3.5 py-1.5 text-sm font-extrabold tabular-nums">
              {formatElapsed(now - new Date(draft.startedAt).getTime())}
            </span>
          ) : null}
          <Button
            variant="ghost"
            className="text-muted-foreground h-9.5 rounded-full px-4"
            onClick={() => void handleDiscard()}
          >
            {discardLabel}
          </Button>
          <Button className="h-9.5 rounded-full px-6" onClick={() => setFinishing(true)}>
            {saveLabel}
          </Button>
        </div>
      </header>

      {/* From 1200px: exercise cards on the left, a history card per exercise on the
          right. */}
      <div className="flex flex-col gap-3 min-[1200px]:grid min-[1200px]:grid-cols-[minmax(0,1fr)_21.5rem] min-[1200px]:items-start min-[1200px]:gap-5">
        <div className="flex flex-col gap-3">
          {draft.performances.map((performance) => (
            <ExercisePerformanceCard
              key={performance.id}
              performance={performance}
              onSwap={() => setPicker({ type: 'swap', performanceId: performance.id })}
            />
          ))}
          <button
            type="button"
            className="w-full rounded-xl bg-accent py-2.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/70"
            onClick={() => setPicker({ type: 'add' })}
          >
            {t.activeSession.addExercise}
          </button>
        </div>
        <SessionHistoryPanel
          performances={draft.performances}
          performedDate={draft.performedDate}
        />
      </div>

      {/* Mobile: sticky action bar (desktop uses the header actions). */}
      <div className="bg-background/95 fixed inset-x-0 bottom-0 z-30 border-t p-3 backdrop-blur md:hidden">
        <div className="mx-auto flex w-full max-w-[820px] gap-2">
          <Button
            variant="ghost"
            className="text-muted-foreground h-9.5 rounded-full px-5"
            onClick={() => void handleDiscard()}
          >
            {discardLabel}
          </Button>
          <Button className="h-9.5 flex-1 rounded-full" onClick={() => setFinishing(true)}>
            {saveLabel}
          </Button>
        </div>
      </div>

      <ExercisePickerSheet mode={picker} onClose={() => setPicker(null)} />
      <FinishSessionSheet open={finishing} onClose={() => setFinishing(false)} />
    </div>
  );
}
