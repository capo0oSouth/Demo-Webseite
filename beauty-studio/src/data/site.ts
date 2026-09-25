/**
 * Stammdaten des (fiktiven) Studios. Alle Angaben sind frei erfunden und dienen
 * ausschliesslich der Demo.
 */

export const site = {
  name: 'Maison Trois',
  claim: 'Nails · Lashes · Brows',
  tagline: 'Drei Frauen. Drei Leidenschaften. Ein Studio in Wil.',
  founded: 2022,
  description:
    'Maison Trois ist das Beauty-Studio für Nails, Lashes und Brows in Wil SG – geführt von Noemi, Alessia und Lea. Präzise Handarbeit, hochwertige Produkte und ein Ort zum Durchatmen.',
  address: {
    street: 'Obere Bahnhofstrasse 24',
    zip: '9500',
    city: 'Wil SG',
    floor: '1. OG, Eingang neben der Boutique',
  },
  phone: '071 911 24 30',
  phoneHref: '+41719112430',
  email: 'hallo@maison-trois.ch',
  instagram: '@maisontrois.wil',
  mapsUrl: 'https://www.openstreetmap.org/search?query=Obere%20Bahnhofstrasse%2C%209500%20Wil',
  payment: ['Karte', 'TWINT', 'Bar'],
} as const;

/** Öffnungszeiten, Wochentag 0 = Sonntag (wie Date.getDay()). */
export const openingHours: { day: number; label: string; open?: string; close?: string }[] = [
  { day: 1, label: 'Montag' },
  { day: 2, label: 'Dienstag', open: '09:00', close: '19:00' },
  { day: 3, label: 'Mittwoch', open: '09:00', close: '19:00' },
  { day: 4, label: 'Donnerstag', open: '09:00', close: '20:00' },
  { day: 5, label: 'Freitag', open: '09:00', close: '19:00' },
  { day: 6, label: 'Samstag', open: '09:00', close: '16:00' },
  { day: 0, label: 'Sonntag' },
];

export const navigation = [
  { href: '/nails', label: 'Nails' },
  { href: '/lashes', label: 'Lashes' },
  { href: '/brows', label: 'Brows' },
  { href: '/preise', label: 'Preise' },
  { href: '/studio', label: 'Studio & Team' },
  { href: '/kontakt', label: 'Kontakt' },
] as const;
