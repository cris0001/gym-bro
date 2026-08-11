import { Link } from '@tanstack/react-router';
import { ChevronLeft } from 'lucide-react';

import { SkeletonList } from '@/components/skeletons';
import { Skeleton } from '@/components/ui/skeleton';

import { useTemplate } from '../hooks/use-template';
import { useTemplateExerciseUiStore } from '../stores/template-exercise-ui.store';
import { TemplateExerciseList } from './template-exercise-list';
import { TemplateExerciseSheet } from './template-exercise-sheet';

interface TemplateBuilderProps {
  templateId: string;
}

// The template builder: a template's exercises with add/edit-targets/delete and
// drag-to-reorder. The template name is read-only here; rename/delete live on
// the plan detail.
export function TemplateBuilder({ templateId }: TemplateBuilderProps) {
  const { data: template, isPending, isError, error } = useTemplate(templateId);
  const openCreate = useTemplateExerciseUiStore((s) => s.openCreate);

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

      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-[26px] font-semibold break-words">{template.name}</h1>
        {template.description ? (
          <p className="font-heading text-muted-foreground text-[13px] italic">
            {template.description}
          </p>
        ) : null}
      </header>

      <section className="border-border bg-card rounded-[20px] border px-[18px] py-4">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-[11px] font-bold tracking-[0.08em] uppercase">
            Exercises
          </span>
          <button
            type="button"
            onClick={() => openCreate(template.id)}
            className="text-primary text-[12.5px] font-bold"
          >
            + Add
          </button>
        </div>

        {template.exercises.length === 0 ? (
          <p className="text-muted-foreground mt-2 text-[13px]">No exercises yet.</p>
        ) : (
          <TemplateExerciseList templateId={template.id} templateExercises={template.exercises} />
        )}
      </section>

      <button
        type="button"
        onClick={() => openCreate(template.id)}
        className="text-primary rounded-[18px] border border-dashed border-[#d9c9b2] p-[13px] text-center text-[13px] font-bold dark:border-[#4d4132]"
      >
        + Add exercise from library
      </button>

      {template.exercises.length > 1 ? (
        <p className="font-heading text-muted-foreground text-center text-[12.5px] italic">
          drag rows to reorder — order is used during the workout
        </p>
      ) : null}

      <TemplateExerciseSheet />
    </div>
  );
}
