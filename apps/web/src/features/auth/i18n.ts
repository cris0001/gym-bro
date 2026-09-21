import { createFeatureTranslation } from '@/lib/i18n/create-translation';

// Auth feature copy (login, register, onboarding). English is the source shape.
export const useAuthTranslation = createFeatureTranslation({
  en: {
    email: 'Email',
    password: 'Password',
    login: {
      signIn: 'Sign in',
      signingIn: 'Signing in…',
      noAccount: 'No account?',
      createOne: 'Create one',
    },
    register: {
      createAccount: 'Create account',
      creating: 'Creating account…',
      haveAccount: 'Already have an account?',
      signIn: 'Sign in',
    },
    onboarding: {
      title: 'Welcome! Set up your profile',
      subtitle: 'All optional — you can change these later in Settings.',
      birthdate: 'Birthdate',
      sex: 'Sex',
      male: 'Male',
      female: 'Female',
      height: 'Height (cm)',
      heightPlaceholder: 'e.g. 180',
      save: 'Save',
      saving: 'Saving…',
      skip: 'Skip for now',
    },
  },
  pl: {
    email: 'E-mail',
    password: 'Hasło',
    login: {
      signIn: 'Zaloguj się',
      signingIn: 'Logowanie…',
      noAccount: 'Nie masz konta?',
      createOne: 'Załóż je',
    },
    register: {
      createAccount: 'Załóż konto',
      creating: 'Tworzenie konta…',
      haveAccount: 'Masz już konto?',
      signIn: 'Zaloguj się',
    },
    onboarding: {
      title: 'Witaj! Uzupełnij profil',
      subtitle: 'Wszystko opcjonalne — zmienisz to później w Ustawieniach.',
      birthdate: 'Data urodzenia',
      sex: 'Płeć',
      male: 'Mężczyzna',
      female: 'Kobieta',
      height: 'Wzrost (cm)',
      heightPlaceholder: 'np. 180',
      save: 'Zapisz',
      saving: 'Zapisywanie…',
      skip: 'Pomiń na razie',
    },
  },
});
