import type { StaffId } from './team';

/**
 * Zentrale Leistungs- und Preisdaten. Seiten, Preisliste und Buchungssystem lesen alle
 * aus dieser Datei – so bleiben Bezeichnungen, Varianten und Preise überall identisch.
 */

export type CategoryId = 'nails' | 'lashes' | 'brows';

export interface Choice {
  id: string;
  label: string;
  hint?: string;
  /** Aufpreis in CHF. */
  price?: number;
  /** Zusätzliche Behandlungszeit in Minuten. */
  minutes?: number;
  /** Farbwert für Farbfelder. */
  swatch?: string;
  /** Nur wählbar, wenn andere Gruppen einen dieser Werte haben. */
  requires?: Record<string, string[]>;
  /** Ersatzwahl, falls diese Option durch eine andere Wahl unmöglich wird. */
  fallback?: string;
}

export type GroupKind = 'shape' | 'length' | 'swatch' | 'cards' | 'chips';

export interface OptionGroup {
  id: string;
  label: string;
  help?: string;
  kind: GroupKind;
  choices: Choice[];
  default: string;
  /** Gruppe nur anzeigen, wenn eine andere Gruppe einen dieser Werte hat. */
  showIf?: Record<string, string[]>;
}

export interface Addon {
  id: string;
  label: string;
  hint: string;
  price: number;
  minutes: number;
}

export type VisualKind = 'hand' | 'toes' | 'lashes' | 'brows' | 'combo';

export interface Treatment {
  id: string;
  category: CategoryId;
  name: string;
  tagline: string;
  description: string;
  idealFor: string;
  durability: string;
  minutes: number;
  price: number;
  badge?: string;
  note?: string;
  visual: VisualKind;
  /** Feste Visualisierungs-Parameter, die nicht über Optionen wählbar sind. */
  preset?: Record<string, string>;
  groups: OptionGroup[];
  addons: Addon[];
  staff: StaffId[];
}

export interface Category {
  id: CategoryId;
  name: string;
  title: string;
  intro: string;
  href: string;
}

export const categories: Category[] = [
  {
    id: 'nails',
    name: 'Nails',
    title: 'Nägel, die zu dir passen',
    intro: 'Gel-Lack, BIAB, Modellage, Maniküre und Pediküre – in deiner Wunschform und -farbe.',
    href: '/nails',
  },
  {
    id: 'lashes',
    name: 'Lashes',
    title: 'Wimpern mit Wow-Effekt',
    intro:
      'Von Classic bis Mega Volume, Lash Lifting und Färben – individuell auf deine Augen gemappt.',
    href: '/lashes',
  },
  {
    id: 'brows',
    name: 'Brows',
    title: 'Brauen, die dein Gesicht rahmen',
    intro: 'Shaping, Färben, Henna, Lamination und Permanent Make-up – präzise vermessen.',
    href: '/brows',
  },
];

/* ------------------------------------------------------------------ Nails */

export const nailColors: Choice[] = [
  { id: 'milky', label: 'Milky White', swatch: '#F3ECE6' },
  { id: 'ballet', label: 'Ballet Pink', swatch: '#F0CFCC' },
  { id: 'nude', label: 'Nude Beige', swatch: '#DDB99E' },
  { id: 'rose', label: 'Rosé', swatch: '#D6969C' },
  { id: 'mauve', label: 'Mauve', swatch: '#A26B7A' },
  { id: 'cherry', label: 'Cherry Red', swatch: '#A3182D' },
  { id: 'bordeaux', label: 'Bordeaux', swatch: '#5A1426' },
  { id: 'mocha', label: 'Mocha', swatch: '#7A5343' },
  { id: 'lavender', label: 'Lavender', swatch: '#C5B5DC' },
  { id: 'sage', label: 'Sage', swatch: '#A7B799' },
  { id: 'babyblue', label: 'Baby Blue', swatch: '#B7D1E6' },
  { id: 'noir', label: 'Noir', swatch: '#211B20' },
];

const biabColors: Choice[] = [
  {
    id: 'clear',
    label: 'Klar',
    hint: 'Transparent, natürlicher Glanz – nur mit Finish Uni.',
    swatch: '#F7E4DE',
    requires: { finish: ['solid'] },
    fallback: 'milky',
  },
  ...nailColors,
];

const shapeChoices: Record<string, Choice> = {
  square: {
    id: 'square',
    label: 'Eckig',
    hint: 'Gerade Kanten, klare Linie – modern und grafisch.',
  },
  squoval: {
    id: 'squoval',
    label: 'Squoval',
    hint: 'Eckig mit sanft gerundeten Ecken – der alltagstaugliche Klassiker.',
  },
  round: { id: 'round', label: 'Rund', hint: 'Folgt der Fingerkuppe – natürlich und robust.' },
  oval: { id: 'oval', label: 'Oval', hint: 'Weich gerundet, lässt die Finger schlanker wirken.' },
  almond: {
    id: 'almond',
    label: 'Mandel',
    hint: 'Schmal zulaufend mit weicher Spitze – elegant und feminin.',
  },
  coffin: {
    id: 'coffin',
    label: 'Ballerina',
    hint: 'Zulaufend mit gerader Spitze, auch «Coffin» genannt. Ab Länge Mittel.',
    requires: { length: ['medium', 'long', 'xl'] },
    fallback: 'squoval',
  },
  stiletto: {
    id: 'stiletto',
    label: 'Stiletto',
    hint: 'Spitz zulaufend und ausdrucksstark. Ab Länge Mittel.',
    requires: { length: ['medium', 'long', 'xl'] },
    fallback: 'almond',
  },
};

const naturalShapes: OptionGroup = {
  id: 'shape',
  label: 'Form',
  help: 'Wir feilen deine Naturnägel in die gewünschte Form.',
  kind: 'shape',
  default: 'squoval',
  choices: ['square', 'squoval', 'round', 'oval', 'almond'].map((id) => shapeChoices[id]),
};

const allShapes: OptionGroup = {
  id: 'shape',
  label: 'Form',
  help: 'Die Form wird bei der Modellage frei aufgebaut.',
  kind: 'shape',
  default: 'almond',
  choices: Object.values(shapeChoices),
};

function extensionLengths(surcharges: [number, number, number]): OptionGroup {
  const [m, l, xl] = surcharges;
  return {
    id: 'length',
    label: 'Länge',
    help: 'Gemessen ab der Fingerkuppe.',
    kind: 'length',
    default: 'medium',
    choices: [
      { id: 'short', label: 'Kurz', hint: 'ca. 2–4 mm über der Fingerkuppe' },
      { id: 'medium', label: 'Mittel', hint: 'ca. 5–8 mm', price: m, minutes: m },
      { id: 'long', label: 'Lang', hint: 'ca. 9–12 mm', price: l, minutes: l },
      { id: 'xl', label: 'Extra lang', hint: 'ab 13 mm', price: xl, minutes: xl },
    ],
  };
}

const nailFinish: OptionGroup = {
  id: 'finish',
  label: 'Finish',
  kind: 'cards',
  default: 'solid',
  choices: [
    { id: 'solid', label: 'Uni', hint: 'Eine Farbe, deckend und glänzend.' },
    {
      id: 'french',
      label: 'French',
      hint: 'Zarte Nude-Basis, die Spitze in deiner gewählten Farbe.',
      price: 15,
      minutes: 15,
    },
    {
      id: 'babyboomer',
      label: 'Babyboomer',
      hint: 'Weicher Farbverlauf von Nude zur Spitze in deiner Farbe.',
      price: 15,
      minutes: 15,
    },
    {
      id: 'chrome',
      label: 'Chrome',
      hint: 'Spiegelnder Metallic-Effekt über deiner Farbe.',
      price: 10,
      minutes: 10,
    },
    {
      id: 'cateye',
      label: 'Cat Eye',
      hint: 'Magnetischer Schimmerstreifen, der sich im Licht bewegt.',
      price: 10,
      minutes: 10,
    },
    {
      id: 'glitter',
      label: 'Glitzer',
      hint: 'Feiner Glitzer, eingearbeitet in deine Farbe.',
      price: 10,
      minutes: 5,
    },
  ],
};

const biabFinish: OptionGroup = {
  ...nailFinish,
  choices: nailFinish.choices.filter((c) =>
    ['solid', 'french', 'babyboomer', 'chrome'].includes(c.id),
  ),
};

const nailArt: OptionGroup[] = [
  {
    id: 'art',
    label: 'Nail Art',
    kind: 'cards',
    default: 'none',
    choices: [
      { id: 'none', label: 'Ohne', hint: 'Pur und elegant.' },
      {
        id: 'accent',
        label: 'Akzentnägel',
        hint: 'Design auf den Ringfingern beider Hände.',
        price: 10,
        minutes: 15,
      },
      {
        id: 'full',
        label: 'Alle Nägel',
        hint: 'Design auf allen zehn Nägeln.',
        price: 25,
        minutes: 30,
      },
    ],
  },
  {
    id: 'motif',
    label: 'Motiv',
    kind: 'chips',
    default: 'lines',
    showIf: { art: ['accent', 'full'] },
    choices: [
      { id: 'lines', label: 'Goldlinien', hint: 'Feine Linien in Gold' },
      { id: 'dots', label: 'Pünktchen', hint: 'Minimalistische Dots' },
      { id: 'flower', label: 'Blümchen', hint: 'Zarte Blüten' },
    ],
  },
];

const colorGroup = (
  choices: Choice[],
  defaultId: string,
  showIf?: OptionGroup['showIf'],
): OptionGroup => ({
  id: 'color',
  label: 'Farbe',
  kind: 'swatch',
  default: defaultId,
  choices,
  ...(showIf ? { showIf } : {}),
});

const handAddons: Record<string, Addon> = {
  soakoff: {
    id: 'soakoff',
    label: 'Ablösen alter Gel-/Fremdarbeit',
    hint: 'Wenn du mit Gel oder Gel-Lack aus einem anderen Studio kommst.',
    price: 15,
    minutes: 15,
  },
  paraffin: {
    id: 'paraffin',
    label: 'Paraffin-Handbad',
    hint: 'Wärmende Pflegepackung für besonders zarte Hände.',
    price: 15,
    minutes: 15,
  },
  repair: {
    id: 'repair',
    label: 'Reparatur eines Nagels',
    hint: 'Für einen eingerissenen oder abgebrochenen Nagel.',
    price: 8,
    minutes: 10,
  },
};

/* ----------------------------------------------------------------- Lashes */

const lashTechnique = (
  deltas: [number, number, number],
  minutes: [number, number, number],
): OptionGroup => ({
  id: 'technique',
  label: 'Technik',
  help: 'Bestimmt, wie dicht und voll deine Wimpern wirken.',
  kind: 'cards',
  default: 'classic',
  choices: [
    {
      id: 'classic',
      label: 'Classic 1:1',
      hint: 'Eine Extension pro Naturwimper – natürlich, wie frisch getuscht.',
    },
    {
      id: 'hybrid',
      label: 'Hybrid',
      hint: 'Mix aus Classic und feinen Fächern – mehr Fülle, trotzdem natürlich.',
      price: deltas[0],
      minutes: minutes[0],
    },
    {
      id: 'volume',
      label: 'Volume',
      hint: 'Handgefertigte Fächer aus 2–5 ultrafeinen Wimpern – weich und voll.',
      price: deltas[1],
      minutes: minutes[1],
    },
    {
      id: 'mega',
      label: 'Mega Volume',
      hint: 'Dichte Fächer aus 6 und mehr Wimpern – maximal dramatisch.',
      price: deltas[2],
      minutes: minutes[2],
    },
  ],
});

const lashStyling: OptionGroup[] = [
  {
    id: 'look',
    label: 'Look',
    help: 'Wo die längsten Wimpern sitzen, verändert die Wirkung deiner Augen.',
    kind: 'cards',
    default: 'natural',
    choices: [
      {
        id: 'natural',
        label: 'Natural',
        hint: 'Folgt deiner natürlichen Wimpernlinie, sanft ansteigend.',
      },
      {
        id: 'doll',
        label: 'Doll Eye',
        hint: 'Längste Wimpern in der Mitte – öffnet das Auge, wirkt runder.',
      },
      {
        id: 'cat',
        label: 'Cat Eye',
        hint: 'Nach aussen hin länger – zieht das Auge optisch nach oben.',
      },
      {
        id: 'squirrel',
        label: 'Squirrel',
        hint: 'Höchster Punkt kurz vor dem äusseren Rand – ein liftender Effekt.',
      },
    ],
  },
  {
    id: 'curl',
    label: 'Schwung',
    kind: 'chips',
    default: 'c',
    choices: [
      { id: 'c', label: 'C-Curl', hint: 'Natürlicher Schwung' },
      { id: 'cc', label: 'CC-Curl', hint: 'Deutlicher Schwung' },
      { id: 'd', label: 'D-Curl', hint: 'Starker, wacher Schwung' },
    ],
  },
  {
    id: 'lashlength',
    label: 'Länge',
    kind: 'chips',
    default: 'medium',
    choices: [
      { id: 'subtle', label: 'Dezent', hint: '8–10 mm' },
      { id: 'medium', label: 'Mittel', hint: '9–12 mm' },
      { id: 'long', label: 'Lang', hint: '10–14 mm' },
    ],
  },
  {
    id: 'accent',
    label: 'Farbakzent',
    help: 'Ein paar farbige Wimpern am äusseren Augenwinkel.',
    kind: 'swatch',
    default: 'none',
    choices: [
      { id: 'none', label: 'Ohne', hint: 'Klassisch schwarz', swatch: '#1B1417' },
      { id: 'mocha', label: 'Mokka', price: 15, minutes: 10, swatch: '#6B4432' },
      { id: 'bordeaux', label: 'Bordeaux', price: 15, minutes: 10, swatch: '#7A1E36' },
      { id: 'rose', label: 'Rosé', price: 15, minutes: 10, swatch: '#D98A9A' },
    ],
  },
];

/* ------------------------------------------------------------------ Brows */

const browColors: Choice[] = [
  { id: 'ash', label: 'Aschblond', swatch: '#8E7B67' },
  { id: 'light', label: 'Hellbraun', swatch: '#7A5A44' },
  { id: 'medium', label: 'Mittelbraun', swatch: '#5A3F30' },
  { id: 'dark', label: 'Dunkelbraun', swatch: '#3C2A21' },
  { id: 'graphite', label: 'Graphit', swatch: '#3A3736' },
];

const browColorGroup = (showIf?: OptionGroup['showIf']): OptionGroup => ({
  id: 'browcolor',
  label: 'Farbton',
  help: 'Wir mischen die Farbe passend zu Haar- und Hautton – das hier ist die Richtung.',
  kind: 'swatch',
  default: 'medium',
  choices: browColors,
  ...(showIf ? { showIf } : {}),
});

const browAddons: Record<string, Addon> = {
  lip: {
    id: 'lip',
    label: 'Oberlippe mit Wachs',
    hint: 'Sanfte Haarentfernung an der Oberlippe.',
    price: 12,
    minutes: 10,
  },
  lashtint: {
    id: 'lashtint',
    label: 'Wimpern färben',
    hint: 'Mehr Ausdruck ohne Mascara, hält 4–6 Wochen.',
    price: 20,
    minutes: 15,
  },
};

/* -------------------------------------------------------------- Treatments */

export const treatments: Treatment[] = [
  // Nails
  {
    id: 'gel-lack',
    category: 'nails',
    name: 'Gel-Lack',
    tagline: 'Farbe, die hält – auf deinen Naturnägeln',
    description:
      'Inklusive Maniküre: Wir formen deine Nägel, pflegen die Nagelhaut und tragen Gel-Lack in deiner Wunschfarbe auf. Er härtet unter der Lampe aus und glänzt ohne Absplittern bis zum nächsten Termin.',
    idealFor: 'Gepflegte Naturnägel mit langanhaltender Farbe',
    durability: 'hält 2–3 Wochen',
    minutes: 60,
    price: 75,
    badge: 'Beliebt',
    visual: 'hand',
    preset: { length: 'natural' },
    groups: [naturalShapes, colorGroup(nailColors, 'rose'), nailFinish, ...nailArt],
    addons: [handAddons.soakoff, handAddons.paraffin],
    staff: ['noemi', 'alessia'],
  },
  {
    id: 'biab',
    category: 'nails',
    name: 'BIAB Naturnagelverstärkung',
    tagline: 'Stärkt weiche und brüchige Naturnägel',
    description:
      'BIAB («Builder in a Bottle») ist ein flexibles Aufbau-Gel, das deine eigenen Nägel stabilisiert, damit sie ohne Einreissen wachsen können. Ohne künstliche Verlängerung – auf Wunsch mit leichtem Überstand.',
    idealFor: 'Weiche, brüchige Nägel, die du wachsen lassen möchtest',
    durability: 'Auffüllen nach 3–4 Wochen',
    minutes: 75,
    price: 95,
    badge: 'Trend',
    visual: 'hand',
    groups: [
      naturalShapes,
      {
        id: 'length',
        label: 'Länge',
        kind: 'length',
        default: 'natural',
        choices: [
          { id: 'natural', label: 'Naturlänge', hint: 'Deine eigene Länge, verstärkt' },
          {
            id: 'short',
            label: 'Leicht verlängert',
            hint: 'ca. 2–4 mm Überstand',
            price: 15,
            minutes: 15,
          },
        ],
      },
      colorGroup(biabColors, 'ballet'),
      biabFinish,
      ...nailArt,
    ],
    addons: [handAddons.soakoff, handAddons.paraffin],
    staff: ['noemi'],
  },
  {
    id: 'gel-neuset',
    category: 'nails',
    name: 'Gel-Modellage · Neuset',
    tagline: 'Verlängerung in deiner Wunschform',
    description:
      'Mit Gel verlängern wir deine Nägel über eine Schablone und modellieren Form und Länge von Hand. Ideal, wenn du Länge möchtest, deine Naturnägel kurz sind oder du eine Form wie Ballerina oder Stiletto tragen willst.',
    idealFor: 'Länge, Wunschform und maximale Stabilität',
    durability: 'Auffüllen alle 3–4 Wochen',
    minutes: 120,
    price: 120,
    visual: 'hand',
    groups: [
      allShapes,
      extensionLengths([10, 20, 35]),
      colorGroup(nailColors, 'milky'),
      nailFinish,
      ...nailArt,
    ],
    addons: [handAddons.soakoff, handAddons.paraffin],
    staff: ['noemi'],
  },
  {
    id: 'gel-refill',
    category: 'nails',
    name: 'Gel-Modellage · Auffüllen',
    tagline: 'Nachgewachsenes auffüllen, Design erneuern',
    description:
      'Nach 3–4 Wochen ist der Naturnagel ein Stück herausgewachsen. Wir kürzen, feilen und füllen die Modellage auf. Form, Länge und Farbe kannst du dabei jedes Mal neu wählen.',
    idealFor: 'Bestehende Gel-Modellage aus unserem Studio',
    durability: 'alle 3–4 Wochen',
    minutes: 90,
    price: 90,
    visual: 'hand',
    groups: [
      allShapes,
      extensionLengths([5, 10, 20]),
      colorGroup(nailColors, 'milky'),
      nailFinish,
      ...nailArt,
    ],
    addons: [handAddons.repair, handAddons.paraffin],
    staff: ['noemi'],
  },
  {
    id: 'manicure',
    category: 'nails',
    name: 'Maniküre Classic',
    tagline: 'Pflege für Hände und Naturnägel',
    description:
      'Nägel kürzen und formen, Nagelhaut sanft zurückschieben, Pflegeöl und eine entspannende Handmassage. Auf Wunsch mit klassischem Nagellack, der etwa eine Woche hält.',
    idealFor: 'Gepflegte Hände ohne Gel',
    durability: 'Lack hält ca. 1 Woche',
    minutes: 45,
    price: 55,
    visual: 'hand',
    preset: { length: 'natural' },
    groups: [
      naturalShapes,
      {
        id: 'polish',
        label: 'Lack',
        kind: 'cards',
        default: 'none',
        choices: [
          { id: 'none', label: 'Ohne Lack', hint: 'Polierte, gepflegte Naturnägel.' },
          { id: 'clear', label: 'Klarlack', hint: 'Transparenter Glanz und Schutz.', price: 5 },
          {
            id: 'color',
            label: 'Farblack',
            hint: 'Klassischer Nagellack in deiner Farbe.',
            price: 10,
            minutes: 10,
          },
        ],
      },
      colorGroup(nailColors, 'ballet', { polish: ['color'] }),
    ],
    addons: [handAddons.paraffin],
    staff: ['noemi', 'alessia'],
  },
  {
    id: 'pedicure',
    category: 'nails',
    name: 'Pediküre',
    tagline: 'Gepflegte Füsse, sandalenbereit',
    description:
      'Warmes Fussbad, Nägel kürzen und formen, Nagelhaut- und Hornhautpflege, Peeling und Fussmassage. Mit klassischem Nagellack oder Gel-Lack, der an den Füssen 4–6 Wochen hält.',
    idealFor: 'Gepflegte Füsse – nicht nur im Sommer',
    durability: 'Gel-Lack hält 4–6 Wochen',
    minutes: 60,
    price: 75,
    visual: 'toes',
    groups: [
      {
        id: 'polish',
        label: 'Lack',
        kind: 'cards',
        default: 'gel',
        choices: [
          { id: 'none', label: 'Ohne Lack', hint: 'Gepflegte, polierte Naturnägel.' },
          {
            id: 'lack',
            label: 'Nagellack',
            hint: 'Klassischer Lack, hält ca. 2 Wochen.',
            price: 10,
            minutes: 10,
          },
          {
            id: 'gel',
            label: 'Gel-Lack',
            hint: 'Glänzt 4–6 Wochen ohne Absplittern.',
            price: 20,
            minutes: 15,
          },
        ],
      },
      colorGroup(nailColors, 'cherry', { polish: ['lack', 'gel'] }),
    ],
    addons: [
      {
        id: 'callus',
        label: 'Intensive Hornhautbehandlung',
        hint: 'Für stark beanspruchte Fersen.',
        price: 10,
        minutes: 10,
      },
      {
        id: 'footparaffin',
        label: 'Paraffin-Fusspackung',
        hint: 'Wärmende Pflege für trockene Haut.',
        price: 18,
        minutes: 15,
      },
    ],
    staff: ['noemi'],
  },
  {
    id: 'nail-removal',
    category: 'nails',
    name: 'Ablösen & Pflege',
    tagline: 'Gel oder BIAB schonend entfernen',
    description:
      'Wir lösen Gel, BIAB oder Gel-Lack schonend ab, glätten die Nageloberfläche und pflegen Nägel und Nagelhaut mit Öl. Ideal für eine Pause zwischen zwei Sets.',
    idealFor: 'Eine Pause für deine Naturnägel',
    durability: '–',
    minutes: 30,
    price: 35,
    visual: 'hand',
    preset: { length: 'natural', polish: 'none' },
    groups: [naturalShapes],
    addons: [handAddons.paraffin],
    staff: ['noemi', 'alessia'],
  },

  // Lashes
  {
    id: 'lash-neuset',
    category: 'lashes',
    name: 'Wimpernverlängerung · Neuset',
    tagline: 'Dein Look, Wimper für Wimper',
    description:
      'Wir setzen feine Kunstwimpern einzeln auf deine Naturwimpern – je nach Technik als einzelne Wimper oder als handgefertigter Fächer. Mit Auffüllen alle 2–3 Wochen bleibt dein Look dauerhaft voll.',
    idealFor: 'Wimpern, die ohne Mascara wach und voll aussehen',
    durability: 'Auffüllen alle 2–3 Wochen',
    minutes: 120,
    price: 150,
    badge: 'Signature',
    visual: 'lashes',
    groups: [lashTechnique([20, 40, 70], [15, 30, 45]), ...lashStyling],
    addons: [
      {
        id: 'foreign',
        label: 'Entfernen von Fremd-Extensions',
        hint: 'Wenn du Extensions aus einem anderen Studio trägst.',
        price: 25,
        minutes: 20,
      },
    ],
    staff: ['alessia'],
  },
  {
    id: 'lash-refill',
    category: 'lashes',
    name: 'Wimpernverlängerung · Auffüllen',
    tagline: 'Lücken schliessen, Look auffrischen',
    description:
      'Herausgewachsene Extensions werden entfernt und neue gesetzt. Auffüllen ist bis drei Wochen nach dem letzten Termin möglich, wenn noch rund 40 % der Extensions vorhanden sind – sonst empfehlen wir ein Neuset.',
    idealFor: 'Bestehende Extensions aus unserem Studio',
    durability: 'alle 2–3 Wochen',
    minutes: 60,
    price: 75,
    visual: 'lashes',
    groups: [
      lashTechnique([10, 20, 30], [10, 15, 20]),
      {
        id: 'interval',
        label: 'Letzter Termin',
        kind: 'chips',
        default: '2w',
        choices: [
          { id: '2w', label: 'Bis 2 Wochen', hint: 'Wenige Lücken' },
          { id: '3w', label: 'Bis 3 Wochen', hint: 'Mehr zum Auffüllen', price: 15, minutes: 15 },
        ],
      },
      ...lashStyling,
    ],
    addons: [],
    staff: ['alessia'],
  },
  {
    id: 'lash-lift',
    category: 'lashes',
    name: 'Lash Lifting',
    tagline: 'Deine eigenen Wimpern, schön geschwungen',
    description:
      'Deine Naturwimpern werden mit einer sanften Lotion ab der Wurzel nach oben geformt – wie mit einer Wimpernzange, nur für 6–8 Wochen. Kein Kleber, keine Extensions, kein Nachfüllen.',
    idealFor: 'Gerade oder nach unten wachsende Naturwimpern',
    durability: 'hält 6–8 Wochen',
    minutes: 60,
    price: 89,
    badge: 'Beliebt',
    visual: 'lashes',
    preset: { mode: 'lift' },
    groups: [
      {
        id: 'tint',
        label: 'Färben',
        kind: 'cards',
        default: 'tint',
        choices: [
          { id: 'none', label: 'Ohne Färben', hint: 'Nur Schwung, deine natürliche Farbe.' },
          {
            id: 'tint',
            label: 'Mit Färben',
            hint: 'Auch helle Spitzen werden dunkel – wie getuscht.',
            price: 15,
            minutes: 10,
          },
        ],
      },
    ],
    addons: [
      {
        id: 'keratin',
        label: 'Keratin-Pflege',
        hint: 'Stärkt und nährt die Wimpern nach dem Lifting.',
        price: 10,
        minutes: 5,
      },
      {
        ...browAddons.lashtint,
        id: 'browtint',
        label: 'Brauen färben',
        hint: 'Passend zum Lifting.',
        price: 15,
        minutes: 10,
      },
    ],
    staff: ['alessia', 'lea'],
  },
  {
    id: 'lash-tint',
    category: 'lashes',
    name: 'Wimpern färben',
    tagline: 'Mehr Ausdruck ohne Mascara',
    description:
      'Eine schonende Farbe macht auch helle Wimpernspitzen sichtbar. Deine Wimpern wirken dadurch länger und dichter – ganz ohne Mascara.',
    idealFor: 'Helle Naturwimpern, Ferien, Sport',
    durability: 'hält 4–6 Wochen',
    minutes: 20,
    price: 25,
    visual: 'lashes',
    preset: { mode: 'tint' },
    groups: [
      {
        id: 'tintcolor',
        label: 'Farbe',
        kind: 'swatch',
        default: 'black',
        choices: [
          { id: 'black', label: 'Schwarz', hint: 'Intensiv', swatch: '#15110F' },
          {
            id: 'brown',
            label: 'Braun',
            hint: 'Weicher, ideal bei hellem Haar',
            swatch: '#4A3226',
          },
        ],
      },
    ],
    addons: [
      {
        ...browAddons.lashtint,
        id: 'browtint',
        label: 'Brauen färben',
        hint: 'Passend dazu.',
        price: 15,
        minutes: 10,
      },
    ],
    staff: ['alessia', 'lea'],
  },
  {
    id: 'lash-removal',
    category: 'lashes',
    name: 'Extensions entfernen',
    tagline: 'Schonend ablösen, Naturwimpern pflegen',
    description:
      'Wir lösen deine Extensions mit einem sanften Cream-Remover, ohne an den Naturwimpern zu ziehen, und pflegen sie anschliessend.',
    idealFor: 'Eine Pause für deine Naturwimpern',
    durability: '–',
    minutes: 30,
    price: 35,
    visual: 'lashes',
    preset: { mode: 'natural' },
    groups: [],
    addons: [],
    staff: ['alessia'],
  },

  // Brows
  {
    id: 'brow-shaping',
    category: 'brows',
    name: 'Brow Shaping',
    tagline: 'Die ideale Form für dein Gesicht',
    description:
      'Wir vermessen deine Brauen, definieren die Form, die zu deinem Gesicht passt, und entfernen überschüssige Härchen – mit Pinzette, Wachs oder Faden.',
    idealFor: 'Eine saubere, ausgewogene Form',
    durability: 'hält 3–4 Wochen',
    minutes: 30,
    price: 35,
    visual: 'brows',
    preset: { mode: 'shaping' },
    groups: [
      {
        id: 'method',
        label: 'Methode',
        kind: 'cards',
        default: 'tweezer',
        choices: [
          { id: 'tweezer', label: 'Pinzette', hint: 'Präzise, Härchen für Härchen.' },
          { id: 'wax', label: 'Warmwachs', hint: 'Schnell und gründlich.' },
          { id: 'thread', label: 'Threading', hint: 'Fadentechnik – besonders sanft zur Haut.' },
        ],
      },
    ],
    addons: [browAddons.lip, browAddons.lashtint],
    staff: ['lea'],
  },
  {
    id: 'brow-styling',
    category: 'brows',
    name: 'Brow Styling · Formen & Färben',
    tagline: 'Mehr Definition, ganz natürlich',
    description:
      'Formen plus Färben: Die Farbe macht auch feine, helle Härchen sichtbar. Dadurch wirken deine Brauen dichter und definierter, ohne geschminkt auszusehen.',
    idealFor: 'Helle oder feine Brauen',
    durability: 'Farbe hält 3–4 Wochen',
    minutes: 45,
    price: 49,
    visual: 'brows',
    preset: { mode: 'tint' },
    groups: [browColorGroup()],
    addons: [browAddons.lip, browAddons.lashtint],
    staff: ['lea'],
  },
  {
    id: 'brow-henna',
    category: 'brows',
    name: 'Henna Brows',
    tagline: 'Färbt Haar und Haut – für lückenlose Fülle',
    description:
      'Henna färbt nicht nur die Härchen, sondern auch die Haut darunter. So werden kleine Lücken optisch aufgefüllt – der Effekt erinnert an einen Hauch Brauenpuder.',
    idealFor: 'Lichte Stellen und mehr Definition',
    durability: 'Haut 1–2 Wochen, Härchen bis 6 Wochen',
    minutes: 60,
    price: 69,
    visual: 'brows',
    preset: { mode: 'henna' },
    groups: [browColorGroup()],
    addons: [browAddons.lip, browAddons.lashtint],
    staff: ['lea'],
  },
  {
    id: 'brow-lamination',
    category: 'brows',
    name: 'Brow Lamination',
    tagline: 'Fluffy, gebürstete Brauen für 6 Wochen',
    description:
      'Eine Lotion macht die Härchen formbar, sie werden nach oben gebürstet und fixiert. Das Ergebnis sind volle, gleichmässige «Fluffy Brows» – ganz ohne tägliches Brow-Gel. Inklusive Formen und Pflege.',
    idealFor: 'Widerspenstige, lichte oder nach unten wachsende Brauen',
    durability: 'hält 6–8 Wochen',
    minutes: 60,
    price: 79,
    badge: 'Beliebt',
    visual: 'brows',
    preset: { mode: 'lamination' },
    groups: [
      {
        id: 'tint',
        label: 'Färben',
        kind: 'cards',
        default: 'tint',
        choices: [
          { id: 'none', label: 'Ohne Färben', hint: 'Deine natürliche Farbe.' },
          {
            id: 'tint',
            label: 'Mit Färben',
            hint: 'Mehr Definition und Tiefe.',
            price: 15,
            minutes: 10,
          },
        ],
      },
      browColorGroup({ tint: ['tint'] }),
    ],
    addons: [browAddons.lip, browAddons.lashtint],
    staff: ['lea'],
  },
  {
    id: 'brow-pmu',
    category: 'brows',
    name: 'Permanent Make-up Brows',
    tagline: 'Aufwachen mit perfekten Brauen',
    description:
      'Feine Pigmente werden in die oberste Hautschicht eingebracht – als zarte Härchenstriche (Microblading), als weicher Puder-Effekt (Powder Brows) oder kombiniert. Die Nachbehandlung nach 6–8 Wochen ist inklusive.',
    idealFor: 'Sehr lichte Brauen oder wer sich das tägliche Schminken sparen will',
    durability: 'hält 1–2 Jahre',
    minutes: 180,
    price: 590,
    note: 'Vor dem Termin rufen wir dich für ein kurzes, kostenloses Vorgespräch an.',
    visual: 'brows',
    groups: [
      {
        id: 'technique',
        label: 'Technik',
        kind: 'cards',
        default: 'microblading',
        choices: [
          {
            id: 'microblading',
            label: 'Microblading',
            hint: 'Feine Härchenstriche – sehr natürlich, ideal bei normaler bis trockener Haut.',
          },
          {
            id: 'powder',
            label: 'Powder Brows',
            hint: 'Weicher Puder-Look, vorne heller – ideal auch bei öliger Haut.',
            price: 30,
          },
          {
            id: 'combo',
            label: 'Combo Brows',
            hint: 'Härchen im vorderen Teil, Puder zum Ende hin – das Beste aus beiden.',
            price: 60,
            minutes: 30,
          },
        ],
      },
      browColorGroup(),
    ],
    addons: [],
    staff: ['lea'],
  },
  {
    id: 'lash-brow-combo',
    category: 'brows',
    name: 'Lash Lift & Brow Lamination',
    tagline: 'Das Duo für einen wachen Blick',
    description:
      'Beide Behandlungen in einem Termin, inklusive Färben von Wimpern und Brauen sowie Formen der Brauen. Gegenüber der Einzelbuchung sparst du CHF 29.–.',
    idealFor: 'Maximaler Effekt mit minimalem Aufwand im Alltag',
    durability: 'hält 6–8 Wochen',
    minutes: 105,
    price: 169,
    badge: 'Kombi-Vorteil',
    visual: 'combo',
    preset: { mode: 'lamination' },
    groups: [browColorGroup()],
    addons: [browAddons.lip],
    staff: ['lea'],
  },
];

export const treatmentById = Object.fromEntries(treatments.map((t) => [t.id, t])) as Record<
  string,
  Treatment
>;

export const treatmentsFor = (category: CategoryId) =>
  treatments.filter((t) => t.category === category);

/** Allgemeine Buchungsbedingungen, auf die Seiten und Buchung verweisen. */
export const policies = {
  cancellation: 'Kostenlos stornieren oder verschieben bis 24 Stunden vor dem Termin.',
  lateCancellation:
    'Bei späterer Absage oder Nichterscheinen verrechnen wir 50 % des Behandlungspreises.',
  payment: 'Bezahlung nach der Behandlung im Studio mit Karte, TWINT oder bar.',
};
