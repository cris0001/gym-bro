import { useEffect } from 'react';

// The favicon (public/favicon.svg) — a white biceps on a rounded tile — with the tile
// recoloured to the live --primary (the glyph stays white), so the
// browser tab follows the chosen palette and light/dark. It re-reads the tokens
// whenever <html>'s class (dark) or data-palette changes. Browsers without SVG
// favicons (Safari) keep the static favicon.ico.
const BICEPS = (tile: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="11" fill="${tile}"/><g transform="translate(10 10) scale(1.1667)" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.409 13.017A5 5 0 0 1 22 15c0 3.866-4 7-9 7-4.077 0-8.153-.82-10.371-2.462-.426-.316-.631-.832-.62-1.362C2.118 12.723 2.627 2 10 2a3 3 0 0 1 3 3 2 2 0 0 1-2 2c-1.105 0-1.64-.444-2-1"/><path d="M15 14a5 5 0 0 0-7.584 2"/><path d="M9.964 6.825C8.019 7.977 9.5 13 8 15"/></g></svg>`;

export function useThemedFavicon() {
  useEffect(() => {
    const link = document.querySelector<HTMLLinkElement>('link#favicon');
    if (!link) return;
    const root = document.documentElement;

    const apply = () => {
      const styles = getComputedStyle(root);
      // A palette may pin its favicon colour (--favicon); otherwise use --primary.
      const tile = (
        styles.getPropertyValue('--favicon') || styles.getPropertyValue('--primary')
      ).trim();
      if (tile) link.href = `data:image/svg+xml,${encodeURIComponent(BICEPS(tile))}`;
    };

    apply();
    const observer = new MutationObserver(apply);
    observer.observe(root, { attributes: true, attributeFilter: ['class', 'data-palette'] });
    return () => observer.disconnect();
  }, []);
}
