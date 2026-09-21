import { useLocaleStore } from '@/stores/locale.store';
import type { Locale } from '@/stores/locale.store';

// Builds a feature-scoped translation hook from a per-locale dictionary. Each feature
// owns its own strings (features/<name>/i18n.ts) so the copy lives next to the code
// that uses it and namespaces never collide. English is the source shape; every other
// locale must match it. The active locale comes from the shared locale store.
export function createFeatureTranslation<T>(dict: Record<Locale, T>): () => T {
  return function useFeatureTranslation(): T {
    const locale = useLocaleStore((s) => s.locale);
    return dict[locale];
  };
}
