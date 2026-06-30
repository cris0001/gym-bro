import {
  Apple,
  CalendarDays,
  ChefHat,
  ClipboardList,
  Dumbbell,
  History,
  LayoutDashboard,
  ListChecks,
  Scale,
  Tag,
  Target,
  TrendingUp,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react';

// Param-free top-level routes, so a single union types the nav config and keeps
// TanStack Router's <Link to> fully type-checked.
export type NavPath =
  | '/'
  | '/calendar'
  | '/session'
  | '/history'
  | '/stats'
  | '/diary'
  | '/body'
  | '/plans'
  | '/exercises'
  | '/tags'
  | '/foods'
  | '/recipes'
  | '/targets';

export interface NavLink {
  to: NavPath;
  label: string;
  icon: LucideIcon;
}

// A top-level section: a main destination (where the category lands) plus an
// optional submenu of related pages. On desktop the children list under the
// section; on mobile the children show as a sub-tab strip on the section's pages.
export interface NavSection extends NavLink {
  // Match only the exact path (for '/', which would otherwise match everything).
  exact?: boolean;
  children: NavLink[];
}

// Four buckets. Each section's `to` is its main view (clicking the category lands
// there); `children` are the rest of that area. (History sits under Training for
// now; it folds into the Calendar view in a later step.)
export const NAV_SECTIONS: NavSection[] = [
  { to: '/', label: 'Home', icon: LayoutDashboard, exact: true, children: [] },
  {
    to: '/calendar',
    label: 'Training',
    icon: Dumbbell,
    children: [
      { to: '/calendar', label: 'Calendar', icon: CalendarDays },
      { to: '/history', label: 'History', icon: History },
      { to: '/stats', label: 'Stats', icon: TrendingUp },
      { to: '/plans', label: 'Plans', icon: ClipboardList },
      { to: '/exercises', label: 'Exercises', icon: ListChecks },
      { to: '/tags', label: 'Tags', icon: Tag },
    ],
  },
  {
    to: '/diary',
    label: 'Food',
    icon: UtensilsCrossed,
    children: [
      { to: '/diary', label: 'Diary', icon: UtensilsCrossed },
      { to: '/foods', label: 'Foods', icon: Apple },
      { to: '/recipes', label: 'Recipes', icon: ChefHat },
      { to: '/targets', label: 'Targets', icon: Target },
    ],
  },
  { to: '/body', label: 'Body', icon: Scale, children: [] },
];

// True when `pathname` is the route itself or a child route under it (e.g.
// '/plans/123' is under '/plans'). '/' matches only itself.
function matchesRoute(pathname: string, route: NavPath): boolean {
  if (route === '/') return pathname === '/';
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
