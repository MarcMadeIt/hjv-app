# Projekt – Vanilla Vite + TypeScript

Dette projekt er en del af et skoleprojekt og er bygget med **Vanilla Vite** og **TypeScript**.  
Applikationen anvender eksterne API’er, bl.a. **Google Maps** og **JSONBin**, som konfigureres via `.env`-filer.

---

## Teknologi

- Vite (Vanilla)
- TypeScript
- HTML / CSS
- JavaScript (via TypeScript)
- Git (versionsstyring)

---

## Krav

Før du starter, skal du have installeret:

- **Node.js** (version 18 eller nyere anbefales)
- **npm** (følger med Node.js)

Tjek versioner:
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
VITE_GOOGLE_MAPS_API_KEY=din_google_maps_api_key
VITE_JSONBIN_API_KEY=din_jsonbin_api_key
```

**Vigtigt**
- Alle Vite environment variables skal starte med `VITE_`
- `.env` må ikke pushes til GitHub (ligger i `.gitignore`)

---

### 4. Start udviklingsserveren
```bash
npm run dev
```

Projektet kan herefter åbnes i browseren på:
```
http://localhost:5173
```

---

## Projektstruktur (kort overblik)

```txt
├─ src/
│  ├─ main.ts
│  ├─ style.css
│  └─ ...
├─ index.html
├─ .env
├─ package.json
└─ vite.config.ts
```

---

## Build til produktion

```bash
npm run build
```

Det færdige build findes i:
```txt
/dist
```

---

## Noter

- Projektet er lavet til undervisningsbrug
- Fokus er på enkel struktur og forståelig kode
- API-nøgler håndteres udelukkende via `.env`

---

## Skoleinformation

- Uddannelse: Professionsbachelor i Webudvikling  
- Semester: 1. semester  
- Projekt: Scenarie- & øvelsesplatform
