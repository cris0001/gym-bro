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
    <nav className="fixed inset-x-0 bottom-0 z-20 flex h-12 bg-sky-500 text-white lg:hidden">
      {NAV_SECTIONS.map((section) => {
        const Icon = section.icon;
        const isActive = section.label === activeSection.label;
        return (
          <Link
            key={section.label}
            to={section.to}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors',
              isActive ? 'bg-white/15 font-semibold text-white' : 'text-white/85',
            )}
          >
            <Icon className="size-5" />
            {section.label}
          </Link>
        );
      })}
    </nav>
  );
}
