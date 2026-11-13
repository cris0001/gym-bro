import { cn } from '@/lib/utils';
import type { Locale } from '@/stores/locale.store';

// Small inline flags for the language switches (EN → the UK flag, PL → the Polish
// one). Inline SVG rather than emoji: flag emoji don't render on Windows (they fall
// back to letters), and SVG keeps them crisp at 16px.
export function FlagIcon({ locale, className }: { locale: Locale; className?: string }) {
  return (
    <svg
      viewBox="0 0 30 20"
      aria-hidden
      className={cn('h-2.5 w-[15px] shrink-0 overflow-hidden rounded-[2px]', className)}
    >
      {locale === 'pl' ? (
        <>
          <rect width="30" height="10" fill="#ffffff" />
          <rect y="10" width="30" height="10" fill="#dc143c" />
          <rect width="30" height="20" fill="none" stroke="#000" strokeOpacity="0.12" />
        </>
      ) : (
        <>
          <rect width="30" height="20" fill="#012169" />
          <path d="M0 0l30 20M30 0L0 20" stroke="#fff" strokeWidth="4" />
          <path d="M0 0l30 20M30 0L0 20" stroke="#c8102e" strokeWidth="1.6" />
          <path d="M15 0v20M0 10h30" stroke="#fff" strokeWidth="6" />
          <path d="M15 0v20M0 10h30" stroke="#c8102e" strokeWidth="3.6" />
        </>
      )}
    </svg>
  );
}
