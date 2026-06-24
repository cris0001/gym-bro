// Public interface of the training feature. Everything outside this folder
// imports from '@/features/training' only — never from internal paths.

export { ExercisesPage } from './components/exercises-page';

export { useExercises, exercisesQueryOptions, exerciseKeys } from './hooks/use-exercises';
export { useCreateExercise } from './hooks/use-create-exercise';
export { useUpdateExercise } from './hooks/use-update-exercise';
export { useDeleteExercise } from './hooks/use-delete-exercise';
