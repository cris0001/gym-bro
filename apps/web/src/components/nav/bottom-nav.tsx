import { Link } from '@tanstack/react-router';
import { Menu } from 'lucide-react';
import { useState } from 'react';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

import { LIBRARY_NAV, PRIMARY_NAV } from './nav-items';

// Mobile navigation: a fixed bottom tab bar of the primary destinations plus a
// "More" tab that opens the library in a bottom sheet. Hidden on lg, where the
// sidebar takes over.
export function BottomNav() {
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      <nav className="bg-background fixed inset-x-0 bottom-0 z-20 flex border-t lg:hidden">
        {PRIMARY_NAV.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.exact ?? false }}
              className="flex flex-1 flex-col items-center gap-0.5 py-2 text-xs"
              activeProps={{ className: 'text-primary' }}
              inactiveProps={{ className: 'text-muted-foreground' }}
            >
              <Icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          className="text-muted-foreground flex flex-1 flex-col items-center gap-0.5 py-2 text-xs"
        >
          <Menu className="size-5" />
          More
        </button>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>Library</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-1 p-4">
            {LIBRARY_NAV.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMoreOpen(false)}
                  className="hover:bg-accent flex min-h-11 items-center gap-3 rounded-md px-3 text-sm"
                >
                  <Icon className="size-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
