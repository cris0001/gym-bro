import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { EXERCISE_CATEGORIES, type CreateExerciseInput, type Exercise } from '@gym-bro/shared';

import { useCreateExercise } from '../hooks/use-create-exercise';
import { useUpdateExercise } from '../hooks/use-update-exercise';

// Local form schema: same name rules as the shared create schema, but a
// friendly "pick a category" message. Category allows '' so nothing is
// pre-selected; the refine rejects '' until the user taps a category. Keeping
// '' in the type makes the form's input and resolver-output types line up.
const exerciseFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name is too long'),
  category: z
    .union([z.literal(''), z.enum(EXERCISE_CATEGORIES)])
    .refine((value) => value !== '', { message: 'Pick a category' }),
});

// Input allows '' (for the initial empty category / defaults); output is the
// validated result the resolver hands to the submit handler.
type ExerciseFormInput = z.input<typeof exerciseFormSchema>;
type ExerciseFormValues = z.output<typeof exerciseFormSchema>;

interface ExerciseFormProps {
  // The row being edited, or null for create mode.
  editing: Exercise | null;
  // Called after a successful create/update (the sheet closes on this).
  onSuccess: () => void;
}

export function ExerciseForm({ editing, onSuccess }: ExerciseFormProps) {
  const form = useForm<ExerciseFormInput, unknown, ExerciseFormValues>({
    resolver: zodResolver(exerciseFormSchema),
    defaultValues: editing
      ? { name: editing.name, category: editing.category }
      : { name: '', category: '' },
  });

  const create = useCreateExercise();
  const update = useUpdateExercise();
  const isPending = create.isPending || update.isPending;
  const error = create.error ?? update.error;

  function onSubmit(values: ExerciseFormValues) {
    // The resolver guarantees a category; this guard narrows '' away with no cast.
    if (!values.category) return;
    const input: CreateExerciseInput = { name: values.name, category: values.category };
    if (editing) {
      update.mutate({ id: editing.id, input }, { onSuccess });
    } else {
      create.mutate(input, { onSuccess });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={(e) => void form.handleSubmit(onSubmit)(e)} className="grid gap-4 p-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Bench Press" className="h-11" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <div className="grid grid-cols-3 gap-2">
                {EXERCISE_CATEGORIES.map((category) => (
                  <Button
                    key={category}
                    type="button"
                    variant={field.value === category ? 'default' : 'outline'}
                    className="h-11"
                    onClick={() => field.onChange(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
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
