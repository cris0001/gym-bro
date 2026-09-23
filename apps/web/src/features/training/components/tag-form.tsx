import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
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
import { FIELD_CLASS, LABEL_CLASS } from '@/lib/form-styles';
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

// The tag as it renders on workouts: a soft tint of its colour with a dot.
function TagPreview({ name, color }: { name: string; color: string }) {
  return (
    <span
      className="inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold"
      style={{
        backgroundColor: `color-mix(in oklab, ${color} 16%, transparent)`,
        color: `color-mix(in oklab, ${color} 70%, #2b2126)`,
      }}
    >
      <span className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
      <span className="truncate">{name.trim() || 'Tag name'}</span>
    </span>
  );
}

interface TagFormProps {
  // The row being edited, or null for create mode.
  editing: WorkoutTag | null;
  // Called after a successful create/update (the sheet closes on this).
  onSuccess: () => void;
  onCancel: () => void;
}

export function TagForm({ editing, onSuccess, onCancel }: TagFormProps) {
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

  const name = form.watch('name');
  const color = form.watch('color');
  const isCustom = !TAG_COLORS.some((c) => c === color.toLowerCase());

  function onSubmit(input: CreateTagInput) {
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
                <Input placeholder="e.g. PR, Deload" className={FIELD_CLASS} {...field} />
              </FormControl>
              <FormMessage />
              <div className="mt-1 flex min-w-0 items-center gap-2">
                <TagPreview name={name} color={color} />
                <span className="text-muted-foreground shrink-0 text-[11.5px]">
                  Preview of how the tag appears.
                </span>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={LABEL_CLASS}>Color</FormLabel>
              <div className="grid grid-cols-6 justify-items-center gap-y-3">
                {TAG_COLORS.map((swatch) => {
                  const selected = field.value.toLowerCase() === swatch;
                  return (
                    <button
                      key={swatch}
                      type="button"
                      aria-label={swatch}
                      aria-pressed={selected}
                      className={cn(
                        'size-9 rounded-full transition-transform',
                        selected
                          ? 'ring-foreground ring-offset-background ring-2 ring-offset-2'
                          : 'hover:scale-110',
                      )}
                      style={{ backgroundColor: swatch }}
                      onClick={() => field.onChange(swatch)}
                    />
                  );
                })}
                {/* Custom colour: native picker, always yields a valid hex. Shows the
                    picked colour once it's outside the palette. */}
                <label
                  className={cn(
                    'text-muted-foreground inline-flex size-9 cursor-pointer items-center justify-center rounded-full border border-dashed border-[#c9bcb2] transition-colors hover:bg-muted dark:border-[#5a4d55]',
                    isCustom &&
                      'ring-foreground ring-offset-background border-0 ring-2 ring-offset-2',
                  )}
                  style={isCustom ? { backgroundColor: field.value } : undefined}
                  aria-label="Custom color"
                >
                  {isCustom ? null : <Plus className="size-4" />}
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

        <FormSheetActions
          submitLabel={editing ? 'Save changes' : 'Add tag'}
          isPending={isPending}
          onCancel={onCancel}
        />
      </form>
    </Form>
  );
}
