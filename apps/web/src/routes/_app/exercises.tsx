import { createFileRoute } from '@tanstack/react-router';

import { ExercisesPage } from '@/features/training';

export const Route = createFileRoute('/_app/exercises')({
  component: ExercisesPage,
});
