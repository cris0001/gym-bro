import { Ellipsis, RotateCw } from 'lucide-react';

import type { StravaConnectionStatus } from '@gym-bro/shared';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useConfirm } from '@/stores/confirm.store';

import { useDisconnectStrava } from '../hooks/use-disconnect-strava';
import { useImportStrava } from '../hooks/use-import-strava';
import { StravaSyncStatus } from './strava-sync-status';

// Connected-state controls in the page header (replacing the old side panel): the
// sync status, an orange Import, and a "⋯" popover with the athlete link + Disconnect.
// The status line sits beside the buttons from sm up (the page shows it under the
// title on phones).
export function StravaHeaderActions({ status }: { status: StravaConnectionStatus }) {
  const importActivities = useImportStrava();
  const disconnect = useDisconnectStrava();
  const confirm = useConfirm();

  async function onDisconnect() {
    const ok = await confirm({
      title: 'Disconnect Strava?',
      description: 'Imported activities stay; new ones won’t sync until you reconnect.',
      confirmText: 'Disconnect',
      destructive: true,
    });
    if (ok) disconnect.mutate();
  }

  return (
    <div className="flex shrink-0 items-center gap-2 sm:gap-3">
      <span className="hidden sm:inline">
        <StravaSyncStatus status={status} />
      </span>
      <Button
        type="button"
        className="h-9.5 rounded-full bg-[#d15b28] px-4 text-white hover:bg-[#d15b28]/90 sm:px-5 dark:bg-[#ff7a3d] dark:text-[#1f0f07]"
        disabled={importActivities.isPending}
        onClick={() => importActivities.mutate()}
      >
        <RotateCw className={importActivities.isPending ? 'size-4 animate-spin' : 'size-4'} />
        {importActivities.isPending ? 'Importing…' : 'Import'}
      </Button>
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Strava connection"
            className="border-border text-muted-foreground hover:bg-muted flex size-9.5 items-center justify-center rounded-full border transition-colors"
          >
            <Ellipsis className="size-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="flex w-60 flex-col gap-2">
          {status.athleteId ? (
            <p className="text-muted-foreground text-sm">
              Connected as{' '}
              <a
                href={`https://www.strava.com/athletes/${status.athleteId}`}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-[#d15b28] underline underline-offset-2 dark:text-[#ff7a3d]"
              >
                {status.athleteName ?? `athlete #${status.athleteId}`}
              </a>
            </p>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            className="text-destructive hover:bg-destructive-tint hover:text-destructive h-9 justify-start rounded-md px-2"
            disabled={disconnect.isPending}
            onClick={() => void onDisconnect()}
          >
            Disconnect Strava
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  );
}
