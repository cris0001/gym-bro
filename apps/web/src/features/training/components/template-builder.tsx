import { Link, useNavigate } from '@tanstack/react-router';
import { ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';

import { DeleteButton } from '@/components/delete-button';
import { Skeleton } from '@/components/ui/skeleton';
import { useConfirm } from '@/stores/confirm.store';

import { useDeleteTemplate } from '../hooks/use-delete-template';
import { useTemplate } from '../hooks/use-template';
import { TemplateExercisesPanel } from './template-exercises-panel';
import { TemplateExercisesPanelSkeleton } from './template-exercises-panel-skeleton';

interface TemplateBuilderProps {
  templateId: string;
}

// The mobile template page: a back link to its plan, the template's exercises panel
// (desktop renders the same panel as the third column of PlansWorkspace), and a quiet
// Delete at the bottom that confirms, removes the template and returns to its plan.
export function TemplateBuilder({ templateId }: TemplateBuilderProps) {
  const { data: template, isPending, isError, error } = useTemplate(templateId);
  const remove = useDeleteTemplate();
  const confirm = useConfirm();
  const navigate = useNavigate();

  async function handleDelete() {
    if (!template) return;
    const ok = await confirm({
      title: `Delete "${template.name}"?`,
      description: 'This removes its exercises too.',
      confirmText: 'Delete',
      destructive: true,
    });
    if (!ok) return;
    remove.mutate(template.id, {
      onSuccess: () => {
        toast.success('Template deleted');
        void navigate({ to: '/plans/$planId', params: { planId: template.trainingPlanId } });
      },
    });
  }

  if (isPending) {
    return (
      <div className="mx-auto lg:col-span-3 flex w-full max-w-2xl flex-col gap-[14px] p-3 md:p-4">
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
    <div className="mx-auto lg:col-span-3 flex w-full max-w-2xl flex-col gap-[14px] p-3 md:p-4 text-foreground">
      <Link
        to="/plans/$planId"
        params={{ planId: template.trainingPlanId }}
        className="text-muted-foreground inline-flex items-center gap-1 self-start text-[13px] font-semibold"
      >
        <ChevronLeft className="size-[15px]" />
        Plan
      </Link>

      <TemplateExercisesPanel template={template} asPageTitle />

      <DeleteButton
        className="mt-2 self-center"
        disabled={remove.isPending}
        onClick={() => void handleDelete()}
      >
        Delete template
      </DeleteButton>
    </div>
  );
}
