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
import {
  createTemplateSchema,
  type CreateTemplateInput,
  type WorkoutTemplate,
} from '@gym-bro/shared';

import { useCreateTemplate } from '../hooks/use-create-template';
import { useUpdateTemplate } from '../hooks/use-update-template';

// Native textarea styled to match the Input primitive (no shadcn Textarea is
// installed; descriptions read better multi-line).
const textareaClassName =
  'min-h-20 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30';

interface TemplateFormProps {
  // The row being edited, or null for create mode.
  editing: WorkoutTemplate | null;
  // The plan to create the template in (used in create mode).
  planId: string | null;
  // Called after a successful create/update (the sheet closes on this).
  onSuccess: () => void;
}

export function TemplateForm({ editing, planId, onSuccess }: TemplateFormProps) {
  const form = useForm<CreateTemplateInput>({
    resolver: zodResolver(createTemplateSchema),
    defaultValues: {
      name: editing?.name ?? '',
      description: editing?.description ?? '',
    },
  });

  const create = useCreateTemplate();
  const update = useUpdateTemplate();
  const isPending = create.isPending || update.isPending;
  const error = create.error ?? update.error;

  function onSubmit(values: CreateTemplateInput) {
    const description = values.description ?? '';
    const input: CreateTemplateInput = {
      name: values.name,
      description: description.length > 0 ? description : null,
    };
    if (editing) {
      update.mutate({ id: editing.id, input }, { onSuccess });
    } else if (planId) {
      create.mutate({ planId, input }, { onSuccess });
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
                <Input placeholder="e.g. Push" className="h-11" {...field} />
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
                  placeholder="e.g. Chest, shoulders, triceps"
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
          {isPending ? 'Saving…' : editing ? 'Save changes' : 'Add template'}
        </Button>
      </form>
    </Form>
  );
}
