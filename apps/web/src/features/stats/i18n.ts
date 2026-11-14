import { createFeatureTranslation } from '@/lib/i18n/create-translation';

// Stats page copy, EN source with a key-for-key PL mirror.
interface StatsCopy {
  title: string;
  exerciseProgress: string;
  workoutRatings: string;
  tiles: {
    workouts: string;
    strava: string;
    avgWorkout: string;
    thisMonth: string;
    activities: (n: number) => string;
    min: string;
    sameAsLastMonth: string;
    vsLastMonth: (signedDiff: string) => string;
  };
  periods: { all: string; custom: string; fromAria: string; toAria: string };
  picker: { placeholder: string; search: string; loading: string; empty: string };
  chart: {
    selectExercise: string;
    noSessions: string;
    latestTopSet: string;
    latestSet: string;
    inThisPeriod: string;
    bestEver: (date: string) => string;
    topSet: string;
    normalSets: string;
  };
  ratings: { empty: string; last30Days: string; latest: string };
}

const en: StatsCopy = {
  title: 'Stats',
  exerciseProgress: 'Exercise progress',
  workoutRatings: 'Workout ratings',
  tiles: {
    workouts: 'Workouts',
    strava: 'Strava',
    avgWorkout: 'Avg workout',
    thisMonth: 'this month',
    activities: (n) => (n === 1 ? 'activity' : 'activities'),
    min: 'min',
    sameAsLastMonth: 'same as last month',
    vsLastMonth: (d) => `${d} vs last month`,
  },
  periods: { all: 'All', custom: 'Custom', fromAria: 'From date', toAria: 'To date' },
  picker: {
    placeholder: 'Select an exercise',
    search: 'Search exercises',
    loading: 'Loading…',
    empty: 'No logged exercises yet.',
  },
  chart: {
    selectExercise: 'Select an exercise to see its progress.',
    noSessions: 'No sessions with this exercise in this period.',
    latestTopSet: 'Latest top set',
    latestSet: 'Latest set',
    inThisPeriod: 'in this period',
    bestEver: (date) => `Best ever · ${date}`,
    topSet: 'Top set',
    normalSets: 'Normal sets',
  },
  ratings: { empty: 'No rated workouts yet.', last30Days: 'Last 30 days', latest: 'Latest' },
};

const pl: StatsCopy = {
  title: 'Statystyki',
  exerciseProgress: 'Postęp w ćwiczeniu',
  workoutRatings: 'Oceny treningów',
  tiles: {
    workouts: 'Treningi',
    strava: 'Strava',
    avgWorkout: 'Średni trening',
    thisMonth: 'w tym miesiącu',
    activities: (n) => (n === 1 ? 'aktywność' : 'aktywności'),
    min: 'min',
    sameAsLastMonth: 'tyle co w zeszłym miesiącu',
    vsLastMonth: (d) => `${d} vs zeszły miesiąc`,
  },
  periods: { all: 'Wszystko', custom: 'Własny', fromAria: 'Data od', toAria: 'Data do' },
  picker: {
    placeholder: 'Wybierz ćwiczenie',
    search: 'Szukaj ćwiczeń',
    loading: 'Ładowanie…',
    empty: 'Brak zapisanych ćwiczeń.',
  },
  chart: {
    selectExercise: 'Wybierz ćwiczenie, aby zobaczyć postęp.',
    noSessions: 'Brak treningów z tym ćwiczeniem w tym okresie.',
    latestTopSet: 'Ostatni top set',
    latestSet: 'Ostatnia seria',
    inThisPeriod: 'w tym okresie',
    bestEver: (date) => `Rekord · ${date}`,
    topSet: 'Top set',
    normalSets: 'Zwykłe serie',
  },
  ratings: {
    empty: 'Brak ocenionych treningów.',
    last30Days: 'Ostatnie 30 dni',
    latest: 'Ostatnie',
  },
};

export const useStatsTranslation = createFeatureTranslation<StatsCopy>({ en, pl });
