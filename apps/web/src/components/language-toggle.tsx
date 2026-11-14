import { cn } from '@/lib/utils';
import { LOCALES, useLocaleStore } from '@/stores/locale.store';

import { FlagIcon } from './flag-icon';

// A compact EN/PL segmented switch for the UI language, each option with its flag.
// Reads and writes the persisted locale store; the selection applies app-wide at once.
export function LanguageToggle({ className }: { className?: string }) {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);

  return (
    <div className={cn('bg-secondary flex h-9 items-center gap-1 rounded-md p-[3px]', className)}>
      {LOCALES.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          aria-pressed={locale === code}
          onClick={() => setLocale(code)}
          className={cn(
            'inline-flex h-full cursor-pointer items-center gap-1.5 rounded-sm px-3 text-[13px] font-semibold transition-colors',
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
