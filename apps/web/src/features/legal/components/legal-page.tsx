import { Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';

import { BrandLogo } from '@/components/brand-logo';
import { FlagIcon } from '@/components/flag-icon';
import { useForceLightTheme } from '@/hooks/use-force-light-theme';
import { LOCALES, useLocaleStore } from '@/stores/locale.store';

import type { LegalDoc } from '../content/types';

const COPY = {
  pl: {
    back: 'Strona główna',
    updated: 'Ostatnia aktualizacja',
    privacy: 'Polityka prywatności',
    terms: 'Regulamin',
  },
  en: {
    back: 'Home',
    updated: 'Last updated',
    privacy: 'Privacy policy',
    terms: 'Terms of service',
  },
};

// A public legal document (terms / privacy) in the landing's fixed light look: a top
// bar with the logo and a one-tap language toggle, then the numbered sections, and
// links to both documents at the bottom. Sets the tab title + meta description.
export function LegalPage({ docs }: { docs: Record<'pl' | 'en', LegalDoc> }) {
  useForceLightTheme('slate');
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const doc = docs[locale];
  const c = COPY[locale];
  const next = LOCALES.find((l) => l.code !== locale) ?? LOCALES[0]!;

  useEffect(() => {
    const prev = document.title;
    document.title = `${doc.title} — Lift4Me`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', doc.intro);
    return () => {
      document.title = prev;
    };
  }, [doc]);

  return (
    <div className="min-h-dvh bg-[#f7f6f2] text-[#14181f] [--logo-knockout:#f7f6f2]">
      <nav className="mx-auto flex h-[72px] w-full max-w-[760px] items-center justify-between px-5">
        <Link to="/" aria-label="Lift4Me">
          <BrandLogo className="h-8 text-[#14181f]" />
        </Link>
        <button
          type="button"
          onClick={() => setLocale(next.code)}
          className="inline-flex h-9 items-center gap-2 rounded-full border border-[#e4e1d8] bg-white px-3 text-[13px] font-semibold transition-colors hover:bg-[#efeee9]"
        >
          <FlagIcon locale={locale} />
          {locale.toUpperCase()}
        </button>
      </nav>

      <main className="mx-auto w-full max-w-[760px] px-5 pt-6 pb-20">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#5b6170] transition-colors hover:text-[#023e8a]"
        >
          <ArrowLeft className="size-4" />
          {c.back}
        </Link>
        <h1 className="font-heading text-[clamp(32px,5vw,44px)] leading-tight font-extrabold tracking-[-0.035em]">
          {doc.title}
        </h1>
        <p className="mt-1 text-sm text-[#5b6170]">
          {c.updated}: {doc.updated}
        </p>
        <p className="mt-6 text-[16px] leading-relaxed text-[#3d4350]">{doc.intro}</p>

        <ol className="mt-10 flex flex-col gap-8">
          {doc.sections.map((section, i) => (
            <li key={section.heading}>
              <h2 className="font-heading text-xl font-bold tracking-[-0.02em]">
                <span className="mr-2 text-[#023e8a]">{i + 1}.</span>
                {section.heading}
              </h2>
              <div className="mt-3 flex flex-col gap-2.5">
                {section.body.map((p) => (
                  <p key={p} className="text-[15px] leading-relaxed text-[#3d4350]">
                    {p}
                  </p>
                ))}
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-14 flex gap-5 border-t border-[#e4e1d8] pt-6 text-sm font-semibold">
          <Link to="/privacy" className="text-[#023e8a] hover:underline">
            {c.privacy}
          </Link>
          <Link to="/terms" className="text-[#023e8a] hover:underline">
            {c.terms}
          </Link>
        </div>
      </main>
    </div>
  );
}
