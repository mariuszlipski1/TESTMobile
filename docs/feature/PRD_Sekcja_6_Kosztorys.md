# PRD: Sekcja 6 - Kosztorys
**Wersja:** 1.0 | **Data:** 2025-11-19 | **Priorytet:** P0 (MVP)

---

## 🎯 Cel biznesowy
Zapewnić użytkownikom real-time kontrolę nad budżetem remontowym poprzez agregację kosztów z wszystkich sekcji, porównanie planowanych vs rzeczywistych wydatków oraz alerty o przekroczeniach.

**Problem:** Użytkownicy tracą kontrolę nad budżetem w połowie remontu, odkrywając za późno przekroczenia (średnio +25% over budget).

**Sukces:** 90% użytkowników mieści się w budżecie +/-10%, 80% otrzymuje alerty przed przekroczeniem progu.

---

## 👥 Użytkownicy
**Primary:** Właściciel mieszkania monitorujący koszty w czasie remontu
**Use case:** "Chcę wiedzieć, ile zostało mi z budżetu i czy nie przekroczę limitu"

---

## 🔧 Funkcjonalności

### 1. Agregacja kosztów z sekcji 2-5
**Logika:** Automatyczne sumowanie zaakceptowanych wycen
**Źródła danych:**
- `estimates` WHERE `is_accepted = TRUE`
- `expenses` (rzeczywiste wydatki)

**Output:** Tabela z rozbiciem na kategorie

```
┌─────────────┬─────────────┬──────────────┬──────────┐
│ Kategoria   │ Planowane   │ Rzeczywiste  │ Status   │
├─────────────┼─────────────┼──────────────┼──────────┤
│ Elektryka   │ 30,000 zł   │ 28,500 zł    │ ✅ -5%   │
│ Hydraulika  │ 15,000 zł   │ 16,200 zł    │ ⚠️ +8%   │
│ Stolarka    │ 20,000 zł   │ 0 zł         │ 🕐 Brak  │
│ Wykończenie │ 25,000 zł   │ 0 zł         │ 🕐 Brak  │
├─────────────┼─────────────┼──────────────┼──────────┤
│ RAZEM       │ 90,000 zł   │ 44,700 zł    │ 49.7%    │
└─────────────┴─────────────┴──────────────┴──────────┘
```

**Kryteria akceptacji:**
- ✅ Odświeżanie w czasie rzeczywistym (WebSocket lub polling co 30s)
- ✅ Kolorystyka: zielony (<5% odchylenie), żółty (5-10%), czerwony (>10%)
- ✅ Możliwość edycji kwot planowanych

### 2. Wykres porównawczy (Planowane vs Rzeczywiste)
**Typ:** Stacked Bar Chart (React Native Chart Kit)
**Kryteria akceptacji:**
- ✅ Responsywność: scroll poziomy jeśli >4 kategorie
- ✅ Tooltip po kliknięciu słupka (szczegóły pozycji)

### 3. Formularz dodawania rzeczywistych wydatków
**Input:** Kategoria, opis, kwota, data, opcjonalnie paragon (zdjęcie)
**Przykład:**
```
Kategoria: [Elektryka ▼]
Opis: Zakup przewodów YDY 5x2.5
Kwota: 450 zł
Data: 2025-11-15
Paragon: [📷 Dodaj zdjęcie]
```

**Kryteria akceptacji:**
- ✅ Walidacja: kwota >0, data ≤ dzisiaj
- ✅ Autouzupełnianie kategorii (jeśli dodawane z poziomu sekcji)
- ✅ OCR paragonu (Faza 2) → automatyczne wyciągnięcie kwoty

### 4. Alerty budżetowe
**Logika:** Push notification gdy wydatki w kategorii >10% planu
**Przykład:**
```
⚠️ Hydraulika przekroczyła budżet!
Planowane: 15,000 zł
Rzeczywiste: 16,500 zł (+10%)
[Zobacz szczegóły]
```

**Kryteria akceptacji:**
- ✅ Wysyłka alertu w <1 min od przekroczenia
- ✅ Możliwość wyłączenia w ustawieniach

### 5. AI Insights (cache 1h)
**Input:** Dane budżetowe + kontekst mieszkania
**Output:** Kontekstualne sugestie
**Prompt Claude:**
```
Użytkownik remontuje mieszkanie (60m², 1978 r.).
Budżet: Elektryka +8%, Hydraulika -5%.
Wygeneruj 2-3 insights (optymalizacja kosztów, typowe odchylenia w remoncie).
Zwróć JSON: [{"insight": "...", "action": "..."}]
```

**Przykład output:**
```
💡 "Hydraulika przekroczyła budżet o 8% - typowe w starych budynkach
   ze względu na ukryte uszkodzenia. Zarezerwuj +5% buforu na stolarkę."
```

**Kryteria akceptacji:**
- ✅ Odświeżanie co 1h (cache w DB: `ai_suggestions`)
- ✅ Koszt: ~$0.05/request (max 1 request/godzina/użytkownik)

### 6. Export raportu (PDF/Excel)
**Format:** PDF z logo aplikacji, tabela, wykres
**Kryteria akceptacji:**
- ✅ Generacja w <5 sek (backend: Puppeteer lub PDFKit)
- ✅ Dostępność offline (zapisanie w lokalnej pamięci)

---

## 🗄️ Model danych

```sql
-- Wydatki rzeczywiste
CREATE TABLE expenses (
  id UUID PRIMARY KEY,
  section_id UUID REFERENCES sections(id),
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  expense_date DATE NOT NULL,
  receipt_url TEXT, -- URL do zdjęcia paragonu
  created_at TIMESTAMP DEFAULT NOW()
);

-- Agregacja budżetu (widok materialny dla performance)
CREATE MATERIALIZED VIEW budget_summary AS
SELECT 
  s.project_id,
  s.type AS category,
  COALESCE(SUM(e.total_amount) FILTER (WHERE e.is_accepted), 0) AS planned,
  COALESCE(SUM(ex.amount), 0) AS actual
FROM sections s
LEFT JOIN estimates e ON e.section_id = s.id
LEFT JOIN expenses ex ON ex.section_id = s.id
GROUP BY s.project_id, s.type;

-- Odświeżanie co 5 min (trigger lub cron job)
CREATE TRIGGER refresh_budget_summary
AFTER INSERT OR UPDATE ON expenses
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_materialized_view('budget_summary');
```

---

## 📐 Wireframe

```
┌───────────────────────────────────────────┐
│ BudgetTable                               │
│ Elektryka    30,000 zł | 28,500 zł ✅ -5% │
│ Hydraulika   15,000 zł | 16,200 zł ⚠️ +8% │
│ Stolarka     20,000 zł | 0 zł      🕐     │
│ Wykończenie  25,000 zł | 0 zł      🕐     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ RAZEM        90,000 zł | 44,700 zł (49.7%)│
└───────────────────────────────────────────┘

┌───────────────────────────────────────────┐
│ CostComparisonChart                       │
│                                           │
│ 30k ████████  ███████    [Planowane]     │
│ 20k ████  ████            [Rzeczywiste]  │
│ 10k                                       │
│  0  ┴────┴────┴────┴────                  │
│     Ele  Hyd  Sto  Wyk                   │
└───────────────────────────────────────────┘

┌───────────────────────────────────────────┐
│ ExpenseTracker                            │
│ [+ Dodaj wydatek]                         │
│ ┌───────────────────────────────────────┐ │
│ │ Kategoria: [Elektryka ▼]              │ │
│ │ Opis: Zakup przewodów                 │ │
│ │ Kwota: 450 zł                         │ │
│ │ Data: 2025-11-15                      │ │
│ │ [📷 Dodaj paragon]                    │ │
│ │ [Zapisz]                              │ │
│ └───────────────────────────────────────┘ │
└───────────────────────────────────────────┘

┌───────────────────────────────────────────┐
│ AI Insights                               │
│ 💡 Hydraulika +8% - typowe w starych     │
│    budynkach. Zarezerwuj bufor +5%.      │
│ 💡 Elektryka -5% - dobra negocjacja!     │
│    [🔄 Odśwież insights]                  │
└───────────────────────────────────────────┘
```

---

## 🚫 Poza zakresem (MVP)
- ❌ Integracja z bankiem (automatyczny import transakcji)
- ❌ Prognozy AI (przewidywanie końcowych kosztów)
- ❌ Współdzielenie raportu z bankiem (do kredytu)

---

## 🧪 Warunki akceptacji (QA)

**Scenariusz testowy:**
1. User akceptuje wycenę w sekcji "Elektryka" (28,500 zł)
2. Przechodzi do Kosztorysu → tabela pokazuje 28,500 zł jako "planowane"
3. Dodaje wydatek rzeczywisty: "Przewody - 450 zł"
4. ✅ Tabela aktualizuje się: rzeczywiste = 450 zł
5. Dodaje kolejny wydatek: 16,000 zł → przekroczenie 10%
6. ✅ Otrzymuje push notification o przekroczeniu
7. AI generuje insight w <3 sek
8. Exportuje raport PDF → otwiera się w <5 sek

**Performance:**
- Agregacja kosztów: <1 sek (materialized view)
- Export PDF: <5 sek
- Push notification: <1 min od zdarzenia

---

## 📊 Metryki sukcesu
- **Budget accuracy:** 90%+ użytkowników w przedziale +/-10% budżetu
- **Expense tracking:** 80%+ użytkowników dodaje minimum 10 wydatków/projekt
- **Report downloads:** 50%+ użytkowników exportuje raport (feature adoption)

---

## 🔗 Zależności
- **Backend:** 
  - GET `/api/projects/{id}/budget` (agregacja)
  - POST `/api/expenses` (dodawanie wydatków)
  - GET `/api/projects/{id}/budget/pdf` (export)
- **AI:** Claude API (insights)
- **Notifications:** Firebase Cloud Messaging (push)

---

## 🕒 Timeline
- **Tydzień 10:** Agregacja kosztów + tabela
- **Tydzień 11:** Wykres + formularz wydatków
- **Tydzień 12:** Alerty budżetowe + AI insights
- **Tydzień 13:** Export PDF + QA

**Effort:** 4 tygodnie (1 frontend dev + 1 backend dev)

---

## 💡 Kluczowe założenia techniczne
- **Charts:** `react-native-chart-kit` (bar chart)
- **PDF:** Backend (Puppeteer) lub `react-native-html-to-pdf`
- **Push:** Firebase Cloud Messaging
- **Cache AI:** Redis (TTL 1h) lub PostgreSQL z `expires_at`
