import { FormSheet } from '@/components/form-sheet';

import { useTagUiStore } from '../stores/tag-ui.store';
import { TagForm } from './tag-form';
import { useTrainingTranslation } from '../i18n';

// Sheet hosting the create/edit form. Open state and the target row come from the UI
// store. The form is keyed by the editing id so it remounts with fresh defaults each
// time the sheet opens for a different tag.
export function TagSheet() {
  const t = useTrainingTranslation();
  const open = useTagUiStore((s) => s.open);
  const editing = useTagUiStore((s) => s.editing);
  const close = useTagUiStore((s) => s.close);

  return (
    <FormSheet
      open={open}
      onClose={close}
      title={editing ? t.tags.editTitle : t.tags.newTitle}
      description={editing ? t.tags.editDescription : t.tags.newDescription}
    >
      <TagForm key={editing?.id ?? 'new'} editing={editing} onSuccess={close} onCancel={close} />
    </FormSheet>
  );
}
