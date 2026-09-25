<script lang="ts">
  import EyeVisual from './EyeVisual.svelte';
  import CompareSlider from './CompareSlider.svelte';
  import { treatmentById } from '../../data/services';
  import { formatDuration } from '../../lib/booking';
  import type { BrowMode } from '../../lib/visuals/eye';

  type Option = {
    id: string;
    label: string;
    treatment: string;
    mode: BrowMode;
    tinted?: boolean;
    pmu?: 'microblading' | 'powder' | 'combo';
    params?: Record<string, string>;
    color: boolean;
    what: string;
  };

  const options: Option[] = [
    {
      id: 'shaping',
      label: 'Shaping',
      treatment: 'brow-shaping',
      mode: 'shaping',
      color: false,
      what: 'Streuhärchen weg, klare Form – deine natürliche Farbe bleibt.',
    },
    {
      id: 'tint',
      label: 'Färben',
      treatment: 'brow-styling',
      mode: 'tint',
      color: true,
      what: 'Auch feine, helle Härchen werden sichtbar – die Braue wirkt dichter.',
    },
    {
      id: 'henna',
      label: 'Henna',
      treatment: 'brow-henna',
      mode: 'henna',
      color: true,
      what: 'Färbt zusätzlich die Haut darunter – lichte Stellen verschwinden optisch.',
    },
    {
      id: 'lamination',
      label: 'Lamination',
      treatment: 'brow-lamination',
      mode: 'lamination',
      tinted: true,
      color: true,
      params: { tint: 'tint' },
      what: 'Härchen werden nach oben gebürstet und fixiert – voller, «fluffy» Look.',
    },
    {
      id: 'microblading',
      label: 'Microblading',
      treatment: 'brow-pmu',
      mode: 'pmu',
      pmu: 'microblading',
      color: true,
      params: { technique: 'microblading' },
      what: 'Feine, gezeichnete Härchenstriche füllen die Form – hält 1–2 Jahre.',
    },
    {
      id: 'powder',
      label: 'Powder Brows',
      treatment: 'brow-pmu',
      mode: 'pmu',
      pmu: 'powder',
      color: true,
      params: { technique: 'powder' },
      what: 'Weicher Puder-Effekt mit Farbverlauf – vorne zart, hinten definiert.',
    },
  ];

  const colors = treatmentById['brow-styling'].groups[0].choices;

  let selected = $state('lamination');
  let color = $state('medium');

  const opt = $derived(options.find((o) => o.id === selected)!);
  const t = $derived(treatmentById[opt.treatment]);
  const swatch = $derived(colors.find((c) => c.id === color)!.swatch!);
  const price = $derived(
    t.price +
      (opt.params?.tint === 'tint' ? 15 : 0) +
      (opt.pmu === 'powder' ? 30 : opt.pmu === 'combo' ? 60 : 0),
  );

  const bookHref = $derived.by(() => {
    const p = new URLSearchParams({ behandlung: opt.treatment, ...(opt.params ?? {}) });
    if (opt.color) p.set('browcolor', color);
    return `/buchen?${p.toString()}`;
  });
</script>

<div class="brow-studio">
  <div class="stage">
    <CompareSlider label="Vergleich natürliche Brauen und {opt.label}" start={40}>
      {#snippet before()}
        <EyeVisual
          focus="brows"
          browMode="natural"
          instant
          label="Natürliche, unbehandelte Braue"
        />
      {/snippet}
      {#snippet after()}
        <EyeVisual
          focus="brows"
          browMode={opt.mode}
          browTinted={opt.tinted ?? false}
          browColor={swatch}
          pmu={opt.pmu}
          label="Braue nach {opt.label}"
        />
      {/snippet}
    </CompareSlider>
  </div>

  <div class="panel">
    <fieldset>
      <legend>Behandlung</legend>
      <div class="tabs">
        {#each options as o (o.id)}
          <button type="button" aria-pressed={selected === o.id} onclick={() => (selected = o.id)}
            >{o.label}</button
          >
        {/each}
      </div>
    </fieldset>

    <div class="info">
      <h3>{t.name}{opt.pmu ? ` · ${opt.label}` : ''}</h3>
      <p>{opt.what}</p>
      <dl>
        <div>
          <dt>Dauer</dt>
          <dd>ca. {formatDuration(t.minutes + (opt.params?.tint === 'tint' ? 10 : 0))}</dd>
        </div>
        <div>
          <dt>Hält</dt>
          <dd>{t.durability}</dd>
        </div>
      </dl>
    </div>

    {#if opt.color}
      <fieldset>
        <legend>Farbton <span>{colors.find((c) => c.id === color)?.label}</span></legend>
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
    {/if}

    <div class="reco">
      <div>
        <span class="reco__label">{opt.params?.tint === 'tint' ? 'inkl. Färben' : 'Preis'}</span>
        <span class="reco__price">CHF {price}.–</span>
      </div>
      <a class="btn btn--small btn--accent" href={bookHref}>Diese Behandlung buchen</a>
    </div>
  </div>
</div>

<style>
  .brow-studio {
    display: grid;
    gap: clamp(1.5rem, 1rem + 2vw, 3rem);
    align-items: start;
  }

  @media (min-width: 980px) {
    .brow-studio {
      grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
      align-items: center;
    }
  }

  .stage {
    aspect-ratio: 1.6;
    border-radius: var(--radius-l);
    overflow: hidden;
    box-shadow: var(--shadow-m);
    background: #efc9b6;
  }

  .panel {
    display: grid;
    gap: 1.3rem;
  }

  fieldset {
    border: 0;
    margin: 0;
    padding: 0;
    min-width: 0;
  }

  legend {
    padding: 0;
    margin-bottom: 0.55rem;
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

  .tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .tabs button {
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

  .tabs button[aria-pressed='true'] {
    background: var(--plum-900);
    border-color: var(--plum-900);
    color: var(--porcelain);
  }

  .info {
    display: grid;
    gap: 0.5rem;
    padding: 1.1rem 1.2rem;
    border-left: 2px solid var(--gold-400);
    background: var(--white);
    border-radius: 0 var(--radius-m) var(--radius-m) 0;
  }

  .info h3 {
    font-size: 1.3rem;
  }

  .info p {
    color: var(--text-soft);
  }

  .info dl {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem 1.6rem;
    margin: 0.2rem 0 0;
    font-size: 0.88rem;
  }

  .info dl div {
    display: flex;
    gap: 0.4rem;
  }

  .info dt {
    color: var(--text-muted);
  }

  .info dd {
    margin: 0;
    font-weight: 500;
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
      radial-gradient(circle at 32% 28%, rgba(255, 255, 255, 0.45), transparent 38%), var(--c);
    box-shadow: 0 4px 10px -6px rgba(51, 24, 42, 0.5);
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

  .reco > div {
    display: grid;
  }

  .reco__label {
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--gold-600);
  }

  .reco__price {
    font-family: var(--font-display);
    font-size: 1.5rem;
  }
</style>
