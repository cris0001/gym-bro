import { createFileRoute } from '@tanstack/react-router';

import { HistoryPage } from '@/features/sessions';

export const Route = createFileRoute('/_app/history/')({
  component: HistoryPage,
});
