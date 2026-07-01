import { movingAverage, type BodyMeasurement, type NutritionTarget } from '@gym-bro/shared';

// A plottable series: a body measurement or the target-calorie overlay. `axis`
// splits the two scales — measurements (kg/%/cm, order ~10–100) share the left
// axis; calories (~2000) get their own right axis so both read clearly.
export interface SeriesDef {
  key: string;
  label: string;
  unit: string;
  axis: 'left' | 'right';
  color: string;
  isCalories?: boolean;
}

// Measurement series, in display order. Weight first (the primary metric).
export const MEASURE_SERIES: SeriesDef[] = [
  { key: 'weightKg', label: 'Weight', unit: 'kg', axis: 'left', color: 'var(--chart-1)' },
  { key: 'bodyFatPct', label: 'Body fat', unit: '%', axis: 'left', color: 'var(--chart-3)' },
  { key: 'bicepsCm', label: 'Biceps', unit: 'cm', axis: 'left', color: 'var(--chart-4)' },
  { key: 'chestCm', label: 'Chest', unit: 'cm', axis: 'left', color: 'var(--chart-5)' },
  { key: 'waistCm', label: 'Waist', unit: 'cm', axis: 'left', color: '#ec4899' },
  { key: 'hipCm', label: 'Hip', unit: 'cm', axis: 'left', color: '#14b8a6' },
  { key: 'thighCm', label: 'Thigh', unit: 'cm', axis: 'left', color: '#f59e0b' },
];

export const CALORIES_SERIES: SeriesDef = {
  key: 'kcal',
  label: 'Calories',
  unit: 'kcal',
  axis: 'right',
  color: 'var(--chart-2)',
  isCalories: true,
};

// The target kcal in effect on `date`: the most recent target whose effectiveDate
// is on or before it (step-hold). `targetsAsc` must be oldest-first. Null before
// the first target exists.
export function targetKcalForDate(targetsAsc: NutritionTarget[], date: string): number | null {
  let value: number | null = null;
  for (const t of targetsAsc) {
    if (t.effectiveDate <= date) value = t.kcal;
    else break;
  }
  return value;
}

export type ChartRow = Record<string, number | string | null>;

export interface TrendData {
  rows: ChartRow[];
  availableMeasures: SeriesDef[];
  hasCalories: boolean;
}

// Build unified chart rows (one per measurement date, oldest-first). Each row holds
// every present measure's raw value plus its `<key>__ma7` / `<key>__ma30` calendar
// moving averages, and `kcal` (the step-held target). `availableMeasures` is the
// subset with any data, for the series picker.
export function buildTrendData(
  entries: BodyMeasurement[],
  targetsAsc: NutritionTarget[],
): TrendData {
  const asc = [...entries].sort((a, b) => a.measuredDate.localeCompare(b.measuredDate));
  const rows: ChartRow[] = asc.map((e) => ({ date: e.measuredDate }));
  const indexByDate = new Map(asc.map((e, i) => [e.measuredDate, i]));

  const availableMeasures: SeriesDef[] = [];
  for (const s of MEASURE_SERIES) {
    const key = s.key as keyof BodyMeasurement;
    const series = asc
      .map((e) => ({ date: e.measuredDate, value: e[key] as number | null }))
      .filter((p): p is { date: string; value: number } => p.value !== null);
    if (series.length === 0) continue;
    availableMeasures.push(s);

    const ma7 = movingAverage(series, 7);
    const ma30 = movingAverage(series, 30);
    series.forEach((p, i) => {
      const row = rows[indexByDate.get(p.date)!]!;
      row[s.key] = p.value;
      row[`${s.key}__ma7`] = ma7[i]!.average;
      row[`${s.key}__ma30`] = ma30[i]!.average;
    });
  }

  let hasCalories = false;
  for (const row of rows) {
    const kcal = targetKcalForDate(targetsAsc, row.date as string);
    row.kcal = kcal;
    if (kcal !== null) hasCalories = true;
  }

  return { rows, availableMeasures, hasCalories };
}
