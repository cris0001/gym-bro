import { create } from 'zustand';

// Accent palette preference, persisted to localStorage and applied as a
// `data-palette` attribute on <html> (the per-palette tokens live in globals.css).
// Plum is the default theme and carries no attribute. The inline script in
// index.html reads the same key before first paint — keep PALETTE_KEY in sync there.
export const PALETTES = [
  { id: 'plum', label: 'Plum', light: '#8d4a5e', dark: '#d68aa0' },
  { id: 'terracotta', label: 'Terracotta', light: '#a4502f', dark: '#e0866a' },
  { id: 'sage', label: 'Sage', light: '#4f6b47', dark: '#9cbf91' },
  { id: 'slate', label: 'Slate', light: '#3f5f86', dark: '#8fb1dc' },
  { id: 'brass', label: 'Brass', light: '#8a6420', dark: '#e0b458' },
  { id: 'violet', label: 'Violet', light: '#6a4a8a', dark: '#b99ad8' },
  { id: 'teal', label: 'Teal', light: '#2f6b6a', dark: '#7fc2bf' },
  { id: 'berry', label: 'Berry', light: '#9a2f4a', dark: '#e57f98' },
  { id: 'olive', label: 'Olive', light: '#6b6a2a', dark: '#c4c276' },
  { id: 'indigo', label: 'Indigo', light: '#3b4a8c', dark: '#99a6e0' },
] as const;

export type Palette = (typeof PALETTES)[number]['id'];

const PALETTE_KEY = 'gym-bro-palette';

function isPalette(value: string | null): value is Palette {
  return PALETTES.some((p) => p.id === value);
}

function readStored(): Palette {
  const value = localStorage.getItem(PALETTE_KEY);
  return isPalette(value) ? value : 'plum';
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
