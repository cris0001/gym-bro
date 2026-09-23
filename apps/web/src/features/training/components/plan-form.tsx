import { zodResolver } from '@hookform/resolvers/zod';
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
import { Input } from '@/components/ui/input';
import { FIELD_CLASS, LABEL_CLASS, TEXTAREA_CLASS } from '@/lib/form-styles';
import { createPlanSchema, type CreatePlanInput, type TrainingPlan } from '@gym-bro/shared';

import { useCreatePlan } from '../hooks/use-create-plan';
import { useUpdatePlan } from '../hooks/use-update-plan';
import { OptionalHint } from './optional-hint';

interface PlanFormProps {
  // The row being edited, or null for create mode.
  editing: TrainingPlan | null;
  // Called after a successful create/update (the sheet closes on this).
  onSuccess: () => void;
  onCancel: () => void;
}

export function PlanForm({ editing, onSuccess, onCancel }: PlanFormProps) {
  const form = useForm<CreatePlanInput>({
    resolver: zodResolver(createPlanSchema),
    defaultValues: {
      name: editing?.name ?? '',
      description: editing?.description ?? '',
    },
  });

  const create = useCreatePlan();
  const update = useUpdatePlan();
  const isPending = create.isPending || update.isPending;
  const error = create.error ?? update.error;

  function onSubmit(values: CreatePlanInput) {
    // Resolver already trimmed; normalize an empty description to null so edits
    // can clear it.
    const description = values.description ?? '';
    const input: CreatePlanInput = {
      name: values.name,
      description: description.length > 0 ? description : null,
    };
    if (editing) {
      update.mutate({ id: editing.id, input }, { onSuccess });
    } else {
      create.mutate(input, { onSuccess });
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
        className="grid gap-4 px-5 pt-3 pb-6 sm:px-6"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={LABEL_CLASS}>Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Push/Pull/Legs" className={FIELD_CLASS} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={LABEL_CLASS}>
                Description <OptionalHint />
              </FormLabel>
              <FormControl>
                <textarea
                  placeholder="e.g. 6-day split, hypertrophy focus"
                  className={TEXTAREA_CLASS}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
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
          submitLabel={editing ? 'Save changes' : 'Add plan'}
          isPending={isPending}
          onCancel={onCancel}
        />
      </form>
    </Form>
  );
}
