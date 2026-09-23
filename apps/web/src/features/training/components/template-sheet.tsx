import { FormSheet } from '@/components/form-sheet';

import { useTemplateUiStore } from '../stores/template-ui.store';
import { TemplateForm } from './template-form';

// Sheet hosting the create/edit form. Open state, the target row, and the parent plan
// come from the UI store. The form is keyed by the editing id so it remounts with
// fresh defaults each time the sheet opens.
export function TemplateSheet() {
  const open = useTemplateUiStore((s) => s.open);
  const editing = useTemplateUiStore((s) => s.editing);
  const planId = useTemplateUiStore((s) => s.planId);
  const close = useTemplateUiStore((s) => s.close);

  return (
    <FormSheet
      open={open}
      onClose={close}
      title={editing ? 'Edit template' : 'New template'}
      description={editing ? 'Update the name or description.' : 'Add a workout to this plan.'}
    >
      <TemplateForm
        key={editing?.id ?? 'new'}
        editing={editing}
        planId={planId}
        onSuccess={close}
        onCancel={close}
      />
    </FormSheet>
  );
}
