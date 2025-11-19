# 🏗️ ARCHITEKTURA MODUŁU NOTATEK - Aplikacja Remontowa

**Stack:** Supabase (PostgreSQL) + Expo React Native  
**Status:** Plan implementacji MVP

---

## 📋 CO NAPRAWDĘ POTRZEBA

### Problem biznesowy
- Notki muszą być **sekcyjnie izolowane** (notatka z Elektryki tylko w Elektrycej)
- Notki powinny być **uniwersalne** (tekst + foto + audio) — w każdej sekcji
- Ostatnio dodana notatka **u góry listy** (sortowanie desc)
- CRUD operacje: Create, Read, Update, Delete dla każdej sekcji
- System musi być **skalowany** — przygotowanie na multi-modal content

### Czemu ta architektura
1. **Supabase** = PostgreSQL z gotowymi RLS (zabezpieczenie na poziomie DB)
2. **Expo** = mobilny cross-platform, natywny dostęp do kamery/mikrofonu
3. **Multi-modal storage** = S3 (zdjęcia/audio) + DB (metadane)

---



## 📱 CZĘŚĆ 3: MOBILE (Expo React Native)

### 3.1 Struktura komponentów

```
mobile/
├── src/
│   ├── screens/
│   │   ├── SectionScreen.tsx (Główny ekran sekcji)
│   │   ├── NoteDetailScreen.tsx (Szczegóły notatki)
│   │   └── NoteEditorScreen.tsx (Edycja/tworzenie)
│   ├── components/
│   │   ├── NotesList.tsx
│   │   ├── NoteItem.tsx
│   │   ├── NoteEditor.tsx (Multi-modal editor)
│   │   ├── ImageGallery.tsx
│   │   ├── AudioRecorder.tsx
│   │   └── TagInput.tsx
│   ├── services/
│   │   ├── notesApi.ts (HTTP client)
│   │   ├── storage.ts (Local AsyncStorage)
│   │   └── offlineSync.ts (Offline mode)
│   ├── store/
│   │   ├── notesSlice.ts (Redux)
│   │   └── store.ts
│   ├── hooks/
│   │   ├── useNotes.ts
│   │   ├── useNoteEditor.ts
│   │   └── useOfflineSync.ts
│   └── types/
│       └── notes.ts
```


---

## 📊 WORKFLOW: Jak wszystko działa razem

### Scenario: User dodaje notatkę w sekcji Elektryka

```
1. User otwiera SectionScreen (Elektryka)
   └─ Render: <NotesList projectId="..." sectionId="electrical" />

2. User klika "+ Nowa notatka"
   └─ Modal: <NoteEditor /> się pojawia

3. User:
   └─ Wpisuje tekst: "Rozmowa z elektrykiem Pan Marek"
   └─ Dodaje zdjęcie instalacji
   └─ Nagrywa audio (30 sekund)
   └─ Klika "Zapisz"

4. Frontend (React Native):
   └─ Sprawdza czy online
   └─ Wysyła POST /notes z contenttype multipart/form-data
   └─ Backend: Zapisuje notatkę w DB
   └─ Backend: Uploaduje image na S3
   └─ Backend: Uploaduje audio, transkrybuje (Whisper API)
   └─ Backend: Returns Note object

5. Frontend:
   └─ Invalidates cache (React Query)
   └─ Re-fetches notatki z sekcji (query key: ['notes', projectId, 'electrical'])
   └─ Wyświetla notatkę NA GÓRZE listy (created_at DESC)

6. Tylko ta sekcja widzi notatkę
   └─ Sekcja "Hydraulika" = inne notatki (sectionId musi być równy)
   └─ RLS policy zapewnia bezpieczeństwo
```

---

## 🚀 IMPLEMENTACJA: Phase-by-Phase

### Phase 1 (Week 1-2): Podstawy
- [ ] Supabase setup + RLS policies
- [ ] Node.js backend + Notes CRUD API
- [ ] React Native: NotesList + NoteItem components
- [ ] Podstawowy HTTP client (notesApi.ts)

### Phase 2 (Week 3): Multi-modal
- [ ] Image upload + gallery
- [ ] Audio recording + storage
- [ ] Whisper API integration (transkrypcja)

### Phase 3 (Week 4): Polish
- [ ] Offline-first sync
- [ ] AI integration (generowanie pytań)
- [ ] Performance: pagination + infinite scroll

---

## 📝 CHECKLIST: Co musisz przygotować

### Supabase
- [ ] Account + Project
- [ ] PostgreSQL Database created
- [ ] Tabele: notes, note_attachments, projects, sections
- [ ] RLS policies włączone
- [ ] Storage bucket: note-attachments

### Node.js Backend
- [ ] Express server
- [ ] Supabase SDK zainstalowany
- [ ] Routes, Controllers, Services setup
- [ ] Environment variables (.env)
- [ ] Deployed na Railway/Render

### React Native Mobile
- [ ] Expo project initialized
- [ ] React Query installed
- [ ] Supabase client configured
- [ ] Components: NotesList, NoteEditor created

---

## 🔑 KEY INSIGHTS

**Dlaczego ta architektura sprawdzi się?**

1. **Sekcyjna izolacja**: RLS + sectionId filtering = bezpieczeństwo na poziomie DB
2. **Uniwersalne notki**: Struktura notes[] zawiera images[], audio[] = elastyczność
3. **Scalable storage**: Supabase Storage (PostgreSQL) + S3 = wzrost bez problemów
4. **Offline-first**: AsyncStorage + sync queue = UX nawet bez internetu
5. **Mobile-first**: Expo + React Query = szybkie iteracje, hot reload

---

## ❓ FAQ

**P: Czy każdy user widzi wszystkie notatki?**
A: Nie! RLS policy: `user_id = auth.uid()` zapewnia że widzisz tylko własne.

**P: Czy notka z Elektryki może być w Hydraulice?**
A: Nie. Foreign key + filter na `sectionId` zapewniają izolację.

**P: Co jeśli user jest offline?**
A: Notatka zapisuje się lokalnie (AsyncStorage), sync gdy online (offlineSync.ts).

**P: Limit na rozmiar audio/video?**
A: 50MB (constraint w DB). Dla większych — consider Vimeo/Cloudinary.

**P: Transkrypcja audio — czy automatyczna?**
A: Tak, via Whisper API w backend. User nie musi nic robić.

---

**Następny krok:** Chcesz żebym przygotował kod do Claude Code? Czy najpierw chcesz setup Supabase?