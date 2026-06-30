import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { useBodyMeasurements } from '../hooks/use-body-measurements';
import { useBodyUiStore } from '../stores/body-ui.store';
import { BodyMeasurementForm } from './body-measurement-form';
import { MeasurementList } from './measurement-list';

// The body-measurements page: a prominent quick-add/edit form card on top, then
// the measurement history. Charts land in the next slice. Mobile-first single
// column.
export function BodyPage() {
  const { data } = useBodyMeasurements();
  const editing = useBodyUiStore((s) => s.editing);
  const entries = data ?? [];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">Body</h1>

      <Card>
        <CardHeader>
          <CardTitle>{editing ? 'Edit measurement' : 'Add measurement'}</CardTitle>
        </CardHeader>
        <CardContent>
          <BodyMeasurementForm />
        </CardContent>
      </Card>

      <section className="flex flex-col gap-1">
        <h2 className="font-semibold">History</h2>
        <MeasurementList entries={entries} />
      </section>
    </div>
  );
}
