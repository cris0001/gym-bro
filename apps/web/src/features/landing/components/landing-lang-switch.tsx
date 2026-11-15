import { FlagIcon } from '@/components/flag-icon';
import { LOCALES, useLocaleStore } from '@/stores/locale.store';

// The landing's language toggle: shows only the active language (flag + code); a tap
// switches to the other one. Fixed landing palette — the shared LanguageToggle uses
// theme tokens. Writes the app-wide locale store, which also translates this page.
export function LandingLangSwitch() {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0]!;
  const next = LOCALES.find((l) => l.code !== locale) ?? LOCALES[0]!;

  return (
    <button
      type="button"
      onClick={() => setLocale(next.code)}
      aria-label={`Language: ${current.label}. Switch to ${next.label}`}
      className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-full border border-[#e4e1d8] bg-white px-3 text-[13px] font-semibold text-[#14181f] transition-colors hover:bg-[#efeee9]"
    >
      <FlagIcon locale={current.code} />
      {current.label}
    </button>
  );
}
