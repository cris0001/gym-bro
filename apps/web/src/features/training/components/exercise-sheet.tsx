import { toast } from 'sonner';

import { DeleteButton } from '@/components/delete-button';
import { FormSheet } from '@/components/form-sheet';
import { useConfirm } from '@/stores/confirm.store';

import { useDeleteExercise } from '../hooks/use-delete-exercise';
import { useExerciseUiStore } from '../stores/exercise-ui.store';
import { ExerciseForm } from './exercise-form';
import { useTrainingTranslation } from '../i18n';

// Sheet hosting the create/edit form. Open state and the target row come from the UI
// store. The form is keyed by the editing id so it remounts with fresh defaults each
// time the sheet opens for a different exercise. On mobile the list rows have no
// delete control, so editing offers it here.
export function ExerciseSheet() {
  const t = useTrainingTranslation();
  const open = useExerciseUiStore((s) => s.open);
  const editing = useExerciseUiStore((s) => s.editing);
  const close = useExerciseUiStore((s) => s.close);
  const remove = useDeleteExercise();
  const confirm = useConfirm();

  async function onDelete() {
    if (!editing) return;
    const ok = await confirm({
      title: t.common.deleteTitle(editing.name),
      description: t.exercises.deleteBody,
      confirmText: t.common.delete,
      destructive: true,
    });
    if (ok) {
      remove.mutate(editing.id, {
        onSuccess: () => {
          toast.success(t.exercises.deleted);
          close();
        },
      });
    }
  }

  return (
    <FormSheet
      open={open}
      onClose={close}
      title={editing ? t.exercises.editTitle : t.exercises.newTitle}
      description={editing ? t.exercises.editDescription : t.exercises.newDescription}
    >
      <ExerciseForm
        key={editing?.id ?? 'new'}
        editing={editing}
        onSuccess={close}
        onCancel={close}
      />

      {editing ? (
        <DeleteButton
          className="mx-auto -mt-2 mb-5 md:hidden"
          disabled={remove.isPending}
          onClick={() => void onDelete()}
        >
          {t.exercises.deleteExercise}
        </DeleteButton>
      ) : null}
    </FormSheet>
  );
}
