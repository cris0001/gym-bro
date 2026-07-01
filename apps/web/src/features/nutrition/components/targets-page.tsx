import { useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import type { NutritionTarget } from '@gym-bro/shared';

import { useCurrentTarget } from '../hooks/use-current-target';
import { TargetsForm } from './targets-form';
import { TargetsHistory } from './targets-history';

// Targets settings: set the current daily target or back-fill/edit a dated entry,
// and review the history of past targets. Editing state is owned here and shared by
// the form (seeds it) and the history (its edit buttons set it).
export function TargetsPage() {
  const { data: current, isPending } = useCurrentTarget();
  const [editing, setEditing] = useState<NutritionTarget | null>(null);

  return (
    <div className="mx-auto lg:col-span-3 flex w-full max-w-5xl flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">Targets</h1>

      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <Card>
          <CardHeader>
            <CardTitle>{editing ? 'Edit target' : 'Daily target'}</CardTitle>
          </CardHeader>
          <CardContent>
            {isPending ? (
              <p className="text-muted-foreground text-sm">Loading…</p>
            ) : (
              <TargetsForm
                key={editing?.id ?? current?.id ?? 'none'}
                current={current ?? null}
                editing={editing}
                onDone={() => setEditing(null)}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>History</CardTitle>
          </CardHeader>
          <CardContent>
            <TargetsHistory onEdit={setEditing} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
