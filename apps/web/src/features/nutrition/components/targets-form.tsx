import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
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

import type { NutritionTarget, SetNutritionTargetInput } from '@gym-bro/shared';

import { useSetTarget } from '../hooks/use-set-target';

// A required daily-target field, kept as a string in the form and converted to a
// number on submit (same approach as the food form).
const targetField = z
  .string()
  .trim()
  .min(1, 'Required')
  .refine((v) => {
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 && n <= 9999.99;
  }, 'Enter a number 0–9999.99');

const targetFormSchema = z.object({
  effectiveDate: z.string().min(1, 'Date is required'),
  kcal: targetField,
  proteinG: targetField,
  carbsG: targetField,
  fatG: targetField,
});

type TargetFormValues = z.infer<typeof targetFormSchema>;

const FIELDS = [
  { name: 'kcal', label: 'Calories (kcal)' },
  { name: 'proteinG', label: 'Protein (g)' },
  { name: 'carbsG', label: 'Carbs (g)' },
  { name: 'fatG', label: 'Fat (g)' },
] as const;

interface TargetsFormProps {
  current: NutritionTarget | null;
  // A past target being edited (loaded from history); its date and macros seed the
  // form. Absent = the normal "set today's target" mode.
  editing?: NutritionTarget | null;
  onDone?: () => void;
}

// Set/change a target. In normal mode it seeds from the current target and defaults
// to today; in edit mode it seeds from the selected history entry (date + macros).
// Saving upserts that date; the current target and history refresh on success.
export function TargetsForm({ current, editing, onDone }: TargetsFormProps) {
  const source = editing ?? current;
  const form = useForm<TargetFormValues>({
    resolver: zodResolver(targetFormSchema),
    defaultValues: {
      effectiveDate: editing?.effectiveDate ?? format(new Date(), 'yyyy-MM-dd'),
      ...(source
        ? {
            kcal: String(source.kcal),
            proteinG: String(source.proteinG),
            carbsG: String(source.carbsG),
            fatG: String(source.fatG),
          }
        : { kcal: '', proteinG: '', carbsG: '', fatG: '' }),
    },
  });

  const setTarget = useSetTarget();

  function onSubmit(values: TargetFormValues) {
    const input: SetNutritionTargetInput = {
      effectiveDate: values.effectiveDate,
      kcal: Number(values.kcal),
      proteinG: Number(values.proteinG),
      carbsG: Number(values.carbsG),
      fatG: Number(values.fatG),
    };
    setTarget.mutate(input, { onSuccess: () => onDone?.() });
  }

  return (
    <Form {...form}>
      <form onSubmit={(e) => void form.handleSubmit(onSubmit)(e)} className="grid gap-4">
        <FormField
          control={form.control}
          name="effectiveDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Effective date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  max={format(new Date(), 'yyyy-MM-dd')}
                  className="h-11"
                  {...field}
                />
              </FormControl>
              <p className="text-muted-foreground text-xs">
                Today by default. Pick a past date to back-fill a historical target.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-3">
          {FIELDS.map((field) => (
            <FormField
              key={field.name}
              control={form.control}
              name={field.name}
              render={({ field: f }) => (
                <FormItem>
                  <FormLabel>{field.label}</FormLabel>
                  <FormControl>
                    <Input inputMode="decimal" placeholder="0" className="h-11" {...f} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>

        {setTarget.error ? (
          <p role="alert" className="text-destructive text-sm">
            {setTarget.error.message}
          </p>
        ) : null}
        {setTarget.isSuccess ? <p className="text-muted-foreground text-sm">Saved.</p> : null}

        <div className="flex gap-2">
          <Button type="submit" className="h-11 flex-1" disabled={setTarget.isPending}>
            {setTarget.isPending ? 'Saving…' : editing ? 'Save changes' : 'Save target'}
          </Button>
          {editing ? (
            <Button type="button" variant="outline" className="h-11" onClick={() => onDone?.()}>
              Cancel
            </Button>
          ) : null}
        </div>
      </form>
    </Form>
  );
}
