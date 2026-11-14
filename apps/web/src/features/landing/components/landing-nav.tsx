import { Link } from '@tanstack/react-router';

import { BrandLogo } from '@/components/brand-logo';

import { useLandingTranslation } from '../i18n';
import { SECTION } from '../utils/styles';
import { LandingLangSwitch } from './landing-lang-switch';

// Top bar: the Lift4Me logo, in-page anchors (sm+), the language switch and Sign in.
export function LandingNav() {
  const t = useLandingTranslation();
  const link =
    'hidden text-sm font-semibold text-[#5b6170] transition-colors hover:text-[#14181f] md:inline';

  return (
    <nav className={`${SECTION} flex h-[76px] items-center justify-between gap-4`}>
      <Link to="/" aria-label="Lift4Me">
        <BrandLogo className="h-7 text-[#14181f] sm:h-8 md:h-9" />
      </Link>
      <div className="flex items-center gap-2 sm:gap-3 md:gap-7">
        <a href="#inside" className={link}>
          {t.nav.inside}
        </a>
        <a href="#pwa" className={link}>
          {t.nav.install}
        </a>
        <a href="#pricing" className={link}>
          {t.nav.pricing}
        </a>
        <LandingLangSwitch />
        <Link
          to="/login"
          className="flex h-9 items-center rounded-full bg-[#14181f] px-4 sm:px-5 text-sm font-semibold whitespace-nowrap text-white transition-colors hover:bg-[#2a303b]"
        >
          {t.nav.signIn}
        </Link>
      </div>
    </nav>
  );
}
