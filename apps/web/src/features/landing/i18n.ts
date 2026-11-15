import { createFeatureTranslation } from '@/lib/i18n/create-translation';

// Landing page copy, EN source with a key-for-key PL mirror. Module texts are keyed by
// the module id in data/modules.ts (which keeps only the icon and colours). The copy
// describes what the app does today — keep it in step when features change.
interface ModuleCopy {
  title: string;
  desc: string;
  chips: string[];
  details: string[];
  caption: string;
}

type ModuleId = 'training' | 'nutrition' | 'body' | 'strava' | 'dashboard' | 'stats';

interface LandingCopy {
  pageTitle: string;
  pageDesc: string;
  nav: { inside: string; install: string; pricing: string; signIn: string };
  hero: {
    note: string;
    lines: string[];
    lastLine: string;
    accent: string;
    lead: string;
    cta: string;
    seeInside: string;
    shotNote: string;
  };
  marquee: string;
  inside: { eyebrow: string; title: string; screenshot: string; screenAlt: (m: string) => string };
  modules: Record<ModuleId, ModuleCopy>;
  timeline: { eyebrow: string; title: string; body: string; note: string; alt: string };
  pwa: {
    eyebrow: string;
    title: string;
    titleMuted: string;
    body: string;
    steps: string[];
    platforms: string;
  };
  pricing: {
    eyebrow: string;
    title: string;
    accent: string;
    note: string;
    features: string[];
    cta: string;
    faq: { q: string; a: string }[];
  };
  closing: { title: string; cta: string; footer: string; privacy: string; terms: string };
}

const en: LandingCopy = {
  pageTitle: 'Lift4Me — training, nutrition & body tracking',
  pageDesc:
    'A gym log, a food diary and a body tracker in one free, installable web app — with your Strava activities next to your workouts.',
  nav: { inside: 'What’s inside', install: 'Install', pricing: 'Pricing', signIn: 'Sign in' },
  hero: {
    note: 'free · no app store · works offline',
    lines: ['Log the lift.', 'Eat the plan.'],
    lastLine: 'Watch the',
    accent: 'trend.',
    lead: 'Your gym log, food diary and body tracker in one place — with Strava runs on the same calendar as your squats. Built for one hand, between sets.',
    cta: 'Start free',
    seeInside: 'See what’s inside',
    shotNote: 'your whole day, one screen',
  },
  marquee: 'eat sleep lift repeat',
  inside: {
    eyebrow: 'What’s inside',
    title: 'Six modules, zero setup',
    screenshot: 'Screenshot placeholder',
    screenAlt: (m) => `${m} screen`,
  },
  modules: {
    training: {
      title: 'Training',
      desc: 'Log every set the way you think about it — weight, reps and how many you had left. Your session saves itself as you go.',
      chips: ['weight × reps × RIR', 'top sets', 'auto-save'],
      details: [
        'Start from your plan or just start lifting',
        'Copy last time’s numbers in one tap',
        'Swap an exercise mid-session — history stays right',
      ],
      caption: 'Every set, logged with one hand.',
    },
    nutrition: {
      title: 'Nutrition',
      desc: 'Five meals a day, your own foods and recipes, and a running tally against your calorie and macro targets.',
      chips: ['barcode scan', 'recipes', 'AI photo estimate'],
      details: [
        'Scan a barcode or pick from the catalog',
        'Snap a plate — AI estimates the macros',
        'Change targets anytime; past days stay as they were',
      ],
      caption: 'A food diary that does the maths.',
    },
    body: {
      title: 'Body',
      desc: 'Weigh in, add body fat or tape measurements if you like, and read the trend — not the daily noise.',
      chips: ['7- & 30-day averages', 'body fat', 'measurements'],
      details: [
        'Rolling averages smooth out the salty days',
        'Optional biceps, chest, waist, hip and thigh',
        'One entry per day — save again to update it',
      ],
      caption: 'The trend, not the noise.',
    },
    strava: {
      title: 'Strava',
      desc: 'Connect once and your runs and rides land on the same calendar as your lifting.',
      chips: ['one-tap import', 'route maps', 'weekly volume'],
      details: [
        'Sign in with Strava — no copy-pasting',
        'Distance, pace and elevation for every activity',
        'Cardio and strength, one timeline',
      ],
      caption: 'Cardio right next to your lifts.',
    },
    dashboard: {
      title: 'Dashboard',
      desc: 'Today at a glance: calories left, the next session, your weight trend and the last workout.',
      chips: ['kcal left today', 'next session', 'weight trend'],
      details: [
        'Start the planned session straight from home',
        'See how much is left to eat today',
        '90 days of weight in one small chart',
      ],
      caption: 'Your day, before your coffee cools.',
    },
    stats: {
      title: 'Stats',
      desc: 'Pick any exercise and watch the top set climb. Proof the plan works — or a nudge to change it.',
      chips: ['top set', 'progress per exercise', 'session ratings'],
      details: [
        'Top set and working sets over any period',
        'Personal bests, dated',
        'How your sessions felt, month by month',
      ],
      caption: 'Proof the work is working.',
    },
  },
  timeline: {
    eyebrow: 'plan ahead',
    title: 'Plan the week. Start with one tap.',
    body: 'Put any workout on any day of the calendar. When it’s time, open the day and hit Start — the exercises, sets and rep targets are already waiting.',
    note: 'tap a day, hit start',
    alt: 'A planned Lift4Me session with its exercises and a Start button',
  },
  pwa: {
    eyebrow: 'no app store',
    title: 'Install it like an app.',
    titleMuted: 'Skip the store.',
    body: 'Lift4Me is a Progressive Web App: add it to your home screen straight from the browser. It runs full-screen, works offline in the gym basement and syncs the moment you’re back online.',
    steps: [
      'Open Lift4Me in your phone’s browser.',
      'Tap Share → “Add to Home Screen”.',
      'Launch it full-screen — even with no signal.',
    ],
    platforms: 'iPhone, Android and desktop',
  },
  pricing: {
    eyebrow: 'pricing',
    title: 'Free.',
    accent: 'For now.',
    note: 'Lift4Me is free while it’s small. If it grows, a small fee may help cover servers and upkeep — you’ll hear about it well in advance, never by surprise.',
    features: [
      'Every module — training, nutrition, body, stats',
      'No limits on workouts, foods or history',
      'Strava import included',
      'Installs as an app, works offline',
    ],
    cta: 'Create your account',
    faq: [
      {
        q: 'Is it really free?',
        a: 'Right now, yes — no trial clock, no card, no locked charts. If the user base grows, a small fee may come to keep the servers running; you’ll be told well in advance.',
      },
      {
        q: 'Does it work without internet?',
        a: 'Yes — log meals and finish workouts offline; everything syncs when you’re back online.',
      },
      {
        q: 'iPhone or Android?',
        a: 'Both — it installs from the browser on either, and has a full layout for desktop too.',
      },
      {
        q: 'Do I need Strava?',
        a: 'No. Strava is optional — connect it if you want your runs and rides next to your lifts.',
      },
    ],
  },
  closing: {
    title: 'Your next set starts here.',
    cta: 'Start free',
    footer: '© 2026 Lift4Me · made for lifters, by a lifter',
    privacy: 'Privacy',
    terms: 'Terms',
  },
};

const pl: LandingCopy = {
  pageTitle: 'Lift4Me — trening, odżywianie i sylwetka',
  pageDesc:
    'Dziennik treningów, dziennik jedzenia i pomiary ciała w jednej darmowej aplikacji webowej do zainstalowania — z aktywnościami ze Stravy obok treningów.',
  nav: { inside: 'Co w środku', install: 'Instalacja', pricing: 'Cennik', signIn: 'Zaloguj się' },
  hero: {
    note: 'za darmo · bez sklepu · działa offline',
    lines: ['Trenuj.', 'Jedz z planem.'],
    lastLine: 'Patrz na',
    accent: 'trend.',
    lead: 'Dziennik treningów, dziennik jedzenia i pomiary ciała w jednym miejscu — z bieganiem ze Stravy w tym samym kalendarzu co przysiady. Zrobione pod jedną rękę, między seriami.',
    cta: 'Zacznij za darmo',
    seeInside: 'Zobacz, co w środku',
    shotNote: 'cały dzień na jednym ekranie',
  },
  marquee: 'jedz śpij trenuj powtórz',
  inside: {
    eyebrow: 'Co w środku',
    title: 'Sześć modułów, zero konfiguracji',
    screenshot: 'Miejsce na zrzut ekranu',
    screenAlt: (m) => `Ekran: ${m}`,
  },
  modules: {
    training: {
      title: 'Trening',
      desc: 'Zapisuj serie tak, jak o nich myślisz — ciężar, powtórzenia i ile zostało w zapasie. Trening zapisuje się sam, na bieżąco.',
      chips: ['ciężar × powt. × RIR', 'top sety', 'auto-zapis'],
      details: [
        'Zacznij z planu albo po prostu zacznij',
        'Wyniki z poprzedniego razu jednym stuknięciem',
        'Zamiana ćwiczenia w trakcie — historia się zgadza',
      ],
      caption: 'Każda seria, zapisana jedną ręką.',
    },
    nutrition: {
      title: 'Odżywianie',
      desc: 'Pięć posiłków dziennie, własne produkty i przepisy oraz bieżący bilans względem celu kalorii i makro.',
      chips: ['skaner kodów', 'przepisy', 'makro ze zdjęcia (AI)'],
      details: [
        'Zeskanuj kod albo wybierz z katalogu',
        'Zrób zdjęcie talerza — AI oszacuje makro',
        'Zmień cel kiedy chcesz; dawne dni zostają bez zmian',
      ],
      caption: 'Dziennik jedzenia, który liczy za Ciebie.',
    },
    body: {
      title: 'Sylwetka',
      desc: 'Zważ się, dodaj tkankę tłuszczową albo obwody i patrz na trend — nie na dzienny szum.',
      chips: ['średnie 7 i 30 dni', 'tkanka tłuszczowa', 'obwody'],
      details: [
        'Średnie kroczące wygładzają słone wieczory',
        'Opcjonalnie biceps, klatka, talia, biodra i udo',
        'Jeden wpis dziennie — kolejny zapis go aktualizuje',
      ],
      caption: 'Trend, nie szum.',
    },
    strava: {
      title: 'Strava',
      desc: 'Połącz raz, a bieganie i rower trafią do tego samego kalendarza co siłownia.',
      chips: ['import jednym stuknięciem', 'mapy tras', 'tygodniowy kilometraż'],
      details: [
        'Logowanie przez Stravę — bez przepisywania',
        'Dystans, tempo i przewyższenie każdej aktywności',
        'Cardio i siła na jednej osi czasu',
      ],
      caption: 'Cardio tuż obok siłowni.',
    },
    dashboard: {
      title: 'Pulpit',
      desc: 'Dzisiejszy dzień w jednym rzucie oka: ile kalorii zostało, następny trening, trend wagi i ostatnia sesja.',
      chips: ['ile kcal zostało', 'następny trening', 'trend wagi'],
      details: [
        'Zacznij zaplanowany trening prosto ze startu',
        'Zobacz, ile jeszcze możesz dziś zjeść',
        '90 dni wagi na jednym małym wykresie',
      ],
      caption: 'Twój dzień, zanim wystygnie kawa.',
    },
    stats: {
      title: 'Statystyki',
      desc: 'Wybierz ćwiczenie i patrz, jak rośnie top set. Dowód, że plan działa — albo sygnał, żeby go zmienić.',
      chips: ['top set', 'postęp w ćwiczeniu', 'oceny treningów'],
      details: [
        'Top set i serie robocze w dowolnym okresie',
        'Rekordy z datą',
        'Jak oceniałeś treningi, miesiąc po miesiącu',
      ],
      caption: 'Dowód, że praca działa.',
    },
  },
  timeline: {
    eyebrow: 'zaplanuj',
    title: 'Zaplanuj tydzień. Zacznij jednym stuknięciem.',
    body: 'Wstaw dowolny trening na dowolny dzień w kalendarzu. Gdy przyjdzie pora, otwórz dzień i stuknij Start — ćwiczenia, serie i zakresy powtórzeń już czekają.',
    note: 'stuknij dzień, zacznij trening',
    alt: 'Zaplanowany trening w Lift4Me z listą ćwiczeń i przyciskiem Start',
  },
  pwa: {
    eyebrow: 'bez sklepu z aplikacjami',
    title: 'Zainstaluj jak aplikację.',
    titleMuted: 'Bez sklepu.',
    body: 'Lift4Me to Progressive Web App: dodajesz ją do ekranu głównego prosto z przeglądarki. Działa na pełnym ekranie, offline w piwnicznej siłowni i synchronizuje się, gdy tylko wrócisz do sieci.',
    steps: [
      'Otwórz Lift4Me w przeglądarce telefonu.',
      'Stuknij Udostępnij → „Do ekranu głównego”.',
      'Uruchamiaj na pełnym ekranie — nawet bez zasięgu.',
    ],
    platforms: 'iPhone, Android i komputer',
  },
  pricing: {
    eyebrow: 'cennik',
    title: 'Za darmo.',
    accent: 'Na razie.',
    note: 'Lift4Me jest darmowe, dopóki jest małe. Jeśli urośnie, może pojawić się niewielka opłata na serwery i utrzymanie — dowiesz się o tym z dużym wyprzedzeniem, nigdy z zaskoczenia.',
    features: [
      'Wszystkie moduły — trening, odżywianie, sylwetka, statystyki',
      'Bez limitów treningów, produktów i historii',
      'Import ze Stravy w zestawie',
      'Instaluje się jak aplikacja, działa offline',
    ],
    cta: 'Załóż konto',
    faq: [
      {
        q: 'Naprawdę za darmo?',
        a: 'Na razie tak — bez okresu próbnego, bez karty, bez zablokowanych wykresów. Jeśli użytkowników przybędzie, może pojawić się niewielka opłata na utrzymanie serwerów; dowiesz się o tym z wyprzedzeniem.',
      },
      {
        q: 'Działa bez internetu?',
        a: 'Tak — dodawaj posiłki i kończ treningi offline; wszystko zsynchronizuje się po powrocie do sieci.',
      },
      {
        q: 'iPhone czy Android?',
        a: 'Oba — instaluje się z przeglądarki na każdym, a na komputerze ma pełny układ.',
      },
      {
        q: 'Czy potrzebuję Stravy?',
        a: 'Nie. Strava jest opcjonalna — podłącz ją, jeśli chcesz mieć bieganie i rower obok siłowni.',
      },
    ],
  },
  closing: {
    title: 'Twoja następna seria zaczyna się tutaj.',
    cta: 'Zacznij za darmo',
    footer: '© 2026 Lift4Me · zrobione dla trenujących, przez trenującego',
    privacy: 'Prywatność',
    terms: 'Regulamin',
  },
};

export const useLandingTranslation = createFeatureTranslation<LandingCopy>({ en, pl });
