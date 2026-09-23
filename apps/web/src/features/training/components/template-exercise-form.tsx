import { useForm } from 'react-hook-form';

import { FormSheetActions } from '@/components/form-sheet-actions';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { LABEL_CLASS, TEXTAREA_CLASS } from '@/lib/form-styles';
import {
  createTemplateExerciseSchema,
  updateTemplateExerciseSchema,
  type TemplateExerciseWithExercise,
} from '@gym-bro/shared';

import { useCreateTemplateExercise } from '../hooks/use-create-template-exercise';
import { useUpdateTemplateExercise } from '../hooks/use-update-template-exercise';
import { ExercisePicker } from './exercise-picker';
import { NumberField } from './number-field';
import { OptionalHint } from './optional-hint';
import { PickedExerciseCard } from './picked-exercise-card';

interface TemplateExerciseFormValues {
  exerciseId: string;
  targetSets: string;
  targetRepsMin: string;
  targetRepsMax: string;
  notes: string;
}

// Numeric text field → number or null (empty means "not set"). NaN passes
// through so the shared schema reports it on that field.
function toIntOrNull(value: string): number | null {
  const trimmed = value.trim();
  return trimmed === '' ? null : Number(trimmed);
}

interface TemplateExerciseFormProps {
  editing: TemplateExerciseWithExercise | null;
  templateId: string | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TemplateExerciseForm({
  editing,
  templateId,
  onSuccess,
  onCancel,
}: TemplateExerciseFormProps) {
  const form = useForm<TemplateExerciseFormValues>({
    defaultValues: {
      exerciseId: editing?.exerciseId ?? '',
      targetSets: editing?.targetSets?.toString() ?? '',
      targetRepsMin: editing?.targetRepsMin?.toString() ?? '',
      targetRepsMax: editing?.targetRepsMax?.toString() ?? '',
      notes: editing?.notes ?? '',
    },
  });

  const create = useCreateTemplateExercise();
  const update = useUpdateTemplateExercise();
  const isPending = create.isPending || update.isPending;
  const error = create.error ?? update.error;

  function onSubmit(values: TemplateExerciseFormValues) {
    form.clearErrors();
    const targets = {
      targetSets: toIntOrNull(values.targetSets),
      targetRepsMin: toIntOrNull(values.targetRepsMin),
      targetRepsMax: toIntOrNull(values.targetRepsMax),
      notes: values.notes.trim() === '' ? null : values.notes.trim(),
    };

    if (editing) {
      const parsed = updateTemplateExerciseSchema.safeParse(targets);
      if (!parsed.success) return applyIssues(parsed.error.issues);
      update.mutate(
        { id: editing.id, templateId: editing.workoutTemplateId, input: parsed.data },
        { onSuccess },
      );
      return;
    }

    if (!values.exerciseId) {
      form.setError('exerciseId', { message: 'Pick an exercise' });
      return;
    }
    const parsed = createTemplateExerciseSchema.safeParse({
      exerciseId: values.exerciseId,
      ...targets,
    });
    if (!parsed.success) return applyIssues(parsed.error.issues);
    if (templateId) create.mutate({ templateId, input: parsed.data }, { onSuccess });
  }

  function applyIssues(issues: { path: PropertyKey[]; message: string }[]) {
    for (const issue of issues) {
      const key = issue.path[0];
      if (typeof key === 'string') {
        form.setError(key as keyof TemplateExerciseFormValues, { message: issue.message });
      }
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
        className="grid gap-4 px-5 pt-3 pb-6 sm:px-6"
      >
        {editing ? (
          <>
            <PickedExerciseCard name={editing.exercise.name} />
            {/* Editing: the three targets side by side, values centred. */}
            <div className="grid grid-cols-3 gap-2">
              <NumberField
                control={form.control}
                name="targetSets"
                label="Sets"
                className="text-center"
              />
              <NumberField
                control={form.control}
                name="targetRepsMin"
                label="Reps min"
                className="text-center"
              />
              <NumberField
                control={form.control}
                name="targetRepsMax"
                label="Reps max"
                className="text-center"
              />
            </div>
          </>
        ) : (
          <>
            <FormField
              control={form.control}
              name="exerciseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={LABEL_CLASS}>Exercise</FormLabel>
                  <ExercisePicker value={field.value} onChange={field.onChange} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <NumberField
              control={form.control}
              name="targetSets"
              label={
                <>
                  Sets <OptionalHint />
                </>
              }
            />
            <div className="grid grid-cols-2 gap-2">
              <NumberField control={form.control} name="targetRepsMin" label="Reps min" />
              <NumberField control={form.control} name="targetRepsMax" label="Reps max" />
            </div>
          </>
        )}

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={LABEL_CLASS}>
                Notes <OptionalHint />
              </FormLabel>
              <FormControl>
                <textarea
                  placeholder="e.g. last set to failure"
                  className={TEXTAREA_CLASS}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error ? (
          <p role="alert" className="text-destructive text-sm">
            {error.message}
          </p>
        ) : null}

        <FormSheetActions
          submitLabel={editing ? 'Save changes' : 'Add exercise'}
          isPending={isPending}
          onCancel={onCancel}
        />
      </form>
    </Form>
  );
}
