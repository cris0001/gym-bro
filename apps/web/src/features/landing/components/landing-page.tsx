import { Link } from '@tanstack/react-router';
import {
  Activity,
  ArrowRight,
  BarChart3,
  Check,
  Dumbbell,
  LayoutDashboard,
  Scale,
  Smartphone,
  Utensils,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { BrandMark } from '@/components/brand-mark';

// What the app actually does, one card per module — kept factual so the landing
// mirrors the real feature set (training, nutrition, body, Strava, dashboard, stats).
const FEATURES: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Dumbbell,
    title: 'Training',
    body: 'Build plans and day templates, schedule them on a calendar, then log every set — weight × reps × RIR, top sets, exercise swaps — in a one-handed workout view that autosaves as you go.',
  },
  {
    icon: Utensils,
    title: 'Nutrition',
    body: 'A daily diary split into meals, with your own foods and recipes (macros per 100 g), barcode scanning, and live progress against your calorie and macro targets.',
  },
  {
    icon: Scale,
    title: 'Body',
    body: 'Track weight and body-fat — plus optional tape measurements — and watch the trend with 7- and 30-day moving averages.',
  },
  {
    icon: Activity,
    title: 'Strava',
    body: 'Connect Strava to pull your rides and runs in automatically, shown right next to your workouts on the calendar.',
  },
  {
    icon: LayoutDashboard,
    title: 'Dashboard',
    body: "Today's calories, your next planned session, latest weight and last workout — the whole picture on one home screen.",
  },
  {
    icon: BarChart3,
    title: 'Stats',
    body: 'Per-exercise progress (max weight and total volume over time) and your workout-rating trend, charted.',
  },
];

function FeatureCard({ icon: Icon, title, body }: (typeof FEATURES)[number]) {
  return (
    <div className="bg-card flex flex-col gap-2 rounded-2xl border p-5">
      <span className="bg-accent text-primary flex size-10 items-center justify-center rounded-xl">
        <Icon className="size-5" />
      </span>
      <h3 className="font-heading text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{body}</p>
    </div>
  );
}

// The public marketing page shown before sign-in: what the app is, that it installs
// as a PWA, and a two-card pricing block (free with no time limit; a struck-through
// "maybe later" paid tier). All copy is English (app is English-only).
export function LandingPage() {
  return (
    <div className="bg-background text-foreground min-h-dvh">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-4">
        <span className="flex items-center gap-2">
          <BrandMark className="size-8" />
          <span className="font-heading text-lg font-semibold">Gym Bro</span>
        </span>
        <nav className="flex items-center gap-2">
          <Link
            to="/login"
            className="text-muted-foreground hover:text-foreground inline-flex h-9 items-center rounded-full px-4 text-sm font-medium"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="bg-primary text-primary-foreground hover:bg-primary/80 inline-flex h-9 items-center rounded-full px-4 text-sm font-medium"
          >
            Get started
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto flex w-full max-w-5xl flex-col items-center gap-5 px-4 pt-10 pb-14 text-center md:pt-16">
        <span className="bg-accent text-accent-foreground inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold">
          <Smartphone className="size-3.5" />
          Installable web app · works offline
        </span>
        <h1 className="font-heading max-w-2xl text-4xl leading-tight font-medium md:text-6xl">
          Your training, nutrition, and body — in one place.
        </h1>
        <p className="text-muted-foreground max-w-xl text-base md:text-lg">
          Gym Bro is a personal fitness tracker: log workouts at the gym, track macros on the go,
          and watch your progress over time. Built for daily use on your phone.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/register"
            className="bg-primary text-primary-foreground hover:bg-primary/80 inline-flex h-12 items-center gap-2 rounded-full px-6 text-base font-semibold"
          >
            Create your account
            <ArrowRight className="size-4" />
          </Link>
          <Link
            to="/login"
            className="bg-accent text-primary hover:bg-accent/70 inline-flex h-12 items-center rounded-full px-6 text-base font-semibold"
          >
            Log in
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto w-full max-w-5xl px-4 pb-14">
        <h2 className="font-heading mb-6 text-center text-2xl font-semibold md:text-3xl">
          What&apos;s inside
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>

      {/* PWA */}
      <section className="mx-auto w-full max-w-5xl px-4 pb-14">
        <div className="bg-card flex flex-col items-center gap-4 rounded-2xl border p-8 text-center">
          <span className="bg-accent text-primary flex size-12 items-center justify-center rounded-2xl">
            <Smartphone className="size-6" />
          </span>
          <h2 className="font-heading text-2xl font-semibold md:text-3xl">
            Install it like an app
          </h2>
          <p className="text-muted-foreground max-w-xl text-sm md:text-base">
            Gym Bro is a Progressive Web App. Add it to your home screen straight from the browser —
            no app store needed — and it opens full-screen like a native app, with the interface
            available even offline. Your data always syncs when you&apos;re back online.
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section className="mx-auto w-full max-w-4xl px-4 pb-16">
        <h2 className="font-heading mb-2 text-center text-2xl font-semibold md:text-3xl">
          Simple pricing
        </h2>
        <p className="text-muted-foreground mb-6 text-center text-sm">
          Everything is free right now — for an unlimited time.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Free — the live plan */}
          <div className="bg-card ring-primary/30 flex flex-col gap-4 rounded-2xl border p-6 ring-1">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-xl font-semibold">Free</h3>
              <span className="bg-accent text-accent-foreground rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-[0.06em] uppercase">
                Current
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-heading text-4xl font-semibold">$0</span>
              <span className="text-muted-foreground text-sm">/ no time limit</span>
            </div>
            <ul className="flex flex-col gap-2 text-sm">
              {[
                'Every feature included',
                'Unlimited workouts, foods & measurements',
                'Strava integration',
                'Install as a PWA',
              ].map((line) => (
                <li key={line} className="flex items-center gap-2">
                  <Check className="text-primary size-4 shrink-0" />
                  {line}
                </li>
              ))}
            </ul>
            <Link
              to="/register"
              className="bg-primary text-primary-foreground hover:bg-primary/80 mt-2 inline-flex h-11 items-center justify-center gap-2 rounded-full text-sm font-semibold"
            >
              Get started free
              <ArrowRight className="size-4" />
            </Link>
          </div>

          {/* A possible future paid tier — struck through, no price. */}
          <div className="border-border/70 flex flex-col gap-4 rounded-2xl border border-dashed bg-transparent p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-muted-foreground text-xl font-semibold line-through">
                Pro
              </h3>
              <span className="text-muted-foreground/70 rounded-full border px-2.5 py-0.5 text-[11px] font-bold tracking-[0.06em] uppercase">
                Someday
              </span>
            </div>
            <p className="text-muted-foreground text-sm">
              A paid tier <span className="italic">might</span> arrive in the future with extra
              bells and whistles. Nothing to buy today — and everything you see now stays free.
            </p>
            <span
              aria-disabled
              className="border-border text-muted-foreground/70 mt-auto inline-flex h-11 cursor-not-allowed items-center justify-center rounded-full border text-sm font-semibold"
            >
              Not available yet
            </span>
          </div>
        </div>
      </section>

      <footer className="text-muted-foreground border-t px-4 py-6 text-center text-xs">
        Gym Bro — a personal fitness tracker.
      </footer>
    </div>
  );
}
