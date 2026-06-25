import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { useStartWorkout } from '../hooks/use-start-workout';
import { useWorkoutDraftStore } from '../stores/workout-draft.store';
import { ExercisePerformanceCard } from './exercise-performance-card';
import { ExercisePickerSheet } from './exercise-picker-sheet';
import { FinishSessionSheet } from './finish-session-sheet';
import { TemplateCombobox } from './template-combobox';

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

  const [picker, setPicker] = useState<PickerMode | null>(null);
  const [finishing, setFinishing] = useState(false);

  if (!draft) {
    return (
      <div className="mx-auto flex w-full max-w-sm flex-col gap-4 p-8">
        <h1 className="text-center text-2xl font-bold">Start a workout</h1>
        <p className="text-muted-foreground text-center text-sm">
          Pick a template, or begin an empty session and add exercises as you go.
        </p>
        <TemplateCombobox
          onSelect={(template) =>
            startFromTemplate({ templateId: template.id, templateName: template.name })
          }
        />
        <div className="text-muted-foreground flex items-center gap-3 text-xs">
          <span className="bg-border h-px flex-1" />
          or
          <span className="bg-border h-px flex-1" />
        </div>
        <Button variant="ghost" className="h-11" onClick={startEmpty}>
          Start empty workout
        </Button>
      </div>
    );
  }

  const isEditing = draft.editingSessionId !== null;

  function handleDiscard() {
    const message = isEditing
      ? "Stop editing? Your changes won't be saved."
      : 'Discard this workout? Logged sets will be lost.';
    if (window.confirm(message)) discard();
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-4 pb-28">
      <header className="flex flex-col gap-2">
        <Input
          aria-label="Workout name"
          className="h-11 text-lg font-semibold"
          value={draft.name}
          onChange={(e) => setName(e.target.value)}
        />
        <label className="text-muted-foreground flex items-center gap-2 text-sm">
          Date
          <input
            type="date"
            aria-label="Workout date"
            className="border-input text-foreground h-9 rounded-md border bg-transparent px-2 text-sm"
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

      <div className="bg-background/95 fixed inset-x-0 bottom-0 z-30 border-t p-3 backdrop-blur lg:left-56">
        <div className="mx-auto flex w-full max-w-2xl gap-2">
          <Button variant="ghost" className="h-11" onClick={handleDiscard}>
            {isEditing ? 'Cancel' : 'Discard'}
          </Button>
          <Button className="h-11 flex-1" onClick={() => setFinishing(true)}>
            {isEditing ? 'Save changes' : 'Finish workout'}
          </Button>
        </div>
      </div>

      <ExercisePickerSheet mode={picker} onClose={() => setPicker(null)} />
      <FinishSessionSheet open={finishing} onClose={() => setFinishing(false)} />
    </div>
  );
}
