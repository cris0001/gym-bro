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

import type { CreateFoodInput, Food } from '@gym-bro/shared';

import { useCreateFood } from '../hooks/use-create-food';
import { useUpdateFood } from '../hooks/use-update-food';

// A required macro field: kept as a string in the form (so a half-typed "2." is
// preserved and an empty field is a clear "Required", not a silent 0) and
// validated against the per-100g numeric range. Converted to a number on submit
// (no Zod transform, so the form's input and output types stay identical — which
// keeps FormField inference happy across the mapped fields below).
const macroField = z
  .string()
  .trim()
  .min(1, 'Required')
  .refine((v) => {
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 && n <= 9999.99;
  }, 'Enter a number 0–9999.99');

// Optional gram-size field (serving or unit weight). Blank = not set; a value lets
// the food be logged by that portion too (e.g. "1 serving = 150 g", "1 unit = 9 g").
const gramSizeField = z
  .string()
  .trim()
  .refine((v) => {
    if (v === '') return true;
    const n = Number(v);
    return Number.isFinite(n) && n > 0 && n <= 99999.99;
  }, 'Enter a number greater than 0');

const foodFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name is too long'),
  kcal: macroField,
  proteinG: macroField,
  carbsG: macroField,
  fatG: macroField,
  servingGrams: gramSizeField,
  unitGrams: gramSizeField,
});

type FoodFormValues = z.infer<typeof foodFormSchema>;

const MACRO_FIELDS = [
  { name: 'kcal', label: 'Calories (kcal)' },
  { name: 'proteinG', label: 'Protein (g)' },
  { name: 'carbsG', label: 'Carbs (g)' },
  { name: 'fatG', label: 'Fat (g)' },
] as const;

interface FoodFormProps {
  editing: Food | null;
  onSuccess: () => void;
}

// Create/edit a food. Macros are entered per 100g. The shared schema is the
// source of truth on the server; this local schema mirrors it with form-friendly
// string inputs and messages.
export function FoodForm({ editing, onSuccess }: FoodFormProps) {
  const form = useForm<FoodFormValues>({
    resolver: zodResolver(foodFormSchema),
    defaultValues: editing
      ? {
          name: editing.name,
          kcal: String(editing.kcal),
          proteinG: String(editing.proteinG),
          carbsG: String(editing.carbsG),
          fatG: String(editing.fatG),
          servingGrams: editing.servingGrams !== null ? String(editing.servingGrams) : '',
          unitGrams: editing.unitGrams !== null ? String(editing.unitGrams) : '',
        }
      : {
          name: '',
          kcal: '',
          proteinG: '',
          carbsG: '',
          fatG: '',
          servingGrams: '',
          unitGrams: '',
        },
  });

  const create = useCreateFood();
  const update = useUpdateFood();
  const isPending = create.isPending || update.isPending;
  const error = create.error ?? update.error;

  function onSubmit(values: FoodFormValues) {
    const input: CreateFoodInput = {
      name: values.name,
      kcal: Number(values.kcal),
      proteinG: Number(values.proteinG),
      carbsG: Number(values.carbsG),
      fatG: Number(values.fatG),
      ...(values.servingGrams.trim() !== '' ? { servingGrams: Number(values.servingGrams) } : {}),
      ...(values.unitGrams.trim() !== '' ? { unitGrams: Number(values.unitGrams) } : {}),
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
                <Input placeholder="e.g. Chicken breast" className="h-11" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <p className="text-muted-foreground text-sm">Macros per 100g.</p>

        <div className="grid grid-cols-2 gap-3">
          {MACRO_FIELDS.map((macro) => (
            <FormField
              key={macro.name}
              control={form.control}
              name={macro.name}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{macro.label}</FormLabel>
                  <FormControl>
                    <Input inputMode="decimal" placeholder="0" className="h-11" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>

        <FormField
          control={form.control}
          name="servingGrams"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Grams per serving (optional)</FormLabel>
              <FormControl>
                <Input
                  inputMode="decimal"
                  placeholder="e.g. 150"
                  className="h-11 w-40"
                  {...field}
                />
              </FormControl>
              <p className="text-muted-foreground text-xs">
                Set this to log the food by serving as well as by grams.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="unitGrams"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Grams per unit (optional)</FormLabel>
              <FormControl>
                <Input inputMode="decimal" placeholder="e.g. 9" className="h-11 w-40" {...field} />
              </FormControl>
              <p className="text-muted-foreground text-xs">
                Set this to log the food by unit/piece (e.g. 1 cracker) as well as by grams.
              </p>
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
          {isPending ? 'Saving…' : editing ? 'Save changes' : 'Add food'}
        </Button>
      </form>
    </Form>
  );
}
