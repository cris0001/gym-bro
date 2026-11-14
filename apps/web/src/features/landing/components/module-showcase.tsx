import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

import { LANDING_MODULES, type LandingModule } from '../data/modules';
import { useLandingTranslation } from '../i18n';
import { useScreenshot } from '../hooks/use-screenshot';
import { HAND } from '../utils/styles';
import { PhoneFrame } from './phone-frame';

// The browser-panel preview of one module: the demo account's screenshot in the
// visitor's language (public/landing/<locale>/), or a module-tinted placeholder for
// modules without one (Strava — the demo accounts aren't connected).
function ModuleScreen({ module }: { module: LandingModule }) {
  const t = useLandingTranslation();
  const shot = useScreenshot();
  const copy = t.modules[module.id];
  const Icon = module.icon;
  if (module.screenshot) {
    return (
      <img
        src={shot(module.screenshot)}
        alt={t.inside.screenAlt(copy.title)}
        className="h-full w-full object-cover object-left-top"
      />
    );
  }
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-3 text-center"
      style={{ background: `linear-gradient(150deg, ${module.color}22, ${module.color}0d)` }}
    >
      <span
        className="flex size-16 items-center justify-center rounded-2xl"
        style={{ backgroundColor: module.color, color: module.iconFg }}
      >
        <Icon className="size-8" />
      </span>
      <span className="font-heading text-xl font-bold text-[#14181f]">{copy.title}</span>
      <span className="text-xs text-[#8a8f9a]">{t.inside.screenshot}</span>
    </div>
  );
}

// "What's inside" — a pinned showcase on every breakpoint. The section is a tall scroll
// track; the inner block stays fixed (static) on screen while scroll progress advances
// the active module: its card expands, the rest collapse and dim, and (desktop) the
// preview panel crossfades. To fit one screen on mobile, the active card's extra bullet
// list is desktop-only; the panel is hidden on mobile.
export function ModuleShowcase() {
  const t = useLandingTranslation();
  const [active, setActive] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  // While a click-to-jump smooth-scroll is running, ignore scroll→active updates so
  // the intermediate positions don't cascade every card's animation on the way.
  const jumpingRef = useRef(false);
  const jumpTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = sectionRef.current;
      if (!el || jumpingRef.current) return;
      const range = el.offsetHeight - window.innerHeight; // pinned scroll distance
      if (range <= 0) return;
      const scrolled = Math.min(Math.max(-el.getBoundingClientRect().top, 0), range);
      const progress = scrolled / range;
      setActive(
        Math.min(LANDING_MODULES.length - 1, Math.floor(progress * LANDING_MODULES.length)),
      );
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
      if (jumpTimer.current) window.clearTimeout(jumpTimer.current);
    };
  }, []);

  // Clicking a card jumps the page to that module's slice of the track.
  function goToModule(index: number) {
    const el = sectionRef.current;
    if (!el) return;
    const range = el.offsetHeight - window.innerHeight;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const target = top + ((index + 0.5) / LANDING_MODULES.length) * range;
    // Jump straight to the target module (no cascade), then let the scroll settle.
    jumpingRef.current = true;
    setActive(index);
    window.clearTimeout(jumpTimer.current);
    window.scrollTo({ top: target, behavior: 'smooth' });
    jumpTimer.current = window.setTimeout(() => {
      jumpingRef.current = false;
    }, 800);
  }

  const current = LANDING_MODULES[active] ?? LANDING_MODULES[0]!;

  return (
    <section id="inside" ref={sectionRef} className="scroll-mt-16 bg-[#eef2f9] h-[400vh]">
      {/* Pinned viewport (all breakpoints): stays fixed while the track scrolls.
          Centered via m-auto (not items-center) + overflow-y-auto so if the block
          is ever taller than the screen it scrolls instead of clipping top/bottom. */}
      <div className="no-scrollbar sticky top-0 flex h-dvh overflow-y-auto">
        <div className="m-auto w-full max-w-[1200px] px-5 py-6 md:px-10 md:py-10">
          <div className="mb-4 flex flex-col items-center gap-1 text-center md:mb-10 md:gap-2">
            <span className={`${HAND} text-lg text-[#023e8a] md:text-[22px]`}>
              {t.inside.eyebrow}
            </span>
            <h2 className="font-heading text-[clamp(26px,3.6vw,44px)] font-extrabold tracking-[-0.035em] text-[#14181f]">
              {t.inside.title}
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16 lg:items-center">
            {/* Left — the card list; scroll progress or a click sets the active one. */}
            <div className="flex flex-col gap-1.5 md:gap-2.5">
              {LANDING_MODULES.map((module, index) => {
                const Icon = module.icon;
                const isActive = index === active;
                const copy = t.modules[module.id];
                return (
                  <button
                    key={module.id}
                    type="button"
                    onClick={() => goToModule(index)}
                    className={cn(
                      'w-full rounded-2xl border p-3 text-left transition-all duration-300 md:p-[18px]',
                      isActive
                        ? 'border-transparent bg-[#14181f] shadow-lg'
                        : 'border-[#e4e1d8] bg-white opacity-55 hover:border-[#023e8a]/40 lg:opacity-65',
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="flex size-[34px] shrink-0 items-center justify-center rounded-xl md:size-[38px]"
                        style={{ backgroundColor: module.color, color: module.iconFg }}
                      >
                        <Icon className="size-4 md:size-[18px]" />
                      </span>
                      <span
                        className={cn(
                          'font-heading flex-1 text-lg font-bold md:text-xl',
                          isActive ? 'text-white' : 'text-[#14181f]',
                        )}
                      >
                        {copy.title}
                      </span>
                      <span
                        className={cn('text-lg', isActive ? 'text-[#7fa6ff]' : 'text-[#8a8f9a]')}
                      >
                        →
                      </span>
                    </div>
                    {/* Details collapse for inactive cards (grid-rows 0fr→1fr eases the
                        height); only the active card expands. */}
                    <div
                      className={cn(
                        'grid grid-rows-[1fr] opacity-100 transition-[grid-template-rows,opacity] duration-300 ease-out',
                        !isActive && 'grid-rows-[0fr] opacity-0',
                      )}
                    >
                      <div className="overflow-hidden">
                        <p
                          className={cn(
                            'pt-2 pl-[50px] text-[13px] leading-relaxed',
                            isActive ? 'text-[#b8bfcc]' : 'text-[#5b6170]',
                          )}
                        >
                          {copy.desc}
                        </p>
                        <div className="mt-2.5 flex flex-wrap gap-1.5 pl-[50px]">
                          {copy.chips.map((chip) => (
                            <span
                              key={chip}
                              className={cn(
                                'rounded-full px-2.5 py-1 text-[11px] font-semibold',
                                isActive
                                  ? 'bg-[#262c38] text-[#c5d3ee]'
                                  : 'bg-[#efeee9] text-[#5b6170]',
                              )}
                            >
                              {chip}
                            </span>
                          ))}
                        </div>
                        {/* Extra bullets are desktop-only so the pinned block fits a phone. */}
                        {isActive && (
                          <ul className="mt-3 hidden flex-col gap-1.5 pl-[50px] lg:flex">
                            {copy.details.map((detail) => (
                              <li
                                key={detail}
                                className="flex gap-2 text-[12.5px] leading-snug text-[#b8bfcc]"
                              >
                                <span className="text-[#7fa6ff]">›</span>
                                {detail}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right — the preview panel (desktop only); stays put via the pin. */}
            <div className="hidden flex-col items-center gap-4 lg:flex">
              <PhoneFrame className="w-[300px]">
                {/* Stacked screens, crossfaded by opacity — the phone never blanks out. */}
                {LANDING_MODULES.map((module, index) => (
                  <div
                    key={module.id}
                    className={cn(
                      'absolute inset-x-0 bottom-0 transition-opacity duration-500 ease-out',
                      module.tabbed ? 'top-3' : 'top-0',
                      index === active ? 'opacity-100' : 'opacity-0',
                    )}
                    aria-hidden={index !== active}
                  >
                    <ModuleScreen module={module} />
                  </div>
                ))}
              </PhoneFrame>
              <span className={`${HAND} text-center text-lg text-[#5b6170]`}>
                {t.modules[current.id].caption}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
