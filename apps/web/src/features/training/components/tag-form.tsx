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
import { createTagSchema, type CreateTagInput, type WorkoutTag } from '@gym-bro/shared';

import { useCreateTag } from '../hooks/use-create-tag';
import { useUpdateTag } from '../hooks/use-update-tag';

// Curated tag palette (lowercase to match the native color input's output and
// the selected-swatch comparison). The native <input type=color> covers any
// colour outside this set.
const TAG_COLORS = [
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#eab308',
  '#22c55e',
  '#14b8a6',
  '#3b82f6',
  '#6366f1',
  '#a855f7',
  '#ec4899',
] as const;

interface TagFormProps {
  // The row being edited, or null for create mode.
  editing: WorkoutTag | null;
  // Called after a successful create/update (the sheet closes on this).
  onSuccess: () => void;
}

export function TagForm({ editing, onSuccess }: TagFormProps) {
  const form = useForm<CreateTagInput>({
    resolver: zodResolver(createTagSchema),
    defaultValues: editing
      ? { name: editing.name, color: editing.color }
      : { name: '', color: TAG_COLORS[4] },
  });

  const create = useCreateTag();
  const update = useUpdateTag();
  const isPending = create.isPending || update.isPending;
  const error = create.error ?? update.error;

  function onSubmit(input: CreateTagInput) {
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
                <Input placeholder="e.g. PR, Deload" className="h-11" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color</FormLabel>
              <div className="flex flex-wrap items-center gap-2">
                {TAG_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    aria-label={color}
                    aria-pressed={field.value.toLowerCase() === color}
                    className={cn(
                      'size-9 rounded-full border transition-transform',
                      field.value.toLowerCase() === color
                        ? 'ring-ring ring-2 ring-offset-2'
                        : 'hover:scale-110',
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => field.onChange(color)}
                  />
                ))}
                {/* Custom colour: native picker, always yields a valid hex. */}
                <label className="ml-1 inline-flex size-9 cursor-pointer items-center justify-center rounded-full border">
                  <span className="text-muted-foreground text-lg leading-none">+</span>
                  <input
                    type="color"
                    className="sr-only"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </label>
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
          {isPending ? 'Saving…' : editing ? 'Save changes' : 'Add tag'}
        </Button>
      </form>
    </Form>
  );
}
