import type { Locale } from '@/stores/locale.store';

// Static UI copy, keyed by locale. English is the source shape (Messages); every
// other locale must match it. Kept as one module for now (only the landing is
// translated); split per feature as translation coverage grows.
const en = {
  nav: { login: 'Log in', getStarted: 'Get started' },
  hero: {
    badge: 'Installable web app · works offline',
    title: 'Your training, nutrition, and body — in one place.',
    subtitle:
      'Gym Bro is a personal fitness tracker: log workouts at the gym, track macros on the go, and watch your progress over time. Built for daily use on your phone.',
    createAccount: 'Create your account',
    login: 'Log in',
  },
  features: {
    heading: "What's inside",
    items: [
      {
        title: 'Training',
        body: 'Build plans and day templates, schedule them on a calendar, then log every set — weight × reps × RIR, top sets, exercise swaps — in a one-handed workout view that autosaves as you go.',
      },
      {
        title: 'Nutrition',
        body: 'A daily diary split into meals, with your own foods and recipes (macros per 100 g), barcode scanning, and live progress against your calorie and macro targets.',
      },
      {
        title: 'Body',
        body: 'Track weight and body-fat — plus optional tape measurements — and watch the trend with 7- and 30-day moving averages.',
      },
      {
        title: 'Strava',
        body: 'Connect Strava to pull your rides and runs in automatically, shown right next to your workouts on the calendar.',
      },
      {
        title: 'Dashboard',
        body: "Today's calories, your next planned session, latest weight and last workout — the whole picture on one home screen.",
      },
      {
        title: 'Stats',
        body: 'Per-exercise progress (max weight and total volume over time) and your workout-rating trend, charted.',
      },
    ],
  },
  pwa: {
    title: 'Install it like an app',
    body: 'Gym Bro is a Progressive Web App. Add it to your home screen straight from the browser — no app store needed — and it opens full-screen like a native app, with the interface available even offline. Your data always syncs when you’re back online.',
  },
  pricing: {
    heading: 'Simple pricing',
    subtitle: 'Everything is free right now — for an unlimited time.',
    free: {
      name: 'Free',
      badge: 'Current',
      price: '$0',
      unit: '/ no time limit',
      features: [
        'Every feature included',
        'Unlimited workouts, foods & measurements',
        'Strava integration',
        'Install as a PWA',
      ],
      cta: 'Get started free',
    },
    pro: {
      name: 'Pro',
      badge: 'Someday',
      body: 'A paid tier might arrive in the future with extra bells and whistles. Nothing to buy today — and everything you see now stays free.',
      cta: 'Not available yet',
    },
  },
  footer: 'Gym Bro — a personal fitness tracker.',
};

export type Messages = typeof en;

const pl: Messages = {
  nav: { login: 'Zaloguj się', getStarted: 'Zacznij' },
  hero: {
    badge: 'Instalowalna aplikacja web · działa offline',
    title: 'Twój trening, dieta i sylwetka — w jednym miejscu.',
    subtitle:
      'Gym Bro to osobisty tracker fitness: zapisuj treningi na siłowni, licz makro w biegu i śledź postępy w czasie. Zaprojektowany do codziennego użytku na telefonie.',
    createAccount: 'Załóż konto',
    login: 'Zaloguj się',
  },
  features: {
    heading: 'Co w środku',
    items: [
      {
        title: 'Trening',
        body: 'Twórz plany i szablony dni, układaj je w kalendarzu, a potem zapisuj każdą serię — ciężar × powtórzenia × RIR, serie szczytowe, podmiany ćwiczeń — w jednoręcznym widoku treningu, który zapisuje się sam.',
      },
      {
        title: 'Dieta',
        body: 'Dzienny dziennik podzielony na posiłki, z własnymi produktami i przepisami (makro na 100 g), skanowaniem kodów kreskowych i bieżącym postępem względem celów kalorii i makro.',
      },
      {
        title: 'Sylwetka',
        body: 'Śledź wagę i poziom tłuszczu — plus opcjonalne obwody — z trendami średnich kroczących 7- i 30-dniowych.',
      },
      {
        title: 'Strava',
        body: 'Połącz Stravę, aby automatycznie pobierać przejażdżki i biegi, pokazywane obok treningów w kalendarzu.',
      },
      {
        title: 'Pulpit',
        body: 'Dzisiejsze kalorie, najbliższy zaplanowany trening, ostatnia waga i ostatni trening — całość na jednym ekranie głównym.',
      },
      {
        title: 'Statystyki',
        body: 'Postęp w ćwiczeniach (maksymalny ciężar i objętość w czasie) oraz trend ocen treningów, na wykresach.',
      },
    ],
  },
  pwa: {
    title: 'Zainstaluj jak aplikację',
    body: 'Gym Bro to Progressive Web App. Dodaj ją do ekranu głównego prosto z przeglądarki — bez sklepu z aplikacjami — a otworzy się na pełnym ekranie jak natywna aplikacja, dostępna nawet offline. Twoje dane synchronizują się, gdy wrócisz online.',
  },
  pricing: {
    heading: 'Prosty cennik',
    subtitle: 'Teraz wszystko jest za darmo — przez czas nieokreślony.',
    free: {
      name: 'Darmowy',
      badge: 'Aktualny',
      price: '0 zł',
      unit: '/ bez limitu czasu',
      features: [
        'Wszystkie funkcje w komplecie',
        'Bez limitu treningów, produktów i pomiarów',
        'Integracja ze Stravą',
        'Instalacja jako PWA',
      ],
      cta: 'Zacznij za darmo',
    },
    pro: {
      name: 'Pro',
      badge: 'Kiedyś',
      body: 'Płatny plan być może pojawi się w przyszłości z dodatkowymi bajerami. Dziś nie ma nic do kupienia — a wszystko, co widzisz teraz, zostaje za darmo.',
      cta: 'Jeszcze niedostępne',
    },
  },
  footer: 'Gym Bro — osobisty tracker fitness.',
};

export const MESSAGES: Record<Locale, Messages> = { en, pl };
