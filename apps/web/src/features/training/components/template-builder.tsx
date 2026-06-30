import { Link } from '@tanstack/react-router';
import { ChevronLeft, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';

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
    return <p className="text-muted-foreground p-4 text-sm">Loading template…</p>;
  }

  if (isError) {
    return (
      <p role="alert" className="text-destructive p-4 text-sm">
        {error.message}
      </p>
    );
  }

  return (
    <div className="mx-auto lg:col-span-3 flex w-full max-w-2xl flex-col">
      <div className="px-4 py-4">
        <Link
          to="/plans/$planId"
          params={{ planId: template.trainingPlanId }}
          className="text-muted-foreground hover:text-foreground mb-3 inline-flex items-center gap-1 text-sm"
        >
          <ChevronLeft className="size-4" />
          Plan
        </Link>

        <h1 className="text-2xl font-bold break-words">{template.name}</h1>
        {template.description ? (
          <p className="text-muted-foreground mt-1 text-sm">{template.description}</p>
        ) : null}
      </div>

      <div className="flex items-center justify-between px-4">
        <h2 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
          Exercises
        </h2>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-9"
          onClick={() => openCreate(template.id)}
        >
          <Plus className="size-4" />
          Add
        </Button>
      </div>

      {template.exercises.length === 0 ? (
        <p className="text-muted-foreground px-4 py-3 text-sm">No exercises yet.</p>
      ) : (
        <TemplateExerciseList templateId={template.id} templateExercises={template.exercises} />
      )}

      <TemplateExerciseSheet />
    </div>
  );
}
