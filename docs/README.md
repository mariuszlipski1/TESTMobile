root README dla całego projektu  
# 🏠 Aplikacja Remontowa - Monorepo  
  
Teczka_budowlanca  
  
Aplikacja do zarządzania dokumentacją remontu mieszkań z asystentem AI, który wspomaga użytkowników w organizacji, planowaniu i monitorowaniu kosztów prac remontowych.  
  
Aplikacja do zarządzania dokumentacją remontu mieszkań z asystentem AI.  
  
## 📦 Struktura projektu  
  
- **mobile/** - Frontend React Native (iOS + Android)  
- **backend/** - Backend Node.js + PostgreSQL  
  
## 🚀 Szybki start  
  
### 1. Klonuj repozytorium z submodułami  
```bash  
git submodule add https://github.com/mariuszlipski1/TeczkaMobile.git TeczkaMobilegit commit -m "Add mobile submodule"  
```  
### KROK 3: Dodaj submodule dla backendu  
```bash  
git submodule add https://github.com/mariuszlipski1/TeczkaBackend.git TeczkaBackendgit commit -m "Add backend submodule"```  
  
**Jeśli zapomniałeś flagi `--recurse-submodules`:**  
```bash  
git submodule update --init --recursive```  
  
### 2. Setup Backend  
```bash  
cd backendnpm installcp .env.example .env# Uzupełnij .env (baza danych, API keys, etc.)  
npm run dev```  
  
Backend będzie dostępny na: `http://localhost:5000`  
  
### 3. Setup Frontend  
```bash  
cd ../mobilenpm installnpm run android  # lub: npm run ios```  
  
## 📝 Praca z submodułami  
  
### Zaktualizuj wszystkie submodule  
```bash  
git submodule update --remote --merge```  
  
### Pracujesz w submodule (np. backend)  
```bash  
cd backend# Dokonujesz zmian...  
git add .git commit -m "Add new API endpoint"git push  
# Wróć do głównego repo  
cd ..git add backendgit commit -m "Update backend submodule"git push```  
  
### Klonowanie po raz pierwszy (inny dev)  
```bash  
git clone --recurse-submodules https://github.com/YOUR_USERNAME/aplikacja-remontowa.gitcd aplikacja-remontowacd backend && npm install && cd ..cd mobile && npm install && cd ..```  
  
## 🔄 Typowe workflow  
```bash  
# 1. Zaciągnij najnowsze zmiany (rodzic + submodule)  
git pull origin main  
git submodule update --remote  
  
# 2. Pracuj w backendzie  
cd backend  
git checkout main  
git pull  
# ... robisz zmiany ...  
git push  
  
# 3. Wróć do głównego projektu i zaktualizuj referencję  
cd ..  
git add backend  
git commit -m "Update backend to latest version"  
git push  
  
# 4. Pracuj w frontencie analogicznie  
cd mobile  
git checkout main  
git pull  
# ... robisz zmiany ...  
git push  
  
cd ..  
git add mobile  
git commit -m "Update mobile to latest version"  
git push  
```  
  
## 📚 Dokumentacja  
  
- [Backend](/backend/README.md) - Instrukcje serwera  
- [Mobile](/mobile/README.md) - Instrukcje mobilne