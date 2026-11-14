import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

// A phone around an app screenshot (390×844 captures): dark bezel, rounded screen,
// a soft drop shadow. Size it with a width class; the screen keeps the 390:844 shape.
// `inset` adds a thin status-bar strip (app-background colour) for screenshots that
// open with a section-tab strip, so the tabs clear the rounded corners.
export function PhoneFrame({
  className,
  inset = false,
  children,
}: {
  className?: string;
  inset?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        'rounded-[26px] bg-[#0f1420] p-[7px] shadow-[0_40px_80px_-36px_rgba(20,24,31,0.55)]',
        className,
      )}
    >
      <div
        className={cn(
          'relative aspect-[390/844] overflow-hidden rounded-[19px] bg-[#fafbfc]',
          inset && 'pt-3',
        )}
      >
        {children}
      </div>
    </div>
  );
}
