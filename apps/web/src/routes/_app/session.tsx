import { createFileRoute } from '@tanstack/react-router';

import { ActiveSessionPage } from '@/features/sessions';

export const Route = createFileRoute('/_app/session')({
  component: ActiveSessionPage,
});
