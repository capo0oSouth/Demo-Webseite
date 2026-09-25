<script lang="ts">
  import NailVisual from './NailVisual.svelte';
  import { nailColors, treatmentById } from '../../data/services';

  interface Props {
    compact?: boolean;
  }

  let { compact = false }: Props = $props();

  const shapes = treatmentById['gel-neuset'].groups.find((g) => g.id === 'shape')!.choices;
  const lengths = [
    { id: 'natural', label: 'Natur', hint: 'eigene Länge, 1–2 mm', price: 0 },
    ...treatmentById['gel-neuset'].groups
      .find((g) => g.id === 'length')!
      .choices.map((c) => ({ id: c.id, label: c.label, hint: c.hint ?? '', price: c.price ?? 0 })),
  ];
  const finishes = [
    { id: 'solid', label: 'Uni' },
    { id: 'french', label: 'French' },
    { id: 'babyboomer', label: 'Babyboomer' },
    { id: 'chrome', label: 'Chrome' },
  ];
  const colors = $derived(
    compact
      ? nailColors.filter((c) =>
          ['milky', 'ballet', 'rose', 'cherry', 'bordeaux', 'noir'].includes(c.id),
        )
      : nailColors,
  );

  let shape = $state('almond');
  let length = $state('medium');
  let color = $state('rose');
  let finish = $state('solid');
  let notice = $state('');

  const needsLength = (s: string) => s === 'coffin' || s === 'stiletto';
  const naturalShapes = ['square', 'squoval', 'round', 'oval', 'almond'];

  function setShape(id: string) {
    shape = id;
    if (needsLength(id) && (length === 'natural' || length === 'short')) {
      length = 'medium';
      notice = `${shapes.find((s) => s.id === id)?.label} braucht mindestens Länge Mittel – angepasst.`;
    } else notice = '';
  }

  function setLength(id: string) {
    length = id;
    if ((id === 'natural' || id === 'short') && needsLength(shape)) {
      shape = shape === 'stiletto' ? 'almond' : 'squoval';
      notice = `Bei dieser Länge ist ${shape === 'almond' ? 'Mandel' : 'Squoval'} die passende Form – angepasst.`;
    } else notice = '';
  }

  const shapeInfo = $derived(shapes.find((s) => s.id === shape));
  const lengthInfo = $derived(lengths.find((l) => l.id === length)!);
  const colorInfo = $derived(nailColors.find((c) => c.id === color)!);

  const recommendation = $derived.by(() => {
    if (length === 'natural') {
      return {
        id: 'gel-lack',
        name: 'Gel-Lack',
        text: 'Auf deinen Naturnägeln – mit Maniküre, hält 2–3 Wochen.',
        price:
          75 + (finish === 'french' || finish === 'babyboomer' ? 15 : finish === 'chrome' ? 10 : 0),
      };
    }
    const base =
      120 +
      lengthInfo.price +
      (finish === 'french' || finish === 'babyboomer' ? 15 : finish === 'chrome' ? 10 : 0);
    return {
      id: 'gel-neuset',
      name: 'Gel-Modellage · Neuset',
      text: 'Verlängerung mit Gel, Form und Länge frei wählbar.',
      price: base,
    };
  });

  const bookHref = $derived.by(() => {
    const p = new URLSearchParams({ behandlung: recommendation.id, shape, color, finish });
    if (recommendation.id === 'gel-neuset') p.set('length', length);
    return `/buchen?${p.toString()}`;
  });
</script>

<div class="studio" class:studio--compact={compact}>
  <div class="studio__stage">
    <NailVisual
      {shape}
      {length}
      color={colorInfo.swatch}
      {finish}
      label="Vorschau: {shapeInfo?.label}, {lengthInfo.label}, {colorInfo.label}"
    />
    <div class="studio__badge" aria-live="polite">
      <strong>{shapeInfo?.label}</strong>
      <span
        >{lengthInfo.label} · {colorInfo.label}{finish !== 'solid'
          ? ` · ${finishes.find((f) => f.id === finish)?.label}`
          : ''}</span
      >
    </div>
  </div>

  <div class="studio__controls">
    <fieldset>
      <legend>Form</legend>
      <div class="chips">
        {#each shapes as s (s.id)}
          <button
            type="button"
            class="chip-btn"
            aria-pressed={shape === s.id}
            onclick={() => setShape(s.id)}>{s.label}</button
          >
        {/each}
      </div>
      <p class="desc">{shapeInfo?.hint}</p>
    </fieldset>

    <fieldset>
      <legend>Länge <span>{lengthInfo.hint}</span></legend>
      <div class="lengths">
        {#each lengths as l (l.id)}
          <button
            type="button"
            class="len"
            aria-pressed={length === l.id}
            onclick={() => setLength(l.id)}
          >
            <span
              class="len__bar"
              style="--h: {(
                { natural: 18, short: 32, medium: 52, long: 74, xl: 100 } as Record<string, number>
              )[l.id]}%"
            ></span>
            {l.label}
          </button>
        {/each}
      </div>
    </fieldset>

    <fieldset>
      <legend>Farbe <span>{colorInfo.label}</span></legend>
      <div class="swatches">
        {#each colors as c (c.id)}
          <button
            type="button"
            class="swatch"
            style="--c: {c.swatch}"
            aria-pressed={color === c.id}
            aria-label={c.label}
            title={c.label}
            onclick={() => (color = c.id)}
          ></button>
        {/each}
      </div>
    </fieldset>

    {#if !compact}
      <fieldset>
        <legend>Finish</legend>
        <div class="chips">
          {#each finishes as f (f.id)}
            <button
              type="button"
              class="chip-btn"
              aria-pressed={finish === f.id}
              onclick={() => (finish = f.id)}>{f.label}</button
            >
          {/each}
        </div>
      </fieldset>
    {/if}

    <p class="notice" aria-live="polite">{notice}</p>

    <div class="reco">
      <div>
        <span class="reco__label">Passende Behandlung</span>
        <span class="reco__name">{recommendation.name}</span>
        <span class="reco__text">{recommendation.text}</span>
      </div>
      <div class="reco__side">
        <span class="reco__price">CHF {recommendation.price}.–</span>
        <a class="btn btn--small btn--accent" href={bookHref}>Diesen Look buchen</a>
      </div>
    </div>
  </div>
</div>

<style>
  .studio {
    display: grid;
    gap: clamp(1.5rem, 1rem + 2vw, 3rem);
    align-items: center;
  }

  @media (min-width: 900px) {
    .studio {
      grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr);
    }
  }

  .studio__stage {
    position: relative;
    aspect-ratio: 1;
    max-width: 520px;
    width: 100%;
    margin-inline: auto;
    border-radius: 999px 999px var(--radius-l) var(--radius-l);
    background:
      radial-gradient(60% 55% at 50% 40%, #fff, rgba(255, 255, 255, 0) 70%),
      linear-gradient(165deg, var(--blush-100), var(--cream));
    overflow: hidden;
    box-shadow: var(--shadow-m);
  }

  .studio__stage :global(svg) {
    position: absolute;
    inset: 4% 4% 0;
    width: 92%;
    height: 96%;
  }

  .studio__badge {
    position: absolute;
    left: 50%;
    bottom: 1rem;
    translate: -50% 0;
    display: grid;
    justify-items: center;
    padding: 0.55rem 1.2rem;
    border-radius: var(--radius-pill);
    background: rgba(255, 255, 255, 0.88);
    backdrop-filter: blur(8px);
    box-shadow: var(--shadow-s);
    white-space: nowrap;
    line-height: 1.3;
  }

  .studio__badge strong {
    font-family: var(--font-display);
    font-weight: 400;
    font-size: 1.15rem;
  }

  .studio__badge span {
    font-size: 0.78rem;
    color: var(--text-muted);
  }

  .studio__controls {
    display: grid;
    gap: 1.4rem;
  }

  fieldset {
    border: 0;
    margin: 0;
    padding: 0;
    min-width: 0;
  }

  legend {
    padding: 0;
    margin-bottom: 0.6rem;
    font-size: 0.74rem;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--gold-600);
  }

  legend span {
    margin-left: 0.4rem;
    letter-spacing: 0.02em;
    text-transform: none;
    font-weight: 400;
    color: var(--text-muted);
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .chip-btn {
    padding: 0.5rem 0.95rem;
    border: 1px solid var(--line-strong);
    border-radius: var(--radius-pill);
    background: var(--white);
    font-size: 0.9rem;
    transition:
      background-color 0.2s,
      color 0.2s,
      border-color 0.2s;
  }

  .chip-btn:hover {
    border-color: var(--plum-900);
  }

  .chip-btn[aria-pressed='true'] {
    background: var(--plum-900);
    border-color: var(--plum-900);
    color: var(--porcelain);
  }

  .desc {
    margin-top: 0.6rem;
    font-size: 0.92rem;
    color: var(--text-soft);
    min-height: 1.5em;
  }

  .lengths {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 0.4rem;
  }

  .len {
    display: grid;
    justify-items: center;
    gap: 0.4rem;
    padding: 0.6rem 0.2rem 0.5rem;
    border: 1px solid var(--line);
    border-radius: 14px;
    background: var(--white);
    font-size: 0.8rem;
    transition:
      border-color 0.2s,
      background-color 0.2s;
  }

  .len__bar {
    position: relative;
    width: 0.9rem;
    height: 2.4rem;
    border-radius: 6px 6px 3px 3px;
    background: var(--blush-100);
    overflow: hidden;
  }

  .len__bar::after {
    content: '';
    position: absolute;
    inset: auto 0 0 0;
    height: var(--h);
    background: var(--rose-400);
    border-radius: 6px 6px 0 0;
    transition: height 0.3s;
  }

  .len[aria-pressed='true'] {
    border-color: var(--plum-900);
    background: var(--blush-50);
    box-shadow: 0 0 0 1px var(--plum-900);
  }

  .len[aria-pressed='true'] .len__bar::after {
    background: var(--berry-700);
  }

  .swatches {
    display: flex;
    flex-wrap: wrap;
    gap: 0.55rem;
  }

  .swatch {
    width: 2.3rem;
    height: 2.3rem;
    border: 0;
    border-radius: 50%;
    background:
      radial-gradient(circle at 32% 28%, rgba(255, 255, 255, 0.7), transparent 38%), var(--c);
    box-shadow:
      inset 0 0 0 1px rgba(51, 24, 42, 0.12),
      0 4px 10px -6px rgba(51, 24, 42, 0.5);
    transition:
      transform 0.25s var(--ease-out),
      box-shadow 0.25s;
  }

  .swatch:hover {
    transform: scale(1.08);
  }

  .swatch[aria-pressed='true'] {
    box-shadow:
      0 0 0 3px var(--porcelain),
      0 0 0 4.5px var(--plum-900);
  }

  .notice {
    min-height: 1.3em;
    margin-top: -0.6rem;
    font-size: 0.85rem;
    color: var(--gold-600);
  }

  .reco {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding: 1.1rem 1.2rem;
    border-radius: var(--radius-m);
    background: var(--white);
    box-shadow: var(--shadow-s);
  }

  .reco > div:first-child {
    display: grid;
    gap: 0.1rem;
  }

  .reco__label {
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--gold-600);
  }

  .reco__name {
    font-family: var(--font-display);
    font-size: 1.2rem;
  }

  .reco__text {
    font-size: 0.85rem;
    color: var(--text-muted);
  }

  .reco__side {
    display: grid;
    justify-items: end;
    gap: 0.4rem;
  }

  .reco__price {
    font-family: var(--font-display);
    font-size: 1.4rem;
  }

  @media (max-width: 520px) {
    .lengths {
      grid-template-columns: repeat(3, 1fr);
    }

    .reco__side {
      justify-items: start;
    }
  }
</style>
