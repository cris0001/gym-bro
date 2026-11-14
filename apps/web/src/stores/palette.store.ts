import { create } from 'zustand';

// Accent palette preference, persisted to localStorage and applied as a
// `data-palette` attribute on <html> (the per-palette tokens live in globals.css).
// Slate is the default pick. Plum is the CSS base and carries no attribute — the
// light-only landing/auth pages force it. The inline script in index.html reads the
// same key before first paint — keep PALETTE_KEY, the ids and the default in sync there.
export const PALETTES = [
  { id: 'slate', label: 'Slate', light: '#3a60a0', dark: '#85aae6' },
  { id: 'plum', label: 'Plum', light: '#8d4a5e', dark: '#d68aa0' },
  { id: 'forest', label: 'Forest', light: '#2f5d46', dark: '#7fbf9b' },
  { id: 'lagoon', label: 'Lagoon', light: '#0f766e', dark: '#4fd1c0' },
  { id: 'violet', label: 'Violet', light: '#7c3aed', dark: '#b391f7' },
  { id: 'crimson', label: 'Crimson', light: '#be123c', dark: '#f2708f' },
  { id: 'signal', label: 'Signal', light: '#c2410c', dark: '#ff8a4c' },
  { id: 'mono', label: 'Mono', light: '#111111', dark: '#f2f2f2' },
] as const;

export type Palette = (typeof PALETTES)[number]['id'];

export const DEFAULT_PALETTE: Palette = 'slate';

const PALETTE_KEY = 'gym-bro-palette';

function isPalette(value: string | null): value is Palette {
  return PALETTES.some((p) => p.id === value);
}

// Unknown values (e.g. a palette removed since it was saved) fall back to the default.
function readStored(): Palette {
  const value = localStorage.getItem(PALETTE_KEY);
  return isPalette(value) ? value : DEFAULT_PALETTE;
}

export function applyPalette(palette: Palette): void {
  const root = document.documentElement;
  if (palette === 'plum') root.removeAttribute('data-palette');
  else root.setAttribute('data-palette', palette);
}

interface PaletteState {
  palette: Palette;
  setPalette: (palette: Palette) => void;
}

export const usePaletteStore = create<PaletteState>((set) => ({
  palette: readStored(),
  setPalette: (palette) => {
    localStorage.setItem(PALETTE_KEY, palette);
    applyPalette(palette);
    set({ palette });
  },
}));
