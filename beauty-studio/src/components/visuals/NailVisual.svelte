<script lang="ts">
  import { untrack } from 'svelte';
  import { Tween } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import {
    fingerPath,
    lengthFactor,
    luminance,
    mixShape,
    nailOutline,
    shade,
    shapeParams,
    smileArea,
    type ShapeParams,
  } from '../../lib/visuals/nails';

  interface Props {
    shape?: string;
    length?: string;
    color?: string;
    /** solid | french | babyboomer | chrome | cateye | glitter | natural | clear */
    finish?: string;
    art?: string;
    motif?: string;
    mode?: 'hand' | 'toes';
    label?: string;
    instant?: boolean;
  }

  let {
    shape = 'almond',
    length = 'medium',
    color = '#D6969C',
    finish = 'solid',
    art = 'none',
    motif = 'lines',
    mode = 'hand',
    label = 'Nagel-Vorschau',
    instant = false,
  }: Props = $props();

  const uid = `nv${Math.random().toString(36).slice(2, 8)}`;
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const targetShape = $derived(
    mode === 'toes' ? shapeParams.toe : (shapeParams[shape] ?? shapeParams.almond),
  );
  const targetLen = $derived(mode === 'toes' ? 0.08 : (lengthFactor[length] ?? 0.5));

  // Form und Länge werden gemeinsam getweent, damit sich der Nagel sichtbar verwandelt.
  const initial = untrack(() => ({ ...targetShape, len: targetLen }));
  let from = $state<ShapeParams & { len: number }>(initial);
  let to = $state<ShapeParams & { len: number }>(initial);
  const progress = new Tween(1, { duration: 650, easing: cubicOut });
  let initialized = false;

  const current = $derived.by(() => {
    const t = progress.current;
    const s = mixShape(from, to, t);
    return { ...s, len: from.len + (to.len - from.len) * t };
  });

  $effect(() => {
    const next = { ...targetShape, len: targetLen };
    if (!initialized || instant || reduced) {
      untrack(() => {
        from = next;
        to = next;
        initialized = true;
        progress.set(1, { duration: 0 });
      });
      return;
    }
    untrack(() => {
      from = { ...current };
      to = next;
      progress.set(0, { duration: 0 }).then(() => (progress.target = 1));
    });
  });

  type Finger = { x: number; y: number; rot: number; w: number; tip: number; name: string };

  const handFingers: Finger[] = [
    { name: 'Zeigefinger', x: 112, y: 196, rot: -8, w: 43, tip: 0.2 },
    { name: 'Mittelfinger', x: 184, y: 170, rot: -2.5, w: 46, tip: 0.2 },
    { name: 'Ringfinger', x: 254, y: 186, rot: 3.5, w: 42, tip: 0.2 },
    { name: 'Kleiner Finger', x: 318, y: 232, rot: 10, w: 35, tip: 0.2 },
  ];

  const toeFingers: Finger[] = [
    { name: 'Grosser Zeh', x: 118, y: 196, rot: -6, w: 62, tip: 0.3 },
    { name: 'Zweiter Zeh', x: 196, y: 190, rot: 1, w: 38, tip: 0.35 },
    { name: 'Dritter Zeh', x: 248, y: 208, rot: 6, w: 34, tip: 0.35 },
    { name: 'Vierter Zeh', x: 294, y: 232, rot: 11, w: 31, tip: 0.35 },
    { name: 'Kleiner Zeh', x: 334, y: 262, rot: 17, w: 27, tip: 0.38 },
  ];

  const fingers = $derived(mode === 'toes' ? toeFingers : handFingers);

  const skin = {
    light: '#F6D9C8',
    mid: '#EDC3AC',
    dark: '#D6A189',
    crease: 'rgba(150, 88, 66, 0.22)',
  };

  const isNatural = $derived(finish === 'natural' || finish === 'clear');
  const tipColor = $derived(color);
  const light = $derived(luminance(color) > 0.55);
  const baseFill = $derived.by(() => {
    if (isNatural) return '#F2C3BA';
    if (finish === 'french' || finish === 'babyboomer') return '#F1CBC4';
    if (finish === 'cateye') return shade(color, -0.35);
    if (finish === 'chrome') return shade(color, -0.1);
    return color;
  });
  const edge = $derived(isNatural ? '#D99A92' : shade(color, light ? -0.18 : -0.35));
  // Sehr helle Spitzen etwas aufhellen, damit die French-Linie sichtbar bleibt
  const frenchTip = $derived(luminance(color) > 0.75 ? '#FDFAF7' : color);
  const petal = $derived(light ? '#C27887' : '#FFF8F4');

  function artOn(i: number) {
    if (mode === 'toes' || isNatural) return false;
    if (art === 'full') return true;
    if (art === 'accent') return i === 2;
    return false;
  }

  function glitterDots(w: number, total: number, seed: number) {
    let s = seed * 9301 + 49297;
    const rnd = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    const dots: { x: number; y: number; r: number; o: number; gold: boolean }[] = [];
    for (let i = 0; i < 70; i++) {
      dots.push({
        x: (rnd() - 0.5) * w,
        y: -rnd() * total,
        r: 0.5 + rnd() * 1.3,
        o: 0.35 + rnd() * 0.65,
        gold: rnd() > 0.6,
      });
    }
    return dots;
  }

  const view = $derived(mode === 'toes' ? '20 60 380 330' : '30 20 360 360');
</script>

<svg
  class="nail-visual"
  viewBox={view}
  role="img"
  aria-label={label}
  preserveAspectRatio="xMidYMid meet"
>
  <defs>
    <linearGradient id="{uid}-skin" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color={skin.dark} />
      <stop offset="0.28" stop-color={skin.mid} />
      <stop offset="0.55" stop-color={skin.light} />
      <stop offset="0.85" stop-color={skin.mid} />
      <stop offset="1" stop-color={skin.dark} />
    </linearGradient>
    <linearGradient
      id="{uid}-fade"
      gradientUnits="userSpaceOnUse"
      x1="0"
      y1={mode === 'toes' ? 300 : 262}
      x2="0"
      y2={mode === 'toes' ? 388 : 376}
    >
      <stop offset="0" stop-color="#fff" />
      <stop offset="1" stop-color="#000" />
    </linearGradient>
    <mask id="{uid}-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="420" height="420">
      <rect x="0" y="0" width="420" height="420" fill="url(#{uid}-fade)" />
    </mask>
    <linearGradient id="{uid}-gloss" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#fff" stop-opacity="0" />
      <stop offset="0.5" stop-color="#fff" stop-opacity="0.75" />
      <stop offset="1" stop-color="#fff" stop-opacity="0" />
    </linearGradient>
    <linearGradient id="{uid}-chrome" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity="0.55" />
      <stop offset="0.25" stop-color="#fff" stop-opacity="0.05" />
      <stop offset="0.45" stop-color="#fff" stop-opacity="0.7" />
      <stop offset="0.6" stop-color="#000" stop-opacity="0.12" />
      <stop offset="0.8" stop-color="#fff" stop-opacity="0.5" />
      <stop offset="1" stop-color="#000" stop-opacity="0.15" />
    </linearGradient>
    <linearGradient id="{uid}-cateye" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0.25" stop-color={shade(color, 0.3)} stop-opacity="0" />
      <stop offset="0.5" stop-color={shade(color, 0.55)} stop-opacity="0.95" />
      <stop offset="0.75" stop-color={shade(color, 0.3)} stop-opacity="0" />
    </linearGradient>
    <linearGradient id="{uid}-gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#F3E1B5" />
      <stop offset="0.5" stop-color="#C39A55" />
      <stop offset="1" stop-color="#E9CF96" />
    </linearGradient>
  </defs>

  <g mask="url(#{uid}-mask)">
    {#each fingers as f, i (f.name)}
      {@const w = f.w}
      {@const bed = mode === 'toes' ? w * 0.72 : w * 1.12}
      {@const free = w * current.len}
      {@const geo = nailOutline(w, bed, free, mode === 'toes' ? shapeParams.toe : current)}
      {@const tipY = -(bed + w * f.tip)}
      {@const fw = mode === 'toes' ? w * 1.34 : w * 1.36}
      <g transform="translate({f.x} {f.y}) rotate({f.rot})">
        <path d={fingerPath(fw, tipY, 320)} fill="url(#{uid}-skin)" />
        <path
          d="M{-fw / 2 + 4} {w * 1.7} Q0 {w * 1.62} {fw / 2 - 4} {w * 1.7}"
          fill="none"
          stroke={skin.crease}
          stroke-width="1.2"
        />
        <path
          d="M{-fw / 2 + 6} {w * 1.82} Q0 {w * 1.76} {fw / 2 - 6} {w * 1.82}"
          fill="none"
          stroke={skin.crease}
          stroke-width="0.9"
        />
        <!-- Nagelwall -->
        <path d={geo.outline} fill="none" stroke="rgba(170, 95, 80, 0.28)" stroke-width="4" />

        <clipPath id="{uid}-clip-{i}">
          <path d={geo.outline} />
        </clipPath>

        <g clip-path="url(#{uid}-clip-{i})">
          <rect
            x={-w}
            y={-geo.total - 10}
            width={w * 2}
            height={geo.total + 20}
            style="fill: {baseFill}"
            class="paint"
          />

          {#if isNatural}
            <ellipse
              cx="0"
              cy={-w * 0.05}
              rx={w * 0.3}
              ry={w * 0.22}
              fill="#FFF3EE"
              opacity="0.45"
            />
            <path d={smileArea(w, bed, geo.total, w * 0.07)} fill="#FBF1EA" opacity="0.95" />
          {:else if finish === 'french'}
            {@const lift = Math.min(w * 0.06, free * 0.3)}
            <path
              d={smileArea(w, bed - w * 0.14, geo.total, w * 0.14 + lift)}
              style="fill: {frenchTip}"
              class="paint"
            />
          {:else if finish === 'babyboomer'}
            <linearGradient
              id="{uid}-bb-{i}"
              gradientUnits="userSpaceOnUse"
              x1="0"
              y1="0"
              x2="0"
              y2={-geo.total}
            >
              <stop offset="0.25" stop-color="#F3D6CF" />
              <stop offset="0.95" stop-color={tipColor} />
            </linearGradient>
            <rect
              x={-w}
              y={-geo.total - 10}
              width={w * 2}
              height={geo.total + 20}
              fill="url(#{uid}-bb-{i})"
            />
          {:else if finish === 'chrome'}
            <rect
              x={-w}
              y={-geo.total - 10}
              width={w * 2}
              height={geo.total + 20}
              fill="url(#{uid}-chrome)"
            />
          {:else if finish === 'cateye'}
            <rect
              x={-w}
              y={-geo.total - 10}
              width={w * 2}
              height={geo.total + 20}
              fill="url(#{uid}-cateye)"
            />
          {:else if finish === 'glitter'}
            {#each glitterDots(w, geo.total, i + 1) as d, j (j)}
              <circle
                cx={d.x}
                cy={d.y}
                r={d.r}
                fill={d.gold ? '#E8CD92' : '#FFFFFF'}
                opacity={d.o}
              />
            {/each}
          {/if}

          {#if artOn(i)}
            <g class="art">
              {#if motif === 'lines'}
                <path
                  d="M{-w * 0.62} {-bed * 0.25} Q{-w * 0.05} {-bed * 0.62} {w * 0.62} {-bed * 1.05}"
                  fill="none"
                  stroke="url(#{uid}-gold)"
                  stroke-width="1.6"
                />
                <path
                  d="M{-w * 0.62} {-bed * 0.42} Q{w * 0.02} {-bed * 0.8} {w * 0.62} {-bed * 1.22}"
                  fill="none"
                  stroke="url(#{uid}-gold)"
                  stroke-width="0.9"
                />
              {:else if motif === 'dots'}
                {#each [0.3, 0.52, 0.74] as k, j (j)}
                  <circle cx="0" cy={-bed * k} r={w * (0.05 - j * 0.008)} fill="url(#{uid}-gold)" />
                {/each}
              {:else}
                <g transform="translate({w * 0.1} {-bed * 0.58})">
                  {#each [0, 72, 144, 216, 288] as a (a)}
                    <ellipse
                      cx="0"
                      cy={-w * 0.085}
                      rx={w * 0.058}
                      ry={w * 0.09}
                      fill={petal}
                      transform="rotate({a})"
                    />
                  {/each}
                  <circle r={w * 0.045} fill="url(#{uid}-gold)" />
                </g>
                <g transform="translate({-w * 0.16} {-bed * 0.95}) scale(0.55)">
                  {#each [0, 72, 144, 216, 288] as a (a)}
                    <ellipse
                      cx="0"
                      cy={-w * 0.085}
                      rx={w * 0.058}
                      ry={w * 0.09}
                      fill={petal}
                      transform="rotate({a})"
                    />
                  {/each}
                  <circle r={w * 0.045} fill="url(#{uid}-gold)" />
                </g>
              {/if}
            </g>
          {/if}

          <!-- Glanzlicht -->
          <rect
            x={-w * 0.36}
            y={-geo.total * 0.92}
            width={w * 0.2}
            height={geo.total * 0.8}
            rx={w * 0.1}
            fill="url(#{uid}-gloss)"
            opacity={finish === 'natural' ? 0.35 : 0.8}
          />
        </g>
        <path
          d={geo.outline}
          fill="none"
          style="stroke: {edge}"
          stroke-width="1"
          opacity="0.55"
          class="paint"
        />
      </g>
    {/each}
  </g>
</svg>

<style>
  .nail-visual {
    width: 100%;
    height: auto;
    overflow: visible;
  }

  .paint {
    transition:
      fill 0.45s ease,
      stroke 0.45s ease;
  }

  .art {
    animation: art-in 0.5s ease both;
  }

  @keyframes art-in {
    from {
      opacity: 0;
    }
  }
</style>
