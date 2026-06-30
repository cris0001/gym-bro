import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
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

import type { BodyMeasurement, UpsertBodyMeasurementInput } from '@gym-bro/shared';

import { useUpsertBodyMeasurement } from '../hooks/use-upsert-body-measurement';
import { useBodyUiStore } from '../stores/body-ui.store';

// An optional measurement field: kept as a string (empty = "not entered"), valid
// when blank or a number in [0, max]. No Zod transform, so input/output types
// match and FormField name inference stays happy across the mapped fields.
const measurement = (max: number) =>
  z
    .string()
    .trim()
    .refine((v) => {
      if (v === '') return true;
      const n = Number(v);
      return Number.isFinite(n) && n >= 0 && n <= max;
    }, `Enter a number 0–${max}`);

const bodyFormSchema = z.object({
  measuredDate: z.string().min(1, 'Date is required'),
  weightKg: measurement(999.99),
  bodyFatPct: measurement(100),
  bicepsCm: measurement(999.99),
  chestCm: measurement(999.99),
  waistCm: measurement(999.99),
  hipCm: measurement(999.99),
  thighCm: measurement(999.99),
});

type BodyFormValues = z.infer<typeof bodyFormSchema>;

const PRIMARY = [
  { name: 'weightKg', label: 'Weight (kg)' },
  { name: 'bodyFatPct', label: 'Body fat (%)' },
] as const;
const ADVANCED = [
  { name: 'bicepsCm', label: 'Biceps (cm)' },
  { name: 'chestCm', label: 'Chest (cm)' },
  { name: 'waistCm', label: 'Waist (cm)' },
  { name: 'hipCm', label: 'Hip (cm)' },
  { name: 'thighCm', label: 'Thigh (cm)' },
] as const;
const MEASUREMENT_KEYS = [...PRIMARY, ...ADVANCED].map((f) => f.name);

const numToStr = (n: number | null) => (n === null ? '' : String(n));

function toDefaults(editing: BodyMeasurement | null): BodyFormValues {
  if (!editing) {
    const blank = { measuredDate: format(new Date(), 'yyyy-MM-dd') } as BodyFormValues;
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
  };
}

const hasAdvanced = (editing: BodyMeasurement | null) =>
  !!editing && ADVANCED.some((f) => editing[f.name] !== null);

// The prominent quick-add / edit form. Weight + body fat are always shown; the
// circumference fields sit behind "Show more". In create mode blank fields are
// omitted so a same-day re-save merges (non-destructive); in edit mode a cleared
// field is sent as null to actually clear it. At least one value is required.
export function BodyMeasurementForm() {
  const editing = useBodyUiStore((s) => s.editing);
  const clearEditing = useBodyUiStore((s) => s.clearEditing);
  const upsert = useUpsertBodyMeasurement();
  const [showMore, setShowMore] = useState(false);

  const form = useForm<BodyFormValues>({
    resolver: zodResolver(bodyFormSchema),
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
      form.setError('root', { message: 'Enter at least one measurement' });
      return;
    }
    const input: UpsertBodyMeasurementInput = {
      measuredDate: values.measuredDate,
      ...measurements,
    };
    upsert.mutate(input, {
      onSuccess: () => (editing ? clearEditing() : form.reset(toDefaults(null))),
    });
  }

  const error = form.formState.errors.root?.message ?? upsert.error?.message;

  return (
    <Form {...form}>
      <form onSubmit={(e) => void form.handleSubmit(onSubmit)(e)} className="grid gap-4">
        <FormField
          control={form.control}
          name="measuredDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input type="date" className="h-11" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-3">
          {(showMore ? [...PRIMARY, ...ADVANCED] : PRIMARY).map((f) => (
            <FormField
              key={f.name}
              control={form.control}
              name={f.name}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{f.label}</FormLabel>
                  <FormControl>
                    <Input inputMode="decimal" placeholder="—" className="h-11" {...field} />
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
          {showMore ? 'Show less' : 'Show more'}
        </Button>

        {error ? (
          <p role="alert" className="text-destructive text-sm">
            {error}
          </p>
        ) : null}

        <div className="flex gap-2">
          <Button type="submit" className="h-11 flex-1" disabled={upsert.isPending}>
            {upsert.isPending ? 'Saving…' : editing ? 'Save changes' : 'Add measurement'}
          </Button>
          {editing ? (
            <Button type="button" variant="outline" className="h-11" onClick={clearEditing}>
              Cancel
            </Button>
          ) : null}
        </div>
      </form>
    </Form>
  );
}
