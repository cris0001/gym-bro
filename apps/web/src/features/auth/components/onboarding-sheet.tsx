import { useState } from 'react';
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

import { useCompleteOnboarding } from '../hooks/use-complete-onboarding';
import { useCurrentUser } from '../hooks/use-current-user';
import {
  SEX_OPTIONS,
  onboardingFormSchema,
  type OnboardingFormValues,
  type UpdateProfileInput,
} from '../types';

export function OnboardingSheet() {
  const { data: user } = useCurrentUser();
  const { mutate, isPending, error } = useCompleteOnboarding();
  // Closing via the X/overlay dismisses for this session only; the sheet
  // reappears on reload until onboardedAt is stamped (Save or Skip).
  const [dismissed, setDismissed] = useState(false);

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingFormSchema),
    defaultValues: { birthdate: '', sex: '', heightCm: '' },
  });

  const open = !!user && user.onboardedAt === null && !dismissed;

  function onSave(values: OnboardingFormValues) {
    const payload: UpdateProfileInput = {};
    if (values.birthdate) payload.birthdate = values.birthdate;
    if (values.sex) payload.sex = values.sex;
    if (values.heightCm) payload.heightCm = Number(values.heightCm);
    mutate(payload);
  }

  return (
    <Sheet open={open} onOpenChange={(next) => !next && setDismissed(true)}>
      <SheetContent side="bottom" className="gap-0">
        <SheetHeader>
          <SheetTitle>Welcome! Set up your profile</SheetTitle>
          <SheetDescription>
            All optional — you can change these later in Settings.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={(e) => void form.handleSubmit(onSave)(e)} className="grid gap-4 p-4">
            <FormField
              control={form.control}
              name="birthdate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Birthdate</FormLabel>
                  <FormControl>
                    <Input type="date" className="h-11" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sex"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sex</FormLabel>
                  <div className="grid grid-cols-2 gap-2">
                    {SEX_OPTIONS.map((opt) => (
                      <Button
                        key={opt}
                        type="button"
                        variant={field.value === opt ? 'default' : 'outline'}
                        className="h-11 capitalize"
                        onClick={() => field.onChange(field.value === opt ? '' : opt)}
                      >
                        {opt}
                      </Button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="heightCm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Height (cm)</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="e.g. 180"
                      className="h-11"
                      {...field}
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

            <div className="grid gap-2 pt-2">
              <Button type="submit" className="h-11" disabled={isPending}>
                {isPending ? 'Saving…' : 'Save'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="h-11"
                disabled={isPending}
                onClick={() => mutate({})}
              >
                Skip for now
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
