import { Monitor, Moon, Sun } from 'lucide-react';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { applyTheme, systemPrefersDark, useThemeStore, type Theme } from '@/stores/theme.store';

// Cycle order (system → light → dark → …) and the icon/label per mode.
const NEXT: Record<Theme, Theme> = { system: 'light', light: 'dark', dark: 'system' };
const ICON = { system: Monitor, light: Sun, dark: Moon } as const;
const LABEL = { system: 'System theme', light: 'Light theme', dark: 'Dark theme' } as const;

// A single icon button that cycles theme (system → light → dark). Keeps the <html>
// `.dark` class in sync when the OS theme changes while in 'system' mode. Mount once
// in the app chrome (header + sidebar share the same store).
export function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  // Re-apply on OS change while following the system setting.
  useEffect(() => {
    if (theme !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyTheme('system');
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [theme]);

  const Icon = ICON[theme];
  const resolved = theme === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : theme;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-9"
      aria-label={`${LABEL[theme]} (tap to change)`}
      title={LABEL[theme]}
      onClick={() => setTheme(NEXT[theme])}
      data-resolved={resolved}
    >
      <Icon className="size-5" />
    </Button>
  );
}
