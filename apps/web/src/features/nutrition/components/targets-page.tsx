import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { useCurrentTarget } from '../hooks/use-current-target';
import { TargetsForm } from './targets-form';
import { TargetsHistory } from './targets-history';

// Targets settings: edit the current daily target (each save is a new dated entry)
// and review the history of past targets.
export function TargetsPage() {
  const { data: current, isPending } = useCurrentTarget();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">Targets</h1>

      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <Card>
          <CardHeader>
            <CardTitle>Daily target</CardTitle>
          </CardHeader>
          <CardContent>
            {isPending ? (
              <p className="text-muted-foreground text-sm">Loading…</p>
            ) : (
              <TargetsForm key={current?.id ?? 'none'} current={current ?? null} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>History</CardTitle>
          </CardHeader>
          <CardContent>
            <TargetsHistory />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
