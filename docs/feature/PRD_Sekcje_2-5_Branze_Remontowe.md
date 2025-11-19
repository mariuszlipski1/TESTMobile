# PRD: Sekcje 2-5 - Branże remontowe (Elektryka/Hydraulika/Stolarka/Wykończenie)
**Wersja:** 1.0 | **Data:** 2025-11-19 | **Priorytet:** P0 (MVP)

---

## 🎯 Cel biznesowy
Umożliwić użytkownikom dokumentowanie rozmów z fachowcami, analizę wycen i strukturalne zarządzanie informacjami dla 4 kluczowych branż remontowych przy użyciu wspólnego, powtarzalnego szablonu.

**Problem:** Chaos w komunikacji z fachowcami: rozproszone notatki (SMS, WhatsApp, papier), brak możliwości porównania wycen, trudność w weryfikacji zakresu prac.

**Sukces:** Użytkownicy zapisują 100% rozmów z fachowcami w aplikacji, AI pomaga zadać 10-15 kluczowych pytań, 60% użytkowników porównuje minimum 2 wyceny przed decyzją.

---

## 👥 Użytkownicy
**Primary:** Właściciel mieszkania szukający wykonawców (stres, brak doświadczenia)
**Use case:** "Rozmawiałem z elektrykiem, nie wiem, czy jego oferta jest uczciwa i czy nie pominął czegoś ważnego"

---

## 🔧 Funkcjonalności (wspólne dla 4 sekcji)

### 1. Multi-modalny edytor notatek
**Input:** Tekst (Markdown) + Zdjęcia + Audio
**Output:** Notatka z timestampem, metadata w JSONB
**Kryteria akceptacji:**
- ✅ Toolbar: Bold, Italic, Lista, Zdjęcie, Nagranie
- ✅ Drag & drop zdjęć bezpośrednio do treści
- ✅ Audio → transkrypcja (Whisper API, opcjonalnie w Fazie 2)
- ✅ Tagowanie: #gniazdka, #przewody, #bezpieczniki (autouzupełnianie)
- ✅ Izolacja danych: notatki widoczne TYLKO w danej sekcji

**Przykład struktury:**
```json
{
  "content": "Elektryk polecił wymianę tablicy...",
  "media": [
    {"type": "image", "url": "s3://...", "position": 0},
    {"type": "audio", "url": "s3://...", "transcript": "..."}
  ],
  "tags": ["tablica", "gniazdka"],
  "created_at": "2025-11-19T10:30:00Z"
}
```

### 2. Upload i OCR wycen (PDF)
**Input:** PDF wyceny (max 5 MB)
**Output:** Wyciągnięte pozycje + kwoty w JSONB
**Workflow:**
1. User uploaduje PDF → Supabase Storage
2. OCR (Tesseract.js lub Claude PDF input) wyciąga tekst
3. Claude analizuje i zwraca JSON:
```json
{
  "contractor_name": "Elektro-Serwis Kowalski",
  "total_amount": 28500,
  "items": [
    {"name": "Wymiana tablicy", "quantity": 1, "price": 3500},
    {"name": "Gniazdka podtynkowe", "quantity": 15, "price": 750}
  ]
}
```
**Kryteria akceptacji:**
- ✅ Rozpoznawanie pozycji: >80% accuracy (test na 20 rzeczywistych wycenach)
- ✅ Fallback: Jeśli OCR nie działa → user może ręcznie wprowadzić kwoty
- ✅ Przycisk "Analizuj AI" przy każdej wycenie

### 3. AI Chat Panel - Asystent pytań do fachowca
**Input:** Typ sekcji (np. "elektryka") + dane mieszkania
**Output:** 10-15 kontekstowych pytań
**Prompt Claude:**
```
Jestem właścicielem mieszkania (60m², 1978 r., stary budynek).
Planuję spotkanie z elektrykiem. Wygeneruj 10-15 kluczowych pytań, które powinienem zadać.
Priorytet: bezpieczeństwo, koszty ukryte, gwarancja.
Zwróć JSON: [{"question": "...", "why": "..."}]
```
**Kryteria akceptacji:**
- ✅ Pytania generowane w <3 sek
- ✅ Cache: 1 generacja/sekcja/projekt (koszt: ~$0.03/request)
- ✅ User może zaznaczyć zadane pytania (checkbox)

### 4. Porównywarka wycen
**UX:** Tabela z 2-3 wycenami obok siebie
**Kryteria akceptacji:**
- ✅ Podświetlenie różnic cenowych >20%
- ✅ AI insight: "Wycena B nie zawiera materiałów, uwaga na koszty dodatkowe"
- ✅ Checkbox "Zaakceptuj wycenę" → dodanie do budżetu

### 5. Quick access do plików
**UX:** Lista plików z ikonami typu (PDF, JPG, Audio)
**Kryteria akceptacji:**
- ✅ Podgląd PDF w iframe (bez pobierania)
- ✅ Long press → [Podgląd / Analiza AI / Usuń]
- ✅ Filtracja: [Wszystkie / Wyceny / Zdjęcia / Audio]

---

## 🗄️ Model danych

```sql
-- Notatki (izolowane per sekcja)
CREATE TABLE notes (
  id UUID PRIMARY KEY,
  section_id UUID REFERENCES sections(id),
  content TEXT,
  media JSONB, -- [{type, url, transcript?}]
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Wyceny
CREATE TABLE estimates (
  id UUID PRIMARY KEY,
  section_id UUID,
  contractor_name VARCHAR(255),
  file_url TEXT,
  total_amount DECIMAL(10,2),
  items JSONB, -- Pozycje wyceny
  is_accepted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP
);

-- Index dla szybkiego filtrowania
CREATE INDEX idx_notes_section ON notes(section_id, created_at DESC);
CREATE INDEX idx_estimates_section ON estimates(section_id);
```

---

## 📐 Wireframe (kluczowe komponenty)

```
┌─────────────────────────────────────────┐
│ ContractorNotesEditor                   │
│ ┌─────────────────────────────────────┐ │
│ │ [B] [I] [📷] [🎤] [#]              │ │
│ │ Elektryk powiedział, że...          │ │
│ │ [📷 IMG_001.jpg]                    │ │
│ └─────────────────────────────────────┘ │
│ Tags: #tablica #gniazdka                │
│ [Zapisz notatkę]                        │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ EstimateUploader                        │
│ [📄 Wycena_Elektryk_Kowalski.pdf]      │
│ [🔍 Analizuj AI]                        │
│ ┌─────────────────────────────────────┐ │
│ │ Kwota: 28,500 zł                    │ │
│ │ • Wymiana tablicy: 3,500 zł         │ │
│ │ • Gniazdka (15 szt): 750 zł         │ │
│ └─────────────────────────────────────┘ │
│ [✓ Zaakceptuj] [Porównaj z innymi]     │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ AIChatPanel                             │
│ "Pytania do elektryka:"                 │
│ ☐ Czy instalacja ma uziemienie?        │
│ ☐ Jaki termin gwarancji?               │
│ ☐ Kto dostarcza materiały?             │
│ [🔄 Wygeneruj więcej]                   │
└─────────────────────────────────────────┘
```

---

## 🎨 Różnice między sekcjami (personalizacja)

| Sekcja | Ikona | Kolor | Przykładowe tagi | AI Context |
|--------|-------|-------|------------------|------------|
| Elektryka | ⚡ | Żółty | #tablica #gniazdka #oświetlenie | "Skup się na bezpieczeństwie i normach" |
| Hydraulika | 💧 | Niebieski | #piony #ciśnienie #ogrzewanie | "Zapytaj o szczelność i gwarancję" |
| Stolarka | 🪚 | Brązowy | #drzwi #futryny #podłogi | "Sprawdź wilgotność i certyfikaty materiałów" |
| Wykończenie | 🎨 | Zielony | #malowanie #gładzie #panele | "Uwzględnij harmonogram i dostępność" |

---

## 🚫 Poza zakresem (MVP)
- ❌ Współdzielenie notatek z fachowcem (Faza 3)
- ❌ Integracja kalendarza (przypomnienia o spotkaniach)
- ❌ Marketplace wykonawców (poza zakresem produktu)

---

## 🧪 Warunki akceptacji (QA)

**Scenariusz testowy:**
1. User wchodzi do sekcji "Elektryka"
2. Dodaje notatkę z 2 zdjęciami i tagiem #tablica
3. Uploaduje PDF wyceny (3 MB)
4. AI analizuje i wyciąga 5 pozycji + kwotę 28,500 zł
5. User generuje pytania → otrzymuje 12 pytań w <3 sek
6. Zaznacza wycenę jako zaakceptowaną
7. ✅ Kwota dodana do budżetu (sekcja Kosztorys)

**Performance:**
- Zapis notatki: <2 sek
- OCR wyceny: <10 sek (PDF 5 MB)
- Generacja pytań AI: <3 sek

---

## 📊 Metryki sukcesu
- **Note creation:** 100+ notatek/użytkownik w pierwszym miesiącu
- **Estimate analysis:** 80%+ wycen przechodzi przez AI (nie ręczne wprowadzanie)
- **AI adoption:** 70%+ użytkowników generuje pytania przed spotkaniem

---

## 🔗 Zależności
- **Backend:** 
  - POST `/api/sections/{id}/notes` (CRUD notatek)
  - POST `/api/sections/{id}/estimates` (upload + OCR)
- **AI:** Claude API (OCR + generacja pytań)
- **Storage:** Supabase Storage buckets `notes-media`, `estimates-pdf`

---

## 🕒 Timeline
- **Tydzień 5-6:** Edytor notatek + upload plików (bez AI)
- **Tydzień 7:** OCR wycen + AI analiza
- **Tydzień 8:** AI Chat Panel (generator pytań)
- **Tydzień 9:** Porównywarka wycen + QA

**Effort:** 5 tygodni (1 frontend dev + 1 backend dev)

---

## 💡 Kluczowe założenia techniczne
- **React Native:** `react-native-document-picker` (upload PDF)
- **Markdown:** `react-native-markdown-display` (edytor)
- **Image:** `react-native-image-picker` (zdjęcia)
- **Audio:** `react-native-audio-recorder-player` (nagrania)
