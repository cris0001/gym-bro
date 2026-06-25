import { createFileRoute } from '@tanstack/react-router';

import { WorkoutDetail } from '@/features/sessions';

export const Route = createFileRoute('/_app/history/$sessionId')({
  component: WorkoutDetailRoute,
});

function WorkoutDetailRoute() {
  const { sessionId } = Route.useParams();
  return <WorkoutDetail sessionId={sessionId} />;
}
