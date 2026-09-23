import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { FIELD_CLASS, LABEL_CLASS, NUMBER_FIELD_CLASS } from '@/lib/form-styles';
import { cn } from '@/lib/utils';

import type { NutritionTarget, SetNutritionTargetInput } from '@gym-bro/shared';

import { useSetTarget } from '../hooks/use-set-target';
import { useNutritionTranslation } from '../i18n';

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

// Protein / carbs / fat share one row; each label wears its macro colour.
const MACRO_FIELDS = [
  { name: 'proteinG', labelClass: 'text-[#8d4a5e] dark:text-[#f0bccb]' },
  { name: 'carbsG', labelClass: 'text-[#b8862a] dark:text-[#d9a441]' },
  { name: 'fatG', labelClass: 'text-[#5a7a52] dark:text-[#8fae85]' },
] as const;

// In a card the fields sit on parchment rather than the card's own white.
const PANEL_BG = 'bg-[#f6f3f0] dark:bg-[#171316]';
const FIELD = cn(FIELD_CLASS, PANEL_BG);

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
  const t = useNutritionTranslation();
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

  // Live share of calories from each macro (protein/carbs 4 kcal/g, fat 9), for the
  // editorial hint under the inputs.
  const watched = form.watch();
  const macroCals =
    (Number(watched.proteinG) || 0) * 4 +
    (Number(watched.carbsG) || 0) * 4 +
    (Number(watched.fatG) || 0) * 9;
  const split =
    macroCals > 0
      ? {
          p: Math.round(((Number(watched.proteinG) || 0) * 4 * 100) / macroCals),
          c: Math.round(((Number(watched.carbsG) || 0) * 4 * 100) / macroCals),
          f: Math.round(((Number(watched.fatG) || 0) * 9 * 100) / macroCals),
        }
      : null;

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
              <FormLabel className={LABEL_CLASS}>{t.targets.effectiveDate}</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  max={format(new Date(), 'yyyy-MM-dd')}
                  className={cn(FIELD, 'max-w-[220px]')}
                  {...field}
                />
              </FormControl>
              <p className="text-muted-foreground text-[12px]">{t.targets.effectiveDateHint}</p>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Calories on their own, larger — the number the day is measured against. */}
        <FormField
          control={form.control}
          name="kcal"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={LABEL_CLASS}>{t.common.macroFields.kcal}</FormLabel>
              <FormControl>
                <Input
                  inputMode="decimal"
                  placeholder="0"
                  className={cn(
                    FIELD,
                    'font-heading h-14 px-4 text-[24px] font-semibold md:text-[24px]',
                  )}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* items-end: a wrapped label (e.g. PL "Węglowodany (g)") keeps the fields in line. */}
        <div className="grid grid-cols-3 items-end gap-3">
          {MACRO_FIELDS.map(({ name, labelClass }) => (
            <FormField
              key={name}
              control={form.control}
              name={name}
              render={({ field: f }) => (
                <FormItem>
                  <FormLabel className={cn(LABEL_CLASS, labelClass)}>
                    {t.common.macroFields[name]}
                  </FormLabel>
                  <FormControl>
                    <Input
                      inputMode="decimal"
                      placeholder="0"
                      className={cn(NUMBER_FIELD_CLASS, PANEL_BG)}
                      {...f}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>

        {/* Where the calories come from: a proportion bar + the same split as text. */}
        {split ? (
          <div className="grid gap-2">
            <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full">
              <span className="bg-[#8d4a5e]" style={{ flexGrow: split.p, flexBasis: 0 }} />
              <span className="bg-[#d9a441]" style={{ flexGrow: split.c, flexBasis: 0 }} />
              <span className="bg-[#5a7a52]" style={{ flexGrow: split.f, flexBasis: 0 }} />
            </div>
            <p className="font-heading text-muted-foreground text-[13px] italic">
              {t.targets.split(split.p, split.c, split.f)}
            </p>
          </div>
        ) : null}

        {setTarget.error ? (
          <p role="alert" className="text-destructive text-sm">
            {setTarget.error.message}
          </p>
        ) : null}
        {setTarget.isSuccess ? (
          <p className="text-muted-foreground text-sm">{t.targets.saved}</p>
        ) : null}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={setTarget.isPending}
            className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-primary/60 inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full text-[14.5px] font-semibold transition-colors disabled:pointer-events-none"
          >
            {setTarget.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            {setTarget.isPending
              ? t.common.saving
              : editing
                ? t.common.saveChanges
                : t.targets.saveTarget}
          </button>
          {editing ? (
            <button
              type="button"
              className="border-border bg-card hover:bg-muted h-12 rounded-full border px-6 text-[14px] font-semibold text-[#5f5257] transition-colors dark:text-[#c9bfc4]"
              onClick={() => onDone?.()}
            >
              {t.common.cancel}
            </button>
          ) : null}
        </div>
      </form>
    </Form>
  );
}
