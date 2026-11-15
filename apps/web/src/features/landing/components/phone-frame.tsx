import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

// A phone around an app screenshot (390×844 captures): dark bezel, rounded screen,
// a soft drop shadow. Size it with a width class; the screen keeps the 390:844 shape.
export function PhoneFrame({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        'rounded-[26px] bg-[#0f1420] p-[7px] shadow-[0_40px_80px_-36px_rgba(20,24,31,0.55)]',
        className,
      )}
    >
      <div className="relative aspect-[390/844] overflow-hidden rounded-[19px] bg-[#fafbfc]">
        {children}
      </div>
    </div>
  );
}
