import { createFileRoute } from '@tanstack/react-router';

import { PlansWorkspace, TemplateBuilder } from '@/features/training';
import { useMediaQuery } from '@/hooks/use-media-query';

export const Route = createFileRoute('/_app/templates/$templateId')({
  component: TemplateBuilderRoute,
});

// lg+: the workspace with this template (and its plan) open; phones get the
// template page.
function TemplateBuilderRoute() {
  const { templateId } = Route.useParams();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  return isDesktop ? (
    <PlansWorkspace templateId={templateId} />
  ) : (
    <TemplateBuilder templateId={templateId} />
  );
}
