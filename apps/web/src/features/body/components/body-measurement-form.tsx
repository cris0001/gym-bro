import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
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
import { FIELD_CLASS, LABEL_CLASS, TEXTAREA_CLASS } from '@/lib/form-styles';
import { cn } from '@/lib/utils';

import type { BodyMeasurement, UpsertBodyMeasurementInput } from '@gym-bro/shared';

import { useDeleteBodyMeasurement } from '../hooks/use-delete-body-measurement';
import { useUpsertBodyMeasurement } from '../hooks/use-upsert-body-measurement';
import { useBodyTranslation } from '../i18n';
import { useBodyUiStore } from '../stores/body-ui.store';

type BodyT = ReturnType<typeof useBodyTranslation>;

// The app's form field at the compact 40px height (same as the Targets form).
const FIELD = cn(FIELD_CLASS, 'bg-field-muted h-10');

// An optional measurement field: kept as a string (empty = "not entered"), valid
// when blank or a number in [0, max]. No Zod transform, so input/output types
// match and FormField name inference stays happy across the mapped fields.
// Built per locale so validation messages follow the UI language.
const measurement = (max: number, t: BodyT) =>
  z
    .string()
    .trim()
    .refine((v) => {
      if (v === '') return true;
      const n = Number(v);
      return Number.isFinite(n) && n >= 0 && n <= max;
    }, t.form.numberRange(max));

const makeBodyFormSchema = (t: BodyT) =>
  z.object({
    measuredDate: z.string().min(1, t.form.dateRequired),
    weightKg: measurement(999.99, t),
    bodyFatPct: measurement(100, t),
    bicepsCm: measurement(999.99, t),
    chestCm: measurement(999.99, t),
    waistCm: measurement(999.99, t),
    hipCm: measurement(999.99, t),
    thighCm: measurement(999.99, t),
    notes: z.string().max(500, t.form.notesTooLong),
  });

type BodyFormValues = z.infer<ReturnType<typeof makeBodyFormSchema>>;

const PRIMARY = ['weightKg', 'bodyFatPct'] as const;
const ADVANCED = ['bicepsCm', 'chestCm', 'waistCm', 'hipCm', 'thighCm'] as const;
const MEASUREMENT_KEYS = [...PRIMARY, ...ADVANCED];

const numToStr = (n: number | null) => (n === null ? '' : String(n));

function toDefaults(editing: BodyMeasurement | null): BodyFormValues {
  if (!editing) {
    const blank = { measuredDate: format(new Date(), 'yyyy-MM-dd'), notes: '' } as BodyFormValues;
    MEASUREMENT_KEYS.forEach((k) => (blank[k] = ''));
    return blank;
  }
  return {
    measuredDate: editing.measuredDate,
    weightKg: numToStr(editing.weightKg),
    bodyFatPct: numToStr(editing.bodyFatPct),
    bicepsCm: numToStr(editing.bicepsCm),
    chestCm: numToStr(editing.chestCm),
    waistCm: numToStr(editing.waistCm),
    hipCm: numToStr(editing.hipCm),
    thighCm: numToStr(editing.thighCm),
    notes: editing.notes ?? '',
  };
}

const hasAdvanced = (editing: BodyMeasurement | null) =>
  !!editing && ADVANCED.some((key) => editing[key] !== null);

// The prominent quick-add / edit form. Weight + body fat are always shown; the
// circumference fields sit behind "Show more". In create mode blank fields are
// omitted so a same-day re-save merges (non-destructive); in edit mode a cleared
// field is sent as null to actually clear it. At least one value is required.
export function BodyMeasurementForm() {
  const t = useBodyTranslation();
  const schema = useMemo(() => makeBodyFormSchema(t), [t]);
  const editing = useBodyUiStore((s) => s.editing);
  const clearEditing = useBodyUiStore((s) => s.clearEditing);
  const upsert = useUpsertBodyMeasurement();
  const remove = useDeleteBodyMeasurement();
  const [showMore, setShowMore] = useState(false);

  const form = useForm<BodyFormValues>({
    resolver: zodResolver(schema),
    defaultValues: toDefaults(null),
  });

  useEffect(() => {
    form.reset(toDefaults(editing));
    setShowMore(hasAdvanced(editing));
  }, [editing, form]);

  function onSubmit(values: BodyFormValues) {
    const measurements: Partial<Record<(typeof MEASUREMENT_KEYS)[number], number | null>> = {};
    let hasAny = false;
    for (const key of MEASUREMENT_KEYS) {
      const raw = values[key].trim();
      if (raw !== '') {
        measurements[key] = Number(raw);
        hasAny = true;
      } else if (editing) {
        measurements[key] = null;
      }
    }
    if (!hasAny) {
      form.setError('root', { message: t.form.atLeastOne });
      return;
    }
    const input: UpsertBodyMeasurementInput = {
      measuredDate: values.measuredDate,
      ...measurements,
    };
    // Notes merge like a measurement: a value sets it, blank clears it when
    // editing, and is omitted on create so a same-day re-save doesn't wipe it.
    const notes = values.notes.trim();
    if (notes !== '') {
      input.notes = notes;
    } else if (editing) {
      input.notes = null;
    }
    upsert.mutate(input, {
      onSuccess: () => {
        // Entries are keyed by date (one per day). If an edit MOVED the entry to a
        // different date, the upsert wrote a new row and left the original at the old
        // date — delete it so the stale value doesn't linger on the chart.
        if (editing && editing.measuredDate !== values.measuredDate) {
          remove.mutate(editing.id);
        }
        if (editing) {
          clearEditing();
        } else {
          form.reset(toDefaults(null));
        }
      },
    });
  }

  const error = form.formState.errors.root?.message ?? upsert.error?.message;

  return (
    <Form {...form}>
      <form onSubmit={(e) => void form.handleSubmit(onSubmit)(e)} className="grid gap-3">
        <FormField
          control={form.control}
          name="measuredDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={LABEL_CLASS}>{t.form.date}</FormLabel>
              <FormControl>
                <Input type="date" className={cn(FIELD, 'max-w-[220px]')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-3">
          {(showMore ? MEASUREMENT_KEYS : PRIMARY).map((key) => (
            <FormField
              key={key}
              control={form.control}
              name={key}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={LABEL_CLASS}>{t.form.fields[key]}</FormLabel>
                  <FormControl>
                    <Input inputMode="decimal" placeholder="—" className={FIELD} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>

        <Button
          type="button"
          variant="ghost"
          className="justify-self-start px-0"
          onClick={() => setShowMore((v) => !v)}
        >
          {showMore ? t.form.showLess : t.form.showMore}
        </Button>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={LABEL_CLASS}>{t.form.notes}</FormLabel>
              <FormControl>
                <textarea
                  placeholder={t.form.notesPlaceholder}
                  className={cn(TEXTAREA_CLASS, 'bg-field-muted min-h-16')}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error ? (
          <p role="alert" className="text-destructive text-sm">
            {error}
          </p>
        ) : null}

        <div className="flex gap-2">
          <Button type="submit" className="h-10 flex-1 rounded-full" disabled={upsert.isPending}>
            {upsert.isPending ? t.form.saving : editing ? t.form.saveChanges : t.form.add}
          </Button>
          {editing ? (
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-full"
              onClick={clearEditing}
            >
              {t.form.cancel}
            </Button>
          ) : null}
        </div>
      </form>
    </Form>
  );
}
