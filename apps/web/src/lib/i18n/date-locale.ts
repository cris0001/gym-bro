import { setDefaultOptions } from 'date-fns';
import { enUS, pl } from 'date-fns/locale';

import type { Locale } from '@/stores/locale.store';

const DATE_LOCALES = { en: enUS, pl } as const;

// Makes every date-fns `format()` in the app follow the UI language (month/day names,
// e.g. "sobota, 14 listopada"). Week maths always passes weekStartsOn explicitly, so
// the Polish locale's Monday week start doesn't change any calendar calculation.
export function applyDateLocale(locale: Locale): void {
  setDefaultOptions({ locale: DATE_LOCALES[locale] });
}
