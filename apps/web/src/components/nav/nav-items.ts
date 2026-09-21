import {
  Activity,
  Apple,
  CalendarDays,
  ChefHat,
  ClipboardList,
  Dumbbell,
  LayoutDashboard,
  ListChecks,
  Scale,
  Tag,
  Target,
  TrendingUp,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react';

import type { NavKey } from '@/lib/i18n/messages';

// Param-free top-level routes, so a single union types the nav config and keeps
// TanStack Router's <Link to> fully type-checked.
export type NavPath =
  | '/dashboard'
  | '/calendar'
  | '/session'
  | '/stats'
  | '/diary'
  | '/body'
  | '/strava'
  | '/plans'
  | '/exercises'
  | '/tags'
  | '/foods'
  | '/recipes'
  | '/targets';

export interface NavLink {
  to: NavPath;
  // Key into the i18n `nav` namespace; the label text is resolved at render time.
  labelKey: NavKey;
  icon: LucideIcon;
}

// A top-level section: a main destination (where the category lands) plus an
// optional submenu of related pages. On desktop the children list under the
// section; on mobile the children show as a sub-tab strip on the section's pages.
export interface NavSection extends NavLink {
  // Match only the exact path (for '/', which would otherwise match everything).
  exact?: boolean;
  // Brand accent for a third-party section (Strava → its orange), so the nav entry
  // reads as that integration's button.
  brand?: 'strava';
  children: NavLink[];
}

// Four buckets. Each section's `to` is its main view (clicking the category lands
// there); `children` are the rest of that area. (History sits under Training for
// now; it folds into the Calendar view in a later step.)
export const NAV_SECTIONS: NavSection[] = [
  { to: '/dashboard', labelKey: 'home', icon: LayoutDashboard, exact: true, children: [] },
  {
    to: '/calendar',
    labelKey: 'training',
    icon: Dumbbell,
    children: [
      { to: '/calendar', labelKey: 'calendar', icon: CalendarDays },
      { to: '/stats', labelKey: 'stats', icon: TrendingUp },
      { to: '/plans', labelKey: 'plans', icon: ClipboardList },
      { to: '/exercises', labelKey: 'exercises', icon: ListChecks },
      { to: '/tags', labelKey: 'tags', icon: Tag },
    ],
  },
  {
    to: '/diary',
    labelKey: 'food',
    icon: UtensilsCrossed,
    children: [
      { to: '/diary', labelKey: 'diary', icon: UtensilsCrossed },
      { to: '/foods', labelKey: 'foods', icon: Apple },
      { to: '/recipes', labelKey: 'recipes', icon: ChefHat },
      { to: '/targets', labelKey: 'targets', icon: Target },
    ],
  },
  { to: '/body', labelKey: 'body', icon: Scale, children: [] },
  { to: '/strava', labelKey: 'strava', icon: Activity, brand: 'strava', children: [] },
];

// True when `pathname` is the route itself or a child route under it (e.g.
// '/plans/123' is under '/plans').
function matchesRoute(pathname: string, route: NavPath): boolean {
  return pathname === route || pathname.startsWith(`${route}/`);
}

// The section the current path belongs to (its main view or any child route),
// for highlighting the active category and choosing the sub-tab strip. Falls back
// to Home for routes outside the nav (e.g. the active /session view).
export function findActiveSection(pathname: string): NavSection {
  const match = NAV_SECTIONS.find((section) =>
    [section.to, ...section.children.map((child) => child.to)].some((route) =>
      matchesRoute(pathname, route),
    ),
  );
  return match ?? NAV_SECTIONS[0]!;
}
