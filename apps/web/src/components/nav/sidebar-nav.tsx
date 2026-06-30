import { Link } from '@tanstack/react-router';
import { Dumbbell } from 'lucide-react';

import { LogoutButton } from '@/features/auth';

import { NAV_SECTIONS } from './nav-items';

const sectionClass = 'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium';
const childClass = 'flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm';
const activeClass = 'bg-primary/10 text-primary';
const inactiveClass = 'text-muted-foreground hover:bg-accent hover:text-foreground';

// Desktop navigation: a fixed, branded left sidebar with the four sections — each
// lands on its main view, with its submenu nested beneath a guide rail. Hidden
// under lg, where the bottom tab bar + sub-tab strip take over.
export function SidebarNav() {
  return (
    <aside className="bg-background sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r lg:flex">
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <span className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-md">
          <Dumbbell className="size-4" />
        </span>
        <span className="text-lg font-bold">Gym Bro</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {NAV_SECTIONS.map((section) => {
          const Icon = section.icon;
          // The main view is reached via the section header, so drop it from the
          // nested children to avoid listing it twice.
          const children = section.children.filter((child) => child.to !== section.to);
          return (
            <div key={section.label} className="flex flex-col">
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
              {children.length > 0 && (
                <div className="border-border/60 my-0.5 ml-[1.15rem] flex flex-col gap-0.5 border-l pl-2.5">
                  {children.map((child) => {
                    const ChildIcon = child.icon;
                    return (
                      <Link
                        key={child.to}
                        to={child.to}
                        className={childClass}
                        activeProps={{ className: activeClass }}
                        inactiveProps={{ className: inactiveClass }}
                      >
                        <ChildIcon className="size-4" />
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="border-t p-3">
        <LogoutButton />
      </div>
    </aside>
  );
}
