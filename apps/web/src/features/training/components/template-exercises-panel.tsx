import type { TemplateWithExercises } from '@gym-bro/shared';

import { cn } from '@/lib/utils';

import { useTemplateExerciseUiStore } from '../stores/template-exercise-ui.store';
import { TemplateExerciseList } from './template-exercise-list';
import { TemplateExerciseSheet } from './template-exercise-sheet';
import { useTrainingTranslation } from '../i18n';

interface TemplateExercisesPanelProps {
  template: TemplateWithExercises;
  // The mobile page's own title (h1); a column inside the desktop workspace uses h2.
  asPageTitle?: boolean;
  // 'card' (mobile page): exercises in a bordered card. 'column' (desktop workspace):
  // a flat Exercise / Target table in the column (the template is edited from its row
  // in the middle column), and a tinted add button.
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
  const t = useTrainingTranslation();
  const openCreate = useTemplateExerciseUiStore((s) => s.openCreate);
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
            <p className="text-muted-foreground text-[13px]">{template.description}</p>
          ) : null}
        </div>
      </header>

      <section
        className={cn(!isColumn && 'border-border bg-card rounded-xl border px-[18px] py-4')}
      >
        {isColumn ? (
          // Aligned with the card rows (1px border + 8px padding): grip | name | 96px
          // target (1250px+ only, like the rows) | edit + delete.
          <div className="text-muted-foreground flex items-center gap-2.5 px-[9px] pb-1.5 text-[10.5px] font-medium tracking-[0.08em] uppercase">
            <span className="w-[23px] shrink-0" />
            <span className="flex-1">{t.templateExercises.exercise}</span>
            <span className="hidden w-24 shrink-0 min-[1250px]:block">
              {t.templateExercises.target}
            </span>
            <span className="w-[66px] shrink-0" />
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-[11px] font-medium tracking-[0.08em] uppercase">
              {t.templateExercises.title}
            </span>
            <button
              type="button"
              onClick={() => openCreate(template.id)}
              className="bg-accent text-accent-foreground hover:bg-accent/70 h-8 rounded-full px-3 text-[12.5px] font-semibold transition-colors"
            >
              {t.common.addShort}
            </button>
          </div>
        )}

        {template.exercises.length === 0 ? (
          <p className="text-muted-foreground mt-2 text-[13px]">{t.templateExercises.emptyShort}</p>
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
          'bg-accent text-accent-foreground hover:bg-accent/70 px-[13px] py-2.5 text-center text-[13px] font-semibold transition-colors',
          isColumn ? 'rounded-lg' : 'rounded-xl',
        )}
      >
        {t.templateExercises.addFromLibrary}
      </button>

      {template.exercises.length > 1 ? (
        <p className="text-muted-foreground text-center text-[12.5px]">
          {t.templateExercises.reorderHint}
        </p>
      ) : null}

      <TemplateExerciseSheet />
    </div>
  );
}
