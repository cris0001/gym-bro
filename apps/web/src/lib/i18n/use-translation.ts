import { useLocaleStore } from '@/stores/locale.store';

import { MESSAGES, type Messages } from './messages';

// UI translation hook: `t` is the message tree for the active locale (e.g.
// `t.hero.title`), plus the current locale and a setter. Frontend-only.
export function useTranslation(): {
  t: Messages;
  locale: ReturnType<typeof useLocaleStore.getState>['locale'];
  setLocale: ReturnType<typeof useLocaleStore.getState>['setLocale'];
} {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  return { t: MESSAGES[locale], locale, setLocale };
}
