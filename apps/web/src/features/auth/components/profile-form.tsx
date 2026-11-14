import { zodResolver } from '@hookform/resolvers/zod';
import type { ReactNode } from 'react';
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
import { FIELD_CLASS } from '@/lib/form-styles';

import { useAuthTranslation } from '../i18n';
import { ChoiceButtons } from './choice-buttons';
import {
  FOOD_NAME_LANGS,
  SEX_OPTIONS,
  onboardingFormSchema,
  type OnboardingFormValues,
  type UpdateProfileInput,
  type User,
} from '../types';

interface ProfileFormProps {
  // Seeds the fields (Settings edits the saved profile; onboarding starts empty).
  user: User | null;
  // 'patch' sends every field, clearing an emptied one (Settings). 'only-set' sends
  // just the filled ones, so skipping a field leaves it untouched (onboarding).
  mode: 'patch' | 'only-set';
  onSubmit: (input: UpdateProfileInput) => void;
  isPending: boolean;
  error: Error | null;
  // Shown under the save button, e.g. onboarding's "Skip for now".
  secondaryAction?: ReactNode;
  status?: ReactNode;
  // Off in Settings, where the food-name language is its own save-on-tap control at
  // the top (FoodNameLangSetting) — the form then never sends it.
  includeFoodNameLang?: boolean;
}

// The profile fields shared by first-run onboarding and Settings: birthdate, sex,
// height, and the language generic catalog foods are named in. All optional.
export function ProfileForm({
  user,
  mode,
  onSubmit,
  isPending,
  error,
  secondaryAction,
  status,
  includeFoodNameLang = true,
}: ProfileFormProps) {
  const t = useAuthTranslation();
  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingFormSchema),
    defaultValues: {
      birthdate: user?.birthdate ?? '',
      sex: user?.sex ?? '',
      heightCm: user?.heightCm != null ? String(user.heightCm) : '',
      foodNameLang: user?.foodNameLang ?? '',
    },
  });

  function submit(values: OnboardingFormValues) {
    if (mode === 'patch') {
      onSubmit({
        birthdate: values.birthdate || null,
        sex: values.sex || null,
        heightCm: values.heightCm ? Number(values.heightCm) : null,
        ...(includeFoodNameLang ? { foodNameLang: values.foodNameLang || null } : {}),
      });
      return;
    }
    const payload: UpdateProfileInput = {};
    if (values.birthdate) payload.birthdate = values.birthdate;
    if (values.sex) payload.sex = values.sex;
    if (values.heightCm) payload.heightCm = Number(values.heightCm);
    if (includeFoodNameLang && values.foodNameLang) payload.foodNameLang = values.foodNameLang;
    onSubmit(payload);
  }

  const sexOptions = SEX_OPTIONS.map((value) => ({
    value,
    label: value === 'male' ? t.onboarding.male : t.onboarding.female,
  }));
  const foodNameOptions: { value: OnboardingFormValues['foodNameLang']; label: string }[] = [
    { value: '', label: t.onboarding.foodNamesAuto },
    ...FOOD_NAME_LANGS.map((value) => ({
      value,
      label: value === 'pl' ? t.onboarding.foodNamesPl : t.onboarding.foodNamesEn,
    })),
  ];

  return (
    <Form {...form}>
      <form onSubmit={(e) => void form.handleSubmit(submit)(e)} className="grid gap-4">
        {/* First: it shapes how the food catalog reads from the very first search. */}
        {includeFoodNameLang ? (
          <FormField
            control={form.control}
            name="foodNameLang"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.onboarding.foodNames}</FormLabel>
                <ChoiceButtons
                  options={foodNameOptions}
                  value={field.value}
                  onChange={field.onChange}
                />
                <p className="text-muted-foreground text-[12.5px] leading-snug">
                  {t.onboarding.foodNamesHint}
                </p>
              </FormItem>
            )}
          />
        ) : null}

        <FormField
          control={form.control}
          name="birthdate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.onboarding.birthdate}</FormLabel>
              <FormControl>
                <Input type="date" className={FIELD_CLASS} {...field} />
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
              <FormLabel>{t.onboarding.sex}</FormLabel>
              <ChoiceButtons
                options={sexOptions}
                value={field.value}
                onChange={field.onChange}
                deselectTo=""
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="heightCm"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.onboarding.height}</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder={t.onboarding.heightPlaceholder}
                  className={FIELD_CLASS}
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
        {status}

        <div className="grid gap-2 pt-2">
          <Button type="submit" className="h-9.5 rounded-full" disabled={isPending}>
            {isPending ? t.onboarding.saving : t.onboarding.save}
          </Button>
          {secondaryAction}
        </div>
      </form>
    </Form>
  );
}
