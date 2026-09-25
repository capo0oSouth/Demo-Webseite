import { openingHours } from '../data/site';
import { staffById, type StaffId } from '../data/team';

/**
 * Simulierte Terminverfügbarkeit. Bestehende Buchungen werden pro Mitarbeiterin und Tag
 * deterministisch erzeugt – die Demo verhält sich dadurch wie ein echter, teilweise
 * ausgebuchter Kalender, ohne einen Server zu benötigen.
 */

export const SLOT_STEP = 30;
export const BOOKING_WINDOW_DAYS = 84;

export const toISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const fromISO = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const minutesToTime = (m: number) =>
  `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

const timeToMinutes = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

function easterSunday(year: number) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

const holidayCache = new Map<number, Map<string, string>>();

/** Feiertage im Kanton St. Gallen sowie Schliesstage des Studios (24. und 31. Dezember). */
export function holidays(year: number) {
  const cached = holidayCache.get(year);
  if (cached) return cached;
  const easter = easterSunday(year);
  const offset = (days: number) => {
    const d = new Date(easter);
    d.setDate(d.getDate() + days);
    return toISO(d);
  };
  const map = new Map<string, string>([
    [`${year}-01-01`, 'Neujahr'],
    [`${year}-01-02`, 'Berchtoldstag'],
    [offset(-2), 'Karfreitag'],
    [offset(1), 'Ostermontag'],
    [offset(39), 'Auffahrt'],
    [offset(50), 'Pfingstmontag'],
    [`${year}-08-01`, 'Bundesfeiertag'],
    [`${year}-11-01`, 'Allerheiligen'],
    [`${year}-12-24`, 'Heiligabend'],
    [`${year}-12-25`, 'Weihnachten'],
    [`${year}-12-26`, 'Stephanstag'],
    [`${year}-12-31`, 'Silvester'],
  ]);
  holidayCache.set(year, map);
  return map;
}

export const holidayName = (d: Date) => holidays(d.getFullYear()).get(toISO(d));

export function openingFor(d: Date) {
  const entry = openingHours.find((o) => o.day === d.getDay());
  if (!entry?.open || !entry.close || holidayName(d)) return null;
  return { open: timeToMinutes(entry.open), close: timeToMinutes(entry.close) };
}

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seeded(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const busyCache = new Map<string, [number, number][]>();

/** Bereits belegte Zeitfenster einer Mitarbeiterin an einem Tag. */
function busyBlocks(staff: StaffId, d: Date, today: Date) {
  const key = `${staff}-${toISO(d)}`;
  const cached = busyCache.get(key);
  if (cached) return cached;
  const hours = openingFor(d);
  const blocks: [number, number][] = [];
  if (!hours) return blocks;
  const r = seeded(hash(key));
  const daysAhead = Math.round((d.getTime() - today.getTime()) / 86400000);
  // Nahe Termine sind stärker gebucht als weit entfernte, Samstage besonders beliebt
  let load = daysAhead <= 3 ? 0.72 : daysAhead <= 10 ? 0.56 : daysAhead <= 24 ? 0.44 : 0.3;
  if (d.getDay() === 6) load += 0.14;
  if (r() < 0.07) load = 1; // ab und zu komplett ausgebucht
  let t = hours.open;
  while (t < hours.close - 30) {
    if (r() < load) {
      const len = [45, 60, 60, 75, 90, 120][Math.floor(r() * 6)];
      blocks.push([t, Math.min(hours.close, t + len)]);
      t += len;
    } else {
      t += [30, 30, 60][Math.floor(r() * 3)];
    }
  }
  busyCache.set(key, blocks);
  return blocks;
}

export interface Slot {
  time: string;
  minutes: number;
  staff: StaffId[];
}

export function slotsFor(staffIds: StaffId[], d: Date, duration: number, now = new Date()) {
  const hours = openingFor(d);
  if (!hours) return [] as Slot[];
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (d < today) return [];
  const isToday = toISO(d) === toISO(now);
  const earliest = isToday ? now.getHours() * 60 + now.getMinutes() + 120 : 0;

  const result: Slot[] = [];
  for (let m = hours.open; m + duration <= hours.close; m += SLOT_STEP) {
    if (m < earliest) continue;
    const free = staffIds.filter((id) => {
      if (!staffById[id].workdays.includes(d.getDay())) return false;
      return !busyBlocks(id, d, today).some(([s, e]) => m < e && m + duration > s);
    });
    if (free.length) result.push({ time: minutesToTime(m), minutes: m, staff: free });
  }
  return result;
}

export type DayStatus = 'closed' | 'holiday' | 'past' | 'full' | 'few' | 'available' | 'off';

export function dayStatus(staffIds: StaffId[], d: Date, duration: number, now = new Date()) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const last = new Date(today);
  last.setDate(last.getDate() + BOOKING_WINDOW_DAYS);
  if (d < today) return { status: 'past' as DayStatus, count: 0 };
  if (d > last) return { status: 'off' as DayStatus, count: 0 };
  if (holidayName(d)) return { status: 'holiday' as DayStatus, count: 0 };
  if (!openingFor(d)) return { status: 'closed' as DayStatus, count: 0 };
  if (!staffIds.some((id) => staffById[id].workdays.includes(d.getDay())))
    return { status: 'off' as DayStatus, count: 0 };
  const count = slotsFor(staffIds, d, duration, now).length;
  return { status: (count === 0 ? 'full' : count <= 3 ? 'few' : 'available') as DayStatus, count };
}

export const weekdayLong = (d: Date) => d.toLocaleDateString('de-CH', { weekday: 'long' });

export const formatDateLong = (d: Date) =>
  d.toLocaleDateString('de-CH', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

export const formatDateShort = (d: Date) =>
  d.toLocaleDateString('de-CH', { weekday: 'short', day: 'numeric', month: 'short' });
