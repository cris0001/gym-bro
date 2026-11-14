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
    features: string[];
    cta: string;
    faq: { q: string; a: string }[];
  };
  closing: { title: string; cta: string; footer: string };
}

const en: LandingCopy = {
  pageTitle: 'Lift4Me — training, nutrition & body tracking',
  pageDesc:
    'A gym log, a food diary and a body tracker in one free, installable web app — with your Strava activities next to your workouts.',
  nav: { inside: 'What’s inside', install: 'Install', pricing: 'Pricing', signIn: 'Sign in' },
  hero: {
    note: 'free · no app store · works offline',
    lines: ['Log the lift.', 'Eat the plan.', 'Watch the'],
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
      desc: 'Plans and day templates, a training calendar, and set logging the way lifters think: weight × reps × RIR, top sets, exercise swaps. Your session is kept as you go, even if you close the app.',
      chips: ['weight × reps × RIR', 'top sets', 'exercise swap', 'auto-save'],
      details: [
        'Start from a plan template or go freestyle',
        'Copy your last set — or your last session of an exercise — in a tap',
        'Finish with a 1–5 rating and your own tags',
      ],
      caption: 'Training — log every set, one-handed.',
    },
    nutrition: {
      title: 'Nutrition',
      desc: 'A daily diary split into five meals. Your own foods and recipes with macros per 100 g, a shared product catalog, barcode scanning, and live progress against your kcal and macro targets.',
      chips: ['macros / 100 g', 'barcode scan', 'recipes', 'AI photo estimate'],
      details: [
        'Five meal slots, breakfast to dinner',
        'Log by grams, servings or pieces',
        'Snap a meal and let AI estimate its macros',
        'Targets are historical — past days stay honest',
      ],
      caption: 'Nutrition — a diary that counts your macros.',
    },
    body: {
      title: 'Body',
      desc: 'Weight and body-fat logs — plus optional measurements — with 7- and 30-day rolling averages, so one salty dinner never hides the real trend.',
      chips: ['7-day avg', '30-day avg', 'body-fat', 'measurements'],
      details: [
        'Optional biceps, chest, waist, hip and thigh',
        'One entry per day — saving again updates it',
        'Charts with moving-average overlays',
      ],
      caption: 'Body — watch the trend, not the noise.',
    },
    strava: {
      title: 'Strava',
      desc: 'Connect your account and import your activities in one tap — they land in the same calendar as your gym sessions. Cardio and lifting, one timeline.',
      chips: ['one-tap import', 'one calendar', 'activity stats'],
      details: [
        'Connect with your Strava login',
        'Activities land on the same calendar',
        'Route maps with distance, time and average speed',
      ],
      caption: 'Strava — cardio next to your lifts.',
    },
    dashboard: {
      title: 'Dashboard',
      desc: 'Today’s kcal, your next planned session, latest weight and last workout — one screen that answers “where am I at?” before your coffee cools.',
      chips: ['today’s kcal', 'next session', 'latest weight'],
      details: [
        'Today’s calories against your target',
        'Your next planned session, ready to start',
        'Latest weight and last workout at a glance',
      ],
      caption: 'Dashboard — your day at a glance.',
    },
    stats: {
      title: 'Stats',
      desc: 'Per-exercise progress — your top set and working sets over time — plus a summary of how you rate your sessions. Proof the plan is working, or a nudge to change it.',
      chips: ['top set', 'working sets', 'session ratings'],
      details: [
        'Pick any exercise you have logged',
        'Weight and reps over time, top set or working sets',
        'Average rating, the 30-day trend and the 1–5 spread',
      ],
      caption: 'Stats — proof the work is working.',
    },
  },
  timeline: {
    eyebrow: 'one timeline',
    title: 'Lifting, cardio and food — on one calendar.',
    body: 'Gym sessions, runs and every day’s plan sit side by side, so you can see the whole week — and why Thursday felt heavy.',
    note: 'plan a day, tap it, start the session',
    alt: 'The Lift4Me calendar with a month of workouts',
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
    accent: 'No catch.',
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
        a: 'Yes. No trial clock, no card, no locked charts. If a paid plan ever appears, everything you use today stays free.',
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
  },
};

const pl: LandingCopy = {
  pageTitle: 'Lift4Me — trening, odżywianie i sylwetka',
  pageDesc:
    'Dziennik treningów, dziennik jedzenia i pomiary ciała w jednej darmowej aplikacji webowej do zainstalowania — z aktywnościami ze Stravy obok treningów.',
  nav: { inside: 'Co w środku', install: 'Instalacja', pricing: 'Cennik', signIn: 'Zaloguj się' },
  hero: {
    note: 'za darmo · bez sklepu · działa offline',
    lines: ['Zapisuj serie.', 'Trzymaj plan.', 'Patrz na'],
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
      desc: 'Plany i szablony dni, kalendarz treningów i zapis serii tak, jak myśli trenujący: ciężar × powtórzenia × RIR, top sety, zamiana ćwiczeń. Trening zapisuje się na bieżąco, nawet gdy zamkniesz aplikację.',
      chips: ['ciężar × powt. × RIR', 'top sety', 'zamiana ćwiczeń', 'auto-zapis'],
      details: [
        'Zacznij z szablonu planu albo trenuj na luzie',
        'Skopiuj ostatnią serię — albo ostatni trening danego ćwiczenia — jednym tapnięciem',
        'Zakończ oceną 1–5 i własnymi tagami',
      ],
      caption: 'Trening — każda seria, jedną ręką.',
    },
    nutrition: {
      title: 'Odżywianie',
      desc: 'Dziennik dnia podzielony na pięć posiłków. Własne produkty i przepisy z makro na 100 g, wspólny katalog produktów, skaner kodów kreskowych i postęp na żywo względem celu kcal i makro.',
      chips: ['makro / 100 g', 'skaner kodów', 'przepisy', 'makro ze zdjęcia (AI)'],
      details: [
        'Pięć posiłków, od śniadania do kolacji',
        'Wpisuj w gramach, porcjach albo sztukach',
        'Zrób zdjęcie posiłku, a AI oszacuje makro',
        'Cele są historyczne — dawne dni się nie zmieniają',
      ],
      caption: 'Odżywianie — dziennik, który liczy makro.',
    },
    body: {
      title: 'Sylwetka',
      desc: 'Waga i tkanka tłuszczowa — plus opcjonalne obwody — ze średnimi kroczącymi z 7 i 30 dni, żeby jedna słona kolacja nie zasłoniła prawdziwego trendu.',
      chips: ['średnia 7 dni', 'średnia 30 dni', 'tkanka tłuszczowa', 'obwody'],
      details: [
        'Opcjonalnie biceps, klatka, talia, biodra i udo',
        'Jeden wpis dziennie — kolejny zapis go aktualizuje',
        'Wykresy ze średnimi kroczącymi',
      ],
      caption: 'Sylwetka — patrz na trend, nie na szum.',
    },
    strava: {
      title: 'Strava',
      desc: 'Połącz konto i zaimportuj aktywności jednym tapnięciem — trafiają do tego samego kalendarza co treningi na siłowni. Cardio i siłownia na jednej osi czasu.',
      chips: ['import jednym tapnięciem', 'jeden kalendarz', 'statystyki aktywności'],
      details: [
        'Połączenie przez logowanie do Stravy',
        'Aktywności lądują w tym samym kalendarzu',
        'Mapy tras z dystansem, czasem i średnią prędkością',
      ],
      caption: 'Strava — cardio obok siłowni.',
    },
    dashboard: {
      title: 'Pulpit',
      desc: 'Dzisiejsze kcal, najbliższy zaplanowany trening, ostatnia waga i ostatni trening — jeden ekran, który mówi „gdzie jestem?”, zanim wystygnie kawa.',
      chips: ['dzisiejsze kcal', 'następny trening', 'ostatnia waga'],
      details: [
        'Dzisiejsze kalorie względem celu',
        'Najbliższy zaplanowany trening, gotowy do startu',
        'Ostatnia waga i ostatni trening w jednym rzucie oka',
      ],
      caption: 'Pulpit — Twój dzień w skrócie.',
    },
    stats: {
      title: 'Statystyki',
      desc: 'Postęp w każdym ćwiczeniu — top set i serie robocze w czasie — plus podsumowanie tego, jak oceniasz treningi. Dowód, że plan działa, albo sygnał, żeby go zmienić.',
      chips: ['top set', 'serie robocze', 'oceny treningów'],
      details: [
        'Wybierz dowolne zapisane ćwiczenie',
        'Ciężar i powtórzenia w czasie, top set albo serie robocze',
        'Średnia ocen, trend z 30 dni i rozkład 1–5',
      ],
      caption: 'Statystyki — dowód, że praca działa.',
    },
  },
  timeline: {
    eyebrow: 'jedna oś czasu',
    title: 'Siłownia, cardio i jedzenie — w jednym kalendarzu.',
    body: 'Treningi, bieganie i plan każdego dnia leżą obok siebie, więc widzisz cały tydzień — i wiesz, czemu czwartek był ciężki.',
    note: 'zaplanuj dzień, kliknij, zacznij trening',
    alt: 'Kalendarz Lift4Me z miesiącem treningów',
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
    accent: 'Bez haczyka.',
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
        a: 'Tak. Bez okresu próbnego, bez karty, bez zablokowanych wykresów. Jeśli kiedyś pojawi się płatny plan, wszystko, z czego korzystasz dziś, zostanie darmowe.',
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
  },
};

export const useLandingTranslation = createFeatureTranslation<LandingCopy>({ en, pl });
