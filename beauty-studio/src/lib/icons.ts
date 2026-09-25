/** Schlanke Linien-Icons (24×24, stroke = currentColor), geteilt von Astro und Svelte. */
export const icons = {
  arrow: '<path d="M4 12h15M13 6l6 6-6 6"/>',
  arrowLeft: '<path d="M20 12H5M11 6l-6 6 6 6"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  chevronLeft: '<path d="m15 6-6 6 6 6"/>',
  chevronRight: '<path d="m9 6 6 6-6 6"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  menu: '<path d="M4 8h16M4 16h16"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  calendar:
    '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.4"/>',
  phone:
    '<path d="M6.6 3.8h2.6l1.5 4-2 1.3a11 11 0 0 0 6.2 6.2l1.3-2 4 1.5v2.6a2 2 0 0 1-2.2 2A16.4 16.4 0 0 1 4.6 6a2 2 0 0 1 2-2.2Z"/>',
  mail: '<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="m4 7 8 6 8-6"/>',
  user: '<circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/>',
  users:
    '<circle cx="9" cy="9" r="3.3"/><path d="M3 19.5a6 6 0 0 1 12 0"/><path d="M15.5 5.9a3.3 3.3 0 0 1 0 6.3M17.5 14a6 6 0 0 1 3.5 5.5"/>',
  sparkle:
    '<path d="M12 2.8c.7 4.6 2.1 6 6.7 6.7-4.6.7-6 2.1-6.7 6.7-.7-4.6-2.1-6-6.7-6.7 4.6-.7 6-2.1 6.7-6.7Z"/><path d="M19 15.5c.3 1.9.9 2.5 2.8 2.8-1.9.3-2.5.9-2.8 2.8-.3-1.9-.9-2.5-2.8-2.8 1.9-.3 2.5-.9 2.8-2.8Z"/>',
  star: '<path d="m12 3.6 2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8Z"/>',
  heart:
    '<path d="M12 19.5s-7.5-4.4-7.5-10a4.2 4.2 0 0 1 7.5-2.6 4.2 4.2 0 0 1 7.5 2.6c0 5.6-7.5 10-7.5 10Z"/>',
  shield:
    '<path d="M12 3 5 5.8v5.5c0 4.3 3 8.2 7 9.7 4-1.5 7-5.4 7-9.7V5.8Z"/><path d="m9 12 2.2 2.2L15.5 10"/>',
  leaf: '<path d="M5 19c0-8 5-13.5 14-14 0 9-5.5 14-14 14Z"/><path d="M5 19 13 11"/>',
  gift: '<rect x="3.5" y="8.5" width="17" height="4" rx="1"/><path d="M5 12.5V20h14v-7.5M12 8.5V20M12 8.5S9.8 4 7.7 4.5c-2 .5-1 4 4.3 4M12 8.5s2.2-4.5 4.3-4c2 .5 1 4-4.3 4"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 7.8v.2"/>',
  alert: '<path d="M12 4 2.8 19.5h18.4Z"/><path d="M12 10v4.5M12 17v.2"/>',
  train:
    '<rect x="6" y="3.5" width="12" height="13" rx="3"/><path d="M6 11h12M9 20l-1.5 1.5M15 20l1.5 1.5M9.5 14h.01M14.5 14h.01"/>',
  car: '<path d="M4.5 16.5V12l1.8-4.6A2 2 0 0 1 8.2 6h7.6a2 2 0 0 1 1.9 1.4l1.8 4.6v4.5"/><path d="M3.5 12h17v4.5h-17zM7 16.5V19M17 16.5V19"/>',
  instagram:
    '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="3.8"/><path d="M17.2 6.8h.01"/>',
  play: '<path d="M8 5.5v13l10.5-6.5Z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  edit: '<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16Z"/><path d="m13.5 6.5 4 4"/>',
  card: '<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3 10h18M7 15h3"/>',
  quote:
    '<path d="M10 7c-3 .8-5 3.2-5 6.5V17h4.5v-4.5H7c0-1.8 1.2-3 3-3.5ZM19 7c-3 .8-5 3.2-5 6.5V17h4.5v-4.5H16c0-1.8 1.2-3 3-3.5Z"/>',
  drop: '<path d="M12 3.5s6 6.4 6 10.5a6 6 0 0 1-12 0c0-4.1 6-10.5 6-10.5Z"/>',
} as const;

export type IconName = keyof typeof icons;

export const iconSvg = (name: IconName, cls = '') =>
  `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${icons[name]}</svg>`;
