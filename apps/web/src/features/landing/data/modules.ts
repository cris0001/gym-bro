import { Dumbbell, Home, Scale, TrendingUp, Utensils, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// One module in the "What's inside" master–detail showcase: its identity and look.
// `color`/`iconFg` paint the solid icon tile; `screenshot` names the demo-account
// capture in /public/landing/<locale>/<name>.webp (none → a tinted placeholder).
// The texts live in ../i18n.ts, keyed by `id`.
export interface LandingModule {
  id: 'training' | 'nutrition' | 'body' | 'strava' | 'dashboard' | 'stats';
  icon: LucideIcon;
  color: string;
  iconFg: string;
  screenshot?: string;
  // The capture opens with a section-tab strip (gets the phone frame's top inset).
  tabbed?: boolean;
}

export const LANDING_MODULES: LandingModule[] = [
  { id: 'training', icon: Dumbbell, color: '#023e8a', iconFg: '#ffffff', screenshot: 'workout' },
  {
    id: 'nutrition',
    icon: Utensils,
    color: '#d9a441',
    iconFg: '#14181f',
    screenshot: 'diary',
    tabbed: true,
  },
  { id: 'body', icon: Scale, color: '#5a7a52', iconFg: '#ffffff', screenshot: 'body' },
  { id: 'strava', icon: Zap, color: '#e8572a', iconFg: '#ffffff' },
  { id: 'dashboard', icon: Home, color: '#7fa6ff', iconFg: '#14181f', screenshot: 'dashboard' },
  {
    id: 'stats',
    icon: TrendingUp,
    color: '#14181f',
    iconFg: '#ffffff',
    screenshot: 'stats',
    tabbed: true,
  },
];
