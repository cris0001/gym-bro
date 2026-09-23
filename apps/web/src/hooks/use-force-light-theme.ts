import { useLayoutEffect } from 'react';

import { applyTheme, useThemeStore } from '@/stores/theme.store';

// Force the light theme while the calling page is mounted, then hand back the user's
// saved theme on the way out (e.g. after signing in). Used by the pages designed
// light-only — the landing (/) and the auth screens (/login, /register); the inline
// pre-paint script in index.html skips `.dark` on those same paths so they never
// flash dark. useLayoutEffect so the switch lands before paint.
export function useForceLightTheme(): void {
  useLayoutEffect(() => {
    document.documentElement.classList.remove('dark');
    return () => applyTheme(useThemeStore.getState().theme);
  }, []);
}
