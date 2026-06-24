import type { Control, FieldPath, FieldValues } from 'react-hook-form';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface NumberFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
}

// A numeric form field (string-backed, numeric keyboard). Generic over the
// form's values so it stays type-safe for any RHF form. Used for the builder's
// sets/reps inputs.
export function NumberField<T extends FieldValues>({ control, name, label }: NumberFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input type="number" inputMode="numeric" min={1} className="h-11" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
