import { cn } from '@/lib/utils';
import { LOCALES, useLocaleStore } from '@/stores/locale.store';

import { FlagIcon } from './flag-icon';

// A compact EN/PL segmented switch for the UI language, each option with its flag.
// Reads and writes the persisted locale store; the selection applies app-wide at once.
export function LanguageToggle({ className }: { className?: string }) {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);

  return (
    <div className={cn('bg-secondary flex items-center rounded-full p-0.5', className)}>
      {LOCALES.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          aria-pressed={locale === code}
          onClick={() => setLocale(code)}
          className={cn(
            'inline-flex h-7 cursor-pointer items-center gap-1 rounded-full px-2.5 text-[11.5px] font-semibold transition-colors',
            locale === code ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground',
          )}
        >
          <FlagIcon locale={code} />
          {label}
        </button>
      ))}
    </div>
  );
}
