import { Link } from '@tanstack/react-router';

import { BrandLogo } from '@/components/brand-logo';

import { useLandingTranslation } from '../i18n';
import { SECTION } from '../utils/styles';

// The cobalt closing band: the last call to action, then a footer row with the logo
// in white (bar, plates and the 4 recoloured via --primary).
export function LandingClosing() {
  const t = useLandingTranslation();
  return (
    <footer className="bg-[#023e8a] text-white">
      <div className={`${SECTION} flex flex-col items-center pt-20 pb-8 text-center md:pt-24`}>
        <p className="font-heading text-[clamp(32px,5vw,60px)] leading-[1.02] font-extrabold tracking-[-0.045em] text-balance">
          {t.closing.title}
        </p>
        <Link
          to="/register"
          className="mt-8 inline-flex h-10 items-center rounded-full bg-white px-8 text-[15px] font-extrabold text-[#023e8a] transition-colors hover:bg-[#e3ebf7]"
        >
          {t.closing.cta}
        </Link>
        <div className="mt-16 flex w-full flex-col items-center gap-3 border-t border-white/20 pt-6 text-[13px] text-[#b9cbe8] sm:flex-row sm:justify-between">
          <BrandLogo className="h-7 text-white [--logo-knockout:#023e8a] [--primary:#ffffff]" />
          <span className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <Link to="/privacy" className="hover:text-white">
              {t.closing.privacy}
            </Link>
            <Link to="/terms" className="hover:text-white">
              {t.closing.terms}
            </Link>
            <span>{t.closing.footer}</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
