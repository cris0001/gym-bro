import type { ExerciseCategory, WorkoutSessionDetail } from '@gym-bro/shared';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// The in-progress workout, held client-side and persisted to localStorage so it
// survives a refresh mid-session (gym setting). DB rows are written only on
// finish; until then everything lives here. Client-side `id`s key sets/
// performances for editing before they exist in the database.

export interface DraftSet {
  id: string;
  weight: number | null;
  reps: number | null;
  rir: number | null;
  // The exercise's heavier, lower-rep "top set" (at most one per exercise). The
  // rest are normal/back-off sets. Persisted to the DB.
  isTopSet: boolean;
  // A bodyweight set: weight is null and the weight input is disabled. Client-only
  // — on the wire it's just a null weight (null weight = bodyweight in the DB).
  isBodyweight: boolean;
}

// One exercise being performed. The swap pair is kept: originalExerciseId is what
// was prescribed, actualExerciseId what's being done (equal until swapped).
// exerciseName/category are snapshots of the ACTUAL exercise, so the active view
// renders without the exercises query.
export interface DraftPerformance {
  id: string;
  originalExerciseId: string;
  actualExerciseId: string;
  exerciseName: string;
  category: ExerciseCategory;
  notes: string | null;
  sets: DraftSet[];
}

export interface WorkoutDraft {
  // Set when editing a finished session (the graph is PUT back on save); null for
  // a brand-new workout (POSTed on finish).
  editingSessionId: string | null;
  name: string;
  performedDate: string;
  plannedSessionId: string | null;
  workoutTemplateId: string | null;
  performances: DraftPerformance[];
  durationMinutes: number | null;
  rating: number | null;
  notes: string | null;
  tagIds: string[];
}

// What a caller provides to begin a session. Each exercise starts as both the
// original and actual; setCount optionally seeds that many empty sets.
export interface StartExerciseInput {
  exerciseId: string;
  exerciseName: string;
  category: ExerciseCategory;
  setCount?: number;
}

export interface StartDraftInput {
  name: string;
  performedDate: string;
  plannedSessionId?: string | null;
  workoutTemplateId?: string | null;
  exercises: StartExerciseInput[];
}

interface WorkoutDraftState {
  draft: WorkoutDraft | null;
  start: (input: StartDraftInput) => void;
  loadForEdit: (detail: WorkoutSessionDetail) => void;
  discard: () => void;
  setName: (name: string) => void;
  setPerformedDate: (performedDate: string) => void;
  addExercise: (input: {
    exerciseId: string;
    exerciseName: string;
    category: ExerciseCategory;
  }) => void;
  removeExercise: (performanceId: string) => void;
  swapExercise: (
    performanceId: string,
    input: { exerciseId: string; exerciseName: string; category: ExerciseCategory },
  ) => void;
  addEmptySet: (performanceId: string) => void;
  copyLastSet: (performanceId: string) => void;
  replaceSets: (performanceId: string, sets: Omit<DraftSet, 'id'>[]) => void;
  updateSet: (performanceId: string, setId: string, patch: Partial<Omit<DraftSet, 'id'>>) => void;
  // Single-select: marking a set as the top set un-marks the others; toggling the
  // current top set off leaves the exercise with none.
  toggleTopSet: (performanceId: string, setId: string) => void;
  // Toggles bodyweight; turning it on nulls the weight.
  toggleBodyweight: (performanceId: string, setId: string) => void;
  removeSet: (performanceId: string, setId: string) => void;
  setExerciseNotes: (performanceId: string, notes: string | null) => void;
  setDuration: (durationMinutes: number | null) => void;
  setRating: (rating: number | null) => void;
  setNotes: (notes: string | null) => void;
  setTags: (tagIds: string[]) => void;
}

const emptySet = (): DraftSet => ({
  id: crypto.randomUUID(),
  weight: null,
  reps: null,
  rir: null,
  isTopSet: false,
  isBodyweight: false,
});

// Applies an update to one performance, leaving the rest untouched.
function mapPerformance(
  draft: WorkoutDraft,
  performanceId: string,
  fn: (performance: DraftPerformance) => DraftPerformance,
): WorkoutDraft {
  return {
    ...draft,
    performances: draft.performances.map((p) => (p.id === performanceId ? fn(p) : p)),
  };
}

export const useWorkoutDraftStore = create<WorkoutDraftState>()(
  persist(
    (set) => ({
      draft: null,

      start: (input) =>
        set({
          draft: {
            editingSessionId: null,
            name: input.name,
            performedDate: input.performedDate,
            plannedSessionId: input.plannedSessionId ?? null,
            workoutTemplateId: input.workoutTemplateId ?? null,
            durationMinutes: null,
            rating: null,
            notes: null,
            tagIds: [],
            performances: input.exercises.map((exercise) => ({
              id: crypto.randomUUID(),
              originalExerciseId: exercise.exerciseId,
              actualExerciseId: exercise.exerciseId,
              exerciseName: exercise.exerciseName,
              category: exercise.category,
              notes: null,
              sets: Array.from({ length: exercise.setCount ?? 0 }, emptySet),
            })),
          },
        }),

      loadForEdit: (detail) =>
        set({
          draft: {
            editingSessionId: detail.id,
            name: detail.name,
            performedDate: detail.performedDate,
            plannedSessionId: detail.plannedSessionId,
            workoutTemplateId: detail.workoutTemplateId,
            durationMinutes: detail.durationMinutes,
            rating: detail.rating,
            notes: detail.notes,
            tagIds: detail.tags.map((tag) => tag.id),
            performances: detail.performances.map((performance) => ({
              id: crypto.randomUUID(),
              originalExerciseId: performance.originalExercise.id,
              actualExerciseId: performance.exercise.id,
              exerciseName: performance.exercise.name,
              category: performance.exercise.category,
              notes: performance.notes,
              sets: performance.sets.map((set) => ({
                id: crypto.randomUUID(),
                weight: set.weight,
                reps: set.reps,
                rir: set.rir,
                isTopSet: set.isTopSet,
                // A persisted null weight means it was logged as bodyweight.
                isBodyweight: set.weight === null,
              })),
            })),
          },
        }),

      discard: () => set({ draft: null }),

      setName: (name) => set((s) => (s.draft ? { draft: { ...s.draft, name } } : s)),

      setPerformedDate: (performedDate) =>
        set((s) => (s.draft ? { draft: { ...s.draft, performedDate } } : s)),

      addExercise: (input) =>
        set((s) =>
          s.draft
            ? {
                draft: {
                  ...s.draft,
                  performances: [
                    ...s.draft.performances,
                    {
                      id: crypto.randomUUID(),
                      originalExerciseId: input.exerciseId,
                      actualExerciseId: input.exerciseId,
                      exerciseName: input.exerciseName,
                      category: input.category,
                      notes: null,
                      sets: [],
                    },
                  ],
                },
              }
            : s,
        ),

      removeExercise: (performanceId) =>
        set((s) =>
          s.draft
            ? {
                draft: {
                  ...s.draft,
                  performances: s.draft.performances.filter((p) => p.id !== performanceId),
                },
              }
            : s,
        ),

      swapExercise: (performanceId, input) =>
        set((s) =>
          s.draft
            ? {
                draft: mapPerformance(s.draft, performanceId, (p) => ({
                  ...p,
                  actualExerciseId: input.exerciseId,
                  exerciseName: input.exerciseName,
                  category: input.category,
                })),
              }
            : s,
        ),

      addEmptySet: (performanceId) =>
        set((s) =>
          s.draft
            ? {
                draft: mapPerformance(s.draft, performanceId, (p) => ({
                  ...p,
                  sets: [...p.sets, emptySet()],
                })),
              }
            : s,
        ),

      copyLastSet: (performanceId) =>
        set((s) =>
          s.draft
            ? {
                draft: mapPerformance(s.draft, performanceId, (p) => {
                  const last = p.sets.at(-1);
                  const next: DraftSet = last
                    ? {
                        id: crypto.randomUUID(),
                        weight: last.weight,
                        reps: last.reps,
                        rir: last.rir,
                        // A copy is a back-off set, never the top set; inherit the
                        // bodyweight state (back-offs of a BW exercise are BW too).
                        isTopSet: false,
                        isBodyweight: last.isBodyweight,
                      }
                    : emptySet();
                  return { ...p, sets: [...p.sets, next] };
                }),
              }
            : s,
        ),

      // Replaces a performance's sets wholesale (e.g. prefilled from last
      // training); each gets a fresh client id so they're independently editable.
      replaceSets: (performanceId, sets) =>
        set((s) =>
          s.draft
            ? {
                draft: mapPerformance(s.draft, performanceId, (p) => ({
                  ...p,
                  sets: sets.map((set_) => ({
                    id: crypto.randomUUID(),
                    weight: set_.weight,
                    reps: set_.reps,
                    rir: set_.rir,
                    isTopSet: set_.isTopSet,
                    isBodyweight: set_.isBodyweight,
                  })),
                })),
              }
            : s,
        ),

      updateSet: (performanceId, setId, patch) =>
        set((s) =>
          s.draft
            ? {
                draft: mapPerformance(s.draft, performanceId, (p) => ({
                  ...p,
                  sets: p.sets.map((set_) => (set_.id === setId ? { ...set_, ...patch } : set_)),
                })),
              }
            : s,
        ),

      toggleTopSet: (performanceId, setId) =>
        set((s) =>
          s.draft
            ? {
                draft: mapPerformance(s.draft, performanceId, (p) => ({
                  ...p,
                  // Flip the target; force every other set off (single top set).
                  sets: p.sets.map((set_) =>
                    set_.id === setId
                      ? { ...set_, isTopSet: !set_.isTopSet }
                      : { ...set_, isTopSet: false },
                  ),
                })),
              }
            : s,
        ),

      toggleBodyweight: (performanceId, setId) =>
        set((s) =>
          s.draft
            ? {
                draft: mapPerformance(s.draft, performanceId, (p) => ({
                  ...p,
                  sets: p.sets.map((set_) =>
                    set_.id === setId
                      ? {
                          ...set_,
                          isBodyweight: !set_.isBodyweight,
                          // Turning bodyweight on clears the weight.
                          weight: set_.isBodyweight ? set_.weight : null,
                        }
                      : set_,
                  ),
                })),
              }
            : s,
        ),

      removeSet: (performanceId, setId) =>
        set((s) =>
          s.draft
            ? {
                draft: mapPerformance(s.draft, performanceId, (p) => ({
                  ...p,
                  sets: p.sets.filter((set_) => set_.id !== setId),
                })),
              }
            : s,
        ),

      setExerciseNotes: (performanceId, notes) =>
        set((s) =>
          s.draft ? { draft: mapPerformance(s.draft, performanceId, (p) => ({ ...p, notes })) } : s,
        ),

      setDuration: (durationMinutes) =>
        set((s) => (s.draft ? { draft: { ...s.draft, durationMinutes } } : s)),
      setRating: (rating) => set((s) => (s.draft ? { draft: { ...s.draft, rating } } : s)),
      setNotes: (notes) => set((s) => (s.draft ? { draft: { ...s.draft, notes } } : s)),
      setTags: (tagIds) => set((s) => (s.draft ? { draft: { ...s.draft, tagIds } } : s)),
    }),
    { name: 'gym-bro-workout-draft' },
  ),
);
