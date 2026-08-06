import { format, parseISO } from 'date-fns';
import { RotateCw, Zap } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useConfirm } from '@/stores/confirm.store';

import type { StravaConnectionStatus } from '@gym-bro/shared';

import { STRAVA_CONNECT_URL } from '../api/strava';
import { useDisconnectStrava } from '../hooks/use-disconnect-strava';
import { useImportStrava } from '../hooks/use-import-strava';

// The connect/import/disconnect panel. Not connected → a "Connect Strava" link (a
// full-page OAuth navigation). Connected → import recent + disconnect, with the last
// sync time.
export function StravaConnectionCard({
  status,
  className,
}: {
  status: StravaConnectionStatus;
  className?: string;
}) {
  const importActivities = useImportStrava();
  const disconnect = useDisconnectStrava();
  const confirm = useConfirm();

  if (!status.connected) {
    return (
      <div
        className={cn(
          'bg-card flex flex-col items-center gap-3 rounded-2xl border p-6 text-center',
          className,
        )}
      >
        <span className="flex size-14 items-center justify-center rounded-full bg-[#fbe3d4] text-[#d15b28]">
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
          className="h-11 rounded-full bg-[#d15b28] px-5 text-white hover:bg-[#d15b28]/90"
        >
          <a href={STRAVA_CONNECT_URL}>Connect Strava</a>
        </Button>
      </div>
    );
  }

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
    <div className={cn('bg-card flex flex-col gap-3 rounded-2xl border p-4', className)}>
      <div className="flex items-center gap-2">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#fbe3d4] text-[#d15b28]">
          <Zap className="size-4" />
        </span>
        <div>
          <p className="font-medium text-[#d15b28]">Strava connected</p>
          <p className="text-muted-foreground text-xs">
            {status.lastSyncAt
              ? `Last synced ${format(parseISO(status.lastSyncAt), 'PP p')}`
              : 'Not synced yet'}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          className="h-11 flex-1 rounded-full bg-[#d15b28] text-white hover:bg-[#d15b28]/90"
          disabled={importActivities.isPending}
          onClick={() => importActivities.mutate()}
        >
          <RotateCw className={importActivities.isPending ? 'size-4 animate-spin' : 'size-4'} />
          {importActivities.isPending ? 'Importing…' : 'Import recent'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="text-muted-foreground h-11 rounded-full px-4"
          disabled={disconnect.isPending}
          onClick={() => void onDisconnect()}
        >
          Disconnect
        </Button>
      </div>
    </div>
  );
}
