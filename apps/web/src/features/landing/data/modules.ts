import { Dumbbell, Home, Scale, TrendingUp, Utensils, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// One module in the "What's inside" master–detail showcase. `color`/`iconFg` paint the
// solid icon tile; `screenshot` points at /public/landing/<id>.png once real captures
// are dropped in — until then the panel renders a colored placeholder.
export interface LandingModule {
  id: string;
  title: string;
  icon: LucideIcon;
  color: string;
  iconFg: string;
  desc: string;
  chips: string[];
  caption: string;
  screenshot?: string;
}

export const LANDING_MODULES: LandingModule[] = [
  {
    id: 'training',
    title: 'Training',
    icon: Dumbbell,
    color: '#8d4a5e',
    iconFg: '#fdf6f5',
    desc: 'Plans and day templates, a training calendar, and set logging the way lifters think: weight × reps × RIR, top sets, exercise swaps. Everything auto-saves as you go.',
    chips: ['weight × reps × RIR', 'top sets', 'exercise swap', 'auto-save'],
    caption: 'Training — log every set, one-handed.',
  },
  {
    id: 'nutrition',
    title: 'Nutrition',
    icon: Utensils,
    color: '#d9a441',
    iconFg: '#2b2126',
    desc: 'A daily diary split into meals. Your own foods and recipes with macros per 100 g, barcode scanning, and live progress against your kcal and macro targets.',
    chips: ['macros / 100 g', 'barcode scan', 'recipes', 'kcal targets'],
    caption: 'Nutrition — a diary that counts your macros.',
  },
  {
    id: 'body',
    title: 'Body',
    icon: Scale,
    color: '#5a7a52',
    iconFg: '#fdf6f5',
    desc: 'Weight and body-fat logs — plus optional measurements — with 7- and 30-day rolling averages, so one salty dinner never hides the real trend.',
    chips: ['7-day avg', '30-day avg', 'body-fat', 'measurements'],
    caption: 'Body — watch the trend, not the noise.',
  },
  {
    id: 'strava',
    title: 'Strava',
    icon: Zap,
    color: '#d15b28',
    iconFg: '#fff7f0',
    desc: 'Connect once and your runs and rides import automatically, landing in the same calendar as your gym sessions. Cardio and lifting, one timeline.',
    chips: ['auto-import', 'one calendar', 'ride & run stats'],
    caption: 'Strava — cardio next to your lifts.',
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: Home,
    color: '#c98fa0',
    iconFg: '#2b2126',
    desc: "Today's kcal, your next planned session, latest weight and last workout — one screen that answers “where am I at?” before your coffee cools.",
    chips: ["today's kcal", 'next session', 'latest weight'],
    caption: 'Dashboard — your day at a glance.',
  },
  {
    id: 'stats',
    title: 'Stats',
    icon: TrendingUp,
    color: '#2b2126',
    iconFg: '#f0e7ea',
    desc: 'Per-exercise progress — top weight and volume over time — plus the trend of your session ratings. Proof the plan is working, or a nudge to change it.',
    chips: ['top weight', 'volume', 'session ratings'],
    caption: 'Stats — proof the work is working.',
  },
];
