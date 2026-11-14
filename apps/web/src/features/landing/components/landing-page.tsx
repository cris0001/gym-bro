import '@fontsource/caveat-brush';

import { useEffect } from 'react';

import { useForceLightTheme } from '@/hooks/use-force-light-theme';

import { useLandingTranslation } from '../i18n';
import { LandingClosing } from './landing-closing';
import { LandingHero } from './landing-hero';
import { LandingMarquee } from './landing-marquee';
import { LandingNav } from './landing-nav';
import { ModuleShowcase } from './module-showcase';
import { PricingSection } from './pricing-section';
import { PwaSection } from './pwa-section';
import { TimelineSection } from './timeline-section';

// The public marketing home page, in the Lift4Me brand: a fixed light design (chalk,
// ink, cobalt) independent of the app theme. Nav, hero (with the dashboard), the
// looping motto strip, the scroll-driven module showcase, one-calendar timeline, the
// install band, pricing + FAQ and a closing CTA. All CTAs route to auth. The brush
// face (the logo's) is loaded here only, for the hand-lettered accents.
export function LandingPage() {
  const t = useLandingTranslation();
  // Light-only, on the slate palette so --primary (logo, focus rings) is the cobalt.
  useForceLightTheme('slate');
  // Page title/description for this route, plus smooth anchor scrolling while the
  // landing is mounted (restored on leave so the app isn't affected).
  useEffect(() => {
    const prevTitle = document.title;
    document.title = t.pageTitle;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', t.pageDesc);

    const root = document.documentElement;
    const prevBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'smooth';
    return () => {
      document.title = prevTitle;
      root.style.scrollBehavior = prevBehavior;
    };
  }, [t.pageTitle, t.pageDesc]);

  return (
    // --logo-knockout: the logo's letters are outlined in the page colour.
    <div className="min-h-dvh overflow-x-clip bg-[#f7f6f2] text-[#14181f] [--logo-knockout:#f7f6f2]">
      <LandingNav />
      <LandingHero />
      <LandingMarquee />
      <ModuleShowcase />
      <TimelineSection />
      <PwaSection />
      <PricingSection />
      <LandingClosing />
    </div>
  );
}
