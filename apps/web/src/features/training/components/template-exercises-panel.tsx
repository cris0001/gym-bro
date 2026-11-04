import type { TemplateWithExercises } from '@gym-bro/shared';

import { useTemplateExerciseUiStore } from '../stores/template-exercise-ui.store';
import { TemplateExerciseList } from './template-exercise-list';
import { TemplateExerciseSheet } from './template-exercise-sheet';

interface TemplateExercisesPanelProps {
  template: TemplateWithExercises;
  // The mobile page's own title (h1); a column inside the desktop workspace uses h2.
  asPageTitle?: boolean;
}

// A template's header + its exercises (add / edit targets / delete / drag-to-reorder)
// and the add-exercise sheet. The body of the mobile template page and the third
// column of the desktop plans workspace.
export function TemplateExercisesPanel({
  template,
  asPageTitle = false,
}: TemplateExercisesPanelProps) {
  const openCreate = useTemplateExerciseUiStore((s) => s.openCreate);
  const Heading = asPageTitle ? 'h1' : 'h2';

  return (
    <div className="flex flex-col gap-[14px]">
      <header className="flex flex-col gap-1">
        <Heading className="font-heading flex items-center gap-2 text-[26px] font-semibold break-words">
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
        className="rounded-[18px] border border-border bg-card px-[13px] py-2.5 text-center text-[13px] font-bold text-primary transition-colors hover:bg-muted"
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
