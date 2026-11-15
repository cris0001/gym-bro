import { Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';

import { useForceLightTheme } from '@/hooks/use-force-light-theme';

import { useAuthTranslation } from '../i18n';
import { AuthBrandPanel, type AuthVariant } from './auth-brand-panel';

interface AuthShellProps {
  variant: AuthVariant;
  children: ReactNode;
}

// The split auth layout in the Lift4Me brand: the ink brand panel (left column from
// 800px, a top band below that) and the chalk form column with a back link, the title,
// subtitle, the form and the sign-in / register switch.
export function AuthShell({ variant, children }: AuthShellProps) {
  const t = useAuthTranslation();
  // Light-only, on the slate palette so --primary (buttons, focus) is the brand cobalt.
  useForceLightTheme('slate');
  const copy = variant === 'signin' ? t.login : t.register;
  const link = 'font-semibold text-[#023e8a] hover:underline';

  return (
    <main className="flex min-h-dvh flex-col bg-[#14181f] min-[800px]:grid min-[800px]:grid-cols-[1fr_420px] min-[800px]:bg-[#f7f6f2] lg:grid-cols-[1fr_480px] 2xl:grid-cols-[1fr_560px]">
      <AuthBrandPanel variant={variant} />

      {/* Form column — a chalk sheet overlapping the band below 800px, a plain column
          above it. */}
      <section className="relative -mt-12 shrink-0 rounded-t-3xl bg-[#f7f6f2] px-6 pt-8 pb-[max(2rem,env(safe-area-inset-bottom))] text-[#14181f] min-[800px]:mt-0 min-[800px]:flex min-[800px]:items-center min-[800px]:rounded-none min-[800px]:px-10">
        <div className="mx-auto w-full max-w-[340px]">
          <Link
            to="/"
            className="mb-6 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#5b6170] transition-colors hover:text-[#023e8a]"
          >
            <ArrowLeft className="size-4" />
            {t.backHome}
          </Link>
          <h1 className="font-heading text-[30px] leading-tight font-extrabold tracking-[-0.03em]">
            {copy.title}
          </h1>
          <p className="mt-1 text-[14px] text-[#5b6170]">{copy.subtitle}</p>

          <div className="mt-7">{children}</div>

          <p className="mt-6 text-center text-sm text-[#5b6170]">
            {variant === 'signin' ? (
              <>
                {t.login.noAccount}{' '}
                <Link to="/register" className={link}>
                  {t.login.createOne}
                </Link>
              </>
            ) : (
              <>
                {t.register.haveAccount}{' '}
                <Link to="/login" className={link}>
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
