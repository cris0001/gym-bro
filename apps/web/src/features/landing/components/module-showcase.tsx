import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

import { LANDING_MODULES, type LandingModule } from '../data/modules';

const DESKTOP = '(min-width: 1024px)';

// The browser-panel preview of one module. Uses the real screenshot when present in
// /public/landing; until then a module-tinted placeholder so the switch is visible.
// Wiring real PNGs later is a one-line change (set `screenshot`).
function ModuleScreen({ module }: { module: LandingModule }) {
  const Icon = module.icon;
  if (module.screenshot) {
    return (
      <img
        src={module.screenshot}
        alt={`${module.title} screen`}
        className="h-full w-full object-cover"
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
      <span className="font-heading text-xl font-semibold text-[#2b2126]">{module.title}</span>
      <span className="text-xs text-[#94858b]">Screenshot placeholder</span>
    </div>
  );
}

// "What's inside" — a pinned showcase on desktop. The section is a tall scroll track;
// its inner panel is sticky and stays put on screen while you scroll, and scroll
// progress through the track advances the active module (list highlight + crossfading
// screen). Reaching the last module releases the pin and normal page scroll resumes.
// On mobile there's no pin: cards stack and the preview panel is hidden.
export function ModuleShowcase() {
  const [active, setActive] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  // Map scroll position within the track to the active module (desktop only).
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = sectionRef.current;
      if (!el || !window.matchMedia(DESKTOP).matches) return;
      const range = el.offsetHeight - window.innerHeight; // pinned scroll distance
      if (range <= 0) return;
      const scrolled = Math.min(Math.max(-el.getBoundingClientRect().top, 0), range);
      const progress = scrolled / range;
      const index = Math.min(
        LANDING_MODULES.length - 1,
        Math.floor(progress * LANDING_MODULES.length),
      );
      setActive(index);
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
    };
  }, []);

  // Clicking a card jumps the page to that module's slice of the track (desktop) or
  // just selects it (mobile, where nothing is pinned).
  function goToModule(index: number) {
    const el = sectionRef.current;
    if (!el || !window.matchMedia(DESKTOP).matches) {
      setActive(index);
      return;
    }
    const range = el.offsetHeight - window.innerHeight;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const target = top + ((index + 0.5) / LANDING_MODULES.length) * range;
    window.scrollTo({ top: target, behavior: 'smooth' });
  }

  const current = LANDING_MODULES[active] ?? LANDING_MODULES[0]!;

  return (
    <section id="inside" ref={sectionRef} className="scroll-mt-16 bg-[#f5e7ea] lg:h-[400vh]">
      {/* Pinned viewport on desktop; a normal block on mobile. */}
      <div className="py-16 md:py-24 lg:sticky lg:top-0 lg:flex lg:h-screen lg:items-center lg:py-0">
        <div className="mx-auto w-full max-w-[1060px] px-6">
          <div className="mb-6 flex flex-col items-center gap-2 text-center md:mb-10">
            <span className="font-heading text-[15px] text-[#8d4a5e] italic">
              What&apos;s inside
            </span>
            <h2 className="font-heading text-[clamp(26px,3.5vw,36px)] font-medium tracking-tight text-[#2b2126]">
              Six modules, zero setup
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(300px,1fr)_minmax(320px,460px)] lg:items-center">
            {/* Left — a compact card list; scroll progress or a click sets the active one. */}
            <div className="flex flex-col gap-2.5">
              {LANDING_MODULES.map((module, index) => {
                const Icon = module.icon;
                const isActive = index === active;
                return (
                  <button
                    key={module.id}
                    type="button"
                    onClick={() => goToModule(index)}
                    className={cn(
                      'w-full rounded-2xl border p-4 text-left transition-all duration-300 md:p-[18px]',
                      isActive
                        ? 'border-transparent bg-[#2b2126] shadow-lg'
                        : 'border-[#e8e1da] bg-[#fdfbf9] hover:border-[#8d4a5e]/40 lg:opacity-65',
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="flex size-[38px] shrink-0 items-center justify-center rounded-xl"
                        style={{ backgroundColor: module.color, color: module.iconFg }}
                      >
                        <Icon className="size-[18px]" />
                      </span>
                      <span
                        className={cn(
                          'font-heading flex-1 text-xl font-semibold',
                          isActive ? 'text-[#f0e7ea]' : 'text-[#2b2126]',
                        )}
                      >
                        {module.title}
                      </span>
                      <span
                        className={cn('text-lg', isActive ? 'text-[#c98fa0]' : 'text-[#94858b]')}
                      >
                        →
                      </span>
                    </div>
                    {/* Details collapse on desktop for inactive cards so the whole
                        pinned block fits one screen; animated via grid-rows (0fr→1fr)
                        so the height eases instead of snapping. Mobile always open. */}
                    <div
                      className={cn(
                        'grid grid-rows-[1fr] opacity-100 transition-[grid-template-rows,opacity] duration-300 ease-out',
                        !isActive && 'lg:grid-rows-[0fr] lg:opacity-0',
                      )}
                    >
                      <div className="overflow-hidden">
                        <p
                          className={cn(
                            'pt-2 pl-[50px] text-[13px] leading-relaxed',
                            isActive ? 'text-[#bfb2b7]' : 'text-[#5f5257]',
                          )}
                        >
                          {module.desc}
                        </p>
                        <div className="mt-2.5 flex flex-wrap gap-1.5 pl-[50px]">
                          {module.chips.map((chip) => (
                            <span
                              key={chip}
                              className={cn(
                                'rounded-full px-2.5 py-1 text-[11px] font-semibold',
                                isActive
                                  ? 'bg-[#3a2f34] text-[#e8cdd5]'
                                  : 'bg-[#f0e9e3] text-[#5f5257]',
                              )}
                            >
                              {chip}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right — the preview panel; it stays put because the whole block is pinned. */}
            <div className="hidden lg:block">
              <div className="overflow-hidden rounded-[20px] border border-[#e0d3d8] bg-[#fdfbf9] shadow-2xl">
                <div className="flex items-center gap-2 border-b border-[#e8e1da] bg-[#f6f3f0] px-4 py-3">
                  <span className="flex gap-1.5">
                    <span className="size-[9px] rounded-full bg-[#e0d3d8]" />
                    <span className="size-[9px] rounded-full bg-[#e0d3d8]" />
                    <span className="size-[9px] rounded-full bg-[#e0d3d8]" />
                  </span>
                  <span className="ml-2 text-xs font-semibold text-[#94858b]">
                    gymbro.app — {current.title}
                  </span>
                </div>
                {/* Stacked screens, crossfaded by opacity — the panel never blanks out. */}
                <div className="relative h-[440px] w-full">
                  {LANDING_MODULES.map((module, index) => (
                    <div
                      key={module.id}
                      className={cn(
                        'absolute inset-0 transition-opacity duration-500 ease-out',
                        index === active ? 'opacity-100' : 'opacity-0',
                      )}
                      aria-hidden={index !== active}
                    >
                      <ModuleScreen module={module} />
                    </div>
                  ))}
                </div>
                <span className="font-heading block border-t border-[#e8e1da] bg-[#f6f3f0] px-4 py-2.5 text-center text-[12.5px] text-[#94858b] italic">
                  {current.caption}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
