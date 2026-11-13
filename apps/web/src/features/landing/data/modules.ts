import { Dumbbell, Home, Scale, TrendingUp, Utensils, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// One module in the "What's inside" master–detail showcase: its identity and look.
// `color`/`iconFg` paint the solid icon tile; `screenshot` points at
// /public/landing/<id>.png once real captures are dropped in — until then the panel
// renders a colored placeholder. The texts live in ../i18n.ts, keyed by `id`.
export interface LandingModule {
  id: 'training' | 'nutrition' | 'body' | 'strava' | 'dashboard' | 'stats';
  icon: LucideIcon;
  color: string;
  iconFg: string;
  screenshot?: string;
}

export const LANDING_MODULES: LandingModule[] = [
  { id: 'training', icon: Dumbbell, color: '#8d4a5e', iconFg: '#fdf6f5' },
  { id: 'nutrition', icon: Utensils, color: '#d9a441', iconFg: '#2b2126' },
  { id: 'body', icon: Scale, color: '#5a7a52', iconFg: '#fdf6f5' },
  { id: 'strava', icon: Zap, color: '#d15b28', iconFg: '#fff7f0' },
  { id: 'dashboard', icon: Home, color: '#c98fa0', iconFg: '#2b2126' },
  { id: 'stats', icon: TrendingUp, color: '#2b2126', iconFg: '#f0e7ea' },
];
