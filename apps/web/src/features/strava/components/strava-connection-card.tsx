import { format, parseISO } from 'date-fns';
import { RotateCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useConfirm } from '@/stores/confirm.store';

import type { StravaConnectionStatus } from '@gym-bro/shared';

import { STRAVA_CONNECT_URL } from '../api/strava';
import { useDisconnectStrava } from '../hooks/use-disconnect-strava';
import { useImportStrava } from '../hooks/use-import-strava';

// The connect/import/disconnect panel. Not connected → a "Connect Strava" link (a
// full-page OAuth navigation). Connected → import recent + disconnect, with the last
// sync time.
export function StravaConnectionCard({ status }: { status: StravaConnectionStatus }) {
  const importActivities = useImportStrava();
  const disconnect = useDisconnectStrava();
  const confirm = useConfirm();

  if (!status.connected) {
    return (
      <div className="bg-card flex flex-col items-start gap-3 rounded-xl border p-4">
        <div>
          <p className="font-medium">Connect Strava</p>
          <p className="text-muted-foreground text-sm">
            Link your Strava account to import your runs, rides, and other activities.
          </p>
        </div>
        <Button asChild className="h-11 bg-orange-600 text-white hover:bg-orange-600/90">
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
    <div className="bg-card flex flex-col gap-3 rounded-xl border p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="font-medium text-orange-600">Strava connected</p>
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
          className="h-11 flex-1 bg-orange-600 text-white hover:bg-orange-600/90"
          disabled={importActivities.isPending}
          onClick={() => importActivities.mutate()}
        >
          <RotateCw className={importActivities.isPending ? 'size-4 animate-spin' : 'size-4'} />
          {importActivities.isPending ? 'Importing…' : 'Import recent'}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="text-destructive h-11"
          disabled={disconnect.isPending}
          onClick={() => void onDisconnect()}
        >
          Disconnect
        </Button>
      </div>
    </div>
  );
}
