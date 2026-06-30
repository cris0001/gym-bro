import { Link } from '@tanstack/react-router';
import { Scale } from 'lucide-react';

import { useBodyMeasurements } from '@/features/body';

// Latest logged weight and its change since the previous measurement, or a prompt
// to log one.
export function LatestWeightCard() {
  const { data: entries = [] } = useBodyMeasurements();

  const weights = entries
    .filter((entry) => entry.weightKg !== null)
    .map((entry) => entry.weightKg!);
  const latest = weights[0] ?? null;
  const previous = weights[1] ?? null;
  const delta = latest !== null && previous !== null ? latest - previous : null;

  return (
    <div className="bg-card flex flex-col gap-2 rounded-xl border p-4">
      <div className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
        <Scale className="text-primary size-5" />
        Weight
      </div>
      {latest !== null ? (
        <>
          <span className="text-3xl font-bold">
            {latest}
            <span className="text-muted-foreground text-base font-normal"> kg</span>
          </span>
          <span className="text-muted-foreground text-xs">
            {delta !== null
              ? `${delta > 0 ? '+' : ''}${delta.toFixed(1)} kg since last`
              : 'First entry'}
          </span>
        </>
      ) : (
        <Link to="/body" className="text-primary text-sm underline">
          Log your weight
        </Link>
      )}
    </div>
  );
}
