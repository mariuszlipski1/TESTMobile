# README.md - Aplikacja Remontowa

## 📋 Przegląd projektu

Aplikacja do zarządzania dokumentacją remontu mieszkań z asystentem AI, który wspomaga użytkowników w organizacji, planowaniu i monitorowaniu kosztów prac remontowych.

## 🎯 Główne założenia

### Problem biznesowy
Użytkownicy planujący remont często gubią się w chaosie dokumentów, ofert i notatek. Brak struktury prowadzi do:
- Przekroczenia budżetu
- Pominięcia istotnych elementów
- Trudności w komunikacji z fachowcami
- Braku historii decyzji i zmian

### Rozwiązanie
Struktura aplikacji dzieli remont na 6 logicznych sekcji, gdzie AI pełni rolę asystenta podpowiadającego kluczowe pytania i pomagającego w organizacji dokumentacji.

---

## 🏗️ Architektura aplikacji

### Stack technologiczny (zgodnie z dokumentem discovery)
- **Frontend:** React Native (mobilny cross-platform)
- Supabase (PostgreSQL )
- **Auth:** Clerk lub Firebase Auth

---

## 📱 Workflow aplikacji

### 1. **Ekran startowy - Dashboard Projektu**

**Komponenty:**
- `<ProjectHeader />` - Nazwa projektu ("Remont Kawalerki Mokotów")
- `<BudgetWidget />` - Slider budżetu (Planowane vs Wydane)
- `<ProgressTracker />` - Status sekcji (checkboxes z ikonami)
- `<AISuggestionsCard />` - Kafel z sugestiami AI
- `<NavigationMenu />` - Menu boczne z 6 sekcjami

**Logika działania:**
```
User otwiera app
  ↓
System ładuje dane projektu z DB
  ↓
AI analizuje postęp i generuje sugestie kontekstowe
  ↓
Dashboard wyświetla agregowane dane (budżet, postęp, AI hints)
```

**Usprawnienia:**
- ✨ **Widget "Następny krok"** - AI podpowiada, co zrobić teraz (np. "Masz 3 oferty elektryka, czas je porównać")
- ✨ **Timeline view** - Opcjonalny widok harmonogramu z kamieniami milowymi
- ✨ **Quick actions** - Floating button do szybkiego dodania notatki/zdjęcia

---

### 2. **Sekcja 1: Plan i Inspekcja**

**Komponenty:**
- `<PropertyDetailsForm />` - Formularz z danymi (metraż, piętro, winda, garaż)
- `<FileUploadZone />` - Drag & drop dla rzutów i zdjęć inspekcyjnych
- `<AIInspectionChecklist />` - Dynamiczna checklista generowana przez AI

**Workflow:**
```
User wypełnia dane nieruchomości
  ↓
Załącza rzut mieszkania (PDF/JPG)
  ↓
AI analizuje rzut i generuje checklistę inspekcji
  (np. "Sprawdź stan pionów wodno-kanalizacyjnych")
  ↓
User zaznacza wykonane punkty
  ↓
System zapisuje do DB + S3
```

**Ulepszenia:**
- ✨ **AI rozpoznaje rzut** - Automatycznie wyciąga metraż, liczbę pomieszczeń
- ✨ **Podpowiedź checklisty** - Przycisk "Generuj ponownie" jeśli lista nie pasuje
- ✨ **Media gallery** - Podgląd wszystkich zdjęć z tej sekcji w siatce

---

### 3. **Sekcje 2-5: Elektryka / Hydraulika / Stolarka / Wykończenie**

**Komponenty (wspólne dla wszystkich 4 sekcji):**
- `<ContractorNotesEditor />` - Multi-modalny edytor (tekst + zdjęcia + audio)
- `<EstimateUploader />` - Upload wycen (PDF z OCR)
- `<AIChatPanel />` - Panel z pytaniami AI ("Na co zwrócić uwagę?")

**Workflow:**
```
User wybiera sekcję (np. Elektryka)
  ↓
1. Dodaje notatki z rozmowy z fachowcem
   - Tekst pisany
   - Zdjęcia instalacji
   - Nagranie audio (opcjonalnie)
  ↓
2. Uploaduje wycenę (PDF)
  ↓
AI:
  - Analizuje wycenę i wyciąga kluczowe pozycje
  - Generuje listę pytań do fachowca
  - Podpowiada, na co zwrócić uwagę przy gwarancji
  ↓
User zaznacza "Wycena zaakceptowana"
  ↓
System dodaje koszty do budżetu
```

**Usprawnienia:**
- ✨ **Notatki multi-modalne:**
  - Tekst + zdjęcia w jednej notatce
  - Transkrypcja audio do tekstu (Whisper API)
  - Tagowanie (#elektryka, #gniazdka)

- ✨ **Inteligentne OCR wycen:**
  - AI rozpoznaje pozycje w wycenie
  - Automatycznie kategoryzuje koszty
  - Porównuje ceny między fachowcami

- ✨ **Quick access do plików:**
  - Szybkie otwieranie załączników jednym kliknięciem
  - Podgląd PDF bez pobierania (iframe)
  - Opcja "Analizuj wycenę AI" bezpośrednio z podglądu

---

### 4. **Sekcja 6: Kosztorys**

**Komponenty:**
- `<BudgetTable />` - Tabela z rozbiciem kosztów
- `<CostComparisonChart />` - Wykres (planowane vs rzeczywiste)
- `<ExpenseTracker />` - Formularz dodawania wydatków

**Workflow:**
```
System agreguje dane z sekcji 2-5
  ↓
Wyświetla tabelę:
  - Elektryka: 30,000 zł (planowane) | 28,500 zł (rzeczywiste)
  - Hydraulika: 15,000 zł | 16,200 zł
  ↓
User dodaje rzeczywiste koszty po zakończeniu prac
  ↓
AI analizuje odchylenia i podpowiada, gdzie zaoszczędzić
```

**Usprawnienia:**
- ✨ **Alerty budżetowe** - Notyfikacja gdy wydatki przekraczają plan o 10%
- ✨ **Export do Excel/PDF** - Raport kosztorysowy do pobrania
- ✨ **AI insights** - "Hydraulika przekroczyła budżet o 8% - typowe w remoncie 2010 r."

---

## 🤖 Integracja AI (Claude)

### Kluczowe funkcje AI

#### 1. **Generator checklisty inspekcji**
```typescript
// Przykład wywołania API
const generateChecklist = async (propertyData) => {
  const prompt = `
    Wygeneruj listę inspekcji dla mieszkania:
    - Metraż: ${propertyData.area} m²
    - Rok budowy: ${propertyData.year}
    - Piętro: ${propertyData.floor}
    
    Zwróć JSON z punktami do sprawdzenia.
  `;
  
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    messages: [{ role: "user", content: prompt }]
  });
  
  return JSON.parse(response.content[0].text);
};
```

#### 2. **Analiza wycen**
- OCR (Tesseract.js) → wyciąga tekst z PDF
- Claude analizuje pozycje i kategoryzuje
- Zwraca strukturę JSON z kosztami

#### 3. **Asystent pytań do fachowca**
- User wybiera sekcję (np. Elektryka)
- Claude generuje 10-15 pytań na podstawie:
  - Danych mieszkania
  - Typowych problemów w remontach
  - Kontekstu (np. "stary budynek = sprawdź licznik")

#### 4. **Kontekstowe sugestie na dashboardzie**
```typescript
// AI analizuje postęp i generuje hint
"Wygląda na to, że planujesz hydraulikę. 
Pamiętaj, aby zapytać fachowca o gwarancję 
na szczelność instalacji."
```

---

## 📂 Struktura bazy danych

### Tabele

```sql
-- Projekty
projects (
  id UUID PRIMARY KEY,
  user_id UUID,
  name VARCHAR(255),
  address TEXT,
  area DECIMAL,
  floor INT,
  has_elevator BOOLEAN,
  market_type ENUM('primary', 'secondary'),
  budget_planned DECIMAL,
  budget_spent DECIMAL,
  created_at TIMESTAMP
)

-- Sekcje projektu
sections (
  id UUID PRIMARY KEY,
  project_id UUID,
  type ENUM('plan', 'electrical', 'plumbing', 'carpentry', 'finishing', 'costs'),
  status ENUM('not_started', 'in_progress', 'completed'),
  notes TEXT,
  updated_at TIMESTAMP
)

-- Notatki multi-modalne
notes (
  id UUID PRIMARY KEY,
  section_id UUID,
  content TEXT,
  media_urls TEXT[], -- Array URL-i do S3
  audio_transcript TEXT,
  tags TEXT[],
  created_at TIMESTAMP
)

-- Wyceny
estimates (
  id UUID PRIMARY KEY,
  section_id UUID,
  contractor_name VARCHAR(255),
  file_url TEXT,
  total_amount DECIMAL,
  items JSONB, -- Pozycje wyceny
  is_accepted BOOLEAN,
  created_at TIMESTAMP
)

-- Wydatki rzeczywiste
expenses (
  id UUID PRIMARY KEY,
  section_id UUID,
  description VARCHAR(255),
  amount DECIMAL,
  date DATE,
  receipt_url TEXT
)

-- Sugestie AI (cache)
ai_suggestions (
  id UUID PRIMARY KEY,
  project_id UUID,
  suggestion_text TEXT,
  context JSONB,
  shown_at TIMESTAMP
)
```

---

## 🎨 Dodatkowe usprawnienia UX

### 1. **Łatwe otwieranie plików**
- **Inline preview** - PDF/zdjęcia otwierają się w modal (bez pobierania)
- **Quick actions** - Long press na plik → opcje: Podgląd / Analiza AI / Udostępnij
- **Recent files widget** - Na dashboardzie lista ostatnio dodanych plików

### 2. **Notatki multi-modalne**
```typescript
// Struktura notatki
interface Note {
  id: string;
  content: string; // Markdown
  media: {
    type: 'image' | 'audio' | 'video';
    url: string;
    thumbnail?: string;
  }[];
  tags: string[];
}
```

**UX:**
- Edytor typu Notion (toolbar z opcjami: **B** / *I* / 📷 / 🎤)
- Drag & drop zdjęć bezpośrednio do notatki
- Nagranie audio → automatyczna transkrypcja

### 3. **Smart file suggestions**
- AI podpowiada, gdzie zapisać plik:
  ```
  Wykryłem wycenę od elektryka w nazwie pliku. 
  Czy zapisać w sekcji Elektryka? [Tak] [Nie]
  ```

### 4. **Offline mode**
- Notatki zapisują się lokalnie (AsyncStorage / SQLite)
- Synchronizacja po powrocie online
- Badge z informacją "3 notatki oczekują na sync"

---

## 🚀 Roadmapa wdrożenia

### Faza 1 (MVP) - 8 tygodni
- ✅ Struktura 6 sekcji
- ✅ Dashboard z budżetem
- ✅ Upload plików (zdjęcia + PDF)
- ✅ Podstawowa integracja AI (checklista + pytania)
- ✅ Auth (Clerk)

### Faza 2 - 4 tygodnie
- ✅ Notatki multi-modalne
- ✅ OCR wycen + analiza AI
- ✅ Kosztorys z wykresami
- ✅ Export do PDF

### Faza 3 - 4 tygodnie
- ✅ Offline mode
- ✅ Udostępnianie projektu (np. rodzinie)
- ✅ Timeline view
- ✅ Push notifications (przypomnienia)

---

## 💡 Kluczowe insights techniczne

### Dlaczego React Native?
- **Jeden kod** → iOS + Android
- **Szybki rozwój** - Hot reload, bogate ekosystem
- **Dostęp do kamery/plików** - Łatwa integracja z `react-native-image-picker`

### Dlaczego PostgreSQL + JSONB?
- **Elastyczność** - Pozycje wycen przechowujemy jako JSON (różne formaty od fachowców)
- **Relacyjność** - Łatwe łączenie projektów → sekcji → notatek

### Dlaczego Claude (nie ChatGPT)?
- **Dłuższy kontekst** - 200k tokenów (cały rzut + wyceny w jednym requescie)
- **Lepszy w analizie dokumentów** - PDF-y z wycenami
- **Function calling** - Strukturalne odpowiedzi (JSON)

---

## 📖 Podsumowanie dla Product Ownera

### Co aplikacja rozwiązuje?
1. **Chaos dokumentacji** → Struktura 6 sekcji
2. **Brak wiedzy** → AI asystent z pytaniami do fachowców
3. **Przekroczenie budżetu** → Real-time tracking kosztów
4. **Rozproszenie plików** → Centralne repozytorium z łatwym dostępem

### Unikalna wartość
- **AI jako copilot**, nie automat - Użytkownik ma kontrolę, AI podpowiada
- **Multimodalność** - Tekst + zdjęcia + audio w jednym miejscu
- **Kontekst biznesowy** - Nie tylko lista TODO, ale planowanie finansowe

### Metryki sukcesu
- **< 5 min** na dodanie notatki z fachowcem (z AI)
- **90%** użytkowników mieści się w budżecie (+/- 10%)
- **4.5★+** rating w sklepach (intuicyjność UX)

---

**Wersja dokumentu:** 1.0  
**Data:** 2025-01-11  
**Autor:** Technical Product Owner
