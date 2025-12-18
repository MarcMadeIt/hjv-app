# Projekt – Vanilla Vite + TypeScript

Dette projekt er et skoleprojekt bygget med **Vanilla Vite** og **TypeScript**.  
Applikationen bruger eksterne API’er, herunder **Google Maps** og **JSONBin**, som konfigureres via miljøvariabler.

---

## Teknologi

- Vite (Vanilla)
- TypeScript
- HTML / CSS
- JavaScript
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
├─ package-lock.json
├─ package.json
└─ tsconfig.json
```

---

## Krav

- **Node.js** (v18 eller nyere anbefales)
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

### 3. Opret `.env` fil

Opret en fil kaldet **`.env`** i rodmappen og indsæt følgende:

```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_JSONBIN_KEY=your_jsonbin_api_key
VITE_JSONBIN_KEY_HEADER=X-Access-Key
VITE_JSONBIN_ID=your_jsonbin_id
```

**Vigtigt**
- Alle miljøvariabler i Vite skal starte med `VITE_`
- `.env` må ikke pushes til GitHub (ligger i `.gitignore`)

---

### 4. Start projektet
```bash
npm run dev
```

Projektet kører nu på:
```
http://localhost:5173
```

---

## Brug af environment variables i TypeScript

Eksempel:
```ts
const googleMapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const jsonBinKey = import.meta.env.VITE_JSONBIN_KEY;
const jsonBinHeader = import.meta.env.VITE_JSONBIN_KEY_HEADER;
const jsonBinId = import.meta.env.VITE_JSONBIN_ID;
```

---

## Build til produktion

```bash
npm run build
```

Output genereres i:
```txt
/dist
```

---

## Noter

- Projektet er udviklet til undervisningsbrug
- Fokus på enkel struktur og læsbar kode
- API-nøgler håndteres udelukkende via `.env`

---

## Skoleprojekt

- Uddannelse: Professionsbachelor i Webudvikling  
- Semester: 1. semester  
- Projekt: Scenarie- & øvelsesplatform
