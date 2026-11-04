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
  // Transport-level failures raised by apiFetch (no API envelope to read a message
  // from), plus the offline banner.
  network: {
    networkError: 'No connection to the server. Check your internet and try again.',
    timeout: 'The server took too long to respond. Try again.',
    offline: 'Offline — changes will sync once you’re back.',
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
  network: {
    networkError: 'Brak połączenia z serwerem. Sprawdź internet i spróbuj ponownie.',
    timeout: 'Serwer zbyt długo nie odpowiada. Spróbuj ponownie.',
    offline: 'Offline — zmiany wyślą się po powrocie sieci.',
  },
};

export const MESSAGES: Record<Locale, Messages> = { en, pl };
