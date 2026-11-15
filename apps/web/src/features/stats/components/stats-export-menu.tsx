import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useLocaleStore } from '@/stores/locale.store';

import { getSessionsForExport } from '../api/export';
import type { StatsRange } from '../api/stats';
import { useStatsTranslation } from '../i18n';
import { buildStatsCsv } from '../utils/export-csv';
import { buildExportModel } from '../utils/export-model';
import { buildStatsPdf } from '../utils/export-pdf';

type Kind = 'pdf' | 'csv';

// Saves a blob as a file. The link is attached for the click, and the object URL is
// released a moment later — revoking it right away can cancel the download.
function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

// "Export" in the stats header: a PDF report (results + progress charts) or a CSV of
// every set, both for the period chosen in the stats date range (all history when
// none). Exercises not trained in the period are left out.
export function StatsExportMenu({ range }: { range: StatsRange | undefined }) {
  const t = useStatsTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<Kind | null>(null);

  async function run(kind: Kind) {
    setBusy(kind);
    try {
      const model = buildExportModel(await getSessionsForExport(range), range);
      if (model.rows.length === 0) {
        toast(t.export.empty);
        return;
      }
      const span = model.from && model.to ? `${model.from}_${model.to}` : 'all';
      if (kind === 'csv') {
        const csv = buildStatsCsv(model, t.export.csvColumns);
        download(new Blob([csv], { type: 'text/csv;charset=utf-8' }), `lift4me-${span}.csv`);
      } else {
        const pdf = await buildStatsPdf(
          model,
          t.export.pdfLabels,
          locale === 'pl' ? 'pl-PL' : 'en-GB',
        );
        download(pdf, `lift4me-report-${span}.pdf`);
      }
      setOpen(false);
    } catch {
      toast.error(t.export.failed);
    } finally {
      setBusy(null);
    }
  }

  const option = (kind: Kind, Icon: typeof FileText, label: string, hint: string) => (
    <button
      type="button"
      disabled={busy !== null}
      onClick={() => void run(kind)}
      className="hover:bg-muted flex w-full items-start gap-3 rounded-md p-2.5 text-left transition-colors disabled:opacity-60"
    >
      {busy === kind ? (
        <Loader2 className="text-primary mt-0.5 size-4 shrink-0 animate-spin" />
      ) : (
        <Icon className="text-primary mt-0.5 size-4 shrink-0" />
      )}
      <span>
        <span className="block text-sm font-semibold">
          {busy === kind ? t.export.working : label}
        </span>
        <span className="text-muted-foreground block text-xs">{hint}</span>
      </span>
    </button>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="border-border bg-card hover:bg-muted inline-flex h-9.5 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors"
        >
          <Download className="size-4" />
          {t.export.button}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-1.5">
        {option('pdf', FileText, t.export.pdf, t.export.pdfHint)}
        {option('csv', FileSpreadsheet, t.export.csv, t.export.csvHint)}
      </PopoverContent>
    </Popover>
  );
}
