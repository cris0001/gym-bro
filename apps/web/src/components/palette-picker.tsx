import { Check } from 'lucide-react';
import type { CSSProperties } from 'react';

import { cn } from '@/lib/utils';
import { PALETTES, usePaletteStore } from '@/stores/palette.store';

// The accent palettes as an inline grid of swatches (Settings → Appearance). Each
// swatch shows the palette's primary for the current mode (light/dark) via CSS vars.
export function PalettePicker({ className }: { className?: string }) {
  const palette = usePaletteStore((s) => s.palette);
  const setPalette = usePaletteStore((s) => s.setPalette);

  return (
    <div className={cn('grid grid-cols-2 gap-1.5 sm:grid-cols-3', className)}>
      {PALETTES.map((p) => {
        const active = p.id === palette;
        return (
          <button
            key={p.id}
            type="button"
            aria-pressed={active}
            onClick={() => setPalette(p.id)}
            className={cn(
              'flex h-11 cursor-pointer items-center gap-2.5 rounded-xl border px-3 text-left text-[13px] font-medium transition-colors',
              active
                ? 'border-primary/40 bg-accent text-accent-foreground'
                : 'border-border hover:bg-muted',
            )}
          >
            <span
              className="size-5 shrink-0 rounded-full bg-(--swatch-light) dark:bg-(--swatch-dark)"
              style={{ '--swatch-light': p.light, '--swatch-dark': p.dark } as CSSProperties}
            />
            <span className="flex-1 truncate">{p.label}</span>
            {active && <Check className="size-4 shrink-0" />}
          </button>
        );
      })}
    </div>
  );
}
