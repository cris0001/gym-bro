import type { Locale } from '@/stores/locale.store';

import { ADMIN, EMAIL, HOSTING, type LegalDoc, UPDATED } from './types';

// Privacy policy (GDPR / RODO). Plain-language, PL source with an EN mirror.
export const PRIVACY: Record<Locale, LegalDoc> = {
  pl: {
    title: 'Polityka prywatności',
    updated: UPDATED,
    intro:
      'Ta polityka wyjaśnia, jakie dane przetwarza Lift4Me (lift4.me), po co, na jakiej podstawie i jakie masz prawa. Piszemy prosto — jeśli coś jest niejasne, napisz do nas.',
    sections: [
      {
        heading: 'Administrator danych',
        body: [
          `Administratorem Twoich danych osobowych jest ${ADMIN.pl} („my”). Kontakt we wszystkich sprawach dotyczących danych: ${EMAIL}.`,
        ],
      },
      {
        heading: 'Jakie dane przetwarzamy',
        body: [
          'Dane konta: imię, adres e-mail i hasło (przechowujemy wyłącznie jego zaszyfrowany skrót — nie znamy Twojego hasła).',
          'Dane profilu (opcjonalne): data urodzenia, płeć, wzrost, preferowany język nazw produktów.',
          'Dane treningowe: plany, szablony, ćwiczenia, treningi, serie (ciężar, powtórzenia, RIR), oceny, notatki i tagi.',
          'Dane żywieniowe: Twoje produkty i przepisy, wpisy w dzienniku, cele kaloryczne i makro oraz zdjęcia, które dodasz do produktów, przepisów lub do szacowania makro.',
          'Pomiary ciała: waga, procent tkanki tłuszczowej i obwody. Są to dane dotyczące zdrowia (szczególna kategoria danych w rozumieniu art. 9 RODO).',
          'Dane ze Stravy — tylko jeśli połączysz konto: aktywności (nazwa, typ, data, dystans, czas, tempo, przewyższenie, tętno, uproszczona trasa GPS) oraz tokeny dostępu potrzebne do importu.',
          'Dane techniczne: dostawca hostingu może przez krótki czas przechowywać logi techniczne (np. adres IP, czas żądania) w celu zapewnienia bezpieczeństwa i działania usługi.',
        ],
      },
      {
        heading: 'Cele i podstawy prawne',
        body: [
          'Prowadzenie konta i świadczenie usługi (zapisywanie i prezentowanie Twoich danych, statystyki, eksport) — art. 6 ust. 1 lit. b RODO (wykonanie umowy, czyli regulaminu).',
          'Przetwarzanie pomiarów ciała i innych danych o zdrowiu — art. 9 ust. 2 lit. a RODO, na podstawie Twojej wyraźnej zgody udzielanej przy rejestracji. Zgodę możesz w każdej chwili wycofać (zob. „Twoje prawa”); nie wpływa to na zgodność z prawem przetwarzania sprzed jej wycofania.',
          'Import ze Stravy — na Twoje żądanie, w ramach świadczenia usługi (art. 6 ust. 1 lit. b RODO).',
          'Bezpieczeństwo, zapobieganie nadużyciom i obsługa zapytań — nasz prawnie uzasadniony interes (art. 6 ust. 1 lit. f RODO).',
        ],
      },
      {
        heading: 'Komu przekazujemy dane',
        body: [
          'Nie sprzedajemy Twoich danych i nie używamy ich do reklam. Korzystamy z dostawców, którzy przetwarzają dane w naszym imieniu:',
          'Neon Inc. — baza danych; serwery w Unii Europejskiej (Frankfurt, Niemcy).',
          `${HOSTING.pl} — hosting aplikacji.`,
          'Google (Gemini API) — wyłącznie gdy użyjesz szacowania makro ze zdjęcia: zdjęcie posiłku jest wysyłane do analizy, a wynik wraca do aplikacji.',
          'Strava — wyłącznie gdy połączysz konto; dane pobieramy z Twojego konta Strava na Twoje żądanie.',
          'Open Food Facts — przy wyszukiwaniu produktu po kodzie kreskowym wysyłamy tylko numer kodu, bez danych osobowych.',
          'Część tych dostawców ma siedzibę w USA. Przekazanie danych poza Europejski Obszar Gospodarczy odbywa się na podstawie standardowych klauzul umownych Komisji Europejskiej lub programu EU-US Data Privacy Framework.',
        ],
      },
      {
        heading: 'Jak długo przechowujemy dane',
        body: [
          'Dane przechowujemy przez cały czas istnienia konta. Po usunięciu konta dane są kasowane z bazy niezwłocznie; z kopii zapasowych znikają automatycznie po upływie okresu ich przechowywania (do kilku dni).',
        ],
      },
      {
        heading: 'Twoje prawa',
        body: [
          'Masz prawo do: dostępu do danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, przenoszenia, wniesienia sprzeciwu oraz wycofania zgody na przetwarzanie danych o zdrowiu.',
          'Większość danych możesz sam przeglądać, poprawiać i usuwać w aplikacji. Statystyki treningowe wyeksportujesz samodzielnie (Statystyki → Eksport, PDF lub CSV).',
          `Usunięcie konta wraz ze wszystkimi danymi, pełny eksport danych oraz pozostałe żądania realizujemy na prośbę wysłaną na ${EMAIL} — z adresu e-mail przypisanego do konta, abyśmy mieli pewność, że to Ty. Odpowiadamy bez zbędnej zwłoki, najpóźniej w ciągu miesiąca.`,
          'Jeśli połączyłeś Stravę, po usunięciu konta odłącz też Lift4Me w ustawieniach swojego konta Strava.',
          'Masz też prawo wnieść skargę do Prezesa Urzędu Ochrony Danych Osobowych (ul. Stawki 2, 00-193 Warszawa).',
        ],
      },
      {
        heading: 'Cookies i pamięć przeglądarki',
        body: [
          'Używamy jednego niezbędnego pliku cookie — sesji logowania (HttpOnly, bez niego nie da się korzystać z konta).',
          'W pamięci przeglądarki (localStorage) zapisujemy Twoje ustawienia (motyw, kolor, język) oraz pamięć podręczną danych, dzięki której aplikacja działa offline.',
          'Nie używamy cookies analitycznych ani reklamowych, dlatego nie wyświetlamy banera zgody.',
          'Do sprawdzania widoczności strony w wyszukiwarce korzystamy z Google Search Console. To narzędzie nie śledzi odwiedzających i nie zapisuje cookies na Twoim urządzeniu.',
        ],
      },
      {
        heading: 'Bezpieczeństwo',
        body: [
          'Połączenie z aplikacją jest szyfrowane (HTTPS), hasła przechowujemy wyłącznie jako skróty bcrypt, a dostęp do danych ma tylko zalogowany właściciel konta.',
        ],
      },
      {
        heading: 'Zmiany polityki',
        body: [
          'O istotnych zmianach tej polityki poinformujemy w aplikacji lub e-mailem. Aktualna wersja jest zawsze dostępna pod adresem lift4.me/privacy.',
        ],
      },
    ],
  },
  en: {
    title: 'Privacy policy',
    updated: UPDATED,
    intro:
      'This policy explains what data Lift4Me (lift4.me) processes, why, on what legal basis, and what your rights are. We keep it plain — if anything is unclear, get in touch.',
    sections: [
      {
        heading: 'Data controller',
        body: [
          `The controller of your personal data is ${ADMIN.en} (“we”). Contact for anything data-related: ${EMAIL}.`,
        ],
      },
      {
        heading: 'What we process',
        body: [
          'Account data: name, e-mail address and password (we store only a hashed version — we never know your password).',
          'Profile data (optional): date of birth, sex, height, preferred food-name language.',
          'Training data: plans, templates, exercises, workouts, sets (weight, reps, RIR), ratings, notes and tags.',
          'Nutrition data: your foods and recipes, diary entries, calorie and macro targets, and photos you add to foods, recipes or the macro estimate.',
          'Body measurements: weight, body-fat percentage and circumferences. These are data concerning health (a special category under Article 9 GDPR).',
          'Strava data — only if you connect your account: activities (name, type, date, distance, time, pace, elevation, heart rate, a simplified GPS route) and the access tokens needed for importing.',
          'Technical data: the hosting provider may keep technical logs (e.g. IP address, request time) for a short time to keep the service secure and running.',
        ],
      },
      {
        heading: 'Purposes and legal bases',
        body: [
          'Running your account and the service (storing and showing your data, stats, exports) — Article 6(1)(b) GDPR (performance of the contract, i.e. the Terms).',
          'Processing body measurements and other health data — Article 9(2)(a) GDPR, based on your explicit consent given at sign-up. You can withdraw it at any time (see “Your rights”); this does not affect the lawfulness of processing before withdrawal.',
          'Strava import — at your request, as part of the service (Article 6(1)(b) GDPR).',
          'Security, abuse prevention and handling requests — our legitimate interest (Article 6(1)(f) GDPR).',
        ],
      },
      {
        heading: 'Who receives your data',
        body: [
          'We don’t sell your data or use it for advertising. We use providers that process data on our behalf:',
          'Neon Inc. — database; servers in the European Union (Frankfurt, Germany).',
          `${HOSTING.en} — application hosting.`,
          'Google (Gemini API) — only when you use the photo macro estimate: the meal photo is sent for analysis and the result comes back to the app.',
          'Strava — only if you connect your account; we fetch data from your Strava account at your request.',
          'Open Food Facts — when you look up a product by barcode, we send only the barcode number, no personal data.',
          'Some of these providers are based in the USA. Transfers outside the European Economic Area rely on the European Commission’s standard contractual clauses or the EU-US Data Privacy Framework.',
        ],
      },
      {
        heading: 'How long we keep data',
        body: [
          'We keep your data for as long as your account exists. When the account is deleted, the data is removed from the database straight away and disappears from backups automatically once their retention period ends (up to a few days).',
        ],
      },
      {
        heading: 'Your rights',
        body: [
          'You have the right to access, rectify and erase your data, to restrict processing, to data portability, to object, and to withdraw consent to the processing of health data.',
          'You can view, correct and delete most of your data yourself in the app. You can export your training stats yourself (Stats → Export, PDF or CSV).',
          `Deleting your account with all its data, a full data export, and any other request are handled when you write to ${EMAIL} — from the e-mail address linked to your account, so we know it’s you. We reply without undue delay and within one month at the latest.`,
          'If you connected Strava, also disconnect Lift4Me in your Strava account settings after deletion.',
          'You also have the right to lodge a complaint with a supervisory authority — in Poland, the President of the Personal Data Protection Office (UODO).',
        ],
      },
      {
        heading: 'Cookies and browser storage',
        body: [
          'We use a single strictly necessary cookie — your sign-in session (HttpOnly; the account doesn’t work without it).',
          'In browser storage (localStorage) we keep your settings (theme, colour, language) and a data cache that lets the app work offline.',
          'We use no analytics or advertising cookies, so there is no consent banner.',
          'We use Google Search Console to see how the site appears in search. It does not track visitors or store cookies on your device.',
        ],
      },
      {
        heading: 'Security',
        body: [
          'Connections to the app are encrypted (HTTPS), passwords are stored only as bcrypt hashes, and only the signed-in account owner can access their data.',
        ],
      },
      {
        heading: 'Changes',
        body: [
          'We’ll announce material changes to this policy in the app or by e-mail. The current version is always at lift4.me/privacy.',
        ],
      },
    ],
  },
};
