import { format, parseISO } from 'date-fns';

import { useTargets } from '../hooks/use-targets';
import { MacrosSummary } from './macros-summary';

// Past targets, newest first (the API returns them oldest-first for charting).
export function TargetsHistory() {
  const { data: targets = [], isPending } = useTargets();

  if (isPending) {
    return <p className="text-muted-foreground text-sm">Loading…</p>;
  }
  if (targets.length === 0) {
    return <p className="text-muted-foreground text-sm">No target history yet.</p>;
  }

  const ordered = [...targets].reverse();

  return (
    <ul className="divide-y">
      {ordered.map((target) => (
        <li key={target.id} className="flex items-center justify-between gap-3 py-3">
          <p className="text-sm font-medium">{format(parseISO(target.effectiveDate), 'PP')}</p>
          <MacrosSummary macros={target} />
        </li>
      ))}
    </ul>
  );
}
