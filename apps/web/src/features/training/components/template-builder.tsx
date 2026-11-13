import { Link } from '@tanstack/react-router';
import { ChevronLeft } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';

import { useTemplate } from '../hooks/use-template';
import { TemplateExercisesPanel } from './template-exercises-panel';
import { TemplateExercisesPanelSkeleton } from './template-exercises-panel-skeleton';

interface TemplateBuilderProps {
  templateId: string;
}

// The mobile template page: a back link to its plan + the template's exercises panel
// (desktop renders the same panel as the third column of PlansWorkspace). The template
// name is read-only here; rename/delete live on the plan.
export function TemplateBuilder({ templateId }: TemplateBuilderProps) {
  const { data: template, isPending, isError, error } = useTemplate(templateId);

  if (isPending) {
    return (
      <div className="mx-auto lg:col-span-3 flex w-full max-w-2xl flex-col gap-[14px] px-5 py-5">
        <div className="flex h-5 items-center">
          <Skeleton className="h-3.5 w-12" />
        </div>
        <TemplateExercisesPanelSkeleton variant="page" />
      </div>
    );
  }

  if (isError) {
    return (
      <p role="alert" className="text-destructive p-4 text-sm">
        {error.message}
      </p>
    );
  }

  return (
    <div className="mx-auto lg:col-span-3 flex w-full max-w-2xl flex-col gap-[14px] px-5 py-5 text-foreground">
      <Link
        to="/plans/$planId"
        params={{ planId: template.trainingPlanId }}
        className="text-muted-foreground inline-flex items-center gap-1 self-start text-[13px] font-semibold"
      >
        <ChevronLeft className="size-[15px]" />
        Plan
      </Link>

      <TemplateExercisesPanel template={template} asPageTitle />
    </div>
  );
}
