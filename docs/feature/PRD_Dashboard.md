# PRD: Dashboard - Ekran startowy
**Wersja:** 1.0 | **Data:** 2025-11-19 | **Priorytet:** P0 (MVP)

---

## 🎯 Cel biznesowy
Zapewnić użytkownikowi natychmiastowy przegląd statusu remontu (budżet, postęp, następne kroki) w jednym, intuicyjnym widoku po otwarciu aplikacji.

**Problem:** Użytkownicy nie wiedzą, "co teraz", gubią się w chaosie sekcji i zadań, brak orientacji o postępie i budżecie.

**Sukces:** 90%+ użytkowników rozpoczyna każdą sesję od dashboardu, 70% wykonuje akcję sugerowaną przez AI w ciągu 24h.

---

## 👥 Użytkownicy
**Primary:** Właściciel mieszkania (busy person, 2-3 wizyty/dzień w aplikacji)
**Use case:** "Otwieram apkę rano - chcę wiedzieć, co dziś zrobić i ile mi zostało z budżetu"

---

## 🔧 Funkcjonalności

### 1. Project Header
**Wyświetlane dane:**
- Nazwa projektu (edytowalna)
- Adres (1-liniowy)
- Avatar projektu (zdjęcie mieszkania lub inicjały)

**Kryteria akceptacji:**
- ✅ Kliknięcie nazwy → modal edycji
- ✅ Maksymalna długość nazwy: 50 znaków
- ✅ Adres skrócony do 1 linii (np. "ul. Mokotowska 12, Warszawa")

**Wireframe:**
```
┌────────────────────────────────────┐
│ [📷] Remont Kawalerki Mokotów      │
│      ul. Mokotowska 12, Warszawa   │
└────────────────────────────────────┘
```

---

### 2. Budget Widget (Slider)
**Źródło danych:** Agregacja z `budget_summary` view
**Wyświetlane:**
- Budżet planowany (total)
- Wydane do tej pory
- % wykorzystania
- Status wizualny (kolor)

**Logika kolorów:**
- Zielony: 0-80% budżetu
- Żółty: 80-95%
- Czerwony: >95%

**Kryteria akceptacji:**
- ✅ Animowany slider (smooth transition)
- ✅ Kliknięcie → przejście do sekcji Kosztorys
- ✅ Odświeżanie real-time (WebSocket)

**Wireframe:**
```
┌────────────────────────────────────┐
│ Budżet                             │
│ ████████████░░░░░░░░░ 60%         │
│ 54,000 zł / 90,000 zł              │
│ Pozostało: 36,000 zł               │
└────────────────────────────────────┘
```

---

### 3. Progress Tracker (Status sekcji)
**Wyświetlane:** 6 sekcji z ikonami i statusem
**Statusy:**
- 🕐 Nie rozpoczęto
- 🔄 W trakcie
- ✅ Ukończono

**Kryteria akceptacji:**
- ✅ Checkbox z animacją (check → fade in)
- ✅ Kliknięcie sekcji → przejście do szczegółów
- ✅ Progress bar globalny: "Ukończono 3/6 sekcji"

**Wireframe:**
```
┌────────────────────────────────────┐
│ Postęp projektu                    │
│ ████████░░░░░░░░░░░░ 3/6 (50%)    │
│                                    │
│ ✅ ⚡ Plan i Inspekcja              │
│ 🔄 ⚡ Elektryka                     │
│ 🔄 💧 Hydraulika                   │
│ 🕐 🪚 Stolarka                     │
│ 🕐 🎨 Wykończenie                  │
│ ✅ 💰 Kosztorys                    │
└────────────────────────────────────┘
```

---

### 4. AI Suggestions Card
**Źródło:** Claude API (cache 1h w DB: `ai_suggestions`)
**Input:** Status sekcji + dane budżetu + ostatnia aktywność
**Output:** 1-2 kontekstowe sugestie

**Prompt Claude:**
```
Użytkownik:
- Ukończone sekcje: Plan, Elektryka
- W trakcie: Hydraulika (2 wyceny)
- Budżet: 60% wykorzystane
- Ostatnia aktywność: dodano wycenę hydraulika (wczoraj)

Wygeneruj 1-2 krótkie sugestie "co dalej" (max 100 znaków każda).
Zwróć JSON: [{"text": "...", "cta": "Zobacz wyceny hydraulika"}]
```

**Przykłady output:**
```
💡 "Masz 2 wyceny hydraulika - czas je porównać i wybrać!"
   [Porównaj wyceny →]

💡 "Elektryka ukończona ✅ - zarezerwuj stolarkę na przyszły tydzień"
   [Dodaj notatkę →]
```

**Kryteria akceptacji:**
- ✅ Refresh co 1h (background job)
- ✅ Fallback jeśli AI unavailable: generyczna sugestia
- ✅ CTA button prowadzi do odpowiedniej sekcji
- ✅ Koszt: ~$0.05/request (max 1/h/user)

**Wireframe:**
```
┌────────────────────────────────────┐
│ 💡 Następny krok                   │
│ Masz 2 wyceny hydraulika - czas je │
│ porównać i wybrać!                 │
│ [Porównaj wyceny →]                │
└────────────────────────────────────┘
```

---

### 5. Navigation Menu (Bottom Tab / Drawer)
**Opcje:**
- Dashboard (domyślny)
- 6 sekcji (ikony + nazwy)
- Ustawienia

**Kryteria akceptacji:**
- ✅ Bottom Tab na iOS/Android (native feel)
- ✅ Badge'y: liczba nieprzeczytanych notatek/wycen
- ✅ Aktywna sekcja podświetlona (primary color)

---

### 6. Quick Actions (Floating Action Button)
**Akcje:**
- 📝 Dodaj notatkę (do ostatnio otwartej sekcji)
- 📷 Dodaj zdjęcie
- 💰 Dodaj wydatek

**Kryteria akceptacji:**
- ✅ FAB w prawym dolnym rogu (Material Design)
- ✅ Expand menu po kliknięciu (3 opcje)
- ✅ Domyślny kontekst: ostatnio odwiedzana sekcja

**Wireframe:**
```
                   ┌─────────┐
                   │ 📝 Notatka│
                   ├─────────┤
                   │ 📷 Zdjęcie│
                   ├─────────┤
                   │ 💰 Wydatek│
                   └─────────┘
                       ▲
                      [+] ← FAB
```

---

### 7. Recent Activity (Opcjonalnie w MVP)
**Wyświetlane:** 3 ostatnie akcje użytkownika
**Przykłady:**
- "Dodano wycenę elektryka (wczoraj)"
- "Zaznaczono 5 punktów w checkliście (3 dni temu)"

**Kryteria akceptacji:**
- ✅ Kliknięcie → przejście do szczegółów
- ✅ Limit: 3 ostatnie akcje (scroll jeśli więcej)

---

## 🗄️ Model danych

```sql
-- Dashboard nie ma własnej tabeli - agreguje dane z innych sekcji
-- Widok materialny dla performance (opcjonalnie)

CREATE MATERIALIZED VIEW dashboard_summary AS
SELECT 
  p.id AS project_id,
  p.name,
  p.address,
  p.budget_planned,
  (SELECT SUM(actual) FROM budget_summary WHERE project_id = p.id) AS budget_spent,
  (SELECT COUNT(*) FROM sections WHERE project_id = p.id AND status = 'completed') AS sections_completed,
  (SELECT COUNT(*) FROM sections WHERE project_id = p.id) AS sections_total
FROM projects p;

-- AI Suggestions (cache)
-- (już zdefiniowane w innych PRD)
```

---

## 📐 Wireframe (Full Dashboard)

```
┌────────────────────────────────────────┐
│ [≡]  Remont Kawalerki Mokotów     [⚙️] │ ← Header
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ Budżet                                 │
│ ████████████░░░░░░░░░ 60%             │
│ 54,000 zł / 90,000 zł                  │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ Postęp projektu (3/6)                  │
│ ████████░░░░░░░░░░░░ 50%              │
│ ✅ Plan | 🔄 Elektryka | 🔄 Hydraulika │
│ 🕐 Stolarka | 🕐 Wykończenie | ✅ Koszt │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ 💡 Następny krok                       │
│ Masz 2 wyceny hydraulika - porównaj!  │
│ [Zobacz wyceny →]                      │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ Ostatnie akcje                         │
│ • Wycena hydraulika (wczoraj)          │
│ • Checklist +5 punktów (3 dni temu)    │
└────────────────────────────────────────┘

                                      [+] ← FAB

┌────────────────────────────────────────┐
│ [🏠] [⚡] [💧] [🪚] [🎨] [💰]          │ ← Bottom Nav
└────────────────────────────────────────┘
```

---

## 🚫 Poza zakresem (MVP)
- ❌ Timeline view (harmonogram Gantt)
- ❌ Widget "Następne spotkanie" (integracja z kalendarzem)
- ❌ Statystyki czasu (ile dni w każdej fazie)

---

## 🧪 Warunki akceptacji (QA)

**Scenariusz testowy:**
1. User loguje się po raz pierwszy → Dashboard pusty (budżet 0%, 0/6 sekcji)
2. Ukończa sekcję "Plan" → Progress: 1/6 (17%)
3. Akceptuje wycenę elektryka (30k zł) → Budżet: 30k/90k (33%)
4. AI generuje sugestię: "Dodaj szczegóły do hydrauliki"
5. User klika FAB → dodaje notatkę w sekcji Elektryka
6. ✅ Dashboard aktualizuje się w real-time

**Performance:**
- Ładowanie dashboardu: <2 sek (cold start)
- Odświeżanie danych: <500ms (WebSocket update)
- AI suggestions: cache 1h → instant load

---

## 📊 Metryki sukcesu
- **Engagement:** 90%+ sesji zaczyna się od dashboardu
- **AI CTR:** 70%+ użytkowników klika CTA w AI Suggestions w ciągu 24h
- **Navigation:** 80%+ użytkowników używa dashboardu do nawigacji (nie back button)

---

## 🔗 Zależności
- **Backend:** 
  - GET `/api/projects/{id}/dashboard` (agregowane dane)
  - WebSocket `/ws/projects/{id}` (real-time updates)
- **AI:** Claude API (suggestions, cache 1h)
- **Auth:** User session (Clerk)

---

## 🕒 Timeline
- **Tydzień 1:** Project Header + Budget Widget
- **Tydzień 2:** Progress Tracker + Navigation
- **Tydzień 3:** AI Suggestions Card + Quick Actions
- **Tydzień 4:** Integracja real-time + QA

**Effort:** 4 tygodnie (1 frontend dev + 0.5 backend dev)

---

## 💡 Kluczowe założenia techniczne
- **Real-time:** Supabase Realtime (PostgreSQL changes → WebSocket)
- **Navigation:** React Navigation (Bottom Tabs)
- **AI Cache:** PostgreSQL + TTL (expires_at)
- **FAB:** `react-native-paper` (Material FAB)
