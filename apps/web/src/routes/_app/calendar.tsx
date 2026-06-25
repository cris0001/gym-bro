import { createFileRoute } from '@tanstack/react-router';

import { CalendarPage } from '@/features/sessions';

export const Route = createFileRoute('/_app/calendar')({
  component: CalendarPage,
});
