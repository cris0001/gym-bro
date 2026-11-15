import { Link } from '@tanstack/react-router';

import { BrandLogo } from '@/components/brand-logo';
import { cn } from '@/lib/utils';

import { useAuthTranslation } from '../i18n';

export type AuthVariant = 'signin' | 'register';

// A weight plate drawn in outline — rim, inner ring, the hub and "LIFT4ME · 20 KG"
// lettered around the face. Decorative; clipped by the panel's edges.
function WeightPlate({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 440 440"
      fill="none"
      className={cn('pointer-events-none absolute text-[#7fa6ff]', className)}
    >
      <defs>
        <path
          id="plate-lettering"
          d="M220 220 m-168 0 a168 168 0 1 1 336 0 a168 168 0 1 1 -336 0"
        />
      </defs>
      <g stroke="currentColor">
        <circle cx="220" cy="220" r="214" strokeWidth="3" strokeOpacity="0.45" />
        <circle cx="220" cy="220" r="194" strokeWidth="1.5" strokeOpacity="0.3" />
        <circle cx="220" cy="220" r="140" strokeWidth="1.5" strokeOpacity="0.25" />
        <circle cx="220" cy="220" r="62" strokeWidth="3" strokeOpacity="0.45" />
        <circle cx="220" cy="220" r="26" strokeWidth="2" strokeOpacity="0.35" />
      </g>
      <text
        fill="currentColor"
        fillOpacity="0.4"
        fontSize="17"
        fontWeight="800"
        letterSpacing="7"
        fontFamily="Geist Variable, sans-serif"
      >
        <textPath href="#plate-lettering" startOffset="8%">
          LIFT4ME · 20 KG · LIFT4ME · 20 KG
        </textPath>
      </text>
    </svg>
  );
}

// The ink brand panel of the auth screens (left column from 800px, a compact top band
// below it): the white Lift4Me logo, the headline with its accent in light cobalt, a
// lead and — with room — the register steps. From 800px an outlined weight plate bleeds
// off the bottom-right corner; the phone band stays plain.
export function AuthBrandPanel({ variant }: { variant: AuthVariant }) {
  const t = useAuthTranslation();
  const copy = t.panel[variant];

  return (
    <section className="relative flex flex-1 flex-col overflow-hidden bg-[#14181f] px-6 pt-[max(2rem,env(safe-area-inset-top))] pb-20 text-white min-[800px]:min-h-dvh min-[800px]:px-12 min-[800px]:py-10 xl:px-20">
      <WeightPlate className="hidden min-[800px]:-right-40 min-[800px]:-bottom-40 min-[800px]:block min-[800px]:size-[560px] 2xl:size-[680px]" />

      <Link to="/" aria-label={t.backHome} className="relative w-fit">
        <BrandLogo className="h-8 text-white [--logo-knockout:#14181f] [--primary:#7fa6ff]" />
      </Link>

      <div className="relative mt-auto max-w-[520px] pt-8 min-[800px]:my-auto min-[800px]:pt-0">
        <h2 className="font-heading text-[30px] leading-[1.04] font-extrabold tracking-[-0.035em] text-balance min-[800px]:text-[clamp(38px,3.4vw,56px)]">
          {copy.title} <span className="text-[#7fa6ff]">{copy.accent}</span>
        </h2>
        <p className="mt-4 max-w-[440px] text-[14px] leading-relaxed text-[#b8bfcc] min-[800px]:mt-5 min-[800px]:text-base">
          {copy.lead}
        </p>
        {'steps' in copy && (
          <ol className="mt-8 hidden gap-5 min-[800px]:grid min-[800px]:grid-cols-3">
            {copy.steps.map((step, i) => (
              <li key={step} className="border-t border-[#2d3546] pt-3">
                <span className="font-heading text-xl font-extrabold text-[#7fa6ff]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="mt-1 text-[13.5px] leading-snug text-[#c7ccd6]">{step}</p>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
