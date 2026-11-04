import { onlineManager } from '@tanstack/react-query';
import { WifiOff } from 'lucide-react';
import { useSyncExternalStore } from 'react';

import { useTranslation } from '@/lib/i18n/use-translation';

// A slim strip shown while the device is offline. It reads TanStack Query's own
// onlineManager — the same signal that pauses queries, mutations and pending retries
// until the connection returns — so the banner and the app's behaviour never disagree.
export function OfflineBanner() {
  const { t } = useTranslation();
  const online = useSyncExternalStore(
    (onChange) => onlineManager.subscribe(onChange),
    () => onlineManager.isOnline(),
  );
  if (online) return null;

  return (
    <div
      role="status"
      className="bg-foreground text-background flex items-center justify-center gap-2 px-4 py-1.5 text-center text-[12.5px] font-medium"
    >
      <WifiOff className="size-3.5 shrink-0" />
      {t.network.offline}
    </div>
  );
}
