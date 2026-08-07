import { useNavigate } from '@tanstack/react-router';
import { format, parseISO } from 'date-fns';
import { CalendarDays, ChevronLeft, Play } from 'lucide-react';
import { useEffect, useState } from 'react';

import { BrandMark } from '@/components/brand-mark';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useConfirm } from '@/stores/confirm.store';

import { usePlannedSessions } from '../hooks/use-planned-sessions';
import { useStartWorkout } from '../hooks/use-start-workout';
import { useWorkoutDraftStore } from '../stores/workout-draft.store';
import { ExercisePerformanceCard } from './exercise-performance-card';
import { ExercisePickerSheet } from './exercise-picker-sheet';
import { FinishSessionSheet } from './finish-session-sheet';
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

  const todayIso = format(new Date(), 'yyyy-MM-dd');
  const { data: plannedToday = [] } = usePlannedSessions(todayIso, todayIso);
  const todaysPlanned = plannedToday.filter((session) => session.status === 'planned');

  const [picker, setPicker] = useState<PickerMode | null>(null);
  const [finishing, setFinishing] = useState(false);
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
          <BrandMark className="size-14 rounded-2xl" />
          <h1 className="font-heading text-[28px] leading-none font-medium">Start a workout</h1>
          <p className="font-heading text-muted-foreground text-sm italic">
            {format(new Date(), 'EEEE, MMMM d')}
          </p>
        </div>

        {todaysPlanned.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-muted-foreground px-1 text-[11px] font-medium tracking-[0.08em] uppercase">
              Planned for today
            </p>
            {todaysPlanned.map((session) => (
              <button
                key={session.id}
                type="button"
                className="bg-card hover:bg-muted/50 flex items-center gap-3 rounded-2xl border p-4 text-left transition-colors"
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
                  <span className="text-muted-foreground block text-xs">planned for today</span>
                </span>
                <Play className="size-4 shrink-0 fill-current text-[#c25a3a]" />
              </button>
            ))}
            <div className="text-muted-foreground font-heading flex items-center gap-3 text-xs italic">
              <span className="bg-border h-px flex-1" />
              or pick a template
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
          className="text-muted-foreground h-11"
          onClick={() => void startEmpty()}
        >
          Start empty workout
        </Button>
      </div>
    );
  }

  const isEditing = draft.editingSessionId !== null;
  // A template-started session takes the template's name; only ad-hoc sessions
  // (started empty) get a free, editable name.
  const isTemplateBased = draft.workoutTemplateId !== null;

  async function handleDiscard() {
    const ok = await confirm({
      title: isEditing ? 'Stop editing?' : 'Discard this workout?',
      description: isEditing ? "Your changes won't be saved." : 'Logged sets will be lost.',
      confirmText: isEditing ? 'Stop editing' : 'Discard',
      destructive: true,
    });
    if (ok) discard();
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-3 md:p-4 pb-28 lg:col-span-3">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground -ml-2 gap-1.5"
          aria-label="Minimize — your session keeps running in the background"
          onClick={() => void navigate({ to: '/' })}
        >
          <ChevronLeft className="size-4" />
          Minimize
        </Button>
        {draft.startedAt && !isEditing ? (
          <span className="bg-accent text-primary rounded-full px-3 py-1 text-sm font-extrabold tabular-nums">
            {formatElapsed(now - new Date(draft.startedAt).getTime())}
          </span>
        ) : null}
      </div>
      <header className="bg-card flex flex-col gap-1 rounded-2xl border p-4">
        {isTemplateBased ? (
          <h1 className="font-heading text-[23px] font-semibold">{draft.name}</h1>
        ) : (
          <Input
            aria-label="Workout name"
            className="font-heading h-11 text-[23px] font-semibold"
            value={draft.name}
            onChange={(e) => setName(e.target.value)}
          />
        )}
        <p className="font-heading text-muted-foreground text-sm italic">
          {format(parseISO(draft.performedDate), 'EEEE, MMMM d')} ·{' '}
          {isTemplateBased ? 'from template' : 'freestyle'}
        </p>
        <label className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
          Date
          <input
            type="date"
            aria-label="Workout date"
            className="border-input text-foreground h-9 rounded-md border bg-background px-2 text-sm"
            value={draft.performedDate}
            onChange={(e) => e.target.value && setPerformedDate(e.target.value)}
          />
        </label>
      </header>

      <div className="flex flex-col gap-3">
        {draft.performances.map((performance) => (
          <ExercisePerformanceCard
            key={performance.id}
            performance={performance}
            onSwap={() => setPicker({ type: 'swap', performanceId: performance.id })}
          />
        ))}
      </div>

      <Button variant="outline" className="h-11" onClick={() => setPicker({ type: 'add' })}>
        Add exercise
      </Button>

      <div className="bg-background/95 fixed inset-x-0 bottom-0 z-30 border-t p-3 backdrop-blur lg:left-60">
        <div className="flex w-full max-w-3xl gap-2">
          <Button
            variant="ghost"
            className="text-muted-foreground h-12 rounded-full px-5"
            onClick={() => void handleDiscard()}
          >
            {isEditing ? 'Cancel' : 'Discard'}
          </Button>
          <Button className="h-12 flex-1 rounded-full" onClick={() => setFinishing(true)}>
            {isEditing ? 'Save changes' : 'Finish workout'}
          </Button>
        </div>
      </div>

      <ExercisePickerSheet mode={picker} onClose={() => setPicker(null)} />
      <FinishSessionSheet open={finishing} onClose={() => setFinishing(false)} />
    </div>
  );
}
