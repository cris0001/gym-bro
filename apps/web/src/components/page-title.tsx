import type { ReactNode } from 'react';
import { formatDate } from '@/lib/i18n/date-format';

// A page's h1 with today's date above it, matching the dashboard header so every
// section page opens the same way. `className` styles the h1 itself (each page keeps
// its own size); the date line is fixed.
export function PageTitle({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <p className="text-muted-foreground text-sm">{formatDate(new Date(), 'EEEE, MMMM d')}</p>
      <h1 className={className}>{children}</h1>
    </div>
  );
}
