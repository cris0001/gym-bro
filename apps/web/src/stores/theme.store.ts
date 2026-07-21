import { create } from 'zustand';

// Theme preference, persisted to localStorage and applied by toggling `.dark` on
// <html> (shadcn/Tailwind dark mode). 'system' follows the OS setting. The same
// localStorage key is read by an inline script in index.html so the class is set
// before first paint (no flash of the wrong theme) — keep THEME_KEY in sync there.
export type Theme = 'light' | 'dark' | 'system';

const THEME_KEY = 'gym-bro-theme';

function readStored(): Theme {
  const value = localStorage.getItem(THEME_KEY);
  return value === 'light' || value === 'dark' || value === 'system' ? value : 'system';
}

export function systemPrefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// Resolve the preference to a concrete light/dark and apply it to <html>.
export function applyTheme(theme: Theme): void {
  const dark = theme === 'dark' || (theme === 'system' && systemPrefersDark());
  document.documentElement.classList.toggle('dark', dark);
}

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: readStored(),
  setTheme: (theme) => {
    localStorage.setItem(THEME_KEY, theme);
    applyTheme(theme);
    set({ theme });
  },
}));
