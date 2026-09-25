# Maison Trois – Beauty-Studio-Demo

Demo-Website für **Maison Trois**, ein fiktives Beauty-Studio für Nails, Lashes und Brows in
Wil SG, geführt von drei Inhaberinnen. Gebaut mit [Astro](https://astro.build), Svelte 5 und
TypeScript.

Das Projekt liegt im Repository `Demo-Webseite`, ist aber **technisch vollständig unabhängig**
von allen anderen Websites darin: eigene Abhängigkeiten, eigene Konfiguration, eigene Assets,
eigener Build und eigenes Deployment.

## Highlights

- **Interaktives Buchungssystem** (`/buchen`) in sieben Schritten: Kategorie → Behandlung →
  Gestalten → Artist → Termin → Angaben → Übersicht → Demo-Bestätigung. Mit Live-Preis,
  mitlaufender Zusammenfassung, Browser-Zurück-Taste und mobiler Preisleiste.
- **Visuelle Konfiguratoren:** parametrische SVG-Nägel (7 Formen × 5 Längen, Farben, French,
  Babyboomer, Chrome, Cat Eye, Glitzer, Nail Art) sowie prozedural gezeichnete Wimpern (Classic,
  Hybrid, Volume, Mega Volume, Looks, Curl, Länge, Lifting) und Brauen (Shaping, Färben, Henna,
  Lamination, Microblading, Powder, Combo) – inklusive Vorher-Nachher-Vergleich.
- **Realistische Terminlogik:** Öffnungszeiten, Feiertage im Kanton St. Gallen, Arbeitstage der
  Inhaberinnen, simulierte Auslastung und Slots passend zur Behandlungsdauer.
- **Demo-sicher:** Buchung, Kontaktformular und Gutschein-Anfrage übertragen keine Daten.

## Voraussetzungen

- Node.js **22.12 oder neuer** (siehe `.nvmrc`)
- npm

## Befehle

Alle Befehle werden **im Ordner `beauty-studio/`** ausgeführt:

```bash
cd beauty-studio
npm install
```

| Befehl                 | Beschreibung                                                     |
| ---------------------- | ---------------------------------------------------------------- |
| `npm run dev`          | Entwicklungsserver unter <http://localhost:4400>                 |
| `npm run build`        | Typprüfung (`astro check`, `svelte-check`) und Produktions-Build |
| `npm run preview`      | Lokale Vorschau des Produktions-Builds unter Port 4400           |
| `npm run check`        | Nur Typ- und Template-Prüfung                                    |
| `npm run format`       | Code mit Prettier formatieren                                    |
| `npm run format:check` | Formatierung prüfen, ohne Dateien zu ändern                      |

Hinweis: Wird der Dev- oder Preview-Server ohne interaktives Terminal gestartet (z. B. aus
einem Skript), läuft er im Hintergrund weiter. Beenden mit `npx astro dev stop` bzw.
`npx astro preview stop`.

## Projektstruktur

```text
beauty-studio/
├── public/                     # Favicon
├── src/
│   ├── assets/photos/          # Fotos (optional, siehe PHOTOS.md)
│   ├── components/
│   │   ├── booking/            # Buchungssystem (Svelte): Schritte, Zustand, Zusammenfassung
│   │   ├── visuals/            # Nagel-, Augen- und Brauen-Visualisierungen, Guides
│   │   └── *.astro             # Header, Footer, Preisliste, FAQ, Bewertungen …
│   ├── data/                   # Leistungen & Preise, Team, Studio-Daten, Texte
│   ├── lib/                    # Preis-, Termin- und Validierungslogik, Geometrie
│   ├── layouts/                # Basislayout
│   ├── pages/                  # Seiten (inkl. /visuals/*.svg für statische Illustrationen)
│   └── styles/                 # Designsystem (Farben, Typografie, Komponenten)
├── PHOTOS.md                   # Bildplätze, Anforderungen und Bildnachweise
└── package.json
```

**Eine Quelle für alle Preise:** `src/data/services.ts` enthält alle Behandlungen, Varianten,
Aufpreise, Extras und Dauern. Preisliste, Leistungsseiten, Guides und Buchungssystem lesen
daraus – Bezeichnungen und Preise sind dadurch überall identisch.

## Fotos

Fotos werden automatisch eingebunden, sobald sie unter `src/assets/photos/<name>.jpg` liegen –
Namen, Formate und fachliche Anforderungen stehen in [PHOTOS.md](./PHOTOS.md). Ohne Foto zeigt
jede Bildfläche eine gestaltete Illustration.

Zehn Bildplätze zeigen bereits geprüfte CC0-Fotos (Nachweise in PHOTOS.md). Die Team-Porträts
sind bewusst Monogramme: Hier gehören echte Fotos der Inhaberinnen hin.

## Trennung von anderen Projekten im Repository

- Alle Dateien dieses Projekts liegen ausschliesslich in `beauty-studio/`.
- Es gibt keine gemeinsamen Komponenten, Styles, Assets oder Konfigurationen mit anderen
  Websites im Repository und kein Workspace-Setup im Wurzelverzeichnis.
- `node_modules/`, `package-lock.json`, `.gitignore`, `.editorconfig` (`root = true`) und die
  Prettier-Konfiguration sind projekteigen.
- Die PostCSS-Konfiguration ist in `astro.config.mjs` inline gesetzt, damit keine
  Konfiguration aus übergeordneten Ordnern übernommen wird.
- Dev- und Preview-Server nutzen Port **4400**, damit das Projekt parallel zu anderen
  Projekten laufen kann.

## Deployment

Die Website wird als statische Seite gebaut. Bei Hosting-Anbietern (z. B. Netlify, Vercel,
Cloudflare Pages) folgende Einstellungen verwenden:

| Einstellung             | Wert            |
| ----------------------- | --------------- |
| Basis-/Root-Verzeichnis | `beauty-studio` |
| Build-Befehl            | `npm run build` |
| Ausgabeverzeichnis      | `dist`          |
| Node-Version            | 22              |

Vor dem ersten Deployment in `astro.config.mjs` die Option `site` auf die endgültige Domain
setzen. Die Seiten enthalten `noindex`, da es sich um eine Demo eines fiktiven Studios handelt.
