<script lang="ts">
  import EyeVisual from './EyeVisual.svelte';
  import CompareSlider from './CompareSlider.svelte';
  import { treatmentById } from '../../data/services';
  import type { LashTechnique } from '../../lib/visuals/eye';

  const neuset = treatmentById['lash-neuset'];
  const techniques = neuset.groups.find((g) => g.id === 'technique')!.choices;
  const looks = neuset.groups.find((g) => g.id === 'look')!.choices;
  const curls = neuset.groups.find((g) => g.id === 'curl')!.choices;
  const lengths = neuset.groups.find((g) => g.id === 'lashlength')!.choices;

  const details: Record<string, { effect: string; density: number; refill: string }> = {
    classic: {
      effect: 'Wie frisch getuschte Wimpern – definiert, aber ganz natürlich.',
      density: 1,
      refill: 'alle 3 Wochen',
    },
    hybrid: {
      effect: 'Etwas mehr Fülle und Textur, trotzdem alltagstauglich.',
      density: 2,
      refill: 'alle 2–3 Wochen',
    },
    volume: {
      effect: 'Weich, dicht und glamourös – die Wimpernlinie wirkt voll.',
      density: 3,
      refill: 'alle 2–3 Wochen',
    },
    mega: {
      effect: 'Maximale Dichte, wie ein feiner Eyeliner-Effekt – für den grossen Auftritt.',
      density: 4,
      refill: 'alle 2 Wochen',
    },
  };

  let mode = $state<'extension' | 'lift'>('extension');
  let technique = $state<LashTechnique>('classic');
  let look = $state('natural');
  let curl = $state('c');
  let lashLength = $state('medium');

  const tech = $derived(techniques.find((t) => t.id === technique)!);
  const price = $derived(
    mode === 'lift' ? treatmentById['lash-lift'].price : neuset.price + (tech.price ?? 0),
  );
  const minutes = $derived(
    mode === 'lift' ? treatmentById['lash-lift'].minutes : neuset.minutes + (tech.minutes ?? 0),
  );

  const bookHref = $derived(
    mode === 'lift'
      ? '/buchen?behandlung=lash-lift'
      : `/buchen?${new URLSearchParams({ behandlung: 'lash-neuset', technique, look, curl, lashlength: lashLength })}`,
  );
</script>

<div class="lash-studio">
  <div class="stage">
    <CompareSlider
      label="Vergleich natürliche Wimpern und {mode === 'lift' ? 'Lash Lifting' : tech.label}"
      start={42}
    >
      {#snippet before()}
        <EyeVisual
          focus="lashes"
          lashMode="natural"
          instant
          label="Natürliche Wimpern ohne Behandlung"
        />
      {/snippet}
      {#snippet after()}
        <EyeVisual
          focus="lashes"
          lashMode={mode === 'lift' ? 'lift' : 'extension'}
          lashTinted={mode === 'lift'}
          {technique}
          {look}
          {curl}
          {lashLength}
          label={mode === 'lift' ? 'Lash Lifting mit Färben' : `${tech.label}, ${look}, ${curl}`}
        />
      {/snippet}
    </CompareSlider>
  </div>

  <div class="panel">
    <div class="modes" role="group" aria-label="Behandlungsart">
      <button type="button" aria-pressed={mode === 'extension'} onclick={() => (mode = 'extension')}
        >Extensions</button
      >
      <button type="button" aria-pressed={mode === 'lift'} onclick={() => (mode = 'lift')}
        >Lash Lifting</button
      >
    </div>

    {#if mode === 'extension'}
      <fieldset>
        <legend>Technik</legend>
        <div class="tabs">
          {#each techniques as t (t.id)}
            <button
              type="button"
              aria-pressed={technique === t.id}
              onclick={() => (technique = t.id as LashTechnique)}
            >
              {t.label}
              <span class="dots" aria-hidden="true">
                {#each [1, 2, 3, 4] as d (d)}<i class:on={d <= details[t.id].density}></i>{/each}
              </span>
            </button>
          {/each}
        </div>
        <p class="effect"><strong>{tech.label}:</strong> {tech.hint} {details[technique].effect}</p>
      </fieldset>

      <fieldset>
        <legend>Look</legend>
        <div class="chips">
          {#each looks as l (l.id)}
            <button type="button" aria-pressed={look === l.id} onclick={() => (look = l.id)}
              >{l.label}</button
            >
          {/each}
        </div>
        <p class="effect">{looks.find((l) => l.id === look)?.hint}</p>
      </fieldset>

      <div class="row">
        <fieldset>
          <legend>Schwung</legend>
          <div class="chips">
            {#each curls as c (c.id)}
              <button type="button" aria-pressed={curl === c.id} onclick={() => (curl = c.id)}
                >{c.label}</button
              >
            {/each}
          </div>
        </fieldset>
        <fieldset>
          <legend>Länge</legend>
          <div class="chips">
            {#each lengths as l (l.id)}
              <button
                type="button"
                aria-pressed={lashLength === l.id}
                onclick={() => (lashLength = l.id)}
                title={l.hint}>{l.label}</button
              >
            {/each}
          </div>
        </fieldset>
      </div>
    {:else}
      <div class="lift">
        <p>
          <strong>Lash Lifting</strong> formt deine eigenen Wimpern ab der Wurzel nach oben – wie eine
          Wimpernzange, nur für 6–8 Wochen. Mit Färben wirken auch helle Spitzen dunkel.
        </p>
        <ul>
          <li>Keine Extensions, kein Kleber, kein Auffüllen</li>
          <li>Ideal bei geraden oder nach unten wachsenden Wimpern</li>
          <li>Tipp: Kombiniere es mit einer Brow Lamination</li>
        </ul>
      </div>
    {/if}

    <div class="reco">
      <div>
        <span class="reco__label"
          >{mode === 'lift' ? 'Lash Lifting inkl. Färben' : `${tech.label} · Neuset`}</span
        >
        <span class="reco__price">CHF {mode === 'lift' ? price + 15 : price}.–</span>
        <span class="reco__meta"
          >ca. {minutes} Min. · {mode === 'lift'
            ? 'hält 6–8 Wochen'
            : `Auffüllen ${details[technique].refill}`}</span
        >
      </div>
      <a class="btn btn--small btn--accent" href={bookHref}>Diesen Look buchen</a>
    </div>
  </div>
</div>

<style>
  .lash-studio {
    display: grid;
    gap: clamp(1.5rem, 1rem + 2vw, 3rem);
    align-items: start;
  }

  @media (min-width: 980px) {
    .lash-studio {
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

  .modes {
    display: inline-flex;
    justify-self: start;
    padding: 4px;
    border-radius: var(--radius-pill);
    background: var(--blush-100);
  }

  .modes button {
    border: 0;
    background: none;
    padding: 0.5rem 1.1rem;
    border-radius: var(--radius-pill);
    font-weight: 500;
    color: var(--text-soft);
    transition:
      background-color 0.25s,
      color 0.25s;
  }

  .modes button[aria-pressed='true'] {
    background: var(--plum-900);
    color: var(--porcelain);
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

  .tabs {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.4rem;
  }

  .tabs button {
    display: grid;
    justify-items: center;
    gap: 0.35rem;
    padding: 0.65rem 0.3rem;
    border: 1px solid var(--line);
    border-radius: 14px;
    background: var(--white);
    font-size: 0.88rem;
    font-weight: 500;
    transition:
      border-color 0.2s,
      background-color 0.2s;
  }

  .tabs button[aria-pressed='true'] {
    border-color: var(--plum-900);
    background: var(--blush-50);
    box-shadow: 0 0 0 1px var(--plum-900);
  }

  .dots {
    display: flex;
    gap: 3px;
  }

  .dots i {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--blush-200);
  }

  .dots i.on {
    background: var(--berry-700);
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .chips button {
    padding: 0.45rem 0.9rem;
    border: 1px solid var(--line-strong);
    border-radius: var(--radius-pill);
    background: var(--white);
    font-size: 0.88rem;
    transition:
      background-color 0.2s,
      color 0.2s,
      border-color 0.2s;
  }

  .chips button[aria-pressed='true'] {
    background: var(--plum-900);
    border-color: var(--plum-900);
    color: var(--porcelain);
  }

  .effect {
    margin-top: 0.6rem;
    font-size: 0.92rem;
    color: var(--text-soft);
  }

  .row {
    display: grid;
    gap: 1.3rem;
  }

  @media (min-width: 560px) {
    .row {
      grid-template-columns: 1fr 1fr;
    }
  }

  .lift {
    display: grid;
    gap: 0.7rem;
    color: var(--text-soft);
  }

  .lift ul {
    margin: 0;
    padding-left: 1.1rem;
    display: grid;
    gap: 0.2rem;
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

  .reco__meta {
    font-size: 0.82rem;
    color: var(--text-muted);
  }

  @media (max-width: 520px) {
    .tabs {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
