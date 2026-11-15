import { createFeatureTranslation } from '@/lib/i18n/create-translation';

// Stats page copy, EN source with a key-for-key PL mirror.
interface StatsCopy {
  title: string;
  export: {
    button: string;
    pdf: string;
    pdfHint: string;
    csv: string;
    csvHint: string;
    working: string;
    empty: string;
    failed: string;
    pdfLabels: {
      title: string;
      period: string;
      allTime: string;
      generated: string;
      workouts: string;
      sets: string;
      volume: string;
      avgRating: string;
      best: string;
      change: string;
      sessions: (n: number) => string;
      bodyweight: string;
    };
    csvColumns: {
      date: string;
      session: string;
      exercise: string;
      category: string;
      set: string;
      weight: string;
      reps: string;
      rir: string;
      topSet: string;
      volume: string;
    };
  };
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
  export: {
    button: 'Export',
    pdf: 'PDF report',
    pdfHint: 'Results and progress charts',
    csv: 'CSV data',
    csvHint: 'Every set — for Excel or an AI chat',
    working: 'Preparing…',
    empty: 'No workouts in this period.',
    failed: 'Export failed — try again.',
    pdfLabels: {
      title: 'Training report',
      period: 'Period',
      allTime: 'All time',
      generated: 'Generated',
      workouts: 'Workouts',
      sets: 'Sets',
      volume: 'Volume',
      avgRating: 'Avg rating',
      best: 'Best',
      change: 'Change',
      sessions: (n) => `${n} ${n === 1 ? 'session' : 'sessions'}`,
      bodyweight: 'Bodyweight — chart shows reps per session',
    },
    csvColumns: {
      date: 'date',
      session: 'workout',
      exercise: 'exercise',
      category: 'category',
      set: 'set',
      weight: 'weight_kg',
      reps: 'reps',
      rir: 'rir',
      topSet: 'top_set',
      volume: 'volume_kg',
    },
  },
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
  export: {
    button: 'Eksport',
    pdf: 'Raport PDF',
    pdfHint: 'Wyniki i wykresy postępów',
    csv: 'Dane CSV',
    csvHint: 'Każda seria — do Excela albo czatu AI',
    working: 'Przygotowuję…',
    empty: 'Brak treningów w tym okresie.',
    failed: 'Eksport się nie udał — spróbuj ponownie.',
    pdfLabels: {
      title: 'Raport treningowy',
      period: 'Okres',
      allTime: 'Cała historia',
      generated: 'Wygenerowano',
      workouts: 'Treningi',
      sets: 'Serie',
      volume: 'Objętość',
      avgRating: 'Średnia ocena',
      best: 'Rekord',
      change: 'Zmiana',
      sessions: (n) =>
        `${n} ${n === 1 ? 'trening' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? 'treningi' : 'treningów'}`,
      bodyweight: 'Masa ciała — wykres pokazuje powtórzenia',
    },
    csvColumns: {
      date: 'data',
      session: 'trening',
      exercise: 'cwiczenie',
      category: 'kategoria',
      set: 'seria',
      weight: 'ciezar_kg',
      reps: 'powtorzenia',
      rir: 'rir',
      topSet: 'top_set',
      volume: 'objetosc_kg',
    },
  },
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
