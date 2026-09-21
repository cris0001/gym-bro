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
import { LanguageToggle } from '@/components/language-toggle';
import { useTranslation } from '@/lib/i18n/use-translation';

// Icons for the feature cards, zipped by index with the translated copy in messages.ts.
const FEATURE_ICONS: LucideIcon[] = [
  Dumbbell,
  Utensils,
  Scale,
  Activity,
  LayoutDashboard,
  BarChart3,
];

function FeatureCard({
  icon: Icon,
  title,
  body,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
}) {
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
// "maybe later" paid tier). Copy is translated via the UI language store.
export function LandingPage() {
  const { t } = useTranslation();

  return (
    <div className="bg-background text-foreground min-h-dvh">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-4">
        <span className="flex items-center gap-2">
          <BrandMark className="size-8" />
          <span className="font-heading text-lg font-semibold">Gym Bro</span>
        </span>
        <nav className="flex items-center gap-2">
          <LanguageToggle className="mr-1" />
          <Link
            to="/login"
            className="text-muted-foreground hover:text-foreground inline-flex h-9 items-center rounded-full px-4 text-sm font-medium"
          >
            {t.nav.login}
          </Link>
          <Link
            to="/register"
            className="bg-primary text-primary-foreground hover:bg-primary/80 inline-flex h-9 items-center rounded-full px-4 text-sm font-medium"
          >
            {t.nav.getStarted}
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto flex w-full max-w-5xl flex-col items-center gap-5 px-4 pt-10 pb-14 text-center md:pt-16">
        <span className="bg-accent text-accent-foreground inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold">
          <Smartphone className="size-3.5" />
          {t.hero.badge}
        </span>
        <h1 className="font-heading max-w-2xl text-4xl leading-tight font-medium md:text-6xl">
          {t.hero.title}
        </h1>
        <p className="text-muted-foreground max-w-xl text-base md:text-lg">{t.hero.subtitle}</p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/register"
            className="bg-primary text-primary-foreground hover:bg-primary/80 inline-flex h-12 items-center gap-2 rounded-full px-6 text-base font-semibold"
          >
            {t.hero.createAccount}
            <ArrowRight className="size-4" />
          </Link>
          <Link
            to="/login"
            className="bg-accent text-primary hover:bg-accent/70 inline-flex h-12 items-center rounded-full px-6 text-base font-semibold"
          >
            {t.hero.login}
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto w-full max-w-5xl px-4 pb-14">
        <h2 className="font-heading mb-6 text-center text-2xl font-semibold md:text-3xl">
          {t.features.heading}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {t.features.items.map((item, index) => (
            <FeatureCard
              key={item.title}
              icon={FEATURE_ICONS[index] ?? Dumbbell}
              title={item.title}
              body={item.body}
            />
          ))}
        </div>
      </section>

      {/* PWA */}
      <section className="mx-auto w-full max-w-5xl px-4 pb-14">
        <div className="bg-card flex flex-col items-center gap-4 rounded-2xl border p-8 text-center">
          <span className="bg-accent text-primary flex size-12 items-center justify-center rounded-2xl">
            <Smartphone className="size-6" />
          </span>
          <h2 className="font-heading text-2xl font-semibold md:text-3xl">{t.pwa.title}</h2>
          <p className="text-muted-foreground max-w-xl text-sm md:text-base">{t.pwa.body}</p>
        </div>
      </section>

      {/* Pricing */}
      <section className="mx-auto w-full max-w-4xl px-4 pb-16">
        <h2 className="font-heading mb-2 text-center text-2xl font-semibold md:text-3xl">
          {t.pricing.heading}
        </h2>
        <p className="text-muted-foreground mb-6 text-center text-sm">{t.pricing.subtitle}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Free — the live plan */}
          <div className="bg-card ring-primary/30 flex flex-col gap-4 rounded-2xl border p-6 ring-1">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-xl font-semibold">{t.pricing.free.name}</h3>
              <span className="bg-accent text-accent-foreground rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-[0.06em] uppercase">
                {t.pricing.free.badge}
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-heading text-4xl font-semibold">{t.pricing.free.price}</span>
              <span className="text-muted-foreground text-sm">{t.pricing.free.unit}</span>
            </div>
            <ul className="flex flex-col gap-2 text-sm">
              {t.pricing.free.features.map((line) => (
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
              {t.pricing.free.cta}
              <ArrowRight className="size-4" />
            </Link>
          </div>

          {/* A possible future paid tier — struck through, no price. */}
          <div className="border-border/70 flex flex-col gap-4 rounded-2xl border border-dashed bg-transparent p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-muted-foreground text-xl font-semibold line-through">
                {t.pricing.pro.name}
              </h3>
              <span className="text-muted-foreground/70 rounded-full border px-2.5 py-0.5 text-[11px] font-bold tracking-[0.06em] uppercase">
                {t.pricing.pro.badge}
              </span>
            </div>
            <p className="text-muted-foreground text-sm">{t.pricing.pro.body}</p>
            <span
              aria-disabled
              className="border-border text-muted-foreground/70 mt-auto inline-flex h-11 cursor-not-allowed items-center justify-center rounded-full border text-sm font-semibold"
            >
              {t.pricing.pro.cta}
            </span>
          </div>
        </div>
      </section>

      <footer className="text-muted-foreground border-t px-4 py-6 text-center text-xs">
        {t.footer}
      </footer>
    </div>
  );
}
