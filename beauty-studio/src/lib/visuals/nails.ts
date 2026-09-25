/**
 * Parametrische Nagel-Geometrie. Alle Formen teilen dieselbe Punktstruktur, dadurch lassen
 * sich Form und Länge flüssig ineinander überblenden (Tween der Zahlenwerte).
 *
 * Lokales Koordinatensystem: Ursprung = Mitte der Nagelhaut, der Nagel zeigt nach oben (−y).
 */

export interface ShapeParams {
  /** Halbe Breite am Beginn der Spitze relativ zur halben Nagelbreite (1 = keine Verjüngung). */
  taper: number;
  /** Höhe der Spitzenrundung relativ zur Nagelbreite. */
  cap: number;
  /** Superellipsen-Exponent: 1 = spitz, 2 = rund, gross = eckig. */
  n: number;
}

export const shapeParams: Record<string, ShapeParams> = {
  square: { taper: 1, cap: 0.1, n: 14 },
  squoval: { taper: 1, cap: 0.24, n: 3.6 },
  round: { taper: 1, cap: 0.44, n: 2.1 },
  oval: { taper: 0.84, cap: 0.62, n: 2 },
  almond: { taper: 0.64, cap: 0.95, n: 1.55 },
  coffin: { taper: 0.56, cap: 0.08, n: 9 },
  stiletto: { taper: 0.8, cap: 1.5, n: 1.02 },
  // Zehennägel: gerade mit weichen Ecken (fusspflegerisch empfohlen)
  toe: { taper: 1, cap: 0.2, n: 4 },
};

/** Freier Rand (über die Fingerkuppe hinaus) relativ zur Nagelbreite. */
export const lengthFactor: Record<string, number> = {
  natural: 0.1,
  short: 0.26,
  medium: 0.55,
  long: 0.9,
  xl: 1.3,
};

export interface NailGeometry {
  /** Umriss des Nagels. */
  outline: string;
  /** Halbe Breite an beliebiger Höhe s (0 = Nagelhaut, s wächst Richtung Spitze). */
  total: number;
  bed: number;
  w: number;
}

const fmt = (v: number) => Math.round(v * 100) / 100;

/**
 * Erzeugt den Nagelumriss.
 * @param w Nagelbreite
 * @param bed Länge des aufliegenden Nagelbetts
 * @param free Länge des freien Randes
 */
export function nailOutline(w: number, bed: number, free: number, p: ShapeParams): NailGeometry {
  const half = w / 2;
  const rise = w * 0.13; // Rundung der Nagelhaut
  const total = bed + free;
  // Die Spitze beginnt höchstens kurz vor dem freien Rand – wie bei einer echten Modellage.
  const capH = Math.min(p.cap * w, free + w * 0.35, total * 0.92);
  const capStart = total - capH;

  // Halbe Breite am Beginn der Spitze: Verjüngung erst ab dem freien Rand (stetig).
  const sideTop = Math.max(rise, Math.min(bed, capStart));
  const taperSpan = Math.max(0, capStart - sideTop);
  const f = Math.min(1, taperSpan / (w * 0.35));
  const capHalf = half * (1 - (1 - p.taper) * f);

  const left: [number, number][] = [];
  left.push([-half, -rise], [-half, -sideTop]);
  const steps = 6;
  for (let i = 1; i <= steps; i++) {
    const u = i / steps;
    const eased = u * u * (3 - 2 * u);
    left.push([-(half + (capHalf - half) * eased), -(sideTop + taperSpan * u)]);
  }
  // Spitze als Superellipse
  const capSteps = 28;
  const e = 2 / p.n;
  const capBase = sideTop + taperSpan;
  const capHeight = total - capBase;
  for (let i = 1; i <= capSteps; i++) {
    const theta = (i / capSteps) * (Math.PI / 2);
    const x = capHalf * Math.pow(Math.cos(theta), e);
    const y = capHeight * Math.pow(Math.sin(theta), e);
    left.push([-x, -(capBase + y)]);
  }

  const right = left
    .slice(0, -1)
    .reverse()
    .map(([x, y]) => [-x, y] as [number, number]);

  // Nagelhaut (U-Form, Mitte am tiefsten)
  const cuticle: [number, number][] = [];
  const cSteps = 10;
  for (let i = 1; i < cSteps; i++) {
    const x = half - (i / cSteps) * w;
    cuticle.push([x, -rise * Math.pow(x / half, 2)]);
  }

  const pts = [...left, ...right, ...cuticle];
  const outline = `M${pts.map(([x, y]) => `${fmt(x)} ${fmt(y)}`).join('L')}Z`;
  return { outline, total, bed, w };
}

/** Lächellinie für French/freien Rand: Bereich oberhalb davon ist die Spitze. */
export function smileArea(w: number, bed: number, total: number, depth: number) {
  const half = w / 2 + 2;
  const top = -(total + 4);
  const pts: string[] = [];
  const steps = 16;
  for (let i = 0; i <= steps; i++) {
    const x = -half + (i / steps) * half * 2;
    const k = x / half;
    pts.push(`${fmt(x)} ${fmt(-(bed + depth * (1 - k * k)))}`);
  }
  return `M${pts.join('L')}L${fmt(half)} ${fmt(top)}L${fmt(-half)} ${fmt(top)}Z`;
}

/** Finger als Kapsel mit runder Kuppe; y = 0 ist die Nagelhaut. */
export function fingerPath(fw: number, tipY: number, bottomY: number) {
  const r = fw / 2;
  const k = 0.5523 * r;
  return [
    `M${fmt(-r)} ${fmt(bottomY)}`,
    `L${fmt(-r)} ${fmt(tipY + r)}`,
    `C${fmt(-r)} ${fmt(tipY + r - k * 1.1)} ${fmt(-k)} ${fmt(tipY)} 0 ${fmt(tipY)}`,
    `C${fmt(k)} ${fmt(tipY)} ${fmt(r)} ${fmt(tipY + r - k * 1.1)} ${fmt(r)} ${fmt(tipY + r)}`,
    `L${fmt(r)} ${fmt(bottomY)}Z`,
  ].join('');
}

export function mixShape(a: ShapeParams, b: ShapeParams, t: number): ShapeParams {
  return {
    taper: a.taper + (b.taper - a.taper) * t,
    cap: a.cap + (b.cap - a.cap) * t,
    // Exponent logarithmisch mischen, sonst "springen" eckige Formen
    n: Math.exp(Math.log(a.n) + (Math.log(b.n) - Math.log(a.n)) * t),
  };
}

/** Hilfsfunktionen für Farben */
export function shade(hex: string, amount: number) {
  const n = hex.replace('#', '');
  const num = parseInt(n, 16);
  let r = (num >> 16) & 255;
  let g = (num >> 8) & 255;
  let b = num & 255;
  const target = amount < 0 ? 0 : 255;
  const a = Math.abs(amount);
  r = Math.round(r + (target - r) * a);
  g = Math.round(g + (target - g) * a);
  b = Math.round(b + (target - b) * a);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

export function luminance(hex: string) {
  const num = parseInt(hex.replace('#', ''), 16);
  const c = [(num >> 16) & 255, (num >> 8) & 255, num & 255].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
