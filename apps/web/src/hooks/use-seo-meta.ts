import { useRouterState } from '@tanstack/react-router';
import { useEffect } from 'react';

const ORIGIN = 'https://lift4.me';

// The only pages meant for search results; robots.txt mirrors this list. Everything
// else (the signed-in app, login) is useless to a visitor from Google and gets noindex.
export const INDEXABLE_PATHS = ['/', '/register', '/privacy', '/terms'] as const;

function upsertTag<K extends 'meta' | 'link'>(
  tag: K,
  selector: string,
  attrs: Record<string, string>,
): void {
  let el = document.head.querySelector<HTMLElement>(selector);
  if (!el) {
    el = document.createElement(tag);
    document.head.appendChild(el);
  }
  for (const [name, value] of Object.entries(attrs)) el.setAttribute(name, value);
}

// One SPA shell serves every route, so the per-route robots directive and canonical
// URL are set at runtime (Googlebot renders JS and reads them after hydration).
export function useSeoMeta(): void {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
    const indexable = (INDEXABLE_PATHS as readonly string[]).includes(path);
    upsertTag('meta', 'meta[name="robots"]', {
      name: 'robots',
      content: indexable ? 'index, follow' : 'noindex, nofollow',
    });
    upsertTag('link', 'link[rel="canonical"]', {
      rel: 'canonical',
      href: `${ORIGIN}${path === '/' ? '/' : path}`,
    });
  }, [pathname]);
}
