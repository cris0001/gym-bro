import { FormSheet } from '@/components/form-sheet';

import { usePlanUiStore } from '../stores/plan-ui.store';
import { PlanForm } from './plan-form';

// Sheet hosting the create/edit form. Open state and the target row come from the UI
// store. The form is keyed by the editing id so it remounts with fresh defaults each
// time the sheet opens for a different plan.
export function PlanSheet() {
  const open = usePlanUiStore((s) => s.open);
  const editing = usePlanUiStore((s) => s.editing);
  const close = usePlanUiStore((s) => s.close);

  return (
    <FormSheet
      open={open}
      onClose={close}
      title={editing ? 'Edit plan' : 'New plan'}
      description={editing ? 'Update the name or description.' : 'Create a training plan.'}
    >
      <PlanForm key={editing?.id ?? 'new'} editing={editing} onSuccess={close} onCancel={close} />
    </FormSheet>
  );
}
