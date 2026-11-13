import { useEffect } from 'react';

import { applyTheme, useThemeStore } from '@/stores/theme.store';

// Keeps the <html> `.dark` class in sync when the OS theme flips while the app is set
// to follow the system. Mounted once in the app shell — the theme control itself now
// lives on the Settings page, which isn't always on screen.
export function useSystemThemeSync() {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    if (theme !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyTheme('system');
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [theme]);
}
