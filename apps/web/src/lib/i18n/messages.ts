import type { Locale } from '@/stores/locale.store';

// Static UI copy for the app (behind login), keyed by locale. English is the source
// shape (Messages); every other locale must match it. Rolled out per feature — start
// with navigation + shared chrome, then expand namespace by namespace. The public
// landing is intentionally English-only and does not use this.
const en = {
  nav: {
    home: 'Home',
    training: 'Training',
    calendar: 'Calendar',
    stats: 'Stats',
    plans: 'Plans',
    exercises: 'Exercises',
    tags: 'Tags',
    food: 'Food',
    diary: 'Diary',
    foods: 'Foods',
    recipes: 'Recipes',
    targets: 'Targets',
    body: 'Body',
    strava: 'Strava',
  },
  common: {
    logout: 'Sign out',
    loggingOut: 'Signing out…',
  },
};

export type Messages = typeof en;
export type NavKey = keyof Messages['nav'];

const pl: Messages = {
  nav: {
    home: 'Start',
    training: 'Trening',
    calendar: 'Kalendarz',
    stats: 'Statystyki',
    plans: 'Plany',
    exercises: 'Ćwiczenia',
    tags: 'Tagi',
    food: 'Jedzenie',
    diary: 'Dziennik',
    foods: 'Produkty',
    recipes: 'Przepisy',
    targets: 'Cele',
    body: 'Ciało',
    strava: 'Strava',
  },
  common: {
    logout: 'Wyloguj',
    loggingOut: 'Wylogowywanie…',
  },
};

export const MESSAGES: Record<Locale, Messages> = { en, pl };
