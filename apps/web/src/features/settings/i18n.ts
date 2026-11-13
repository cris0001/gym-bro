import { createFeatureTranslation } from '@/lib/i18n/create-translation';

// Settings page copy. English is the source shape; pl mirrors it key-for-key.
export const useSettingsTranslation = createFeatureTranslation({
  en: {
    title: 'Settings',
    profile: 'Profile',
    profileHint: 'Used for your stats; all optional.',
    email: 'Email',
    appearance: 'Appearance',
    language: 'App language',
    theme: 'Theme',
    accent: 'Accent color',
  },
  pl: {
    title: 'Ustawienia',
    profile: 'Profil',
    profileHint: 'Używane w statystykach; wszystko opcjonalne.',
    email: 'E-mail',
    appearance: 'Wygląd',
    language: 'Język aplikacji',
    theme: 'Motyw',
    accent: 'Kolor akcentu',
  },
});
