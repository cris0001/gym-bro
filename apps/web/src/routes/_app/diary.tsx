import { createFileRoute } from '@tanstack/react-router';

import { DiaryPage } from '@/features/nutrition';

export const Route = createFileRoute('/_app/diary')({
  component: DiaryPage,
});
