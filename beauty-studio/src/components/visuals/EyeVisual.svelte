<script lang="ts">
  import { untrack } from 'svelte';
  import { Tween } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { fade } from 'svelte/transition';
  import {
    browShape,
    cameras,
    eye,
    eyeOpening,
    lowerLidPath,
    renderBrows,
    renderLashes,
    upperLidPath,
    type BrowMode,
    type LashMode,
    type LashTechnique,
  } from '../../lib/visuals/eye';

  interface Props {
    focus?: 'lashes' | 'brows' | 'combo';
    lashMode?: LashMode;
    technique?: LashTechnique;
    look?: string;
    curl?: string;
    lashLength?: string;
    accent?: string | null;
    lashTinted?: boolean;
    browMode?: BrowMode;
    browColor?: string;
    browTinted?: boolean;
    pmu?: 'microblading' | 'powder' | 'combo';
    tintColor?: string;
    label?: string;
    instant?: boolean;
  }

  let {
    focus = 'lashes',
    lashMode = 'natural',
    technique = 'classic',
    look = 'natural',
    curl = 'c',
    lashLength = 'medium',
    accent = null,
    lashTinted = false,
    browMode = 'natural',
    browColor = '#5A3F30',
    browTinted = false,
    pmu = 'microblading',
    tintColor,
    label = 'Vorschau Augenpartie',
    instant = false,
  }: Props = $props();

  const uid = `ev${Math.random().toString(36).slice(2, 8)}`;
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const noMotion = untrack(() => instant) || reduced;
  const opts = { duration: noMotion ? 0 : 700, easing: cubicOut };

  const lookIndex: Record<string, number> = { natural: 0, doll: 1, cat: 2, squirrel: 3 };
  const curlValue: Record<string, number> = { c: 0.5, cc: 0.72, d: 0.95 };
  const lengthValue: Record<string, number> = { subtle: 60, medium: 72, long: 86 };

  const weightsFor = (l: string): [number, number, number, number] => {
    const w: [number, number, number, number] = [0, 0, 0, 0];
    w[lookIndex[l] ?? 0] = 1;
    return w;
  };

  const shape = new Tween(
    untrack(() => ({
      look: weightsFor(look),
      curl: curlValue[curl] ?? 0.5,
      length: lengthValue[lashLength] ?? 72,
    })),
    opts,
  );
  const camera = new Tween(
    untrack(() => [...cameras[focus]]),
    { ...opts, duration: noMotion ? 0 : 900 },
  );

  $effect(() => {
    shape.target = {
      look: weightsFor(look),
      curl: curlValue[curl] ?? 0.5,
      length: lengthValue[lashLength] ?? 72,
    };
  });

  $effect(() => {
    camera.target = [...cameras[focus]];
  });

  const lashes = $derived(
    renderLashes({
      mode: lashMode,
      technique,
      look: shape.current.look,
      curl: shape.current.curl,
      length: shape.current.length,
      accent,
      tinted: lashTinted || lashMode === 'tint',
    }),
  );

  const lashColor = $derived(lashMode === 'tint' && tintColor ? tintColor : lashes.color);
  const lashKey = $derived(`${lashMode}-${technique}-${lashTinted}-${tintColor}`);
  const browKey = $derived(`${browMode}-${browTinted}-${pmu}`);

  const brows = $derived(
    renderBrows({ mode: browMode, color: browColor, tinted: browTinted, pmu }),
  );

  const vb = $derived(camera.current.map((v) => Math.round(v * 10) / 10).join(' '));
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  class="eye-visual"
  viewBox={vb}
  role="img"
  aria-label={label}
  preserveAspectRatio="xMidYMid slice"
>
  <defs>
    <radialGradient id="{uid}-skin" cx="0.5" cy="0.45" r="0.75">
      <stop offset="0" stop-color="#F6DDCF" />
      <stop offset="0.55" stop-color="#EDC8B5" />
      <stop offset="1" stop-color="#DDAF99" />
    </radialGradient>
    <radialGradient id="{uid}-bone" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#FFF4EC" stop-opacity="0.75" />
      <stop offset="1" stop-color="#FFF4EC" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="{uid}-lid" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#C98F7C" stop-opacity="0" />
      <stop offset="1" stop-color="#B7806E" stop-opacity="0.35" />
    </linearGradient>
    <radialGradient id="{uid}-sclera" cx="0.52" cy="0.5" r="0.6">
      <stop offset="0" stop-color="#FFFBF8" />
      <stop offset="0.7" stop-color="#F3E7E3" />
      <stop offset="1" stop-color="#D9BDB5" />
    </radialGradient>
    <radialGradient id="{uid}-iris" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0.3" stop-color="#8A6A45" />
      <stop offset="0.62" stop-color="#6B4A2C" />
      <stop offset="0.9" stop-color="#3E2918" />
      <stop offset="1" stop-color="#23160E" />
    </radialGradient>
    <linearGradient id="{uid}-shadow" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2A1812" stop-opacity="0.55" />
      <stop offset="0.35" stop-color="#2A1812" stop-opacity="0" />
    </linearGradient>
    <linearGradient id="{uid}-henna" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color={browColor} stop-opacity="0.18" />
      <stop offset="0.22" stop-color={browColor} stop-opacity="0.42" />
      <stop offset="1" stop-color={browColor} stop-opacity="0.5" />
    </linearGradient>
    <linearGradient
      id="{uid}-powder"
      gradientUnits="userSpaceOnUse"
      x1="146"
      y1="0"
      x2="552"
      y2="0"
    >
      <stop offset={pmu === 'combo' ? '0.28' : '0'} stop-color={browColor} stop-opacity="0" />
      <stop offset="0.5" stop-color={browColor} stop-opacity="0.42" />
      <stop offset="1" stop-color={browColor} stop-opacity="0.66" />
    </linearGradient>
    <filter id="{uid}-soft" x="-10%" y="-20%" width="120%" height="140%">
      <feGaussianBlur stdDeviation="1.6" />
    </filter>
    <filter id="{uid}-blur" x="-20%" y="-50%" width="140%" height="200%">
      <feGaussianBlur stdDeviation="14" />
    </filter>
    <clipPath id="{uid}-eye"><path d={eyeOpening} /></clipPath>
  </defs>

  <rect x="-40" y="-40" width="720" height="600" fill="url(#{uid}-skin)" />
  <ellipse cx="360" cy="200" rx="220" ry="46" fill="url(#{uid}-bone)" />

  <!-- Oberlid & Lidfalte -->
  <path
    d={eye.crease}
    fill="none"
    stroke="#B57C69"
    stroke-opacity="0.28"
    stroke-width="1.8"
    stroke-linecap="round"
  />
  <path
    d={eye.crease}
    fill="none"
    stroke="#A86F5E"
    stroke-opacity="0.25"
    stroke-width="10"
    filter="url(#{uid}-blur)"
  />
  <path
    d="M150 362 C205 270 398 246 502 342 L 530 318 C418 196 196 222 128 334 Z"
    fill="url(#{uid}-lid)"
    opacity="0.6"
  />

  <!-- Braue -->
  <g class="brow" style="opacity: {focus === 'lashes' ? 0 : 1}">
    {#key browKey}
      <g in:fade={{ duration: instant ? 0 : 420 }} out:fade={{ duration: instant ? 0 : 420 }}>
        {#if brows.stain}
          <path d={browShape} fill="url(#{uid}-henna)" filter="url(#{uid}-soft)" />
        {/if}
        {#if brows.powder !== 'none'}
          <path d={browShape} fill="url(#{uid}-powder)" filter="url(#{uid}-soft)" />
          {#each brows.stipple as [opacity, d] (opacity)}
            <path {d} stroke={browColor} stroke-width="1.5" stroke-linecap="round" {opacity} />
          {/each}
        {/if}
        <path
          d={brows.fine}
          style="fill: {brows.hairColor}"
          opacity={brows.fineOpacity}
          class="paint"
        />
        {#if brows.strokes}
          <path d={brows.strokes} style="fill: {browColor}" opacity="0.9" class="paint" />
        {/if}
        <path
          d={brows.hairs}
          style="fill: {brows.hairColor}"
          opacity={brows.hairOpacity}
          class="paint"
        />
        {#if brows.strays}
          <path d={brows.strays} fill="#6E5344" opacity="0.7" />
        {/if}
      </g>
    {/key}
  </g>

  <!-- Auge -->
  <path d={eyeOpening} fill="url(#{uid}-sclera)" />
  <g clip-path="url(#{uid}-eye)">
    <circle cx={eye.iris.cx} cy={eye.iris.cy} r={eye.iris.r} fill="url(#{uid}-iris)" />
    <g stroke="#C9A67A" stroke-opacity="0.25" stroke-width="1">
      {#each Array.from({ length: 36 }, (_, i) => i * 10) as a (a)}
        <line
          x1={eye.iris.cx + Math.cos((a * Math.PI) / 180) * 26}
          y1={eye.iris.cy + Math.sin((a * Math.PI) / 180) * 26}
          x2={eye.iris.cx + Math.cos((a * Math.PI) / 180) * 56}
          y2={eye.iris.cy + Math.sin((a * Math.PI) / 180) * 56}
        />
      {/each}
    </g>
    <circle cx={eye.iris.cx} cy={eye.iris.cy} r="25" fill="#130C0A" />
    <ellipse cx={eye.iris.cx + 20} cy={eye.iris.cy - 20} rx="9" ry="7" fill="#fff" opacity="0.9" />
    <circle cx={eye.iris.cx - 22} cy={eye.iris.cy + 16} r="3.5" fill="#fff" opacity="0.5" />
    <rect x="140" y="240" width="380" height="190" fill="url(#{uid}-shadow)" />
  </g>
  <ellipse cx="160" cy="364" rx="9" ry="7" fill="#E0928E" opacity="0.8" />
  <path d={lowerLidPath} fill="none" stroke="#D99B92" stroke-width="3" opacity="0.8" />
  <path
    d={lowerLidPath}
    fill="none"
    stroke="#8F5B4E"
    stroke-width="0.8"
    opacity="0.5"
    transform="translate(0 2.5)"
  />

  <!-- Wimpern -->
  <path d={lashes.lower} fill="#4A3830" opacity="0.72" />
  {#key lashKey}
    <g in:fade={{ duration: instant ? 0 : 380 }} out:fade={{ duration: instant ? 0 : 380 }}>
      {#if lashes.tips}
        <path d={lashes.tips} fill={lashes.tipColor} opacity="0.85" />
      {/if}
      <path d={lashes.main} fill={lashColor} />
      {#if lashes.accent && accent}
        <path d={lashes.accent} style="fill: {accent}" class="paint" />
      {/if}
      <path
        d={upperLidPath}
        fill="none"
        stroke={lashColor}
        stroke-width={lashes.lineWidth}
        stroke-linecap="round"
      />
    </g>
  {/key}
</svg>

<style>
  .eye-visual {
    display: block;
    width: 100%;
    height: 100%;
  }

  .brow {
    transition: opacity 0.6s ease;
  }

  .paint {
    transition:
      fill 0.45s ease,
      opacity 0.45s ease;
  }
</style>
