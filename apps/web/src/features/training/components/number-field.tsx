import type { ReactNode } from 'react';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { LABEL_CLASS, NUMBER_FIELD_CLASS } from '@/lib/form-styles';
import { cn } from '@/lib/utils';

interface NumberFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: ReactNode;
  className?: string;
}

// A numeric form field (string-backed, numeric keyboard) with a serif value. Generic
// over the form's values so it stays type-safe for any RHF form. Used for the
// builder's sets/reps inputs.
export function NumberField<T extends FieldValues>({
  control,
  name,
  label,
  className,
}: NumberFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className={LABEL_CLASS}>{label}</FormLabel>
          <FormControl>
            <Input
              type="number"
              inputMode="numeric"
              min={1}
              className={cn(NUMBER_FIELD_CLASS, className)}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
