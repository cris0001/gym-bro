import {
  Apple,
  CalendarDays,
  ClipboardList,
  Dumbbell,
  History,
  LayoutDashboard,
  ListChecks,
  Tag,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';

// Param-free top-level routes, so a single union types the shared nav config and
// keeps TanStack Router's <Link to> fully type-checked.
export type NavPath =
  | '/'
  | '/calendar'
  | '/session'
  | '/history'
  | '/stats'
  | '/plans'
  | '/exercises'
  | '/tags'
  | '/foods';

export interface NavItem {
  to: NavPath;
  label: string;
  icon: LucideIcon;
  // Match only the exact path (for '/', which would otherwise match everything).
  exact?: boolean;
}

// Daily-use destinations — shown in the mobile bottom bar and the sidebar's top
// section.
export const PRIMARY_NAV: NavItem[] = [
  { to: '/', label: 'Home', icon: LayoutDashboard, exact: true },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/session', label: 'Workout', icon: Dumbbell },
  { to: '/history', label: 'History', icon: History },
  { to: '/stats', label: 'Stats', icon: TrendingUp },
];

// Setup/library destinations, used infrequently — grouped under "Library" in the
// sidebar and behind "More" on mobile.
export const LIBRARY_NAV: NavItem[] = [
  { to: '/plans', label: 'Plans', icon: ClipboardList },
  { to: '/exercises', label: 'Exercises', icon: ListChecks },
  { to: '/tags', label: 'Tags', icon: Tag },
  { to: '/foods', label: 'Foods', icon: Apple },
];
