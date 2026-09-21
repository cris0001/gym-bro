import { cn } from '@/lib/utils';
import { LOCALES, useLocaleStore } from '@/stores/locale.store';

// A compact EN/PL segmented switch for the UI language. Reads and writes the
// persisted locale store; the selection applies app-wide immediately.
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
            'rounded-full px-2.5 py-1 text-xs font-semibold transition-colors',
            locale === code ? 'bg-card text-foreground' : 'text-muted-foreground',
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
