import { Link } from '@tanstack/react-router';
import { ArrowLeft, BicepsFlexed } from 'lucide-react';
import type { ReactNode } from 'react';

import { useForceLightTheme } from '@/hooks/use-force-light-theme';
import { cn } from '@/lib/utils';

import { useAuthTranslation } from '../i18n';

type AuthVariant = 'signin' | 'register';

// The dark panel logo lockup — reused desktop (left column) and mobile (top band).
function BrandLogo() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="flex size-9 items-center justify-center rounded-[11px] bg-[#8d4a5e] text-[#fdf6f5]">
        <BicepsFlexed className="size-5" />
      </span>
      <span className="font-heading text-xl font-semibold text-[#f0e7ea]">Gym Bro</span>
    </span>
  );
}

// Concentric "plate" rings. Two of them are scattered across the dark panel (one
// bleeding out of each corner) and clipped by the panel's overflow-hidden.
function PlateRings({ className, opacity = 0.12 }: { className: string; opacity?: number }) {
  return (
    <svg
      aria-hidden
      className={cn('pointer-events-none absolute', className)}
      viewBox="0 0 440 440"
      fill="none"
    >
      <g stroke="#c98fa0" strokeOpacity={opacity}>
        {[70, 130, 190, 220].map((r) => (
          <circle key={r} cx="220" cy="220" r={r} />
        ))}
      </g>
    </svg>
  );
}

// Type scales up again from 1200px, where the split panel is wide enough that the
// base sizes read as small.
const HEADER =
  'font-heading leading-[1.12] font-medium text-[#f0e7ea] text-[29px] min-[800px]:text-[clamp(34px,2.8vw,50px)] min-[1200px]:text-[clamp(42px,3.3vw,58px)]';
const LEAD =
  'mt-4 text-[13.5px] leading-relaxed text-[#cfc2c8] min-[800px]:mt-5 min-[800px]:text-[14px] min-[1200px]:mt-6 min-[1200px]:text-[16px]';

// The motivational header with a short supporting line, plus the numbered steps on
// register (desktop-only, where there's room).
function BrandContent({ variant }: { variant: AuthVariant }) {
  if (variant === 'register') {
    return (
      <>
        <h2 className={HEADER}>
          Three months from now you&apos;ll wish you started{' '}
          <em className="text-[#d9a441]">today.</em>
        </h2>
        <p className={LEAD}>Plans, sessions, meals and measurements — tracked in one place.</p>
        <ol className="mt-8 hidden flex-col gap-4 min-[800px]:flex min-[1200px]:gap-5">
          {[
            'Create an account — takes 30 seconds',
            'Pick a plan or build your own',
            'Log your first session tonight',
          ].map((step, i) => (
            <li key={i} className="flex items-center gap-3 min-[1200px]:gap-4">
              <span className="font-heading flex size-[26px] shrink-0 items-center justify-center rounded-full bg-[#8d4a5e] text-[13px] font-semibold text-[#fdf6f5] min-[1200px]:size-[30px] min-[1200px]:text-[14px]">
                {i + 1}
              </span>
              <span className="text-[13.5px] text-[#cfc2c8] min-[1200px]:text-[15.5px]">
                {step}
              </span>
            </li>
          ))}
        </ol>
      </>
    );
  }
  return (
    <>
      <h2 className={HEADER}>
        The bar doesn&apos;t care about your mood.{' '}
        <em className="text-[#d9a441]">Show up anyway.</em>
      </h2>
      <p className={LEAD}>Your lifts, your macros, your measurements — one log, every session.</p>
    </>
  );
}

const QUOTES: Record<AuthVariant, string> = {
  signin: 'Discipline is just remembering what you want.',
  register: "The only bad workout is the one you didn't log.",
};

interface AuthShellProps {
  variant: AuthVariant;
  children: ReactNode;
}

// The split auth layout: a dark brand panel (left column from 800px, a top band below
// that) and the form column with its title, subtitle, the form, and the sign-in /
// register switch footer. Inside the panel the logo and the closing quote always sit
// on the section's left edge; only the headline block is width-capped, so it never
// drifts to the middle on wide screens.
export function AuthShell({ variant, children }: AuthShellProps) {
  const t = useAuthTranslation();
  // Sign-in and register are designed light-only, whatever theme the app is set to.
  useForceLightTheme();
  const copy = variant === 'signin' ? t.login : t.register;

  return (
    <main className="flex min-h-dvh flex-col bg-[#2b2126] min-[800px]:grid min-[800px]:grid-cols-[1fr_380px] min-[800px]:bg-[#f6f3f0] lg:grid-cols-[1fr_440px] xl:grid-cols-[1fr_460px] 3xl:grid-cols-[1fr_620px] 4xl:grid-cols-[1fr_660px]">
      {/* Brand panel — a top band below 800px, the left column above it. On phones the
          form card keeps its natural height and the band only fills what's left above
          it (flex-1), so the whole form is on screen without scrolling. Left padding
          grows with the viewport so the copy is never glued to the edge, but it stays
          left-aligned rather than centering on wide screens. */}
      <section className="relative flex flex-1 flex-col overflow-hidden bg-[#2b2126] px-6 pt-[max(2.5rem,env(safe-area-inset-top))] pb-[88px] min-[800px]:min-h-dvh min-[800px]:px-10 min-[800px]:py-10 lg:px-14 xl:px-20 2xl:px-24 4xl:px-28">
        <PlateRings className="right-0 bottom-0 h-[320px] w-[320px] translate-x-1/4 translate-y-1/4 min-[800px]:h-[460px] min-[800px]:w-[460px] 2xl:h-[560px] 2xl:w-[560px]" />
        <PlateRings
          className="-top-24 -left-28 hidden h-[260px] w-[260px] min-[800px]:block 2xl:h-[320px] 2xl:w-[320px]"
          opacity={0.08}
        />

        <div className="relative">
          <Link to="/" aria-label={t.backHome} className="inline-flex w-fit">
            <BrandLogo />
          </Link>
        </div>

        <div className="relative mt-auto mb-2 max-w-[440px] pt-6 min-[800px]:mt-0 min-[800px]:mb-0 min-[800px]:flex min-[800px]:pb-16 min-[800px]:max-w-[360px] min-[800px]:flex-1 min-[800px]:flex-col min-[800px]:justify-center min-[800px]:pt-0 xl:ml-[6%] xl:max-w-[420px] 2xl:ml-[9%] 2xl:max-w-[480px] 4xl:max-w-[560px]">
          <BrandContent variant={variant} />
        </div>

        <p className="font-heading relative hidden text-sm text-[#94858b] italic min-[800px]:block min-[1200px]:text-[15.5px]">
          &quot;{QUOTES[variant]}&quot;
        </p>
      </section>

      {/* Form column — a light section overlapping the band below 800px, a plain
          column above it. */}
      <section className="relative -mt-16 shrink-0 rounded-t-3xl bg-[#f6f3f0] px-6 pt-7 pb-[max(2rem,env(safe-area-inset-bottom))] min-[800px]:mt-0 min-[800px]:flex min-[800px]:items-center min-[800px]:rounded-none min-[800px]:px-8 min-[800px]:pt-10 lg:px-10">
        <div className="mx-auto w-full max-w-[330px] min-[800px]:max-w-[300px] lg:max-w-[320px] xl:max-w-[330px] 3xl:max-w-[350px] 4xl:max-w-[370px]">
          <Link
            to="/"
            className="mb-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#94858b] transition-colors hover:text-[#8d4a5e]"
          >
            <ArrowLeft className="size-4" />
            {t.backHome}
          </Link>
          <h1 className="font-heading text-[28px] leading-tight font-semibold text-[#2b2126] min-[1200px]:text-[30px] 4xl:text-[32px]">
            {copy.title}
          </h1>
          <p className="mt-1 text-[13.5px] text-[#94858b] min-[1200px]:text-[14.5px]">
            {copy.subtitle}
          </p>

          <div className="mt-6">{children}</div>

          <p className="mt-6 text-center text-sm text-[#5f5257]">
            {variant === 'signin' ? (
              <>
                {t.login.noAccount}{' '}
                <Link to="/register" className="font-semibold text-[#8d4a5e] hover:underline">
                  {t.login.createOne}
                </Link>
              </>
            ) : (
              <>
                {t.register.haveAccount}{' '}
                <Link to="/login" className="font-semibold text-[#8d4a5e] hover:underline">
                  {t.register.signIn}
                </Link>
              </>
            )}
          </p>
        </div>
      </section>
    </main>
  );
}
