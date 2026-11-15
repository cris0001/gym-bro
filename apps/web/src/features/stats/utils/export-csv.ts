import type { ExportModel } from './export-model';

export interface CsvColumns {
  date: string;
  session: string;
  exercise: string;
  category: string;
  set: string;
  weight: string;
  reps: string;
  rir: string;
  topSet: string;
  volume: string;
}

const cell = (value: string | number | null): string => {
  if (value === null) return '';
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

// One row per set — the shape spreadsheets pivot well and AI chats read best. Comma
// separated, dot decimals, empty cell = not recorded (bodyweight / no RIR); a UTF-8
// BOM so Excel opens Polish names correctly.
export function buildStatsCsv(model: ExportModel, cols: CsvColumns): string {
  const header = [
    cols.date,
    cols.session,
    cols.exercise,
    cols.category,
    cols.set,
    cols.weight,
    cols.reps,
    cols.rir,
    cols.topSet,
    cols.volume,
  ];
  const lines = model.rows.map((r) =>
    [
      r.date,
      r.session,
      r.exercise,
      r.category,
      r.setNumber,
      r.weight,
      r.reps,
      r.rir,
      r.isTopSet ? 1 : 0,
      r.weight !== null && r.reps !== null ? Math.round(r.weight * r.reps * 10) / 10 : null,
    ]
      .map(cell)
      .join(','),
  );
  return '﻿' + [header.map(cell).join(','), ...lines].join('\r\n') + '\r\n';
}
