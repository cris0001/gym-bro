import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// The UI language. Frontend-only for now — user-generated content (exercise/food
// names, notes) stays as entered; only static interface copy is translated. A
// backend-side language preference is a later decision.
export type Locale = 'en' | 'pl';

export const LOCALES: { code: Locale; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'pl', label: 'PL' },
];

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

// Persisted so the choice survives reloads. Defaults to English.
export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: 'en',
      setLocale: (locale) => set({ locale }),
    }),
    { name: 'gym-bro-locale' },
  ),
);
