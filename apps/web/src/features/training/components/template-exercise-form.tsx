import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { cn } from '@/lib/utils';
import {
  createTemplateExerciseSchema,
  updateTemplateExerciseSchema,
  type TemplateExerciseWithExercise,
} from '@gym-bro/shared';

import { useCreateTemplateExercise } from '../hooks/use-create-template-exercise';
import { useUpdateTemplateExercise } from '../hooks/use-update-template-exercise';
import { ExercisePicker } from './exercise-picker';
import { NumberField } from './number-field';

const textareaClassName =
  'min-h-20 w-full min-w-0 rounded-lg border border-input bg-background px-2.5 py-1.5 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30';

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
}

export function TemplateExerciseForm({
  editing,
  templateId,
  onSuccess,
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
      <form onSubmit={(e) => void form.handleSubmit(onSubmit)(e)} className="grid gap-4 p-4">
        {editing ? (
          <div>
            <p className="text-sm font-medium">Exercise</p>
            <p className="text-muted-foreground text-sm">{editing.exercise.name}</p>
          </div>
        ) : (
          <FormField
            control={form.control}
            name="exerciseId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Exercise</FormLabel>
                <ExercisePicker value={field.value} onChange={field.onChange} />
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <NumberField control={form.control} name="targetSets" label="Sets (optional)" />

        <div className="grid grid-cols-2 gap-2">
          <NumberField control={form.control} name="targetRepsMin" label="Reps min" />
          <NumberField control={form.control} name="targetRepsMax" label="Reps max" />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (optional)</FormLabel>
              <FormControl>
                <textarea
                  placeholder="e.g. last set to failure"
                  className={cn(textareaClassName)}
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

        <Button type="submit" className="h-11" disabled={isPending}>
          {isPending ? 'Saving…' : editing ? 'Save changes' : 'Add exercise'}
        </Button>
      </form>
    </Form>
  );
}
