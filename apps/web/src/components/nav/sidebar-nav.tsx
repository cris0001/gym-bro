import { Link } from '@tanstack/react-router';

import { LogoutButton } from '@/features/auth';

import { NAV_SECTIONS } from './nav-items';

const sectionClass = 'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium';
const childClass = 'flex items-center gap-3 rounded-md px-3 py-1.5 text-sm';
const activeClass = 'bg-accent text-foreground font-medium';
const inactiveClass = 'text-muted-foreground hover:bg-accent/50';

// Desktop navigation: a fixed left sidebar with the four sections, each landing on
// its main view, and its submenu listed underneath. Hidden under lg, where the
// bottom tab bar + sub-tab strip take over.
export function SidebarNav() {
  return (
    <aside className="bg-background sticky top-0 hidden h-dvh w-56 shrink-0 flex-col border-r lg:flex">
      <div className="flex h-14 items-center px-4 text-lg font-bold">GM</div>

      <nav className="flex flex-1 flex-col gap-2 overflow-y-auto p-3">
        {NAV_SECTIONS.map((section) => {
          const Icon = section.icon;
          // The main view is reached via the section header, so drop it from the
          // indented children to avoid listing it twice.
          const children = section.children.filter((child) => child.to !== section.to);
          return (
            <div key={section.label} className="flex flex-col gap-0.5">
              <Link
                to={section.to}
                activeOptions={{ exact: section.exact ?? false }}
                className={sectionClass}
                activeProps={{ className: activeClass }}
                inactiveProps={{ className: inactiveClass }}
              >
                <Icon className="size-4" />
                {section.label}
              </Link>
              {children.map((child) => {
                const ChildIcon = child.icon;
                return (
                  <Link
                    key={child.to}
                    to={child.to}
                    className={`${childClass} ml-4`}
                    activeProps={{ className: activeClass }}
                    inactiveProps={{ className: inactiveClass }}
                  >
                    <ChildIcon className="size-4" />
                    {child.label}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div className="p-3">
        <LogoutButton />
      </div>
    </aside>
  );
}
