import type { WorkoutSessionDetail } from '@gym-bro/shared';

// One logged set, flattened for the CSV.
export interface ExportSetRow {
  date: string;
  session: string;
  exercise: string;
  category: string;
  setNumber: number;
  weight: number | null;
  reps: number | null;
  rir: number | null;
  isTopSet: boolean;
}

// One session of an exercise: the headline weight (top set, else the heaviest set —
// null when every set was bodyweight), the reps done at it (for bodyweight-only work,
// the session's best reps), and the session volume.
export interface ExercisePoint {
  date: string;
  weight: number | null;
  reps: number | null;
  volume: number;
}

export interface ExerciseSummary {
  name: string;
  category: string;
  sessions: number;
  sets: number;
  volume: number;
  best: { weight: number; reps: number | null; date: string } | null;
  // First → last headline weight in the window (null without two weighted sessions).
  change: number | null;
  points: ExercisePoint[];
}

export interface ExportModel {
  from: string | null;
  to: string | null;
  workouts: number;
  sets: number;
  volume: number;
  avgDuration: number | null;
  avgRating: number | null;
  rows: ExportSetRow[];
  exercises: ExerciseSummary[];
}

const round1 = (n: number) => Math.round(n * 10) / 10;
const mean = (xs: number[]) =>
  xs.length ? round1(xs.reduce((a, b) => a + b, 0) / xs.length) : null;

// Builds the export data from strength sessions in the chosen window. Exercises that
// weren't done in the window simply don't appear (they have no sets in it); empty
// performances are skipped. Exercises are keyed by what was actually done (swaps
// count for the replacement), most-trained first (ties: heavier volume first, so the
// main lifts lead and bodyweight work trails).
export function buildExportModel(
  sessions: WorkoutSessionDetail[],
  range: { from?: string; to?: string } = {},
): ExportModel {
  const ordered = [...sessions]
    .filter((s) => s.sessionType === 'strength')
    .sort((a, b) => a.performedDate.localeCompare(b.performedDate));

  const rows: ExportSetRow[] = [];
  const byExercise = new Map<string, ExerciseSummary>();

  for (const session of ordered) {
    for (const perf of session.performances) {
      if (perf.sets.length === 0) continue;
      const sets = [...perf.sets].sort((a, b) => a.position - b.position);
      sets.forEach((set, i) =>
        rows.push({
          date: session.performedDate,
          session: session.name,
          exercise: perf.exercise.name,
          category: perf.exercise.category,
          setNumber: i + 1,
          weight: set.weight,
          reps: set.reps,
          rir: set.rir,
          isTopSet: set.isTopSet,
        }),
      );

      const weighted = sets.filter((s) => s.weight !== null);
      const top = weighted.find((s) => s.isTopSet);
      const heaviest = weighted.reduce<(typeof sets)[number] | null>(
        (best, s) => (best === null || (s.weight ?? 0) > (best.weight ?? 0) ? s : best),
        null,
      );
      const headline = top ?? heaviest;
      const repCounts = sets.map((s) => s.reps).filter((r): r is number => r !== null);
      const maxReps = repCounts.length ? Math.max(...repCounts) : null;
      const volume = sets.reduce((sum, s) => sum + (s.weight ?? 0) * (s.reps ?? 0), 0);

      const summary = byExercise.get(perf.exercise.id) ?? {
        name: perf.exercise.name,
        category: perf.exercise.category,
        sessions: 0,
        sets: 0,
        volume: 0,
        best: null,
        change: null,
        points: [],
      };
      summary.sessions += 1;
      summary.sets += sets.length;
      summary.volume += volume;
      summary.points.push({
        date: session.performedDate,
        weight: headline?.weight ?? null,
        // Bodyweight-only sessions have no headline set: keep the best reps instead.
        reps: headline ? headline.reps : maxReps,
        volume,
      });
      if (
        heaviest?.weight != null &&
        (summary.best === null || heaviest.weight > summary.best.weight)
      ) {
        summary.best = {
          weight: heaviest.weight,
          reps: heaviest.reps,
          date: session.performedDate,
        };
      }
      byExercise.set(perf.exercise.id, summary);
    }
  }

  const exercises = [...byExercise.values()]
    .map((ex) => {
      const weights = ex.points.map((p) => p.weight).filter((w): w is number => w !== null);
      const change =
        weights.length >= 2 ? round1(weights[weights.length - 1]! - weights[0]!) : null;
      return { ...ex, volume: Math.round(ex.volume), change };
    })
    .sort((a, b) => b.sessions - a.sessions || b.volume - a.volume || a.name.localeCompare(b.name));

  const durations = ordered.map((s) => s.durationMinutes).filter((d): d is number => d !== null);
  const ratings = ordered.map((s) => s.rating).filter((r): r is number => r !== null);

  return {
    from: range.from ?? ordered[0]?.performedDate ?? null,
    to: range.to ?? ordered[ordered.length - 1]?.performedDate ?? null,
    workouts: ordered.length,
    sets: rows.length,
    volume: Math.round(exercises.reduce((sum, e) => sum + e.volume, 0)),
    avgDuration: mean(durations),
    avgRating: mean(ratings),
    rows,
    exercises,
  };
}
