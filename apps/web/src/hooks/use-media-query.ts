import { useEffect, useState } from 'react';

// Subscribes to a CSS media query and returns whether it currently matches.
// Used to switch between mobile and desktop presentations in JS where a CSS
// breakpoint alone isn't enough (e.g. mounting a modal vs an inline panel).
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}
