import type { TemplateWithExercises } from '@gym-bro/shared';

import { cn } from '@/lib/utils';

import { useTemplateExerciseUiStore } from '../stores/template-exercise-ui.store';
import { useTemplateUiStore } from '../stores/template-ui.store';
import { TemplateExerciseList } from './template-exercise-list';
import { TemplateExerciseSheet } from './template-exercise-sheet';

interface TemplateExercisesPanelProps {
  template: TemplateWithExercises;
  // The mobile page's own title (h1); a column inside the desktop workspace uses h2.
  asPageTitle?: boolean;
  // 'card' (mobile page): exercises in a bordered card. 'column' (desktop workspace):
  // a flat Exercise / Target table in the column, an Edit pill for the template, and
  // a dashed add button — matching the workspace mockup.
  variant?: 'card' | 'column';
}

// A template's header + its exercises (add / edit targets / delete / drag-to-reorder)
// and the add-exercise sheet. The body of the mobile template page and the third
// column of the desktop plans workspace.
export function TemplateExercisesPanel({
  template,
  asPageTitle = false,
  variant = 'card',
}: TemplateExercisesPanelProps) {
  const openCreate = useTemplateExerciseUiStore((s) => s.openCreate);
  const openEditTemplate = useTemplateUiStore((s) => s.openEdit);
  const Heading = asPageTitle ? 'h1' : 'h2';
  const isColumn = variant === 'column';

  return (
    <div className="flex flex-col gap-[14px]">
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <Heading
            className={cn(
              'font-heading flex items-center gap-2 font-semibold break-words',
              isColumn ? 'text-[24px] leading-tight' : 'text-[26px]',
            )}
          >
            {template.name}
            {template.shortName ? (
              <span className="bg-accent text-accent-foreground rounded-md px-1.5 py-0.5 font-sans text-[11px] font-bold">
                {template.shortName}
              </span>
            ) : null}
          </Heading>
          {template.description ? (
            <p className="font-heading text-muted-foreground text-[13px] italic">
              {template.description}
            </p>
          ) : null}
        </div>
        {isColumn ? (
          <button
            type="button"
            className="border-border bg-card text-primary h-9 shrink-0 rounded-full border px-4 text-[13px] font-semibold"
            onClick={() => openEditTemplate(template)}
          >
            Edit
          </button>
        ) : null}
      </header>

      <section
        className={cn(!isColumn && 'border-border bg-card rounded-[20px] border px-[18px] py-4')}
      >
        {isColumn ? (
          // Aligned with the rows: grip (≈36px) | name | 96px target | edit + delete.
          <div className="text-muted-foreground flex items-center gap-2.5 pb-1.5 text-[10.5px] font-bold tracking-[0.08em] uppercase">
            <span className="w-[23px] shrink-0" />
            <span className="flex-1">Exercise</span>
            <span className="w-24 shrink-0">Target</span>
            <span className="w-[74px] shrink-0" />
          </div>
        ) : (
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
        )}

        {template.exercises.length === 0 ? (
          <p className="text-muted-foreground mt-2 text-[13px]">No exercises yet.</p>
        ) : (
          <TemplateExerciseList
            templateId={template.id}
            templateExercises={template.exercises}
            variant={isColumn ? 'table' : 'list'}
          />
        )}
      </section>

      <button
        type="button"
        onClick={() => openCreate(template.id)}
        className={cn(
          'text-primary hover:bg-muted px-[13px] py-2.5 text-center text-[13px] font-bold transition-colors',
          isColumn
            ? 'border-border-strong rounded-[14px] border border-dashed'
            : 'border-border bg-card rounded-[18px] border',
        )}
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
