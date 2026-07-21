import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import { toast } from 'sonner';

import { StravaPage } from '@/features/strava';

// Search params: `connected`/`error` are set by the OAuth callback redirect; `activity`
// is a deep-link from the calendar to open a specific activity.
interface StravaSearch {
  connected?: boolean | undefined;
  error?: boolean | undefined;
  activity?: string | undefined;
}

export const Route = createFileRoute('/_app/strava')({
  validateSearch: (search: Record<string, unknown>): StravaSearch => ({
    connected: search.connected === '1' || search.connected === true ? true : undefined,
    error: search.error === '1' || search.error === true ? true : undefined,
    activity: typeof search.activity === 'string' ? search.activity : undefined,
  }),
  component: StravaRoute,
});

function StravaRoute() {
  const { connected, error, activity } = Route.useSearch();
  const navigate = Route.useNavigate();

  // Toast the OAuth result once, then strip the flag from the URL so a refresh
  // doesn't re-toast.
  useEffect(() => {
    if (!connected && !error) return;
    if (connected) toast.success('Strava connected');
    if (error) toast.error('Could not connect to Strava');
    // Drop the OAuth flags from the URL (keep any activity deep-link).
    void navigate({ search: (prev) => ({ activity: prev.activity }), replace: true });
  }, [connected, error, navigate]);

  return <StravaPage initialActivityId={activity} />;
}
