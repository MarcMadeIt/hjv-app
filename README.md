# Skoleprojekt Gamemaster (Scenariebygger - Team 2)

Dette projekt er **Gamemaster-modulet (Team 2)** i skoleprojektet  
**“Scenarie- & øvelsesplatform til Hjemmeværnsskolen”**.

Gamemaster-applikationen bruges af en øvelsesleder til at opbygge scenarier ved hjælp af
kortbaseret placering af opgaver, som efterfølgende kan eksporteres og anvendes af deltagerdelen.

---

## Funktionalitet

- Visning af opgaver i en liste
- Interaktivt kort baseret på Google Maps
- Placering af opgaver som:
  - Punkter (markers)
  - Zoner (radius/områder)
- Valg af scenarietype (land / sø)
- Eksport af færdigt scenarie som JSON
- Simpel og overskuelig brugergrænseflade målrettet øvelsesledere

---

## Teknologi

- Vite (Vanilla)
- TypeScript
- HTML / CSS
- Google Maps API
- JSONBin
- Git

---

## Projektstruktur

```txt
├─ node_modules/
├─ public/
├─ src/
├─ .env
├─ .gitignore
├─ index.html
├─ package.json
├─ package-lock.json
└─ tsconfig.json
```

---

## Krav

Før projektet kan køres, skal følgende være installeret:

- **Node.js** (version 18 eller nyere)
- **npm**

Tjek installation:
```bash
node -v
npm -v
```

---

## Opsætning

### 1. Klon projektet
```bash
git clone <repository-url>
cd <projektmappe>
```

---

### 2. Installer dependencies
```bash
npm install
```

---

### 3. Miljøvariabler (.env)

Projektet bruger miljøvariabler til API-nøgler.  
Opret en fil kaldet **`.env`** i projektets rodmappe.

Eksempel:
```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_JSONBIN_KEY=your_jsonbin_api_key
VITE_JSONBIN_KEY_HEADER=X-Access-Key
VITE_JSONBIN_ID=your_jsonbin_id
```

**Vigtigt**
- Alle Vite environment variables skal starte med `VITE_`
- `.env` må ikke pushes til GitHub (ligger i `.gitignore`)

---

### 4. Start udviklingsserveren
```bash
npm run dev
```

Applikationen kan herefter tilgås på:
```
http://localhost:5173
```

---

## Build til produktion

```bash
npm run build
```

Det færdige build genereres i:
```txt
/dist
```

---

## Noter

- Projektet er udviklet til undervisningsbrug
- Fokus er på enkelhed, overblik og brugervenlighed
- Gamemaster kræver ingen teknisk erfaring for at kunne anvendes

---

## Skoleinformation

- Uddannelse: Professionsbachelor i Webudvikling  
- Semester: 1. semester  
- Team: **Team 2 – Gamemaster & Scenarier**  
- Projekt: Scenarie- & øvelsesplatform til Hjemmeværnsskolen
