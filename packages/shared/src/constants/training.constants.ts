// Closed set of exercise categories. Mirrors the exercise_category pgEnum in
// the API's exercises table. `as const` so it can seed both the Zod enum and
// the inferred ExerciseCategory type from one source.
export const EXERCISE_CATEGORIES = [
  'Chest',
  'Back',
  'Legs',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Abs',
  'Cardio',
  'Other',
] as const;
