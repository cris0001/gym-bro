import { useLayoutEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

// The source logo's 360×130 canvas has wide margins around the text, which made the
// inline wordmark look small and off-centre next to the icon tile.
const SOURCE_VIEWBOX = '0 0 360 130';
const FONT = "104px 'Caveat Brush'";

// The Lift4Me wordmark beside the BrandMark tile in the app chrome: the brand logo SVG
// (lift4me-logo-*.svg — Caveat Brush text as designed), inlined so it can follow the
// theme. "Lift"/"Me" take the text colour and the "4" the accent (--primary), so it
// tracks the chosen palette and light/dark mode. Inline (not an <img>) also lets it use
// the bundled @fontsource face — the source files pull the font from Google Fonts, which
// an <img> can't load. The viewBox is cropped to the text's measured box once the font
// is ready, so the height you give it (className) is the word's own height.
export function BrandWordmark({ className }: { className?: string }) {
  const textRef = useRef<SVGTextElement>(null);
  const [viewBox, setViewBox] = useState(SOURCE_VIEWBOX);

  useLayoutEffect(() => {
    let cancelled = false;
    const fit = () => {
      const box = textRef.current?.getBBox();
      if (cancelled || !box || box.width === 0) return;
      setViewBox(`${box.x} ${box.y} ${box.width} ${box.height}`);
    };
    fit();
    // Measure again once Caveat Brush has loaded — the fallback face is a different width.
    void document.fonts.load(FONT).then(fit, fit);
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <svg
      viewBox={viewBox}
      role="img"
      aria-label="Lift4Me"
      className={cn('text-foreground h-8 w-auto shrink-0 overflow-visible', className)}
    >
      <text
        ref={textRef}
        x="180"
        y="94"
        textAnchor="middle"
        fill="currentColor"
        fontFamily="'Caveat Brush', cursive"
        fontSize="104"
      >
        Lift<tspan fill="var(--primary)">4</tspan>Me
      </text>
    </svg>
  );
}
