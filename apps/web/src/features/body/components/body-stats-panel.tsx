import type { BodyMeasurement } from '@gym-bro/shared';

// Weight summary derived from the entries (newest first). Null when no weight has
// been logged — the trend chart already shows the empty state, so the panel just
// hides.
function weightStats(entries: BodyMeasurement[]) {
  const values = entries.filter((e) => e.weightKg !== null).map((e) => e.weightKg!);
  if (values.length === 0) return null;
  const latest = values[0]!;
  const previous = values[1];
  return {
    latest,
    sinceLast: previous === undefined ? null : latest - previous,
    min: Math.min(...values),
    max: Math.max(...values),
  };
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="text-lg font-semibold">{value}</span>
    </div>
  );
}

// Compact weight stats: latest, change since the previous entry, and the
// all-time low/high.
export function BodyStatsPanel({ entries }: { entries: BodyMeasurement[] }) {
  const stats = weightStats(entries);
  if (!stats) return null;

  const sinceLast =
    stats.sinceLast === null
      ? '—'
      : `${stats.sinceLast > 0 ? '+' : ''}${stats.sinceLast.toFixed(1)} kg`;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Stat label="Latest" value={`${stats.latest} kg`} />
      <Stat label="Since last" value={sinceLast} />
      <Stat label="Lowest" value={`${stats.min} kg`} />
      <Stat label="Highest" value={`${stats.max} kg`} />
    </div>
  );
}
