import { createFeatureTranslation } from '@/lib/i18n/create-translation';

// Billing / paywall copy. English is the source shape.
export const useBillingTranslation = createFeatureTranslation({
  en: {
    title: 'Your access has expired',
    body: 'Your licence has ended. Renew to get back to your training, nutrition and body tracking — your data is safe and waiting.',
    expiredOn: (date: string) => `Expired on ${date}`,
    renew: 'Renew access',
    signOut: 'Sign out',
  },
  pl: {
    title: 'Twój dostęp wygasł',
    body: 'Twoja licencja się skończyła. Odnów dostęp, aby wrócić do treningów, diety i pomiarów — Twoje dane są bezpieczne i czekają.',
    expiredOn: (date: string) => `Wygasła ${date}`,
    renew: 'Odnów dostęp',
    signOut: 'Wyloguj',
  },
});
