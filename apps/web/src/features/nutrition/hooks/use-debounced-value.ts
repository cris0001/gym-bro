import { useEffect, useState } from 'react';

// The value as of `delayMs` after it last changed — lets a search wait for a pause in
// typing instead of firing a request per keystroke.
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}
