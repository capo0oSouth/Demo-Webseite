<script lang="ts">
  import type { OptionGroup, Treatment } from '../../data/services';
  import { isChoiceAvailable, type Selection } from '../../lib/booking';
  import { lengthFactor, nailOutline, shapeParams } from '../../lib/visuals/nails';

  interface Props {
    group: OptionGroup;
    treatment: Treatment;
    selection: Selection;
    onchoose: (groupId: string, choiceId: string) => void;
  }

  let { group, treatment, selection, onchoose }: Props = $props();

  const name = $derived(`${treatment.id}-${group.id}`);

  const delta = (p?: number) => (p ? `+ ${p}.–` : 'inkl.');

  function shapeIcon(id: string) {
    const geo = nailOutline(26, 26, 20, shapeParams[id] ?? shapeParams.almond);
    return geo.outline;
  }

  function lengthIcon(id: string) {
    const shape = shapeParams[selection.shape ?? 'squoval'] ?? shapeParams.squoval;
    const free = 22 * (lengthFactor[id] ?? 0.5);
    return nailOutline(22, 24, free, shape).outline;
  }

  const colorLabel = $derived.by(() => {
    if (group.id !== 'color') return group.label;
    if (selection.finish === 'french') return 'Farbe der Spitze';
    if (selection.finish === 'babyboomer') return 'Farbe des Verlaufs';
    if (selection.finish === 'chrome') return 'Grundfarbe unter dem Chrome';
    if (selection.finish === 'cateye') return 'Grundfarbe des Cat Eye';
    return group.label;
  });

  const selectedChoice = $derived(group.choices.find((c) => c.id === selection[group.id]));
</script>

<fieldset class="group group--{group.kind}">
  <legend>
    <span class="legend__title">{colorLabel}</span>
    {#if group.kind === 'swatch' && selectedChoice}
      <span class="legend__value">{selectedChoice.label}</span>
    {/if}
  </legend>
  {#if group.help}<p class="help">{group.help}</p>{/if}

  <div class="choices">
    {#each group.choices as choice (choice.id)}
      {@const available = isChoiceAvailable(choice, selection)}
      {@const checked = selection[group.id] === choice.id}
      <label class="choice" class:is-checked={checked} class:is-limited={!available}>
        <input
          type="radio"
          {name}
          value={choice.id}
          {checked}
          onchange={() => onchoose(group.id, choice.id)}
        />
        {#if group.kind === 'shape'}
          <svg class="choice__icon" viewBox="-17 -52 34 56" aria-hidden="true">
            <path d={shapeIcon(choice.id)} />
          </svg>
          <span class="choice__label">{choice.label}</span>
          {#if !available}<span class="choice__meta">ab Länge Mittel</span>{/if}
        {:else if group.kind === 'length'}
          <svg class="choice__icon" viewBox="-16 -58 32 62" aria-hidden="true">
            <path d={lengthIcon(choice.id)} />
          </svg>
          <span class="choice__label">{choice.label}</span>
          <span class="choice__meta">{choice.hint}</span>
          <span class="choice__price">{delta(choice.price)}</span>
        {:else if group.kind === 'swatch'}
          <span
            class="swatch"
            class:swatch--none={choice.id === 'none'}
            style="--swatch: {choice.swatch}"
            aria-hidden="true"
          ></span>
          <span class="visually-hidden"
            >{choice.label}{choice.price ? `, Aufpreis ${choice.price} Franken` : ''}</span
          >
          <span class="swatch__name" aria-hidden="true">{choice.label}</span>
        {:else if group.kind === 'cards'}
          <span class="card__top">
            <span class="choice__label">{choice.label}</span>
            <span class="choice__price">{delta(choice.price)}</span>
          </span>
          {#if choice.hint}<span class="choice__hint">{choice.hint}</span>{/if}
        {:else}
          <span class="choice__label">{choice.label}</span>
          {#if choice.hint}<span class="choice__meta">{choice.hint}</span>{/if}
          {#if choice.price}<span class="choice__price">{delta(choice.price)}</span>{/if}
        {/if}
      </label>
    {/each}
  </div>
  {#if group.kind === 'shape' && selectedChoice?.hint}
    <p class="shape-hint">{selectedChoice.hint}</p>
  {/if}
  {#if group.kind === 'swatch' && selectedChoice?.price}
    <p class="shape-hint">Aufpreis {delta(selectedChoice.price)}</p>
  {/if}
</fieldset>

<style>
  .group {
    border: 0;
    margin: 0;
    padding: 0;
    min-width: 0;
  }

  legend {
    display: flex;
    gap: 0.6rem;
    align-items: baseline;
    padding: 0;
    margin-bottom: 0.35rem;
    font-family: var(--font-display);
    font-size: 1.25rem;
    font-weight: 400;
  }

  .legend__value {
    font-family: var(--font-body);
    font-size: 0.9rem;
    color: var(--berry-700);
  }

  .help {
    font-size: 0.9rem;
    color: var(--text-muted);
    margin-bottom: 0.8rem;
  }

  .choices {
    display: grid;
    gap: 0.6rem;
    margin-top: 0.7rem;
  }

  .choice {
    position: relative;
    display: grid;
    cursor: pointer;
    border: 1px solid var(--line);
    background: var(--white);
    border-radius: 16px;
    transition:
      border-color 0.25s,
      box-shadow 0.3s,
      transform 0.3s var(--ease-out),
      background-color 0.25s;
    -webkit-tap-highlight-color: transparent;
  }

  .choice:hover {
    border-color: var(--rose-400);
    transform: translateY(-1px);
  }

  .choice input {
    position: absolute;
    opacity: 0;
    width: 1px;
    height: 1px;
    pointer-events: none;
  }

  .choice:has(input:focus-visible) {
    outline: 2px solid var(--focus);
    outline-offset: 2px;
  }

  .choice.is-checked {
    border-color: var(--plum-900);
    background: var(--blush-50);
    box-shadow:
      0 0 0 1px var(--plum-900),
      0 12px 24px -18px rgba(51, 24, 42, 0.6);
  }

  .choice__label {
    font-weight: 500;
    font-size: 0.95rem;
    color: var(--plum-900);
  }

  .choice__meta {
    font-size: 0.78rem;
    color: var(--text-muted);
    line-height: 1.3;
  }

  .choice__price {
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--berry-700);
    white-space: nowrap;
  }

  .choice__hint {
    font-size: 0.85rem;
    line-height: 1.45;
    color: var(--text-soft);
  }

  .choice__icon {
    width: 100%;
    height: 3.3rem;
    fill: var(--blush-200);
    stroke: var(--rose-500);
    stroke-width: 1;
    transition: fill 0.25s;
  }

  .is-checked .choice__icon {
    fill: var(--rose-400);
    stroke: var(--berry-700);
  }

  .is-limited .choice__icon {
    opacity: 0.55;
  }

  /* Formen */
  .group--shape .choices {
    grid-template-columns: repeat(auto-fill, minmax(84px, 1fr));
  }

  .group--shape .choice {
    padding: 0.8rem 0.4rem 0.7rem;
    justify-items: center;
    text-align: center;
    gap: 0.35rem;
  }

  .shape-hint {
    margin-top: 0.7rem;
    font-size: 0.88rem;
    color: var(--text-soft);
  }

  /* Längen */
  .group--length .choices {
    grid-template-columns: repeat(auto-fit, minmax(118px, 1fr));
  }

  .group--length .choice {
    padding: 0.8rem 0.6rem;
    justify-items: center;
    text-align: center;
    gap: 0.25rem;
  }

  .group--length .choice__icon {
    height: 3.6rem;
  }

  /* Farbfelder */
  .group--swatch .choices {
    grid-template-columns: repeat(auto-fill, minmax(64px, 1fr));
    gap: 0.4rem;
  }

  .group--swatch .choice {
    border: 0;
    background: transparent;
    padding: 0.35rem 0.1rem;
    justify-items: center;
    gap: 0.35rem;
    box-shadow: none;
  }

  .group--swatch .choice.is-checked {
    background: transparent;
    box-shadow: none;
  }

  .swatch {
    width: 2.6rem;
    height: 2.6rem;
    border-radius: 50%;
    background:
      radial-gradient(circle at 32% 28%, rgba(255, 255, 255, 0.7), transparent 38%), var(--swatch);
    box-shadow:
      inset 0 0 0 1px rgba(51, 24, 42, 0.12),
      0 4px 10px -6px rgba(51, 24, 42, 0.5);
    transition:
      box-shadow 0.25s,
      transform 0.3s var(--ease-out);
  }

  .swatch--none {
    background:
      linear-gradient(
        135deg,
        transparent 46%,
        var(--rose-400) 47%,
        var(--rose-400) 53%,
        transparent 54%
      ),
      var(--white);
  }

  .is-checked .swatch {
    transform: scale(1.06);
    box-shadow:
      0 0 0 3px var(--porcelain),
      0 0 0 4.5px var(--plum-900);
  }

  .swatch__name {
    font-size: 0.72rem;
    line-height: 1.2;
    text-align: center;
    color: var(--text-soft);
  }

  .is-checked .swatch__name {
    color: var(--plum-900);
    font-weight: 500;
  }

  /* Karten */
  .group--cards .choices {
    grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  }

  .group--cards .choice {
    padding: 0.9rem 1rem;
    gap: 0.3rem;
    align-content: start;
  }

  .card__top {
    display: flex;
    justify-content: space-between;
    gap: 0.6rem;
    align-items: baseline;
  }

  /* Chips */
  .group--chips .choices {
    grid-template-columns: repeat(auto-fit, minmax(128px, 1fr));
  }

  .group--chips .choice {
    padding: 0.7rem 0.9rem;
    gap: 0.1rem;
    text-align: center;
    justify-items: center;
  }

  @media (max-width: 520px) {
    .group--cards .choices {
      grid-template-columns: 1fr;
    }

    .group--length .choices {
      grid-template-columns: repeat(2, 1fr);
    }

    .group--chips .choices {
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    }
  }
</style>
