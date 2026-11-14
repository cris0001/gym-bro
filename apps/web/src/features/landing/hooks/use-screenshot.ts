import { useLocaleStore } from '@/stores/locale.store';

// A demo-account screenshot in the visitor's language (public/landing/<locale>/).
export function useScreenshot(): (name: string) => string {
  const locale = useLocaleStore((s) => s.locale);
  return (name) => `/landing/${locale}/${name}.webp`;
}
