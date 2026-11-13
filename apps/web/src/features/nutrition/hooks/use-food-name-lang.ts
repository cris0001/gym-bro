import { useCurrentUser } from '@/features/auth';
import { useLocaleStore, type Locale } from '@/stores/locale.store';

// The language generic catalog foods are named in: the account's choice (Settings /
// onboarding), else the UI language. Search matches both regardless.
export function useFoodNameLang(): Locale {
  const { data: user } = useCurrentUser();
  const locale = useLocaleStore((s) => s.locale);
  return user?.foodNameLang ?? locale;
}
