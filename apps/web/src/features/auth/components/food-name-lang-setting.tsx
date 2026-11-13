import { useCurrentUser } from '../hooks/use-current-user';
import { useUpdateProfile } from '../hooks/use-update-profile';
import { useAuthTranslation } from '../i18n';
import { FOOD_NAME_LANGS, type FoodNameLang } from '../types';
import { ChoiceButtons } from './choice-buttons';

type Choice = FoodNameLang | '';

// The food-name language as a standalone, save-on-tap setting — the first thing in
// Settings. '' = follow the app language (stored as null).
export function FoodNameLangSetting() {
  const t = useAuthTranslation();
  const { data: user } = useCurrentUser();
  const update = useUpdateProfile();

  const options: { value: Choice; label: string }[] = [
    { value: '', label: t.onboarding.foodNamesAuto },
    ...FOOD_NAME_LANGS.map((value) => ({
      value,
      label: value === 'pl' ? t.onboarding.foodNamesPl : t.onboarding.foodNamesEn,
    })),
  ];
  // Show the choice being saved straight away, not after the round trip.
  const pending = update.isPending ? update.variables.foodNameLang : undefined;
  const value: Choice = pending !== undefined ? (pending ?? '') : (user?.foodNameLang ?? '');

  return (
    <div className="grid gap-2">
      <span className="text-subtle-foreground text-[12.5px] font-semibold">
        {t.onboarding.foodNames}
      </span>
      <ChoiceButtons
        options={options}
        value={value}
        onChange={(next) => update.mutate({ foodNameLang: next || null })}
      />
      <p className="text-muted-foreground text-[12.5px] leading-snug">
        {t.onboarding.foodNamesHint}
      </p>
      {update.error ? (
        <p role="alert" className="text-destructive text-sm">
          {update.error.message}
        </p>
      ) : null}
    </div>
  );
}
