import { BicepsFlexed } from 'lucide-react';

import { cn } from '@/lib/utils';

// The app's brand mark for in-app chrome (sidebar, mobile top bar, auth screens): a
// terracotta tile with the light biceps glyph — the INVERSE of the cream home-screen /
// PWA icon (public/logo.svg). Size the tile via className; the glyph scales with it.
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'bg-primary text-primary-foreground flex items-center justify-center rounded-[10px]',
        className,
      )}
    >
      <BicepsFlexed className="size-1/2" />
    </span>
  );
}
