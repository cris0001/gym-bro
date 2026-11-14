import { Monitor, Moon, Sun } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useThemeStore, type Theme } from '@/stores/theme.store';

const OPTIONS: { value: Theme; label: string; Icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
  { value: 'system', label: 'System', Icon: Monitor },
];

// Light / dark / system as a segmented control (Settings → Appearance). The OS-change
// listener for 'system' lives in useSystemThemeSync, mounted by the app shell.
export function ThemeToggle({ className }: { className?: string }) {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  return (
    <div className={cn('bg-secondary grid h-9 grid-cols-3 gap-1 rounded-md p-[3px]', className)}>
      {OPTIONS.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          aria-pressed={theme === value}
          onClick={() => setTheme(value)}
          className={cn(
            'inline-flex h-full cursor-pointer items-center justify-center gap-1.5 rounded-sm text-[13px] font-semibold transition-colors',
            theme === value ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground',
          )}
        >
          <Icon className="size-4" />
          {label}
        </button>
      ))}
    </div>
  );
}
