import { zodResolver } from '@hookform/resolvers/zod';
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
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { createPlanSchema, type CreatePlanInput, type TrainingPlan } from '@gym-bro/shared';

import { useCreatePlan } from '../hooks/use-create-plan';
import { useUpdatePlan } from '../hooks/use-update-plan';

// Native textarea styled to match the Input primitive (no shadcn Textarea is
// installed; plan descriptions read better multi-line than a single Input).
const textareaClassName =
  'min-h-20 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30';

interface PlanFormProps {
  // The row being edited, or null for create mode.
  editing: TrainingPlan | null;
  // Called after a successful create/update (the sheet closes on this).
  onSuccess: () => void;
}

export function PlanForm({ editing, onSuccess }: PlanFormProps) {
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
      <form onSubmit={(e) => void form.handleSubmit(onSubmit)(e)} className="grid gap-4 p-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Push/Pull/Legs" className="h-11" {...field} />
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
              <FormLabel>Description (optional)</FormLabel>
              <FormControl>
                <textarea
                  placeholder="e.g. 6-day split, hypertrophy focus"
                  className={cn(textareaClassName)}
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

        <Button type="submit" className="h-11" disabled={isPending}>
          {isPending ? 'Saving…' : editing ? 'Save changes' : 'Add plan'}
        </Button>
      </form>
    </Form>
  );
}
