import { FormSheet } from '@/components/form-sheet';

import { useTemplateExerciseUiStore } from '../stores/template-exercise-ui.store';
import { TemplateExerciseForm } from './template-exercise-form';
import { useTrainingTranslation } from '../i18n';

// Sheet hosting the add/edit-targets form. Open state, the target row, and the parent
// template come from the UI store. The form is keyed by the editing id so it
// remounts with fresh defaults each time the sheet opens.
export function TemplateExerciseSheet() {
  const t = useTrainingTranslation();
  const open = useTemplateExerciseUiStore((s) => s.open);
  const editing = useTemplateExerciseUiStore((s) => s.editing);
  const templateId = useTemplateExerciseUiStore((s) => s.templateId);
  const close = useTemplateExerciseUiStore((s) => s.close);

  return (
    <FormSheet
      open={open}
      onClose={close}
      title={editing ? t.templateExercises.editTitle : t.templateExercises.addTitle}
      description={
        editing ? t.templateExercises.editDescription : t.templateExercises.addDescription
      }
    >
      <TemplateExerciseForm
        key={editing?.id ?? 'new'}
        editing={editing}
        templateId={templateId}
        onSuccess={close}
        onCancel={close}
      />
    </FormSheet>
  );
}
