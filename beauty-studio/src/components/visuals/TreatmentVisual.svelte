<script lang="ts">
  import NailVisual from './NailVisual.svelte';
  import EyeVisual from './EyeVisual.svelte';
  import type { Treatment } from '../../data/services';
  import { visibleGroups, type Selection } from '../../lib/booking';

  interface Props {
    treatment: Treatment;
    selection: Selection;
    compare?: boolean;
    caption?: boolean;
    compact?: boolean;
  }

  let { treatment, selection, compare = true, caption = true, compact = false }: Props = $props();

  let view = $state<'after' | 'before'>('after');
  let beforeMounted = $state(false);

  const swatch = (groupId: string) =>
    treatment.groups.find((g) => g.id === groupId)?.choices.find((c) => c.id === selection[groupId])
      ?.swatch;

  const labelOf = (groupId: string) =>
    treatment.groups.find((g) => g.id === groupId)?.choices.find((c) => c.id === selection[groupId])
      ?.label;

  const kind = $derived(treatment.visual);

  const nail = $derived.by(() => {
    let finish = selection.finish ?? 'solid';
    if (treatment.id === 'manicure')
      finish =
        selection.polish === 'color' ? 'solid' : selection.polish === 'clear' ? 'clear' : 'natural';
    if (treatment.id === 'pedicure') finish = selection.polish === 'none' ? 'natural' : 'solid';
    if (treatment.id === 'nail-removal') finish = 'natural';
    if (selection.color === 'clear') finish = 'clear';
    return {
      shape: selection.shape ?? 'round',
      length: selection.length ?? treatment.preset?.length ?? 'natural',
      color: swatch('color') ?? '#F0CFCC',
      finish,
      art: selection.art ?? 'none',
      motif: selection.motif ?? 'lines',
      mode: (kind === 'toes' ? 'toes' : 'hand') as 'hand' | 'toes',
    };
  });

  const eyeProps = $derived.by(() => {
    const id = treatment.id;
    const color = swatch('browcolor') ?? '#5A3F30';
    if (id === 'lash-neuset' || id === 'lash-refill') {
      return {
        focus: 'lashes' as const,
        lashMode: 'extension' as const,
        technique: (selection.technique ?? 'classic') as 'classic',
        look: selection.look,
        curl: selection.curl,
        lashLength: selection.lashlength,
        accent: selection.accent && selection.accent !== 'none' ? (swatch('accent') ?? null) : null,
      };
    }
    if (id === 'lash-lift')
      return {
        focus: 'lashes' as const,
        lashMode: 'lift' as const,
        lashTinted: selection.tint === 'tint',
      };
    if (id === 'lash-tint')
      return {
        focus: 'lashes' as const,
        lashMode: 'tint' as const,
        tintColor: swatch('tintcolor'),
      };
    if (id === 'lash-removal') return { focus: 'lashes' as const, lashMode: 'natural' as const };
    if (id === 'lash-brow-combo')
      return {
        focus: 'combo' as const,
        lashMode: 'lift' as const,
        lashTinted: true,
        browMode: 'lamination' as const,
        browTinted: true,
        browColor: color,
      };
    const modes: Record<string, 'shaping' | 'tint' | 'henna' | 'lamination' | 'pmu'> = {
      'brow-shaping': 'shaping',
      'brow-styling': 'tint',
      'brow-henna': 'henna',
      'brow-lamination': 'lamination',
      'brow-pmu': 'pmu',
    };
    return {
      focus: 'brows' as const,
      browMode: modes[id] ?? 'shaping',
      browColor: color,
      browTinted: selection.tint === 'tint',
      pmu: (selection.technique ?? 'microblading') as 'microblading',
    };
  });

  const isEye = $derived(kind === 'lashes' || kind === 'brows' || kind === 'combo');
  const beforeFocus = $derived(isEye ? eyeProps.focus : 'lashes');

  // Nur sichtbare, aussagekräftige Optionen (ohne «Ohne» und ohne Termin-Intervall)
  const summary = $derived(
    visibleGroups(treatment, selection)
      .filter((g) => g.id !== 'interval' && selection[g.id])
      .map((g) => labelOf(g.id))
      .filter((l) => l && l !== 'Ohne')
      .join(' · '),
  );

  const ariaLabel = $derived(`Vorschau ${treatment.name}${summary ? `: ${summary}` : ''}`);

  function setView(v: 'after' | 'before') {
    if (v === 'before') beforeMounted = true;
    view = v;
  }
</script>

<figure class="stage" class:stage--eye={isEye} class:stage--compact={compact}>
  <div class="stage__canvas">
    <div class="layer" class:is-hidden={view !== 'after'} aria-hidden={view !== 'after'}>
      {#if isEye}
        <EyeVisual {...eyeProps} label={ariaLabel} />
      {:else}
        <NailVisual {...nail} label={ariaLabel} />
      {/if}
    </div>
    {#if compare && beforeMounted}
      <div class="layer" class:is-hidden={view !== 'before'} aria-hidden={view !== 'before'}>
        {#if isEye}
          <EyeVisual
            focus={beforeFocus}
            lashMode="natural"
            browMode="natural"
            label="Vorher: natürlicher Zustand"
            instant
          />
        {:else}
          <NailVisual
            shape="round"
            length="natural"
            finish="natural"
            mode={nail.mode}
            label="Vorher: Naturnägel"
            instant
          />
        {/if}
      </div>
    {/if}
  </div>

  {#if compare}
    <div class="toggle" role="group" aria-label="Vorher-Nachher-Vergleich">
      <button type="button" aria-pressed={view === 'before'} onclick={() => setView('before')}
        >Vorher</button
      >
      <button type="button" aria-pressed={view === 'after'} onclick={() => setView('after')}
        >Nachher</button
      >
    </div>
  {/if}

  {#if caption && summary}
    <figcaption>
      <span class="caption__label">{view === 'before' ? 'Ausgangslage' : 'Deine Auswahl'}</span>
      <span>{view === 'before' ? 'Natürlicher Zustand' : summary}</span>
    </figcaption>
  {/if}
</figure>

<style>
  .stage {
    position: relative;
    margin: 0;
    border-radius: var(--radius-l);
    overflow: hidden;
    background:
      radial-gradient(60% 70% at 50% 40%, #fff 0%, rgba(255, 255, 255, 0) 70%),
      linear-gradient(160deg, var(--blush-100), var(--cream));
    isolation: isolate;
  }

  .stage::before {
    content: '';
    position: absolute;
    left: 50%;
    top: 12%;
    width: 58%;
    aspect-ratio: 1;
    translate: -50% 0;
    border-radius: 50%;
    border: 1px solid rgba(191, 154, 92, 0.35);
    z-index: -1;
  }

  .stage--eye::before {
    display: none;
  }

  .stage__canvas {
    position: relative;
    aspect-ratio: 1.6;
    overflow: hidden;
  }

  .layer {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    transition:
      opacity 0.5s ease,
      transform 0.6s var(--ease-out);
  }

  .layer :global(svg.nail-visual) {
    height: 100%;
    width: auto;
    max-width: 100%;
  }

  .layer.is-hidden {
    opacity: 0;
    transform: scale(0.985);
    pointer-events: none;
  }

  .toggle {
    position: absolute;
    top: 0.85rem;
    left: 0.85rem;
    display: inline-flex;
    padding: 3px;
    border-radius: var(--radius-pill);
    background: rgba(255, 255, 255, 0.82);
    backdrop-filter: blur(8px);
    box-shadow: var(--shadow-s);
  }

  .toggle button {
    border: 0;
    background: transparent;
    padding: 0.35rem 0.85rem;
    border-radius: var(--radius-pill);
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--text-soft);
    transition:
      background-color 0.25s,
      color 0.25s;
  }

  .toggle button[aria-pressed='true'] {
    background: var(--plum-900);
    color: var(--porcelain);
  }

  figcaption {
    display: flex;
    flex-wrap: wrap;
    gap: 0.2rem 0.6rem;
    align-items: baseline;
    padding: 0.7rem 1.1rem 0.8rem;
    background: rgba(255, 255, 255, 0.72);
    border-top: 1px solid rgba(191, 154, 92, 0.22);
    font-size: 0.88rem;
    color: var(--plum-900);
  }

  .caption__label {
    font-size: 0.66rem;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--gold-600);
  }

  .stage--compact figcaption {
    display: none;
  }

  .stage--compact .toggle {
    top: 0.5rem;
    left: 0.5rem;
  }
</style>
