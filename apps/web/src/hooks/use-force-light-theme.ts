import { useLayoutEffect } from 'react';

import { applyPalette, usePaletteStore } from '@/stores/palette.store';
import { applyTheme, useThemeStore } from '@/stores/theme.store';

// Force the light plum theme while the calling page is mounted, then hand back the
// user's saved theme + palette on the way out (e.g. after signing in). Used by the
// pages designed light-only — the landing (/) and the auth screens (/login,
// /register); the inline pre-paint script in index.html skips `.dark` and the palette
// on those same paths so they never flash. useLayoutEffect so the switch lands
// before paint.
export function useForceLightTheme(): void {
  useLayoutEffect(() => {
    document.documentElement.classList.remove('dark');
    applyPalette('plum');
    return () => {
      applyTheme(useThemeStore.getState().theme);
      applyPalette(usePaletteStore.getState().palette);
    };
  }, []);
}
