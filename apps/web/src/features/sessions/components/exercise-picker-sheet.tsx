import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { EXERCISE_CATEGORIES, type ExerciseCategory } from '@gym-bro/shared';

import { templateQueryOptions, useExercises } from '@/features/training';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { FIELD_CLASS } from '@/lib/form-styles';

import { useSessionsTranslation } from '../i18n';
import { useWorkoutDraftStore } from '../stores/workout-draft.store';
import type { PickerMode } from './active-session-page';
import { ExerciseCategoryChips } from './exercise-category-chips';
import { ExercisePickerList } from './exercise-picker-list';
import type { PickableExercise } from './exercise-picker-row';
import { PickerSourceToggle } from './picker-source-toggle';
import { foldText, matchesQuery } from '@/utils/fold-text';

interface ExercisePickerSheetProps {
  mode: PickerMode | null;
  onClose: () => void;
}

// Sheet (bottom on phones, centred modal on desktop) to add an exercise or swap one
// (same picker, behaviour chosen by `mode`). A session started from a template can
// scope to that template's exercises (default for "add"; "swap" opens on the full
// library). Search + category chips narrow the list; soft-deleted exercises are hidden.
export function ExercisePickerSheet({ mode, onClose }: ExercisePickerSheetProps) {
  const t = useSessionsTranslation();
  const { data: exercises = [], isPending: exercisesPending } = useExercises();
  const draft = useWorkoutDraftStore((s) => s.draft);
  const addExercise = useWorkoutDraftStore((s) => s.addExercise);
  const swapExercise = useWorkoutDraftStore((s) => s.swapExercise);
  const workoutTemplateId = draft?.workoutTemplateId ?? null;

  // isLoading, not isPending: a disabled query (no template) stays pending forever.
  const { data: template, isLoading: templateLoading } = useQuery({
    ...templateQueryOptions(workoutTemplateId ?? ''),
    enabled: workoutTemplateId !== null,
  });
  const [source, setSource] = useState<'template' | 'all'>('template');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<ExerciseCategory | null>(null);

  // Add scopes to the template by default; swap opens on the full library.
  useEffect(() => {
    setSource(mode?.type === 'swap' ? 'all' : 'template');
    setCategory(null);
  }, [mode]);

  const isSwap = mode?.type === 'swap';
  const effectiveSource = workoutTemplateId !== null ? source : 'all';
  const listLoading = effectiveSource === 'template' ? templateLoading : exercisesPending;
  const candidates: PickableExercise[] = (
    effectiveSource === 'template'
      ? (template?.exercises ?? []).map((te) => te.exercise)
      : exercises
  ).filter((exercise) => exercise.isActive);
  // Chips only for categories that actually have exercises, in the canonical order.
  const categories = EXERCISE_CATEGORIES.filter((c) => candidates.some((e) => e.category === c));
  const query = foldText(search.trim());
  const filtered = candidates.filter(
    (e) => (category === null || e.category === category) && matchesQuery(e.name, query),
  );
  const inWorkoutIds = useMemo(
    () => new Set((draft?.performances ?? []).map((p) => p.actualExerciseId)),
    [draft?.performances],
  );

  function handleClose() {
    setSearch('');
    onClose();
  }

  function handleSelect(exercise: PickableExercise) {
    const payload = {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      category: exercise.category,
    };
    if (mode?.type === 'swap') swapExercise(mode.performanceId, payload);
    else if (mode?.type === 'add') addExercise(payload);
    handleClose();
  }

  // Fixed height on phones too: a content-sized sheet would jump when the list grows
  // (switching to all exercises) or shrinks (searching).
  return (
    <Sheet open={mode !== null} onOpenChange={(next) => !next && handleClose()}>
      <SheetContent side="bottom" className="h-[88dvh] gap-0 sm:h-[75dvh] sm:max-w-xl lg:max-w-xl">
        <SheetHeader>
          <SheetTitle>{isSwap ? t.picker.swapTitle : t.picker.addTitle}</SheetTitle>
          <SheetDescription>
            {isSwap ? t.picker.swapDescription : t.picker.addDescription}
          </SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-3 px-4 pb-4">
          {workoutTemplateId !== null && (
            <PickerSourceToggle
              value={effectiveSource}
              onChange={(next) => {
                setSource(next);
                setCategory(null);
              }}
              labels={{ template: t.picker.template, all: t.picker.all }}
            />
          )}

          <div className="relative shrink-0">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
            <Input
              placeholder={t.picker.searchPlaceholder}
              className={cn(FIELD_CLASS, 'pl-10')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {!listLoading && categories.length > 1 && (
            <ExerciseCategoryChips
              categories={categories}
              value={category}
              onChange={setCategory}
              labels={t.picker.categories}
              allLabel={t.picker.allCategories}
            />
          )}

          <ExercisePickerList
            loading={listLoading}
            exercises={filtered}
            inWorkoutIds={inWorkoutIds}
            isSwap={isSwap}
            onSelect={handleSelect}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
