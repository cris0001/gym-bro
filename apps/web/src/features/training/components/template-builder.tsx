import { Link } from '@tanstack/react-router';
import { ChevronLeft } from 'lucide-react';

import { SkeletonList } from '@/components/skeletons';
import { Skeleton } from '@/components/ui/skeleton';

import { useTemplate } from '../hooks/use-template';
import { TemplateExercisesPanel } from './template-exercises-panel';

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
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-7 w-1/2" />
        <div className="border-border bg-card rounded-[20px] border px-[18px] py-4">
          <SkeletonList rows={4} />
        </div>
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
