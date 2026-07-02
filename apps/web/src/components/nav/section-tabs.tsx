import { Link, useRouterState } from '@tanstack/react-router';

import { findActiveSection } from './nav-items';

// Mobile sub-navigation: a horizontal, scrollable strip of the active section's
// pages (its main view + submenu), shown under the top bar so within-section
// navigation stays one tap away. Sections with no submenu (Home, Body) render
// nothing. Hidden on lg, where the sidebar lists everything.
export function SectionTabs() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const section = findActiveSection(pathname);

  if (section.children.length === 0) {
    return null;
  }

  return (
    <div className="bg-background/80 sticky top-14 z-10 border-b backdrop-blur lg:hidden">
      <nav className="no-scrollbar flex gap-1 overflow-x-auto px-3 py-2">
        {section.children.map((child) => (
          <Link
            key={child.to}
            to={child.to}
            className="text-muted-foreground rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap"
            activeProps={{ className: 'bg-accent text-foreground' }}
          >
            {child.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
