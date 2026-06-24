import { createFileRoute } from '@tanstack/react-router';

import { TemplateBuilder } from '@/features/training';

export const Route = createFileRoute('/_app/templates/$templateId')({
  component: TemplateBuilderRoute,
});

function TemplateBuilderRoute() {
  const { templateId } = Route.useParams();
  return <TemplateBuilder templateId={templateId} />;
}
