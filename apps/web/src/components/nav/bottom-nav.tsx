import { Link, useRouterState } from '@tanstack/react-router';

import { cn } from '@/lib/utils';

import { findActiveSection, NAV_SECTIONS } from './nav-items';

// Mobile navigation: a fixed bottom tab bar of the four sections, each landing on
// its main view. A tab is active whenever the current route belongs to that
// section (e.g. Training stays lit on /plans), so the submenu pages keep their
// category highlighted. The sub-tab strip (SectionTabs) handles within-section
// navigation. Hidden on lg, where the sidebar takes over.
export function BottomNav() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const activeSection = findActiveSection(pathname);

  return (
    <nav className="bg-card dark:bg-background fixed inset-x-0 bottom-0 z-20 flex h-14 border-t lg:hidden">
      {NAV_SECTIONS.map((section) => {
        const Icon = section.icon;
        const isActive = section.label === activeSection.label;
        // Strava reads as its own orange tab within the bar.
        const isStrava = section.brand === 'strava';
        const color = isStrava
          ? 'text-[#d15b28] dark:text-[#ff7a3d]'
          : isActive
            ? 'text-primary'
            : 'text-muted-foreground';
        return (
          <Link
            key={section.label}
            to={section.to}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium',
              color,
            )}
          >
            {/* A tint pill sits behind the icon when the tab is active. */}
            <span
              className={cn(
                'flex h-[26px] w-11 items-center justify-center rounded-[13px] transition-colors',
                isActive && (isStrava ? 'bg-[#fbe3d4] dark:bg-[#45291b]' : 'bg-accent'),
              )}
            >
              <Icon className="size-5" />
            </span>
            {section.label}
          </Link>
        );
      })}
    </nav>
  );
}
