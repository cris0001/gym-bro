import { createFeatureTranslation } from '@/lib/i18n/create-translation';

import type { SportGroup } from './utils/sport-group';

// Strava feature copy, EN source with a key-for-key PL mirror. Activity names come
// from Strava as the athlete typed them and are never translated; known activity
// TYPES (Run, Ride…) are, via activityTypeLabel.
interface StravaCopy {
  connect: { title: string; body: string; cta: string; sectionHint: string };
  header: {
    import: string;
    importing: string;
    menuAria: string;
    connectedAs: string;
    athlete: (id: string) => string;
    disconnect: string;
    disconnectTitle: string;
    disconnectBody: string;
    disconnectConfirm: string;
  };
  sync: { connected: string; synced: (ago: string) => string };
  all: string;
  periods: { month: string; year: string; all: string };
  stats: {
    activities: string;
    distance: string;
    movingTime: string;
    elevation: string;
    weekly: (byDistance: boolean) => string;
    weeks: (n: number) => string;
    lastWeeks: (n: number) => string;
    thisWeek: string;
    vs: (delta: string, label: string) => string;
    weekOf: (label: string, value: string) => string;
  };
  activityCount: (n: number) => string;
  row: {
    distance: string;
    time: string;
    pace: string;
    speed: string;
    view: string;
    remove: string;
    removeTitle: (name: string) => string;
    removeBody: string;
  };
  page: { loadError: string; emptyTitle: string; emptyBody: string };
  card: {
    lastActivity: string;
    noneYet: string;
    distance: string;
    time: string;
    pace: string;
    speed: string;
  };
  groups: Record<SportGroup, string>;
  metrics: {
    distance: string;
    moving: string;
    elapsed: string;
    pace: string;
    avgSpeed: string;
    maxSpeed: string;
    elevation: string;
    avgHr: string;
    maxHr: string;
    cadence: string;
    avgPower: string;
    maxPower: string;
    calories: string;
    relativeEffort: string;
    kudos: string;
    achievements: string;
  };
  types: Record<string, string>;
}

const en: StravaCopy = {
  connect: {
    title: 'Connect Strava',
    body: 'Link your Strava account to import your runs, rides, and other activities.',
    cta: 'Connect Strava',
    sectionHint: 'Link Strava to see your activities here.',
  },
  header: {
    import: 'Import',
    importing: 'Importing…',
    menuAria: 'Strava connection',
    connectedAs: 'Connected as',
    athlete: (id) => `athlete #${id}`,
    disconnect: 'Disconnect Strava',
    disconnectTitle: 'Disconnect Strava?',
    disconnectBody: 'Imported activities stay; new ones won’t sync until you reconnect.',
    disconnectConfirm: 'Disconnect',
  },
  sync: { connected: 'Connected', synced: (ago) => `synced ${ago} ago` },
  all: 'All',
  periods: { month: 'Month', year: 'Year', all: 'All' },
  stats: {
    activities: 'Activities',
    distance: 'Distance',
    movingTime: 'Moving time',
    elevation: 'Elevation',
    weekly: (byDistance) => `Weekly ${byDistance ? 'distance' : 'time'}`,
    weeks: (n) => `${n} weeks`,
    lastWeeks: (n) => `Last ${n} weeks`,
    thisWeek: 'This week',
    vs: (delta, label) => `${delta} vs ${label}`,
    weekOf: (label, value) => `Week of ${label}: ${value}`,
  },
  activityCount: (n) => `${n} ${n === 1 ? 'activity' : 'activities'}`,
  row: {
    distance: 'distance',
    time: 'time',
    pace: 'pace',
    speed: 'speed',
    view: 'View on Strava ↗',
    remove: 'Remove',
    removeTitle: (name) => `Remove "${name}"?`,
    removeBody: 'Removes it from the app only — your Strava activity is untouched.',
  },
  page: {
    loadError: 'Couldn’t load your activities.',
    emptyTitle: 'No activities yet',
    emptyBody: 'Import recent activities from Strava to see them here and on your calendar.',
  },
  card: {
    lastActivity: 'Last activity',
    noneYet: 'No activities imported yet.',
    distance: 'Distance',
    time: 'Time',
    pace: 'Pace',
    speed: 'Speed',
  },
  groups: { ride: 'Rides', run: 'Runs', walk: 'Walks & hikes', swim: 'Swims', other: 'Other' },
  metrics: {
    distance: 'Distance',
    moving: 'Moving',
    elapsed: 'Elapsed',
    pace: 'Pace',
    avgSpeed: 'Avg speed',
    maxSpeed: 'Max speed',
    elevation: 'Elevation',
    avgHr: 'Avg HR',
    maxHr: 'Max HR',
    cadence: 'Cadence',
    avgPower: 'Avg power',
    maxPower: 'Max power',
    calories: 'Calories',
    relativeEffort: 'Relative effort',
    kudos: 'Kudos',
    achievements: 'Achievements',
  },
  types: {},
};

const pl: StravaCopy = {
  connect: {
    title: 'Połącz Stravę',
    body: 'Połącz konto Strava, aby importować bieganie, jazdę na rowerze i inne aktywności.',
    cta: 'Połącz Stravę',
    sectionHint: 'Połącz Stravę, aby widzieć tu swoje aktywności.',
  },
  header: {
    import: 'Importuj',
    importing: 'Importowanie…',
    menuAria: 'Połączenie ze Stravą',
    connectedAs: 'Połączono jako',
    athlete: (id) => `zawodnik #${id}`,
    disconnect: 'Odłącz Stravę',
    disconnectTitle: 'Odłączyć Stravę?',
    disconnectBody:
      'Zaimportowane aktywności zostaną; nowe nie będą się synchronizować, dopóki nie połączysz ponownie.',
    disconnectConfirm: 'Odłącz',
  },
  sync: { connected: 'Połączono', synced: (ago) => `synchronizacja ${ago} temu` },
  all: 'Wszystko',
  periods: { month: 'Miesiąc', year: 'Rok', all: 'Wszystko' },
  stats: {
    activities: 'Aktywności',
    distance: 'Dystans',
    movingTime: 'Czas ruchu',
    elevation: 'Przewyższenie',
    weekly: (byDistance) => `Tygodniowy ${byDistance ? 'dystans' : 'czas'}`,
    weeks: (n) => `${n} tygodni`,
    lastWeeks: (n) => `Ostatnie ${n} tygodni`,
    thisWeek: 'Ten tydzień',
    vs: (delta, label) => `${delta} vs ${label}`,
    weekOf: (label, value) => `Tydzień od ${label}: ${value}`,
  },
  activityCount: (n) => `${n} ${n === 1 ? 'aktywność' : 'aktywności'}`,
  row: {
    distance: 'dystans',
    time: 'czas',
    pace: 'tempo',
    speed: 'prędkość',
    view: 'Zobacz na Stravie ↗',
    remove: 'Usuń',
    removeTitle: (name) => `Usunąć „${name}”?`,
    removeBody: 'Usuwa tylko z aplikacji — aktywność na Stravie zostaje nietknięta.',
  },
  page: {
    loadError: 'Nie udało się wczytać aktywności.',
    emptyTitle: 'Brak aktywności',
    emptyBody: 'Zaimportuj ostatnie aktywności ze Stravy, aby zobaczyć je tutaj i w kalendarzu.',
  },
  card: {
    lastActivity: 'Ostatnia aktywność',
    noneYet: 'Nie zaimportowano jeszcze aktywności.',
    distance: 'Dystans',
    time: 'Czas',
    pace: 'Tempo',
    speed: 'Prędkość',
  },
  groups: {
    ride: 'Rower',
    run: 'Bieganie',
    walk: 'Spacery i wędrówki',
    swim: 'Pływanie',
    other: 'Inne',
  },
  metrics: {
    distance: 'Dystans',
    moving: 'Czas ruchu',
    elapsed: 'Czas całkowity',
    pace: 'Tempo',
    avgSpeed: 'Śr. prędkość',
    maxSpeed: 'Maks. prędkość',
    elevation: 'Przewyższenie',
    avgHr: 'Śr. tętno',
    maxHr: 'Maks. tętno',
    cadence: 'Kadencja',
    avgPower: 'Śr. moc',
    maxPower: 'Maks. moc',
    calories: 'Kalorie',
    relativeEffort: 'Wysiłek względny',
    kudos: 'Kudosy',
    achievements: 'Osiągnięcia',
  },
  types: {
    Run: 'Bieg',
    TrailRun: 'Bieg terenowy',
    VirtualRun: 'Bieg wirtualny',
    Ride: 'Rower',
    VirtualRide: 'Rower wirtualny',
    GravelRide: 'Rower gravel',
    MountainBikeRide: 'Rower górski',
    EBikeRide: 'Rower elektryczny',
    Walk: 'Spacer',
    Hike: 'Wędrówka',
    Swim: 'Pływanie',
    WeightTraining: 'Trening siłowy',
    Workout: 'Trening',
    Yoga: 'Joga',
    Rowing: 'Wioślarstwo',
    Elliptical: 'Orbitrek',
    StairStepper: 'Stepper',
    Crossfit: 'CrossFit',
    AlpineSki: 'Narciarstwo zjazdowe',
    NordicSki: 'Narciarstwo biegowe',
    Snowboard: 'Snowboard',
    IceSkate: 'Łyżwiarstwo',
    InlineSkate: 'Rolki',
    RockClimbing: 'Wspinaczka',
    Kayaking: 'Kajakarstwo',
    Soccer: 'Piłka nożna',
    Tennis: 'Tenis',
  },
};

export const useStravaTranslation = createFeatureTranslation<StravaCopy>({ en, pl });

type StravaT = ReturnType<typeof useStravaTranslation>;

// A Strava activity type in the UI language; unknown types fall back to Strava's own
// name (Strava adds types over time — the raw name is still readable).
export function activityTypeLabel(t: StravaT, type: string): string {
  return t.types[type] ?? type;
}

// For other features (e.g. the calendar): a translator for Strava activity types.
export function useActivityTypeLabel(): (type: string) => string {
  const t = useStravaTranslation();
  return (type) => activityTypeLabel(t, type);
}
