// Public interface of the training feature. Everything outside this folder
// imports from '@/features/training' only — never from internal paths.

export { ExercisesPage } from './components/exercises-page';
export { TagsPage } from './components/tags-page';

export { useExercises, exercisesQueryOptions, exerciseKeys } from './hooks/use-exercises';
export { useCreateExercise } from './hooks/use-create-exercise';
export { useUpdateExercise } from './hooks/use-update-exercise';
export { useDeleteExercise } from './hooks/use-delete-exercise';

export { useTags, tagsQueryOptions, tagKeys } from './hooks/use-tags';
export { useCreateTag } from './hooks/use-create-tag';
export { useUpdateTag } from './hooks/use-update-tag';
export { useDeleteTag } from './hooks/use-delete-tag';

export { usePlans, plansQueryOptions, planKeys } from './hooks/use-plans';
export { usePlan, planQueryOptions } from './hooks/use-plan';
export { useCreatePlan } from './hooks/use-create-plan';
export { useUpdatePlan } from './hooks/use-update-plan';
export { useDeletePlan } from './hooks/use-delete-plan';
