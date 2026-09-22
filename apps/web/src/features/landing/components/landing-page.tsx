import { Link } from '@tanstack/react-router';
import { BicepsFlexed } from 'lucide-react';
import { useEffect } from 'react';

import { ModuleShowcase } from './module-showcase';
import { PricingSection } from './pricing-section';
import { PwaSection } from './pwa-section';

const PAGE_TITLE = 'Gym Bro — training, nutrition & body tracking';
const PAGE_DESC =
  'A gym log, a food diary and a body tracker in one free, installable web app — with your Strava rides next to your workouts.';

function BrandLogo({ size = 34, radius = 10 }: { size?: number; radius?: number }) {
  return (
    <span
      className="flex items-center justify-center bg-[#8d4a5e] text-[#fdf6f5]"
      style={{ width: size, height: size, borderRadius: radius }}
    >
      <BicepsFlexed style={{ width: size * 0.53, height: size * 0.53 }} />
    </span>
  );
}

// The public marketing home page. Fixed light design (theme-independent) reproduced
// from the approved mockup: nav, hero, the scroll-driven module showcase, a serif
// strip, the dark PWA band, pricing + FAQ, and a closing CTA. All CTAs route to auth.
export function LandingPage() {
  // Page title/description for this route, plus smooth anchor scrolling while the
  // landing is mounted (restored on leave so the app isn't affected).
  useEffect(() => {
    const prevTitle = document.title;
    document.title = PAGE_TITLE;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', PAGE_DESC);

    const root = document.documentElement;
    const prevBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'smooth';
    return () => {
      document.title = prevTitle;
      root.style.scrollBehavior = prevBehavior;
    };
  }, []);

  return (
    <div className="flex min-h-dvh flex-col items-center bg-[#f6f3f0] text-[#2b2126]">
      {/* Nav */}
      <div className="mx-auto flex w-full max-w-[1060px] items-center justify-between px-6 py-[22px]">
        <span className="flex items-center gap-2.5">
          <BrandLogo />
          <span className="font-heading text-[21px] font-semibold">Gym Bro</span>
        </span>
        <div className="flex items-center gap-4 sm:gap-[18px]">
          <a href="#inside" className="hidden text-[13px] font-semibold text-[#5f5257] sm:inline">
            What&apos;s inside
          </a>
          <a href="#pwa" className="hidden text-[13px] font-semibold text-[#5f5257] sm:inline">
            Install
          </a>
          <a href="#pricing" className="hidden text-[13px] font-semibold text-[#5f5257] sm:inline">
            Pricing
          </a>
          <Link
            to="/login"
            className="flex h-[38px] items-center rounded-full bg-[#8d4a5e] px-[18px] text-[13px] font-semibold whitespace-nowrap text-[#fdf6f5] hover:bg-[#75394c]"
          >
            Sign in
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div className="mx-auto flex w-full max-w-[1060px] flex-col items-center gap-7 px-6 pt-20 pb-20 text-center md:gap-6 md:pt-16 md:pb-18">
        <h1 className="font-heading max-w-[760px] text-[clamp(38px,6vw,58px)] leading-[1.08] font-medium tracking-tight text-balance">
          Log your lifts. Track your plate. <em className="text-[#8d4a5e]">Watch the trend.</em>
        </h1>
        <p className="hidden max-w-[560px] text-base leading-relaxed text-[#5f5257] sm:block">
          A gym log, a food diary and a body tracker that live in one place — with your Strava rides
          next to your workouts. Free, no app store needed.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/register"
            className="flex h-12 items-center rounded-full bg-[#8d4a5e] px-[26px] text-[14.5px] font-semibold whitespace-nowrap text-[#fdf6f5] hover:bg-[#75394c]"
          >
            Get started free
          </Link>
          <a
            href="#inside"
            className="hidden h-12 items-center rounded-full border border-[#d6c8bd] bg-[#fdfbf9] px-[22px] text-sm font-semibold whitespace-nowrap text-[#5f5257] sm:flex"
          >
            See what&apos;s inside ↓
          </a>
        </div>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 pt-2">
          {['Free forever', 'Works offline', 'Strava import'].map((tick) => (
            <span key={tick} className="flex items-center gap-1.5 text-[12.5px] text-[#94858b]">
              <span className="text-[#5a7a52]">✓</span>
              {tick}
            </span>
          ))}
        </div>
      </div>

      {/* Serif strip — a seamless, infinitely looping marquee, above the modules */}
      <div className="w-full overflow-hidden border-y border-[#e8e1da] bg-[#f6f3f0] py-3">
        <div className="animate-marquee flex w-max motion-reduce:animate-none">
          {[0, 1].map((group) => (
            <div key={group} className="flex shrink-0" aria-hidden={group === 1}>
              {Array.from({ length: 8 }).map((_, i) => (
                <span
                  key={i}
                  className="font-heading flex items-center gap-6 pr-6 text-[clamp(14px,1.6vw,18px)] whitespace-nowrap text-[#c9bcb2] italic"
                >
                  eat sleep lift repeat
                  <span className="text-[#8d4a5e]">·</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* What's inside — scroll-driven module showcase */}
      <div className="w-full">
        <ModuleShowcase />
      </div>

      {/* PWA */}
      <div className="w-full">
        <PwaSection />
      </div>

      {/* Pricing + FAQ */}
      <PricingSection />

      {/* Closing CTA */}
      <div className="mt-6 flex w-full justify-center bg-[#2b2126]">
        <div className="mx-auto flex w-full max-w-[1060px] flex-col items-center gap-5 px-6 py-11 text-center">
          <span className="font-heading text-[clamp(24px,3.5vw,32px)] font-medium tracking-tight text-[#f0e7ea]">
            Your next session is waiting.
          </span>
          <Link
            to="/register"
            className="flex h-12 items-center rounded-full bg-[#c98fa0] px-7 text-[14.5px] font-bold whitespace-nowrap text-[#2b2126]"
          >
            Get started free
          </Link>
          <div className="flex w-full items-center justify-center gap-2.5 border-t border-[#4a3d43] pt-3">
            <BrandLogo size={24} radius={7} />
            <span className="text-xs text-[#94858b]">Gym Bro · train, eat, track — 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}
