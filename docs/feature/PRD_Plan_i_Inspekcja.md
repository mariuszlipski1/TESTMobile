# PRD: Sekcja 1 - Plan i Inspekcja
**Wersja:** 1.0 | **Data:** 2025-11-19 | **Priorytet:** P0 (MVP)

---

## 🎯 Cel biznesowy
Umożliwić użytkownikom strukturalne zebranie kluczowych danych o nieruchomości i wygenerowanie inteligentnej checklisty inspekcyjnej, która zapobiegnie pominięciu krytycznych elementów przed rozpoczęciem remontu.

**Problem:** Użytkownicy rozpoczynają remont bez kompleksowej inspekcji, co prowadzi do odkrycia ukrytych wad w trakcie prac (wzrost kosztów o 15-30%).

**Sukces:** 90% użytkowników ukończy checklistę przed rozpoczęciem prac, 80% zgłosi, że AI wykryło punkt, którego by nie sprawdzili.

---

## 👥 Użytkownicy
**Primary:** Właściciel mieszkania planujący remont (30-45 lat, brak doświadczenia w remontach)  
**Use case:** "Kupiłem mieszkanie na rynku wtórnym, chcę wiedzieć, co sprawdzić przed przystąpieniem do prac"

---

## 🔧 Funkcjonalności

### 1. Formularz danych nieruchomości
**Input:** Metraż, piętro, rok budowy, rynek (pierwotny/wtórny), winda, parking  
**Output:** Dane zapisane w DB (tabela `projects`)

**Kryteria akceptacji:**
- Walidacja: metraż 15-300 m², rok 1900-2025  
- Pola opcjonalne: winda, parking  
- Zapis lokalny (offline-first) + sync w tle  

---

### 2. Upload rzutu mieszkania
**Input:** PDF/JPG rzutu mieszkania (max 10 MB)  
**Output:** Plik w Supabase Storage + URL w DB

**Kryteria akceptacji:**
- Drag & drop + przycisk upload  
- Podgląd obrazu przed zapisem  
- AI opcjonalnie wyciąga metraż z rzutu  

---

### 3. Generator checklisty inspekcyjnej (AI)
**Input:** Dane z formularza + rzut (opcjonalnie)  
**Output:** Lista 15-25 punktów do sprawdzenia (JSON)

**Prompt Claude:**
```
Wygeneruj checklistę inspekcji dla:
- Metraż: {area} m², Rok: {year}, Piętro: {floor}, Rynek: {market_type}
Zwróć JSON: [{"category": "hydraulika", "task": "Sprawdź...", "priority": "high"}]
```

**Kryteria akceptacji:**
- Generacja <5 sek  
- Przycisk „Regeneruj”  
- Cache: jedna generacja/projekt  

---

### 4. Interaktywna checklista
**UX:** Lista checkboxów z kategoriami  
**Kryteria akceptacji:**
- Zaznaczenie punktu → zapis w DB z timestampem  
- Notatki do każdego punktu  
- Progress bar (np. 12/20)  

---

### 5. Galeria zdjęć inspekcyjnych
**Input:** Zdjęcia z kamery/galerii (max 20 sztuk)  
**Output:** Siatka miniatur + pełny podgląd

**Kryteria akceptacji:**
- Upload batch  
- Przypisanie zdjęcia do punktu checklisty  
- Kompresja do 1920 px  

---

## 🗄️ Model danych

```sql
ALTER TABLE projects ADD COLUMN inspection_checklist JSONB;
ALTER TABLE projects ADD COLUMN checklist_progress INT DEFAULT 0;

CREATE TABLE inspection_photos (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  photo_url TEXT NOT NULL,
  checklist_item_id UUID,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 📐 Wireframe

```
┌─────────────────────────────────┐
│ PropertyDetailsForm             │
│ [Metraż] [Piętro] [Rok budowy]  │
│ [✓ Winda] [✓ Parking]           │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ FileUploadZone                  │
│ [📄 Przeciągnij rzut tutaj]     │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ AIInspectionChecklist           │
│ ☐ Hydraulika: Sprawdź piony...  │
│ ☑ Elektryka: Zlokalizuj licznik │
│ Progress: ████░░░░ 12/20        │
│ [🔄 Regeneruj checklistę]       │
└─────────────────────────────────┘
```

---

## 🚫 Poza zakresem (MVP)
- AI rozpoznawanie pomieszczeń na rzucie  
- Współdzielenie checklisty  
- Nagrania wideo

---

## 🧪 Warunki akceptacji (QA)

**Scenariusz testowy:**
1. Wypełnienie formularza  
2. Upload rzutu  
3. Generacja checklisty  
4. Zaznaczenie punktów, dodanie zdjęć  
5. Walidacja zapisów w DB  

**Performance:**
- Generacja <5 sek  
- Upload zdjęcia <3 sek  
- Scroll 60 FPS  

---

## 📊 Metryki sukcesu
- 85% użytkowników ukończy 50% checklisty  
- Time-to-value <10 min  
- <5% regeneracji checklisty  

---

## 🔗 Zależności i workflow

### **Workflow zależności (end-to-end)**

```
[User]
   │
   ▼
[Clerk Auth] -- sprawdzenie sesji
   │
   ▼
[Frontend RN/Web]
   │   ├─ Formularz -> zapis local storage
   │   ├─ Upload -> Supabase Storage
   │   └─ Request AI -> Backend
   ▼
[Backend (Supabase Edge Functions)]
   │   ├─ Walidacja danych
   │   ├─ Zapis w DB (projects)
   │   └─ Wywołanie Claude API
   ▼
[Claude API]
   │   └─ Generacja checklisty
   ▼
[Backend]
   │   └─ Zapis JSON checklisty
   ▼
[Frontend]
   ├─ Render checklisty
   ├─ Zaznaczanie punktów -> zapis DB
   └─ Upload zdjęć -> Storage + DB
```

---

