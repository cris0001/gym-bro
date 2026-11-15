import type { jsPDF as JsPdf } from 'jspdf';

import type { ExerciseSummary, ExportModel } from './export-model';

export interface PdfLabels {
  title: string;
  period: string;
  allTime: string;
  generated: string;
  workouts: string;
  sets: string;
  volume: string;
  avgRating: string;
  best: string;
  change: string;
  sessions: (n: number) => string;
  bodyweight: string;
}

// Brand colours (RGB) — ink, muted text, rule lines, cobalt, pale cobalt.
const INK: [number, number, number] = [20, 24, 31];
const MUTED: [number, number, number] = [91, 97, 112];
const LINE: [number, number, number] = [228, 225, 216];
const COBALT: [number, number, number] = [2, 62, 138];
const COBALT_SOFT: [number, number, number] = [227, 235, 247];

const PAGE_W = 210;
const PAGE_H = 297;
const M = 16;
const SECTION_H = 62;

async function loadFont(url: string): Promise<string> {
  const buf = await (await fetch(url)).arrayBuffer();
  let binary = '';
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

// Geist (TTF, public/fonts) — the built-in PDF fonts have no Polish letters.
async function registerFonts(doc: JsPdf): Promise<void> {
  const [regular, bold] = await Promise.all([
    loadFont('/fonts/geist-regular.ttf'),
    loadFont('/fonts/geist-bold.ttf'),
  ]);
  doc.addFileToVFS('Geist-Regular.ttf', regular);
  doc.addFont('Geist-Regular.ttf', 'Geist', 'normal');
  doc.addFileToVFS('Geist-Bold.ttf', bold);
  doc.addFont('Geist-Bold.ttf', 'Geist', 'bold');
}

function text(
  doc: JsPdf,
  value: string,
  x: number,
  y: number,
  size: number,
  opts: {
    bold?: boolean;
    color?: [number, number, number];
    align?: 'left' | 'right' | 'center';
  } = {},
) {
  doc.setFont('Geist', opts.bold ? 'bold' : 'normal');
  doc.setFontSize(size);
  doc.setTextColor(...(opts.color ?? INK));
  doc.text(value, x, y, { align: opts.align ?? 'left' });
}

// The headline weight per session as a line with dots, min/max on the left and the
// first/last dates under it. Bodyweight-only exercises chart their reps instead.
function drawChart(
  doc: JsPdf,
  ex: ExerciseSummary,
  x: number,
  y: number,
  w: number,
  h: number,
  fmtDate: (d: string) => string,
) {
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.2);
  doc.roundedRect(x, y, w, h, 2, 2, 'S');

  const weighted = ex.points
    .filter((p) => p.weight !== null)
    .map((p) => ({ date: p.date, weight: p.weight! }));
  // Bodyweight-only: plot the reps done instead (the "weight" field carries reps here).
  const pts =
    weighted.length > 0
      ? weighted
      : ex.points.filter((p) => p.reps !== null).map((p) => ({ date: p.date, weight: p.reps! }));
  if (pts.length === 0) return;
  const values = pts.map((p) => p.weight);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = max === min ? Math.max(1, max * 0.05) : (max - min) * 0.15;
  const lo = min - pad;
  const hi = max + pad;
  const left = x + 14;
  const right = x + w - 5;
  const top = y + 5;
  const bottom = y + h - 9;
  const px = (i: number) =>
    pts.length === 1 ? (left + right) / 2 : left + ((right - left) * i) / (pts.length - 1);
  const py = (v: number) => bottom - ((v - lo) / (hi - lo)) * (bottom - top);

  doc.setDrawColor(...LINE);
  for (const v of [lo + (hi - lo) * 0.15, (lo + hi) / 2, hi - (hi - lo) * 0.15]) {
    doc.line(left, py(v), right, py(v));
  }
  text(doc, String(max), x + 2.5, py(max) + 1, 7, { color: MUTED });
  if (max !== min) text(doc, String(min), x + 2.5, py(min) + 1, 7, { color: MUTED });

  doc.setDrawColor(...COBALT);
  doc.setLineWidth(0.6);
  for (let i = 1; i < pts.length; i++) {
    doc.line(px(i - 1), py(pts[i - 1]!.weight), px(i), py(pts[i]!.weight));
  }
  doc.setFillColor(...COBALT);
  pts.forEach((p, i) => doc.circle(px(i), py(p.weight), 0.8, 'F'));

  text(doc, fmtDate(pts[0]!.date), left, y + h - 3, 7, { color: MUTED });
  if (pts.length > 1)
    text(doc, fmtDate(pts[pts.length - 1]!.date), right, y + h - 3, 7, {
      color: MUTED,
      align: 'right',
    });
}

// Builds the training report and returns it as a Blob: a header with the period, four
// summary tiles, then one section per exercise trained in the window (stats line +
// progress chart), paginated, with a page footer.
export async function buildStatsPdf(
  model: ExportModel,
  labels: PdfLabels,
  locale: string,
): Promise<Blob> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  await registerFonts(doc);

  const num = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
  const fmtDate = (d: string) =>
    new Date(`${d}T12:00:00`).toLocaleDateString(locale, { day: 'numeric', month: 'short' });
  const fmtLong = (d: string) =>
    new Date(`${d}T12:00:00`).toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  // Header.
  text(doc, 'Lift4Me', M, M + 6, 20, { bold: true, color: COBALT });
  text(doc, labels.title, M, M + 14, 13, { bold: true });
  const period =
    model.from && model.to ? `${fmtLong(model.from)} – ${fmtLong(model.to)}` : labels.allTime;
  text(doc, `${labels.period}: ${period}`, M, M + 20, 9, { color: MUTED });
  text(
    doc,
    `${labels.generated}: ${fmtLong(new Date().toISOString().slice(0, 10))}`,
    PAGE_W - M,
    M + 6,
    8,
    { color: MUTED, align: 'right' },
  );

  // Summary tiles.
  const tiles: [string, string][] = [
    [labels.workouts, String(model.workouts)],
    [labels.sets, String(model.sets)],
    [labels.volume, `${num.format(model.volume / 1000)} t`],
    [labels.avgRating, model.avgRating === null ? '—' : `${num.format(model.avgRating)} / 5`],
  ];
  const tileW = (PAGE_W - 2 * M - 9) / 4;
  tiles.forEach(([label, value], i) => {
    const tx = M + i * (tileW + 3);
    doc.setFillColor(...COBALT_SOFT);
    doc.roundedRect(tx, M + 26, tileW, 20, 2, 2, 'F');
    text(doc, label.toUpperCase(), tx + 4, M + 32, 7, { color: MUTED });
    text(doc, value, tx + 4, M + 41, 14, { bold: true });
  });

  // Exercise sections.
  let y = M + 56;
  for (const ex of model.exercises) {
    if (y + SECTION_H > PAGE_H - M - 6) {
      doc.addPage();
      y = M;
    }
    text(doc, ex.name, M, y + 5, 12, { bold: true });
    text(doc, `${ex.category} · ${labels.sessions(ex.sessions)}`, PAGE_W - M, y + 5, 8, {
      color: MUTED,
      align: 'right',
    });
    const parts = [
      ex.best
        ? `${labels.best}: ${num.format(ex.best.weight)} kg${ex.best.reps ? ` × ${ex.best.reps}` : ''} (${fmtDate(ex.best.date)})`
        : null,
      ex.change !== null
        ? `${labels.change}: ${ex.change > 0 ? '+' : ''}${num.format(ex.change)} kg`
        : null,
      // Bodyweight-only exercises have no kilos to sum — say what the chart shows instead.
      ex.best ? `${labels.volume}: ${num.format(ex.volume)} kg` : labels.bodyweight,
    ].filter(Boolean);
    text(doc, parts.join('   ·   '), M, y + 11, 8.5, { color: MUTED });
    drawChart(doc, ex, M, y + 14, PAGE_W - 2 * M, 40, fmtDate);
    y += SECTION_H;
  }

  // Footers.
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    text(doc, `lift4.me · ${p}/${pages}`, PAGE_W / 2, PAGE_H - 8, 7, {
      color: MUTED,
      align: 'center',
    });
  }
  return doc.output('blob');
}
