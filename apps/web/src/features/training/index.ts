// Public interface of the training feature. Everything outside this folder
// imports from '@/features/training' only — never from internal paths.

export { ExercisesPage } from './components/exercises-page';
export { TagsPage } from './components/tags-page';
export { PlansPage } from './components/plans-page';
export { PlanDetail } from './components/plan-detail';
export { TemplateBuilder } from './components/template-builder';

export { useExercises, exercisesQueryOptions, exerciseKeys } from './hooks/use-exercises';
export { useCreateExercise } from './hooks/use-create-exercise';
export { useUpdateExercise } from './hooks/use-update-exercise';
export { useDeleteExercise } from './hooks/use-delete-exercise';

export { useTags, tagsQueryOptions, tagKeys } from './hooks/use-tags';
export { useCreateTag } from './hooks/use-create-tag';
export { useUpdateTag } from './hooks/use-update-tag';
export { useDeleteTag } from './hooks/use-delete-tag';

export { useActivePlan, activePlanQueryOptions, activePlanKeys } from './hooks/use-active-plan';
export { useSetActivePlan } from './hooks/use-set-active-plan';

export { usePlans, plansQueryOptions, planKeys } from './hooks/use-plans';
export { usePlan, planQueryOptions } from './hooks/use-plan';
export { useCreatePlan } from './hooks/use-create-plan';
export { useUpdatePlan } from './hooks/use-update-plan';
export { useDeletePlan } from './hooks/use-delete-plan';

export { useCreateTemplate } from './hooks/use-create-template';
export { useUpdateTemplate } from './hooks/use-update-template';
export { useDeleteTemplate } from './hooks/use-delete-template';
export { useReorderTemplates } from './hooks/use-reorder-templates';

export { useTemplate, templateQueryOptions, templateKeys } from './hooks/use-template';
export { useCreateTemplateExercise } from './hooks/use-create-template-exercise';
export { useUpdateTemplateExercise } from './hooks/use-update-template-exercise';
export { useDeleteTemplateExercise } from './hooks/use-delete-template-exercise';
export { useReorderTemplateExercises } from './hooks/use-reorder-template-exercises';
