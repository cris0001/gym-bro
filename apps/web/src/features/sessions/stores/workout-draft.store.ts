import type { ExerciseCategory } from '@gym-bro/shared';
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
  updateSet: (performanceId: string, setId: string, patch: Partial<Omit<DraftSet, 'id'>>) => void;
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
                      }
                    : emptySet();
                  return { ...p, sets: [...p.sets, next] };
                }),
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
