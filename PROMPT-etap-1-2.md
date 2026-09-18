# ZADANIE: przepisz UI widoków Dashboard + Training wg zatwierdzonych projektów

Repo: apps/web (React 19, TanStack Router, Tailwind v4, shadcn/ui). Paleta Plum & Parchment — tokeny już są w globals.css, NIE zmieniaj ich.

## ZASADY NADRZĘDNE

1. WSZYSTKIE istniejące funkcjonalności ZOSTAJĄ: hooki, mutacje, walidacje, drafty, timery, drag&drop kalendarza, skaner, confirm-dialogi, toasty, nawigacja. To jest wyłącznie przepisanie WARSTWY WIDOKU.
2. Jeśli projekt jest w KONFLIKCIE z istniejącą funkcjonalnością (czegoś nie da się zrobić bez zmiany logiki, projekt pomija coś co istnieje, albo dwie instrukcje się wykluczają) — ZATRZYMAJ SIĘ I ZAPYTAJ zamiast decydować samemu lub cokolwiek usuwać.
3. Czego nie ma w projektach, nie zmieniaj. Żadnych własnych "ulepszeń".
4. Mobile i desktop wg breakpointów jak w kodzie (md/lg) — projekty pokazują oba.

## REFERENCJE (odwzoruj 1:1)

Pliki projektowe w repo (otwórz w przeglądarce):

- "Etap 1 - Dashboard.dc.html" — karty 1a-1f
- "Etap 2 - Training.dc.html" — karty 3a/3b (skeletony), 2a/2b (aktywna sesja), 1a-1i (kalendarz, panele dnia, stats, plans, exercises, modale)

## ETAP 1 — DASHBOARD (zmiany są drobne)

1. Stany puste — podkreślone linki zamień na tint-pigułki (bg #f5e7ea, tekst #8d4a5e, h-36, rounded-full, px-14, 12.5px/600, width:fit-content):
   - TodayNutritionCard bez targetu: pigułka "Set a target"
   - LastWorkoutCard: "No workouts logged yet." + pigułka "Start one"
   - LatestWeightCard: pigułka "Log your weight"
   - NextSessionCard "Plan one" już jest pigułką — zostaje.
2. Pełny skeleton strony (karta 1d mobile, 1f desktop): podczas pierwszego ładowania cała strona to skeleton (header 2 linie + avatar, CTA-pigułka, hero z kołem ringu + 3 paski, karty stat, blok Strava). Bloki #efe8e2, pulse opacity 1↔0.55 1.6s, bez shimmerów i spinnerów. Przy refetchu w tle nie chowaj treści.
3. Onboarding sheet: bez zmian funkcjonalnych; wysokość auto (treść + padding), NIE 100% ekranu.

## ETAP 2 — TRAINING

### /calendar

1. Komórka "dziś": ciemne tło #2b2126 — marker zaplanowanej sesji na niej w JASNEJ śliwce #c98fa0 (nie #8d4a5e, bo niewidoczny). Na mobile w komórce dziś NIE pokazuj napisu "TODAY" (brakuje miejsca na markery) — sam inwers wystarczy.
2. Panel dnia (desktop) / sheet (mobile) — trzy stany wg kart:
   - planned: data italic serif NAD kartą; karta: nazwa + "planned · N exercises" + przycisk Start; lista ćwiczeń: KAŻDE w osobnym wierszu — numer italic serif po lewej (kolor #c9bcb2), nazwa 13px/600, pod nią cel uppercase 10.5px muted ("4 SETS × 6 REPS"), wiersze rozdzielone dashed.
   - finished: bez dodatkowego wrappera, data nad sekcją; badge FINISHED (zielony tint), nazwa serif, meta (czas · sety · volume · ★ocena), tagi użytkownika, serie jako chipy — top set na śliwkowym tincie #f5e7ea z ★, reszta #f0e9e3; stopka Open / Edit / Delete.
   - strava: badge STRAVA (pomarańczowy tint), nazwa, metryki, mała mapa trasy (polyline #d15b28).
   - pusty: karta "Nothing on this day" + "+ Add session".
3. Drag overlay (przenoszenie sesji): pigułka bg primary, biały tekst — bez zmian logiki dnd.

### /session (aktywna sesja) — karty 2a (mobile) i 2b (desktop)

1. BEZ kółek statusu przy seriach — wiersz serii to: pola Weight / Reps / RIR + typ serii + ✕. Nagłówki kolumn zostają.
2. Pola: h-40, radius 10, bg #f6f3f0, border #e8e1da; bieżąca seria (pierwsza bez reps): border 1.5px #8d4a5e. Wartości serif 16px/600 wyśrodkowane. Seria BW: zamiast pola wagi box "BW" (muted).
3. Typ serii: desktop — chipy Top set / BW inline za polami (bez "Normal"); mobile — chevron ▾ rozwija chipy Top set / BW / Clear pod wierszem.
4. Historia ("Previous strip"): ramka bg #faf6f3; linia = " Sep 12 — ★ 85 × 4 @1 · 75 × 8 · …" (BEZ słowa "Previous"; top set ★ w kolorze #75394c); "More ▾" rozwija starsze — KAŻDY trening w OSOBNEJ linijce, max-h scroll. Stany "Loading previous…" / "No previous sessions." zostają.
5. Nagłówek ćwiczenia: chevron, nazwa serif + licznik "2/4" (zielony gdy komplet), meta "kategoria · N sets · swapped"; 3 przyciski ikonowe 32px: Copy (kopiuj serie z ostatniego treningu), ArrowLeftRight (swap), Trash2 (usuń). ZWINIĘTA karta pokazuje pod nagłówkiem chipy zalogowanych serii (top = śliwkowy chip z ★).
6. Pod tytułem strony linia postępu: "1 of 3 exercises done · 6 sets logged" (desktop dodatkowo z timerem inline; mobile timer jako pigułka u góry — jak jest).
7. Stopka karty: "+ Add set" (pigułka tint) + "Copy last (75 × 6)" (pigułka outline) obok siebie; Add note zostaje.
8. "+ Add exercise" i podobne przyciski (Add session, Add template): pełny background #efe6e9, border 1px solid #e0d3d8, tekst #8d4a5e — NIE kreskowane-przezroczyste.
9. Discard/Finish: mobile sticky bar, desktop w nagłówku — jak jest w kodzie.

### /stats mobile — karta 1e

Kompresja: picker ćwiczenia + zakres 1M/3M/6M/1Y w JEDNYM rzędzie; nad wykresem linia "85 kg · +5 kg / 3M · top set"; oceny treningów jako kompaktowy pasek (mini-słupki + "avg 3.8 ★") zamiast drugiego pełnego wykresu. Funkcje (wybór ćwiczenia, zakresu) zostają.

### /plans desktop — karta 1f

Grid 3 kolumn kart zamiast listy na pełną szerokość. Karta: nazwa serif + badge ACTIVE (śliwkowy tint) / kebab menu; meta "3 templates · used 24× · started Aug 1"; chipy szablonów ("Push Day A · 6"); nieaktywne mają link "Set active". Wszystkie akcje (set active, edit, delete, reorder szablonów w szczególe planu) zostają.

### /exercises desktop — karta 1i

Search (max-w 360) + chipy kategorii w jednym rzędzie; grid 3 kolumn kart: nazwa serif 16px, pod nią "kategoria · sprzęt · used in N workouts", chevron po prawej. Mobile bez zmian.

### Skeletony — karty 3a/3b

Calendar: nagłówek + siatka 7 kolumn (komórki 46px mobile / 72px desktop) + panel (desktop). Stats: rząd picker+zakres, słupki. Plans/Exercises/Tags: wiersze 38px thumb + 2 linie (mobile), grid kart (desktop). Zasady jak w etapie 1 (pulse 1.6s, #efe8e2, zero spinnerów pełnostronicowych). Aktywna sesja BEZ skeletonu (draft lokalny).

### Modale/sheety

Każdy sheet z małą treścią (assign template, onboarding, day-detail na mobile, finish) — wysokość auto do treści, nigdy 100vh.

## KRYTERIA AKCEPTACJI

- Zero regresji funkcjonalnych (pkt. ZASADY 1); przy konflikcie — pytanie, nie decyzja.
- Dziś na kalendarzu: marker planned widoczny; mobile bez "TODAY".
- Serie bez kółek statusu; historia bez słowa "Previous", każdy trening w osobnej linijce po More.
- Stany puste dashboardu jako pigułki; pełne skeletony dashboard + training.
- Plans/Exercises desktop jako grid; przyciski Add z pełnym tłem.
