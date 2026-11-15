import { apiFetch } from '@/lib/api-client';

import type { WorkoutHistoryPage, WorkoutSessionDetail } from '@gym-bro/shared';

import type { StatsRange } from './stats';

const PAGE = 100;
const PARALLEL = 6;

// Every strength session in the window with its full set graph, for the exports.
// Pages through GET /api/workout-sessions (date-filtered on the server), then loads
// each strength session's detail a few at a time.
export async function getSessionsForExport(range?: StatsRange): Promise<WorkoutSessionDetail[]> {
  const ids: string[] = [];
  for (let offset = 0; ; offset += PAGE) {
    const params = new URLSearchParams({ limit: String(PAGE), offset: String(offset) });
    if (range?.from) params.set('from', range.from);
    if (range?.to) params.set('to', range.to);
    const page = await apiFetch<WorkoutHistoryPage>(`/api/workout-sessions?${params.toString()}`);
    for (const item of page.items) if (item.sessionType === 'strength') ids.push(item.id);
    if (offset + PAGE >= page.total) break;
  }

  const details: WorkoutSessionDetail[] = [];
  for (let i = 0; i < ids.length; i += PARALLEL) {
    const batch = ids.slice(i, i + PARALLEL);
    details.push(
      ...(await Promise.all(
        batch.map((id) => apiFetch<WorkoutSessionDetail>(`/api/workout-sessions/${id}`)),
      )),
    );
  }
  return details;
}
