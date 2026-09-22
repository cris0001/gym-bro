import { Link } from '@tanstack/react-router';
import { BicepsFlexed } from 'lucide-react';
import type { ReactNode } from 'react';

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

// Concentric "plate" rings bleeding out of the bottom-right corner of the dark panel.
function PlateRings() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute right-0 bottom-0 h-[440px] w-[440px] translate-x-1/4 translate-y-1/4"
      viewBox="0 0 440 440"
      fill="none"
    >
      <g stroke="#c98fa0" strokeOpacity="0.12">
        {[70, 130, 190, 220].map((r) => (
          <circle key={r} cx="220" cy="220" r={r} />
        ))}
      </g>
    </svg>
  );
}

// The motivational header + (desktop-only) steps, per page. Sign-in has no list
// (removed); register keeps its three numbered steps. The quote sits at the bottom
// on desktop.
function BrandContent({ variant }: { variant: AuthVariant }) {
  if (variant === 'register') {
    return (
      <>
        <h2 className="font-heading text-[29px] leading-[1.12] font-medium text-[#f0e7ea] md:text-[44px]">
          Three months from now you&apos;ll wish you started{' '}
          <em className="text-[#d9a441]">today.</em>
        </h2>
        <ol className="mt-8 hidden flex-col gap-4 md:flex">
          {[
            'Create an account — takes 30 seconds',
            'Pick a plan or build your own',
            'Log your first session tonight',
          ].map((step, i) => (
            <li key={i} className="flex items-center gap-3">
              <span className="font-heading flex size-[26px] shrink-0 items-center justify-center rounded-full bg-[#8d4a5e] text-[13px] font-semibold text-[#fdf6f5]">
                {i + 1}
              </span>
              <span className="text-[13.5px] text-[#cfc2c8]">{step}</span>
            </li>
          ))}
        </ol>
      </>
    );
  }
  return (
    <h2 className="font-heading text-[29px] leading-[1.12] font-medium text-[#f0e7ea] md:text-[44px]">
      The bar doesn&apos;t care about your mood. <em className="text-[#d9a441]">Show up anyway.</em>
    </h2>
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

// The split auth layout: a dark brand panel (left on desktop, a top band on mobile
// that the form card overlaps) and the form column with its title, subtitle, the
// form itself, and the sign-in/register switch footer.
export function AuthShell({ variant, children }: AuthShellProps) {
  const t = useAuthTranslation();
  const copy = variant === 'signin' ? t.login : t.register;

  return (
    <main className="min-h-dvh bg-[#f6f3f0] md:grid md:grid-cols-[1fr_minmax(0,460px)]">
      {/* Brand panel */}
      <section className="relative flex min-h-[48dvh] flex-col overflow-hidden bg-[#2b2126] px-6 pt-14 pb-24 md:min-h-0 md:justify-between md:px-11 md:py-10">
        <PlateRings />
        <div className="relative">
          <BrandLogo />
        </div>
        <div className="relative mt-auto max-w-[560px] pt-10 md:mt-0 md:pt-0">
          <BrandContent variant={variant} />
        </div>
        <p className="font-heading relative mt-10 hidden text-sm text-[#94858b] italic md:mt-0 md:block">
          &quot;{QUOTES[variant]}&quot;
        </p>
      </section>

      {/* Form column */}
      <section className="relative -mt-16 rounded-t-3xl bg-[#f6f3f0] px-6 pt-8 pb-12 md:mt-0 md:flex md:items-center md:rounded-none md:px-10 md:pt-10">
        <div className="mx-auto w-full max-w-[330px]">
          <h1 className="font-heading text-[28px] leading-tight font-semibold text-[#2b2126]">
            {copy.title}
          </h1>
          <p className="mt-1 text-[13.5px] text-[#94858b]">{copy.subtitle}</p>

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
