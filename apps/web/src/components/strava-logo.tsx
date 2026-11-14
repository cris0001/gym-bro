import { cn } from '@/lib/utils';

// Strava's "peaks" mark, used to label the Strava integration (nav entry, dashboard
// card) as Strava's brand guidelines ask of API apps. Paints with currentColor so it
// takes the surrounding brand orange, or white on an active orange fill. Shaped like a
// lucide icon (className only) so it can sit in the nav config's `icon` slot.
export function StravaLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn('size-4 shrink-0', className)}
      role="img"
      aria-label="Strava"
    >
      <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
    </svg>
  );
}
