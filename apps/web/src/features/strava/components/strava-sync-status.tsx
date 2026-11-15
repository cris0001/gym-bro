import { formatDistanceToNow, parseISO } from 'date-fns';

import type { StravaConnectionStatus } from '@gym-bro/shared';
import { useStravaTranslation } from '../i18n';

// 'Connected · synced 2 hours ago' with a green dot, for the Strava page header.
export function StravaSyncStatus({ status }: { status: StravaConnectionStatus }) {
  const t = useStravaTranslation();
  return (
    <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
      <span className="size-2 rounded-full bg-[#4a9d5b]" />
      {t.sync.connected}
      {status.lastSyncAt && ` · ${t.sync.synced(formatDistanceToNow(parseISO(status.lastSyncAt)))}`}
    </span>
  );
}
