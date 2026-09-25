export type StaffId = 'noemi' | 'alessia' | 'lea';

export interface StaffMember {
  id: StaffId;
  name: string;
  firstName: string;
  role: string;
  focus: string;
  since: string;
  bio: string;
  quote: string;
  specialties: string[];
  /** Arbeitstage, 0 = Sonntag (wie Date.getDay()). */
  workdays: number[];
}

export const team: StaffMember[] = [
  {
    id: 'noemi',
    name: 'Noemi Egger',
    firstName: 'Noemi',
    role: 'Nail Artist · Mitinhaberin',
    focus: 'Nails',
    since: 'Nageldesignerin seit 2017',
    bio: 'Noemi hat ihre Ausbildung in St. Gallen gemacht und danach vier Jahre in einem Zürcher Nail-Studio gearbeitet. Ihre Spezialität sind feine Formen, saubere Nagelhaut-Arbeit und minimalistische Nail Art, die auch nach drei Wochen noch schön aussieht.',
    quote: 'Eine perfekte Form ist wie ein gutes Kleid – sie passt einfach zu dir.',
    specialties: ['Gel-Modellage', 'BIAB', 'Minimal Nail Art', 'Pediküre'],
    workdays: [2, 3, 5, 6],
  },
  {
    id: 'alessia',
    name: 'Alessia Keller',
    firstName: 'Alessia',
    role: 'Lash Artist · Mitinhaberin',
    focus: 'Lashes',
    since: 'Lash Artist seit 2019',
    bio: 'Alessia ist zertifizierte Volume-Lash-Artist und bildet sich jedes Jahr weiter. Sie liebt massgeschneiderte Wimpern-Stylings, die zur Augenform passen – von ganz natürlich bis zum vollen Glamour-Look.',
    quote: 'Die schönsten Wimpern sind die, bei denen man fragt: Sind das deine eigenen?',
    specialties: ['Volume & Mega Volume', 'Lash Mapping', 'Lash Lifting', 'Gel-Lack'],
    workdays: [2, 4, 5, 6],
  },
  {
    id: 'lea',
    name: 'Lea Zünd',
    firstName: 'Lea',
    role: 'Brow Artist · Mitinhaberin',
    focus: 'Brows',
    since: 'Brow Artist seit 2018',
    bio: 'Lea ist die Perfektionistin im Team. Sie vermisst jede Braue individuell, arbeitet mit Henna, Lamination und Permanent Make-up und berät ehrlich, wenn weniger mehr ist.',
    quote:
      'Brauen sind der Rahmen deines Gesichts – sie sollen dich unterstreichen, nicht verändern.',
    specialties: ['Brow Lamination', 'Henna Brows', 'Microblading', 'Powder Brows'],
    workdays: [3, 4, 5, 6],
  },
];

export const staffById = Object.fromEntries(team.map((m) => [m.id, m])) as Record<
  StaffId,
  StaffMember
>;
