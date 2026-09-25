/**
 * Statische Illustrationen, die beim Build als eigene SVG-Dateien unter /visuals/<name>.svg
 * erzeugt werden. So bleiben die Seiten leicht und die Grafiken werden lazy und gecacht geladen.
 */

type NailProps = {
  kind: 'nail';
  shape?: string;
  length?: string;
  color?: string;
  finish?: string;
  art?: string;
  motif?: string;
  mode?: 'hand' | 'toes';
};

type EyeProps = {
  kind: 'eye';
  focus?: 'lashes' | 'brows' | 'combo';
  lashMode?: 'natural' | 'extension' | 'lift' | 'tint';
  technique?: 'classic' | 'hybrid' | 'volume' | 'mega';
  look?: string;
  curl?: string;
  lashLength?: string;
  lashTinted?: boolean;
  browMode?: 'natural' | 'shaping' | 'tint' | 'henna' | 'lamination' | 'pmu';
  browColor?: string;
  browTinted?: boolean;
  pmu?: 'microblading' | 'powder' | 'combo';
};

export type Illustration = NailProps | EyeProps;

const browBrown = '#5A3F30';

export const illustrations = {
  // Fallbacks für Fotoflächen
  'nails-rose-almond': { kind: 'nail', shape: 'almond', length: 'medium', color: '#D6969C' },
  'nails-french-almond': {
    kind: 'nail',
    shape: 'almond',
    length: 'medium',
    color: '#F3ECE6',
    finish: 'french',
  },
  'nails-red-squoval': { kind: 'nail', shape: 'squoval', length: 'short', color: '#A3182D' },
  'nails-nude-accent': {
    kind: 'nail',
    shape: 'oval',
    length: 'short',
    color: '#F0CFCC',
    art: 'accent',
    motif: 'lines',
  },
  'lashes-volume-cat': {
    kind: 'eye',
    focus: 'lashes',
    lashMode: 'extension',
    technique: 'volume',
    look: 'cat',
  },
  'lashes-classic-natural': {
    kind: 'eye',
    focus: 'lashes',
    lashMode: 'extension',
    technique: 'classic',
    look: 'natural',
  },
  'lashes-lift-tinted': { kind: 'eye', focus: 'lashes', lashMode: 'lift', lashTinted: true },
  'lashes-hybrid-cc': {
    kind: 'eye',
    focus: 'lashes',
    lashMode: 'extension',
    technique: 'hybrid',
    look: 'natural',
    curl: 'cc',
  },
  'brows-lamination': {
    kind: 'eye',
    focus: 'brows',
    browMode: 'lamination',
    browTinted: true,
    browColor: browBrown,
  },
  'brows-henna': { kind: 'eye', focus: 'brows', browMode: 'henna', browColor: browBrown },

  // Signature Looks
  'look-milky-almond': { kind: 'nail', shape: 'almond', length: 'medium', color: '#F3ECE6' },
  'look-clean-french': {
    kind: 'nail',
    shape: 'squoval',
    length: 'natural',
    color: '#F3ECE6',
    finish: 'french',
  },
  'look-cherry-coffin': { kind: 'nail', shape: 'coffin', length: 'long', color: '#A3182D' },
  'look-natural-classic': {
    kind: 'eye',
    focus: 'lashes',
    lashMode: 'extension',
    technique: 'classic',
    look: 'natural',
    curl: 'c',
    lashLength: 'medium',
  },
  'look-soft-cat-eye': {
    kind: 'eye',
    focus: 'lashes',
    lashMode: 'extension',
    technique: 'volume',
    look: 'cat',
    curl: 'cc',
    lashLength: 'long',
  },

  // Nails: Vergleich & Finishes
  'compare-gel-lack': { kind: 'nail', shape: 'squoval', length: 'natural', color: '#D6969C' },
  'compare-biab': { kind: 'nail', shape: 'oval', length: 'natural', color: '#F0CFCC' },
  'compare-modellage': { kind: 'nail', shape: 'almond', length: 'long', color: '#F3ECE6' },
  'compare-manicure': { kind: 'nail', shape: 'round', length: 'natural', finish: 'natural' },
  'finish-uni': { kind: 'nail', shape: 'almond', length: 'medium', color: '#A26B7A' },
  'finish-french': {
    kind: 'nail',
    shape: 'almond',
    length: 'medium',
    color: '#F3ECE6',
    finish: 'french',
  },
  'finish-babyboomer': {
    kind: 'nail',
    shape: 'almond',
    length: 'medium',
    color: '#F3ECE6',
    finish: 'babyboomer',
  },
  'finish-chrome': {
    kind: 'nail',
    shape: 'almond',
    length: 'medium',
    color: '#C5B5DC',
    finish: 'chrome',
  },
  'finish-cateye': {
    kind: 'nail',
    shape: 'almond',
    length: 'medium',
    color: '#5A1426',
    finish: 'cateye',
  },
  'finish-glitter': {
    kind: 'nail',
    shape: 'almond',
    length: 'medium',
    color: '#F0CFCC',
    finish: 'glitter',
  },
  'nails-stiletto-chrome': {
    kind: 'nail',
    shape: 'stiletto',
    length: 'long',
    color: '#7A2E49',
    finish: 'chrome',
  },

  // Lashes: Looks
  'lash-look-natural': {
    kind: 'eye',
    focus: 'lashes',
    lashMode: 'extension',
    technique: 'classic',
    look: 'natural',
    lashLength: 'long',
    curl: 'cc',
  },
  'lash-look-doll': {
    kind: 'eye',
    focus: 'lashes',
    lashMode: 'extension',
    technique: 'classic',
    look: 'doll',
    lashLength: 'long',
    curl: 'cc',
  },
  'lash-look-cat': {
    kind: 'eye',
    focus: 'lashes',
    lashMode: 'extension',
    technique: 'classic',
    look: 'cat',
    lashLength: 'long',
    curl: 'cc',
  },
  'lash-look-squirrel': {
    kind: 'eye',
    focus: 'lashes',
    lashMode: 'extension',
    technique: 'classic',
    look: 'squirrel',
    lashLength: 'long',
    curl: 'cc',
  },

  // Brows: Permanent Make-up
  'pmu-microblading': {
    kind: 'eye',
    focus: 'brows',
    browMode: 'pmu',
    pmu: 'microblading',
    browColor: '#4A3327',
  },
  'pmu-powder': {
    kind: 'eye',
    focus: 'brows',
    browMode: 'pmu',
    pmu: 'powder',
    browColor: '#4A3327',
  },
  'pmu-combo': { kind: 'eye', focus: 'brows', browMode: 'pmu', pmu: 'combo', browColor: '#4A3327' },
} satisfies Record<string, Illustration>;

export type IllustrationName = keyof typeof illustrations;
