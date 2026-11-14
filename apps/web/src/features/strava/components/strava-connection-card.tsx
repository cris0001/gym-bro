import { Zap } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { STRAVA_CONNECT_URL } from '../api/strava';

// Shown when Strava isn't connected: a "Connect Strava" link (a full-page OAuth
// navigation). Once connected, the import/disconnect controls live in the page header
// (StravaHeaderActions).
export function StravaConnectionCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'bg-card flex flex-col items-center gap-3 rounded-xl border p-6 text-center',
        className,
      )}
    >
      <span className="flex size-14 items-center justify-center rounded-xl bg-[#fbe3d4] text-[#d15b28] dark:bg-[#45291b] dark:text-[#ff7a3d]">
        <Zap className="size-7" />
      </span>
      <div>
        <p className="font-heading text-lg font-semibold">Connect Strava</p>
        <p className="text-muted-foreground text-sm">
          Link your Strava account to import your runs, rides, and other activities.
        </p>
      </div>
      <Button
        asChild
        className="h-9.5 rounded-full bg-[#d15b28] px-5 text-white hover:bg-[#d15b28]/90 dark:bg-[#ff7a3d]"
      >
        <a href={STRAVA_CONNECT_URL}>Connect Strava</a>
      </Button>
    </div>
  );
}
