import { useLayoutEffect } from 'react';

import { applyPalette, type Palette, usePaletteStore } from '@/stores/palette.store';
import { applyTheme, useThemeStore } from '@/stores/theme.store';

// Force a light theme (plum by default; the landing passes its own brand palette)
// while the calling page is mounted, then hand back the
// user's saved theme + palette on the way out (e.g. after signing in). Used by the
// pages designed light-only — the landing (/) and the auth screens (/login,
// /register); the inline pre-paint script in index.html skips `.dark` and the palette
// on those same paths so they never flash. useLayoutEffect so the switch lands
// before paint.
export function useForceLightTheme(palette: Palette = 'plum'): void {
  useLayoutEffect(() => {
    document.documentElement.classList.remove('dark');
    applyPalette(palette);
    return () => {
      applyTheme(useThemeStore.getState().theme);
      applyPalette(usePaletteStore.getState().palette);
    };
  }, [palette]);
}
