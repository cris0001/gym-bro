import { format } from 'date-fns';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { useWorkoutDraftStore } from '../stores/workout-draft.store';
import { ExercisePerformanceCard } from './exercise-performance-card';
import { ExercisePickerSheet } from './exercise-picker-sheet';
import { FinishSessionSheet } from './finish-session-sheet';

// Add a brand-new exercise, or swap the one at a given performance — both pick
// from the exercise library, so one picker sheet serves both via this mode.
export type PickerMode = { type: 'add' } | { type: 'swap'; performanceId: string };

// The active workout screen: the in-progress draft (from the persisted store)
// rendered as editable name + exercise cards + set logging, with a sticky
// finish/discard bar. No draft = nothing in progress. One-handed, mobile-first.
export function ActiveSessionPage() {
  const draft = useWorkoutDraftStore((s) => s.draft);
  const start = useWorkoutDraftStore((s) => s.start);
  const setName = useWorkoutDraftStore((s) => s.setName);
  const discard = useWorkoutDraftStore((s) => s.discard);

  const [picker, setPicker] = useState<PickerMode | null>(null);
  const [finishing, setFinishing] = useState(false);

  if (!draft) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 p-8 text-center">
        <h1 className="text-2xl font-bold">No active workout</h1>
        <p className="text-muted-foreground text-sm">
          Start a session from a planned day on the calendar, or begin an empty one.
        </p>
        <Button
          className="h-11"
          onClick={() =>
            start({
              name: 'Workout',
              performedDate: format(new Date(), 'yyyy-MM-dd'),
              exercises: [],
            })
          }
        >
          Start empty workout
        </Button>
      </div>
    );
  }

  function handleDiscard() {
    if (window.confirm('Discard this workout? Logged sets will be lost.')) discard();
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-4 pb-28">
      <header className="flex flex-col gap-1">
        <Input
          aria-label="Workout name"
          className="h-11 text-lg font-semibold"
          value={draft.name}
          onChange={(e) => setName(e.target.value)}
        />
        <p className="text-muted-foreground text-sm">{draft.performedDate}</p>
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

      <div className="bg-background/95 fixed inset-x-0 bottom-0 border-t p-3 backdrop-blur">
        <div className="mx-auto flex w-full max-w-2xl gap-2">
          <Button variant="ghost" className="h-11" onClick={handleDiscard}>
            Discard
          </Button>
          <Button className="h-11 flex-1" onClick={() => setFinishing(true)}>
            Finish workout
          </Button>
        </div>
      </div>

      <ExercisePickerSheet mode={picker} onClose={() => setPicker(null)} />
      <FinishSessionSheet open={finishing} onClose={() => setFinishing(false)} />
    </div>
  );
}
