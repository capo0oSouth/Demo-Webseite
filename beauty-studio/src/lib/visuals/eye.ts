/**
 * Prozedurale Augenpartie (Auge + Braue) für die Wimpern- und Brauen-Visualisierung.
 * Die Szene ist 640 × 520 Einheiten gross; die Kamera zoomt je nach Behandlung.
 */

export type Pt = [number, number];

const fmt = (v: number) => Math.round(v * 10) / 10;

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

function cubic(p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt {
  const u = 1 - t;
  return [
    u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
  ];
}

function cubicTangent(p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt {
  const u = 1 - t;
  const x = 3 * u * u * (p1[0] - p0[0]) + 6 * u * t * (p2[0] - p1[0]) + 3 * t * t * (p3[0] - p2[0]);
  const y = 3 * u * u * (p1[1] - p0[1]) + 6 * u * t * (p2[1] - p1[1]) + 3 * t * t * (p3[1] - p2[1]);
  const l = Math.hypot(x, y) || 1;
  return [x / l, y / l];
}

/* ------------------------------------------------------------------ Szene */

export const eye = {
  inner: [150, 362] as Pt,
  outer: [502, 342] as Pt,
  upper: [
    [150, 362],
    [205, 270],
    [398, 246],
    [502, 342],
  ] as [Pt, Pt, Pt, Pt],
  lower: [
    [150, 362],
    [222, 414],
    [405, 412],
    [502, 342],
  ] as [Pt, Pt, Pt, Pt],
  crease: 'M128 334 C 196 222 418 196 530 318',
  iris: { cx: 322, cy: 341, r: 60 },
};

const c = (p: [Pt, Pt, Pt, Pt]) =>
  `C${p[1][0]} ${p[1][1]} ${p[2][0]} ${p[2][1]} ${p[3][0]} ${p[3][1]}`;

export const eyeOpening = `M${eye.upper[0][0]} ${eye.upper[0][1]}${c(eye.upper)}C${eye.lower[2][0]} ${eye.lower[2][1]} ${eye.lower[1][0]} ${eye.lower[1][1]} ${eye.lower[0][0]} ${eye.lower[0][1]}Z`;

export const upperLidPath = `M${eye.upper[0][0]} ${eye.upper[0][1]}${c(eye.upper)}`;
export const lowerLidPath = `M${eye.lower[0][0]} ${eye.lower[0][1]}${c(eye.lower)}`;

/** Kamera-Ausschnitte (gleiches Seitenverhältnis 1.6 : 1, damit nichts springt). */
export const cameras = {
  lashes: [96, 160, 464, 290],
  brows: [80, 48, 480, 300],
  combo: [36, 60, 568, 355],
} as const;

/* ---------------------------------------------------------------- Wimpern */

export type LashMode = 'natural' | 'extension' | 'lift' | 'tint';
export type LashTechnique = 'classic' | 'hybrid' | 'volume' | 'mega';

export interface LashParams {
  mode: LashMode;
  technique: LashTechnique;
  /** Gewichte der Looks natural, doll, cat, squirrel (werden gemischt → sanfte Übergänge). */
  look: [number, number, number, number];
  /** Schwung 0 … 1 */
  curl: number;
  /** maximale sichtbare Länge in Einheiten */
  length: number;
  accent: string | null;
  tinted: boolean;
}

const lookCurves = [
  // Natural: sanft ansteigend, Maximum bei ca. 70 %
  (t: number) => 0.56 + 0.44 * smooth(0, 0.72, t) - 0.1 * smooth(0.82, 1, t),
  // Doll Eye: Maximum in der Mitte
  (t: number) => 0.58 + 0.42 * Math.exp(-Math.pow((t - 0.5) / 0.24, 2)),
  // Cat Eye: nach aussen immer länger
  (t: number) => 0.5 + 0.5 * Math.pow(t, 1.35),
  // Squirrel: Peak kurz vor dem Rand, dann deutlicher Abfall
  (t: number) => 0.52 + 0.48 * Math.exp(-Math.pow((t - 0.8) / (t < 0.8 ? 0.26 : 0.1), 2)),
];

export function lookFactor(t: number, weights: [number, number, number, number]) {
  const sum = weights.reduce((a, b) => a + b, 0) || 1;
  return weights.reduce((acc, w, i) => acc + w * lookCurves[i](t), 0) / sum;
}

interface Strand {
  base: Pt;
  angle: number;
  len: number;
  width: number;
  curl: number;
}

function strandPath(s: Strand) {
  const n = 7;
  const pts: Pt[] = [];
  let [x, y] = s.base;
  let a = s.angle;
  const up = -Math.PI / 2;
  const step = s.len / n;
  pts.push([x, y]);
  for (let k = 1; k <= n; k++) {
    const f = k / n;
    // Richtung dreht sich mit zunehmender Länge Richtung "oben" (Schwung)
    const target = up + (a > up ? 0.35 : -0.35);
    a = a + (target - a) * s.curl * 0.22 * f;
    x += Math.cos(a) * step;
    y += Math.sin(a) * step;
    pts.push([x, y]);
  }
  // Verjüngte Kontur als quadratische Bézier-Sichel (kompakt, läuft spitz aus)
  const p0 = pts[0];
  const p2 = pts[n];
  const mid: Pt = [(pts[3][0] + pts[4][0]) / 2, (pts[3][1] + pts[4][1]) / 2];
  const c: Pt = [2 * mid[0] - (p0[0] + p2[0]) / 2, 2 * mid[1] - (p0[1] + p2[1]) / 2];
  const dx = pts[1][0] - p0[0];
  const dy = pts[1][1] - p0[1];
  const l = Math.hypot(dx, dy) || 1;
  const nx = -dy / l;
  const ny = dx / l;
  const hw = s.width * 0.5 + 0.04;
  return `M${fmt(p0[0] + nx * hw)} ${fmt(p0[1] + ny * hw)}Q${fmt(c[0] + nx * hw * 0.5)} ${fmt(c[1] + ny * hw * 0.5)} ${fmt(p2[0])} ${fmt(p2[1])}Q${fmt(c[0] - nx * hw * 0.5)} ${fmt(c[1] - ny * hw * 0.5)} ${fmt(p0[0] - nx * hw)} ${fmt(p0[1] - ny * hw)}Z`;
}

const techniques: Record<
  LashTechnique,
  { count: number; fan: [number, number]; width: number; spread: number; line: number }
> = {
  classic: { count: 64, fan: [1, 1], width: 2.3, spread: 0, line: 1.6 },
  hybrid: { count: 74, fan: [1, 3], width: 1.3, spread: 13, line: 2.2 },
  volume: { count: 84, fan: [3, 5], width: 0.95, spread: 18, line: 3 },
  mega: { count: 100, fan: [6, 9], width: 0.78, spread: 22, line: 4.4 },
};

export interface LashRender {
  main: string;
  tips: string;
  accent: string;
  lower: string;
  lineWidth: number;
  color: string;
  tipColor: string;
}

export function renderLashes(p: LashParams, seed = 7): LashRender {
  const r = rng(seed);
  const [P0, P1, P2, P3] = eye.upper;
  const main: string[] = [];
  const tips: string[] = [];
  const accent: string[] = [];
  const isExt = p.mode === 'extension';
  const tech = techniques[p.technique];
  const count = isExt ? tech.count : 58;

  for (let i = 0; i < count; i++) {
    const t = 0.035 + (i / (count - 1)) * 0.94 + (r() - 0.5) * (isExt ? 0.012 : 0.01);
    const base = cubic(P0, P1, P2, P3, t);
    const tan = cubicTangent(P0, P1, P2, P3, t);
    // Normale nach aussen/oben
    let angle = Math.atan2(-tan[0], tan[1]);
    // leichte zusätzliche Öffnung am äusseren Rand
    angle += smooth(0.7, 1, t) * 0.28 - smooth(0.25, 0, t) * 0.12;

    let len: number;
    let curl: number;
    if (p.mode === 'natural' || p.mode === 'tint') {
      // Naturwimpern zeigen eher nach vorne/aussen und wirken im Frontalblick kurz
      angle += (angle > -Math.PI / 2 ? 1 : -1) * 0.34;
      len = 40 * lookCurves[0](t) * (0.8 + r() * 0.35);
      curl = 0.12;
    } else if (p.mode === 'lift') {
      angle += (angle > -Math.PI / 2 ? -1 : 1) * 0.12;
      len = 47 * lookCurves[0](t) * (0.86 + r() * 0.22);
      curl = 0.95;
    } else {
      len = p.length * lookFactor(t, p.look) * (0.93 + r() * 0.12);
      curl = p.curl;
    }
    const jitter = (r() - 0.5) * (isExt ? 0.06 : 0.16);
    const base2: Pt = [base[0], base[1] + 1.5];

    const isAccent = isExt && p.accent && t > 0.74 && i % 2 === 0;
    const target = isAccent ? accent : main;

    if (!isExt) {
      const s: Strand = { base: base2, angle: angle + jitter, len, width: 1.3, curl };
      // Ungefärbte Naturwimpern: dunkler Ansatz, helle Spitzen
      target.push(strandPath(p.tinted ? s : { ...s, len: len * 0.62, width: 1.35 }));
      if (!p.tinted) tips.push(strandPath(s));
      continue;
    }

    const [fmin, fmax] = tech.fan;
    const fan = fmin + Math.floor(r() * (fmax - fmin + 1));
    const spread = ((tech.spread * Math.PI) / 180) * (fan > 1 ? 1 : 0);
    for (let k = 0; k < fan; k++) {
      const off = fan > 1 ? (k / (fan - 1) - 0.5) * spread : 0;
      const width = fan === 1 ? (p.technique === 'hybrid' ? 1.9 : tech.width) : tech.width;
      target.push(
        strandPath({
          base: [base2[0] + (r() - 0.5) * 1.2, base2[1]],
          angle: angle + jitter + off,
          len: len * (0.9 + r() * 0.12),
          width,
          curl,
        }),
      );
    }
  }

  // Untere Wimpern (immer natürlich)
  const [L0, L1, L2, L3] = eye.lower;
  const lower: string[] = [];
  for (let i = 0; i < 30; i++) {
    const t = 0.2 + (i / 29) * 0.74;
    const base = cubic(L0, L1, L2, L3, t);
    const tan = cubicTangent(L0, L1, L2, L3, t);
    let angle = Math.atan2(tan[0], -tan[1]);
    angle += (t - 0.55) * 0.5;
    lower.push(
      strandPath({
        base: [base[0], base[1] - 1],
        angle: angle + (r() - 0.5) * 0.2,
        len: (9 + r() * 7) * (0.6 + t * 0.6),
        width: 0.8,
        curl: 0,
      }),
    );
  }

  const natural = p.mode === 'natural' || p.mode === 'lift';
  return {
    main: main.join(''),
    tips: tips.join(''),
    accent: accent.join(''),
    lower: lower.join(''),
    lineWidth: isExt ? tech.line : 1.2,
    color: isExt ? '#140F11' : p.tinted ? '#1A1311' : '#4A3830',
    tipColor: natural && !p.tinted ? '#9C8374' : '#1A1311',
  };
}

/* ------------------------------------------------------------------ Brauen */

export type BrowMode = 'natural' | 'shaping' | 'tint' | 'henna' | 'lamination' | 'pmu';

export interface BrowParams {
  mode: BrowMode;
  color: string;
  tinted: boolean;
  pmu?: 'microblading' | 'powder' | 'combo';
}

// Ideale Brauenform: Kopf innen (links), Bogen, Schwanz aussen (rechts)
const browTop: [Pt, Pt, Pt, Pt][] = [
  [
    [150, 190],
    [152, 172],
    [250, 142],
    [388, 118],
  ],
  [
    [388, 118],
    [440, 110],
    [505, 140],
    [552, 172],
  ],
];
const browBottom: [Pt, Pt, Pt, Pt][] = [
  [
    [154, 222],
    [214, 210],
    [322, 168],
    [398, 152],
  ],
  [
    [398, 152],
    [452, 142],
    [510, 158],
    [552, 174],
  ],
];

function sampleEdge(segs: [Pt, Pt, Pt, Pt][], n = 40): Pt[] {
  const pts: Pt[] = [];
  segs.forEach((s, si) => {
    for (let i = si === 0 ? 0 : 1; i <= n; i++) pts.push(cubic(s[0], s[1], s[2], s[3], i / n));
  });
  return pts;
}

const topPts = sampleEdge(browTop);
const bottomPts = sampleEdge(browBottom);

function edgeY(pts: Pt[], x: number) {
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    if ((x >= x0 && x <= x1) || (x <= x0 && x >= x1)) {
      const t = (x - x0) / (x1 - x0 || 1);
      return y0 + (y1 - y0) * t;
    }
  }
  return null;
}

export const browShape = (() => {
  const head = 'C140 216 140 196 150 190';
  const top = browTop
    .map((s) => `C${s[1][0]} ${s[1][1]} ${s[2][0]} ${s[2][1]} ${s[3][0]} ${s[3][1]}`)
    .join('');
  const bottom = [...browBottom]
    .reverse()
    .map((s) => `C${s[2][0]} ${s[2][1]} ${s[1][0]} ${s[1][1]} ${s[0][0]} ${s[0][1]}`)
    .join('');
  return `M150 190${top}L552 174${bottom}${head}Z`;
})();

const X_HEAD = 146;
const X_TAIL = 552;

interface Hair {
  x: number;
  y: number;
  angle: number;
  len: number;
  width: number;
}

function hairPath(h: Hair, bend: number) {
  const a = (h.angle * Math.PI) / 180;
  const x2 = h.x + Math.cos(a) * h.len;
  const y2 = h.y + Math.sin(a) * h.len;
  // Leichte Krümmung Richtung Schläfe
  const mx = (h.x + x2) / 2 + Math.cos(a + Math.PI / 2) * bend;
  const my = (h.y + y2) / 2 + Math.sin(a + Math.PI / 2) * bend;
  const nx = -Math.sin(a) * h.width * 0.5;
  const ny = Math.cos(a) * h.width * 0.5;
  return `M${fmt(h.x + nx)} ${fmt(h.y + ny)}Q${fmt(mx)} ${fmt(my)} ${fmt(x2)} ${fmt(y2)}Q${fmt(mx)} ${fmt(my)} ${fmt(h.x - nx)} ${fmt(h.y - ny)}Z`;
}

export interface BrowRender {
  hairs: string;
  fine: string;
  strays: string;
  strokes: string;
  /** Puderpunkte, nach Deckkraft gruppiert: [Deckkraft, Pfad]. */
  stipple: [number, string][];
  hairColor: string;
  fineOpacity: number;
  hairOpacity: number;
  stain: boolean;
  powder: 'none' | 'powder' | 'combo';
}

export function renderBrows(p: BrowParams, seed = 11): BrowRender {
  const r = rng(seed);
  const laminated = p.mode === 'lamination';
  const natural = p.mode === 'natural';
  const hairs: string[] = [];
  const fine: string[] = [];
  const strays: string[] = [];
  const strokes: string[] = [];

  const angleAt = (u: number, v: number) => {
    if (laminated)
      return lerp(-96, -62, Math.pow(u, 1.6)) + (v - 0.5) * 8 + (u > 0.82 ? (u - 0.82) * 120 : 0);
    const base = lerp(-86, -6, smooth(0.04, 0.9, u));
    return base + (v - 0.5) * 46 * Math.min(1, u * 2.2);
  };

  const place = (
    count: number,
    out: string[],
    opts: { len: number; width: number; jitter: number; bend: number },
  ) => {
    let placed = 0;
    let guard = 0;
    while (placed < count && guard < count * 30) {
      guard++;
      const x = lerp(X_HEAD + 4, X_TAIL - 4, r());
      const yt = edgeY(topPts, x);
      const yb = edgeY(bottomPts, x);
      if (yt == null || yb == null) continue;
      const u = (x - X_HEAD) / (X_TAIL - X_HEAD);
      // Kopf der Braue weicher, Ende schmaler
      const v = r();
      const y = lerp(yb, yt, laminated ? v * 0.9 : v);
      if (u < 0.05 && r() > 0.4) continue;
      const tailTaper = u > 0.85 ? 1 - (u - 0.85) * 3 : 1;
      const angle = angleAt(u, v) + (r() - 0.5) * opts.jitter;
      const len = opts.len * (0.75 + r() * 0.5) * tailTaper * (laminated ? 1.45 : 1);
      out.push(
        hairPath(
          { x, y, angle, len, width: opts.width * (0.8 + r() * 0.4) },
          laminated ? (r() - 0.5) * 6 + 1.4 : (r() - 0.3) * 2.2 + opts.bend,
        ),
      );
      placed++;
    }
  };

  const hairCount = natural ? 240 : laminated ? 340 : p.mode === 'shaping' ? 260 : 300;
  place(hairCount, hairs, {
    len: 19,
    width: 1.2,
    jitter: natural ? 24 : laminated ? 16 : 12,
    bend: 0.8,
  });
  // Feine, helle Härchen – nach dem Färben sichtbar
  place(190, fine, { len: 13, width: 0.75, jitter: 20, bend: 0.5 });

  if (natural) {
    // Streuhärchen ausserhalb der Form (unter der Braue, zwischen den Brauen, über dem Bogen)
    const zones: [number, number, number, number, number][] = [
      [170, 440, 12, 30, 1], // unterhalb
      [118, 150, -10, 32, 0], // zwischen den Brauen
      [300, 480, -22, -4, -1], // oberhalb
    ];
    for (const [x0, x1, dy0, dy1, side] of zones) {
      const n = side === 1 ? 26 : 12;
      for (let i = 0; i < n; i++) {
        const x = lerp(x0, x1, r());
        const ref = side === 1 ? edgeY(bottomPts, x) : side === -1 ? edgeY(topPts, x) : 200;
        if (ref == null) continue;
        const y = side === 0 ? lerp(170, 225, r()) : ref + lerp(dy0, dy1, r());
        const u = Math.max(0, (x - X_HEAD) / (X_TAIL - X_HEAD));
        strays.push(
          hairPath(
            { x, y, angle: angleAt(u, 0.5) + (r() - 0.5) * 40, len: 7 + r() * 8, width: 0.8 },
            0.5,
          ),
        );
      }
    }
  }

  const dots: { x: number; y: number; o: number }[] = [];
  if (p.mode === 'pmu') {
    const tech = p.pmu ?? 'microblading';
    if (tech === 'microblading' || tech === 'combo') {
      // Feine, präzise Härchenstriche nach natürlichem Wuchsmuster
      const maxU = tech === 'combo' ? 0.45 : 1;
      let placed = 0;
      let guard = 0;
      while (placed < 210 && guard < 6000) {
        guard++;
        const x = lerp(X_HEAD + 4, X_TAIL - 6, r());
        const u = (x - X_HEAD) / (X_TAIL - X_HEAD);
        if (u > maxU) continue;
        const yt = edgeY(topPts, x);
        const yb = edgeY(bottomPts, x);
        if (yt == null || yb == null) continue;
        const v = 0.08 + r() * 0.84;
        const y = lerp(yb, yt, v);
        const tailTaper = u > 0.85 ? 1 - (u - 0.85) * 3 : 1;
        strokes.push(
          hairPath(
            {
              x,
              y,
              angle: angleAt(u, v) + (r() - 0.5) * 6,
              len: (16 + r() * 7) * tailTaper,
              width: 0.95,
            },
            1.2,
          ),
        );
        placed++;
      }
    }
    if (tech === 'powder' || tech === 'combo') {
      let guard = 0;
      while (dots.length < 1300 && guard < 20000) {
        guard++;
        const x = lerp(X_HEAD, X_TAIL, r());
        const yt = edgeY(topPts, x);
        const yb = edgeY(bottomPts, x);
        if (yt == null || yb == null) continue;
        const u = (x - X_HEAD) / (X_TAIL - X_HEAD);
        const minU = tech === 'combo' ? 0.3 : 0;
        if (u < minU) continue;
        // Ombré: vorne heller, zum Ende hin dichter
        if (r() > 0.15 + smooth(0, 0.55, u) * 0.85) continue;
        const y = lerp(yb + 1, yt - 1, r());
        dots.push({ x, y, o: 0.25 + r() * 0.45 });
      }
    }
  }

  const buckets: [number, string[]][] = [
    [0.3, []],
    [0.48, []],
    [0.66, []],
  ];
  for (const d of dots)
    buckets[d.o < 0.4 ? 0 : d.o < 0.55 ? 1 : 2][1].push(`M${fmt(d.x)} ${fmt(d.y)}h0`);
  const stipple: [number, string][] = buckets
    .filter(([, b]) => b.length)
    .map(([o, b]) => [o, b.join('')]);

  const colored = p.tinted || p.mode === 'tint' || p.mode === 'henna' || p.mode === 'pmu';
  return {
    hairs: hairs.join(''),
    fine: fine.join(''),
    strays: strays.join(''),
    strokes: strokes.join(''),
    stipple,
    hairColor: colored ? p.color : '#76594A',
    hairOpacity: colored ? 0.95 : 0.82,
    fineOpacity: colored ? 0.8 : 0.2,
    stain: p.mode === 'henna',
    powder:
      p.mode === 'pmu'
        ? p.pmu === 'powder'
          ? 'powder'
          : p.pmu === 'combo'
            ? 'combo'
            : 'none'
        : 'none',
  };
}
