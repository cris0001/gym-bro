import type { ExerciseProgressPoint } from '@gym-bro/shared';

// What progress is measured in: kg for anything that ever carried load (a bodyweight
// set then counts as 0 kg added, e.g. pull-ups going BW → +10), reps for exercises
// only ever done at bodyweight (pure pull-ups: 8 → 12 reps).
export type Mode = 'kg' | 'reps';

export function modeOf(allTime: ExerciseProgressPoint[]): Mode {
  return allTime.some((p) => p.topWeight !== null || p.normalWeight !== null) ? 'kg' : 'reps';
}

// One tier's plotted value; a tier that wasn't logged that session stays null so the
// line breaks there.
export function tierValue(weight: number | null, reps: number | null, mode: Mode): number | null {
  if (weight === null && reps === null) return null;
  return mode === 'kg' ? (weight ?? 0) : reps;
}

export function setLabel(weight: number | null, reps: number | null): string | null {
  if (weight === null && reps === null) return null;
  return `${weight === null ? 'BW' : `${weight} kg`}${reps !== null ? ` × ${reps}` : ''}`;
}

// A session's working set: its top set when one was marked, else its normal set.
const hasTop = (p: ExerciseProgressPoint) => p.topWeight !== null || p.topReps !== null;
const workingValue = (p: ExerciseProgressPoint, mode: Mode) =>
  hasTop(p)
    ? tierValue(p.topWeight, p.topReps, mode)
    : tierValue(p.normalWeight, p.normalReps, mode);
const workingReps = (p: ExerciseProgressPoint) => (hasTop(p) ? p.topReps : p.normalReps);

// Headline numbers over the chosen window, from each session's working set (raw
// weight, or reps for bodyweight-only exercises): the latest value, its change since
// the window's first session, and the all-time best.
export function headline(
  points: ExerciseProgressPoint[],
  allTime: ExerciseProgressPoint[],
  mode: Mode,
) {
  const inRange = points.filter((p) => workingValue(p, mode) !== null);
  const first = inRange[0];
  const last = inRange.at(-1);
  const best = allTime.reduce<ExerciseProgressPoint | null>((acc, p) => {
    const v = workingValue(p, mode);
    return v !== null && (acc === null || v > (workingValue(acc, mode) ?? 0)) ? p : acc;
  }, null);
  return {
    latestIsTop: last ? hasTop(last) : false,
    latest: last ? { value: workingValue(last, mode)!, reps: workingReps(last) } : null,
    change:
      first && last && first !== last
        ? workingValue(last, mode)! - workingValue(first, mode)!
        : null,
    best: best ? { value: workingValue(best, mode)!, date: best.date } : null,
  };
}

// The "Latest" figure: "100 kg × 5", "BW × 12" (0 kg added), or "12 reps".
export function latestText(latest: { value: number; reps: number | null }, mode: Mode) {
  if (mode === 'reps') return { value: `${latest.value}`, unit: ' reps' };
  const reps = latest.reps !== null ? ` × ${latest.reps}` : '';
  return latest.value === 0
    ? { value: 'BW', unit: reps }
    : { value: `${latest.value}`, unit: ` kg${reps}` };
}
