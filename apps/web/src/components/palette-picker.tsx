import { Check, Palette as PaletteIcon } from 'lucide-react';
import type { CSSProperties } from 'react';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { PALETTES, usePaletteStore } from '@/stores/palette.store';

// Icon button next to the theme toggle that opens the accent palette list. Each
// swatch shows the palette's primary for the current mode (light/dark) via CSS vars.
export function PalettePicker() {
  const palette = usePaletteStore((s) => s.palette);
  const setPalette = usePaletteStore((s) => s.setPalette);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-9"
          aria-label="Accent color"
          title="Accent color"
        >
          <PaletteIcon className="size-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 gap-2 p-2">
        <p className="text-muted-foreground px-2 pt-1 text-xs font-semibold">Accent color</p>
        <div className="grid grid-cols-2 gap-1">
          {PALETTES.map((p) => {
            const active = p.id === palette;
            return (
              <button
                key={p.id}
                type="button"
                aria-pressed={active}
                onClick={() => setPalette(p.id)}
                className={cn(
                  'flex h-11 items-center gap-2.5 rounded-[10px] px-2.5 text-left text-[13px] font-medium transition-colors',
                  active ? 'bg-accent text-accent-foreground' : 'hover:bg-muted',
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
      </PopoverContent>
    </Popover>
  );
}
