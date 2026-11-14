import { FlagIcon } from '@/components/flag-icon';
import { cn } from '@/lib/utils';
import { LOCALES, useLocaleStore } from '@/stores/locale.store';

// EN/PL switch (with flags) in the landing's fixed palette — the shared LanguageToggle
// uses theme tokens, which would clash on this theme-independent page. Writes the
// app-wide locale store, which also translates this page.
export function LandingLangSwitch() {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  return (
    <div className="flex items-center rounded-full border border-[#e4e1d8] bg-white p-0.5">
      {LOCALES.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          aria-pressed={locale === code}
          onClick={() => setLocale(code)}
          className={cn(
            'inline-flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors',
            locale === code ? 'bg-[#14181f] text-white' : 'text-[#5b6170] hover:text-[#14181f]',
          )}
        >
          <FlagIcon locale={code} />
          {label}
        </button>
      ))}
    </div>
  );
}
