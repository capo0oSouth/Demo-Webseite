// @ts-check
import { defineConfig } from 'astro/config';

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  // Vor dem Deployment auf die endgültige Domain setzen (für Canonical-URLs, Sitemap usw.).
  // site: 'https://beauty-studio.example',

  // Eigener Port, damit dieses Projekt parallel zu anderen Projekten im Repository laufen kann.
  server: { port: 4400 },

  vite: {
    css: {
      // Inline-Konfiguration verhindert, dass Vite eine PostCSS-Konfiguration aus
      // übergeordneten Ordnern (z. B. einer anderen Website im Repository) übernimmt.
      postcss: {},
    },
  },
});
