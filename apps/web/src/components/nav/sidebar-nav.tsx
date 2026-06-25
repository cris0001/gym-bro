import { Link } from '@tanstack/react-router';

import { LogoutButton } from '@/features/auth';

import { LIBRARY_NAV, PRIMARY_NAV } from './nav-items';

const linkClass = 'flex items-center gap-3 rounded-md px-3 py-2 text-sm';
const activeClass = 'bg-accent text-foreground font-medium';
const inactiveClass = 'text-muted-foreground hover:bg-accent/50';

// Desktop navigation: a fixed left sidebar with the primary destinations up top
// and the less-used library grouped below. Hidden under lg, where the bottom tab
// bar takes over.
export function SidebarNav() {
  return (
    <aside className="bg-background sticky top-0 hidden h-dvh w-56 shrink-0 flex-col border-r lg:flex">
      <div className="flex h-14 items-center px-4 text-lg font-bold">GM</div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {PRIMARY_NAV.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.exact ?? false }}
              className={linkClass}
              activeProps={{ className: activeClass }}
              inactiveProps={{ className: inactiveClass }}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}

        <span className="text-muted-foreground mt-4 mb-1 px-3 text-xs font-medium uppercase">
          Library
        </span>
        {LIBRARY_NAV.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={linkClass}
              activeProps={{ className: activeClass }}
              inactiveProps={{ className: inactiveClass }}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3">
        <LogoutButton />
      </div>
    </aside>
  );
}
