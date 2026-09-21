import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

import { LANDING_MODULES, type LandingModule } from '../data/modules';

// The browser-panel preview of one module. Uses the real screenshot when present in
// /public/landing; until then a module-tinted placeholder so the scroll-driven switch
// is visible. Wiring real PNGs later is a one-line change (set `screenshot`).
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

// "What's inside" — a pinned scrollytelling showcase. Desktop: the left column is a
// stack of tall steps (one module each); the right browser panel is sticky and stays
// on screen for the whole section, crossfading to the module whose step is crossing
// the viewport centre. Clicking a card scrolls to its step. Mobile: cards stack
// normally and the panel is hidden.
export function ModuleShowcase() {
  const [active, setActive] = useState(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // A zero-height band at the vertical centre: the step spanning it is "active".
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(Number((entry.target as HTMLElement).dataset.index));
          }
        }
      },
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 },
    );
    for (const el of stepRefs.current) if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const current = LANDING_MODULES[active] ?? LANDING_MODULES[0]!;

  return (
    <section id="inside" className="scroll-mt-16 bg-[#f5e7ea] py-16 md:py-24">
      <div className="mx-auto w-full max-w-[1060px] px-6">
        <div className="mb-6 flex flex-col items-center gap-2 text-center md:mb-10">
          <span className="font-heading text-[15px] text-[#8d4a5e] italic">What&apos;s inside</span>
          <h2 className="font-heading text-[clamp(26px,3.5vw,36px)] font-medium tracking-tight text-[#2b2126]">
            Six modules, zero setup
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(300px,1fr)_minmax(320px,460px)] lg:items-start">
          {/* Left — one tall step per module; scrolling drives the active one. */}
          <div className="flex flex-col gap-2.5 lg:gap-0">
            {LANDING_MODULES.map((module, index) => {
              const Icon = module.icon;
              const isActive = index === active;
              return (
                <div
                  key={module.id}
                  ref={(el) => {
                    stepRefs.current[index] = el;
                  }}
                  data-index={index}
                  className="flex flex-col justify-center lg:min-h-[55vh]"
                >
                  <button
                    type="button"
                    onClick={() =>
                      stepRefs.current[index]?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                      })
                    }
                    className={cn(
                      'w-full rounded-2xl border p-4 text-left transition-all duration-300 md:p-[18px]',
                      isActive
                        ? 'border-transparent bg-[#2b2126] shadow-xl lg:scale-[1.02]'
                        : 'border-[#e8e1da] bg-[#fdfbf9] hover:border-[#8d4a5e]/40 lg:opacity-70',
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
                    <p
                      className={cn(
                        'mt-2 pl-[50px] text-[13px] leading-relaxed',
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
                  </button>
                </div>
              );
            })}
          </div>

          {/* Right — the panel pins for the whole section and crossfades per module. */}
          <div className="hidden lg:block">
            <div className="sticky top-24 overflow-hidden rounded-[20px] border border-[#e0d3d8] bg-[#fdfbf9] shadow-2xl">
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
              <div className="relative h-[460px] w-full">
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
    </section>
  );
}
