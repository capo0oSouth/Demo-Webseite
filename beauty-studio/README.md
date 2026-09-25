# Beauty Studio – Demo-Website

Eigenständiges Webprojekt für die Demo-Website eines Beauty-Studios, gebaut mit
[Astro](https://astro.build) und TypeScript.

Das Projekt liegt zwar im Repository `Demo-Webseite`, ist aber **technisch vollständig
unabhängig** von allen anderen Websites darin: eigene Abhängigkeiten, eigene Konfiguration,
eigene Assets, eigener Build und eigenes Deployment.

## Voraussetzungen

- Node.js **22.12 oder neuer** (siehe `.nvmrc`)
- npm

## Befehle

Alle Befehle werden **im Ordner `beauty-studio/`** ausgeführt:

```bash
cd beauty-studio
npm install
```

| Befehl                 | Beschreibung                                                  |
| ---------------------- | ------------------------------------------------------------- |
| `npm run dev`          | Entwicklungsserver unter <http://localhost:4400>              |
| `npm run build`        | Typprüfung (`astro check`) und Produktions-Build nach `dist/` |
| `npm run preview`      | Lokale Vorschau des Produktions-Builds unter Port 4400        |
| `npm run check`        | Nur Typ- und Template-Prüfung                                 |
| `npm run format`       | Code mit Prettier formatieren                                 |
| `npm run format:check` | Formatierung prüfen, ohne Dateien zu ändern                   |

Hinweis: Wird der Dev- oder Preview-Server ohne interaktives Terminal gestartet (z. B. aus
einem Skript), läuft er im Hintergrund weiter. Beenden mit `npx astro dev stop` bzw.
`npx astro preview stop`.

## Projektstruktur

```text
beauty-studio/
├── public/              # Statische Dateien, unverändert ausgeliefert (Favicon usw.)
├── src/
│   ├── assets/          # Bilder und Medien, die von Astro optimiert werden
│   ├── components/      # Wiederverwendbare UI-Komponenten
│   ├── layouts/         # Seitenlayouts (BaseLayout.astro)
│   ├── pages/           # Seiten – jede Datei wird zu einer Route
│   └── styles/          # Globale Styles und Design-Tokens
├── astro.config.mjs     # Astro-/Vite-Konfiguration
├── tsconfig.json        # TypeScript-Konfiguration (strict)
└── package.json         # Eigene Abhängigkeiten und Skripte
```

## Trennung von anderen Projekten im Repository

- Alle Dateien dieses Projekts liegen ausschließlich in `beauty-studio/`.
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
setzen.
