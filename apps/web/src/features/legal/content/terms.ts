import type { Locale } from '@/stores/locale.store';

import { ADMIN, EMAIL, type LegalDoc, UPDATED } from './types';

// Terms of service. Plain-language, PL source with an EN mirror.
export const TERMS: Record<Locale, LegalDoc> = {
  pl: {
    title: 'Regulamin',
    updated: UPDATED,
    intro:
      'Regulamin określa zasady korzystania z Lift4Me — aplikacji do zapisywania treningów, odżywiania i pomiarów ciała dostępnej pod adresem lift4.me.',
    sections: [
      {
        heading: 'Usługodawca',
        body: [`Usługę świadczy ${ADMIN.pl}. Kontakt: ${EMAIL}.`],
      },
      {
        heading: 'Konto',
        body: [
          'Do korzystania z aplikacji potrzebne jest konto. Zakładając je, akceptujesz ten regulamin oraz politykę prywatności.',
          'Usługa jest przeznaczona dla osób, które ukończyły 16 lat. Jedno konto jest przeznaczone dla jednej osoby; dbaj o poufność swojego hasła.',
        ],
      },
      {
        heading: 'Cena',
        body: [
          'Korzystanie z Lift4Me jest obecnie bezpłatne.',
          'W przyszłości, w zależności od liczby użytkowników, możemy wprowadzić opłatę na pokrycie kosztów utrzymania (serwery, rozwój). Poinformujemy o tym co najmniej 30 dni wcześniej. Bez Twojej wyraźnej zgody nie zostaniesz obciążony żadną opłatą — jeśli się nie zgodzisz, możesz usunąć konto.',
        ],
      },
      {
        heading: 'To nie jest porada medyczna',
        body: [
          'Wyliczenia w aplikacji (kalorie, makroskładniki, średnie, szacowanie makro ze zdjęcia przez AI) mają charakter orientacyjny i mogą zawierać błędy. Nie stanowią porady medycznej, dietetycznej ani trenerskiej.',
          'Przed rozpoczęciem treningów lub zmianą diety, zwłaszcza przy problemach zdrowotnych, skonsultuj się z lekarzem. Trenujesz na własną odpowiedzialność.',
        ],
      },
      {
        heading: 'Zasady korzystania',
        body: [
          'Nie wolno korzystać z aplikacji niezgodnie z prawem, zakłócać jej działania ani próbować uzyskać dostępu do cudzych danych.',
          'Nie umieszczaj w nazwach, notatkach i zdjęciach treści bezprawnych ani naruszających prawa innych osób.',
          'Produkty zeskanowane po kodzie kreskowym mogą trafić do wspólnego katalogu produktów (nazwa, wartości odżywcze, zdjęcie produktu) — bez Twoich danych osobowych.',
        ],
      },
      {
        heading: 'Integracje',
        body: [
          'Połączenie ze Stravą jest dobrowolne i podlega także regulaminowi Stravy. Możesz je w każdej chwili odłączyć w aplikacji.',
        ],
      },
      {
        heading: 'Dostępność i dane',
        body: [
          'Dokładamy starań, by aplikacja działała stabilnie, ale udostępniamy ją w obecnej postaci i mogą zdarzać się przerwy techniczne.',
          'Zalecamy co jakiś czas eksportować swoje statystyki (Statystyki → Eksport).',
        ],
      },
      {
        heading: 'Usunięcie konta i eksport danych',
        body: [
          `Aby usunąć konto wraz ze wszystkimi danymi albo otrzymać pełny eksport swoich danych, napisz na ${EMAIL} z adresu e-mail przypisanego do konta. Zrealizujemy prośbę bez zbędnej zwłoki, najpóźniej w ciągu miesiąca.`,
          'Statystyki treningowe możesz w każdej chwili wyeksportować samodzielnie w aplikacji (PDF lub CSV).',
        ],
      },
      {
        heading: 'Odpowiedzialność',
        body: [
          'W granicach dopuszczalnych przez prawo nie odpowiadamy za szkody wynikające z decyzji podjętych na podstawie danych z aplikacji ani z przerw w jej działaniu. Postanowienie to nie ogranicza praw przysługujących konsumentom na podstawie bezwzględnie obowiązujących przepisów.',
        ],
      },
      {
        heading: 'Reklamacje i kontakt',
        body: [`Uwagi i reklamacje przyjmujemy pod adresem ${EMAIL}. Odpowiadamy w ciągu 14 dni.`],
      },
      {
        heading: 'Zmiany regulaminu',
        body: [
          'O zmianach regulaminu poinformujemy w aplikacji lub e-mailem co najmniej 14 dni przed ich wejściem w życie. Jeśli się nie zgadzasz, możesz usunąć konto.',
          'W sprawach nieuregulowanych stosuje się prawo polskie.',
        ],
      },
    ],
  },
  en: {
    title: 'Terms of service',
    updated: UPDATED,
    intro:
      'These terms set out how you may use Lift4Me — an app for logging training, nutrition and body measurements available at lift4.me.',
    sections: [
      {
        heading: 'Provider',
        body: [`The service is provided by ${ADMIN.en}. Contact: ${EMAIL}.`],
      },
      {
        heading: 'Your account',
        body: [
          'You need an account to use the app. By creating one, you accept these terms and the privacy policy.',
          'The service is intended for people aged 16 or over. One account is for one person; keep your password confidential.',
        ],
      },
      {
        heading: 'Price',
        body: [
          'Lift4Me is currently free to use.',
          'In the future, depending on the number of users, we may introduce a fee to cover running costs (servers, development). We’ll announce it at least 30 days in advance. You will never be charged without your explicit consent — if you don’t agree, you can delete your account.',
        ],
      },
      {
        heading: 'Not medical advice',
        body: [
          'Calculations in the app (calories, macros, averages, AI photo macro estimates) are approximate and may contain errors. They are not medical, dietary or coaching advice.',
          'Talk to a doctor before starting training or changing your diet, especially if you have health conditions. You train at your own risk.',
        ],
      },
      {
        heading: 'Acceptable use',
        body: [
          'Don’t use the app unlawfully, disrupt it, or try to access other people’s data.',
          'Don’t put unlawful content, or content infringing others’ rights, in names, notes or photos.',
          'Products you scan by barcode may be added to a shared product catalog (name, nutrition values, product photo) — without your personal data.',
        ],
      },
      {
        heading: 'Integrations',
        body: [
          'Connecting Strava is optional and is also subject to Strava’s terms. You can disconnect it in the app at any time.',
        ],
      },
      {
        heading: 'Availability and your data',
        body: [
          'We work to keep the app stable, but it is provided as is and there may be technical interruptions.',
          'We recommend exporting your stats from time to time (Stats → Export).',
        ],
      },
      {
        heading: 'Deleting your account and exporting data',
        body: [
          `To delete your account with all its data, or to receive a full export of your data, write to ${EMAIL} from the e-mail address linked to your account. We’ll handle it without undue delay and within one month at the latest.`,
          'You can export your training stats yourself in the app at any time (PDF or CSV).',
        ],
      },
      {
        heading: 'Liability',
        body: [
          'To the extent permitted by law, we are not liable for damage resulting from decisions made based on data in the app or from interruptions in service. This does not limit any rights consumers have under mandatory law.',
        ],
      },
      {
        heading: 'Complaints and contact',
        body: [`Send feedback and complaints to ${EMAIL}. We reply within 14 days.`],
      },
      {
        heading: 'Changes',
        body: [
          'We’ll announce changes to these terms in the app or by e-mail at least 14 days before they take effect. If you don’t agree, you can delete your account.',
          'Polish law applies to matters not covered here.',
        ],
      },
    ],
  },
};
