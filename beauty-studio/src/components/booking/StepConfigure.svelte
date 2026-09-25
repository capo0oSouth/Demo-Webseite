<script lang="ts">
  import OptionGroup from './OptionGroup.svelte';
  import TreatmentVisual from '../visuals/TreatmentVisual.svelte';
  import { visibleGroups, formatDuration } from '../../lib/booking';
  import type { BookingState } from './state.svelte';

  interface Props {
    booking: BookingState;
    showVisual: boolean;
  }

  let { booking, showVisual }: Props = $props();

  const t = $derived(booking.treatment!);
  const groups = $derived(t ? visibleGroups(t, booking.selection) : []);

  let noticeTimer: ReturnType<typeof setTimeout> | undefined;
  $effect(() => {
    if (booking.notice) {
      clearTimeout(noticeTimer);
      noticeTimer = setTimeout(() => (booking.notice = null), 7000);
    }
    return () => clearTimeout(noticeTimer);
  });
</script>

{#if t}
  {#if showVisual}
    <div class="mobile-visual">
      <TreatmentVisual treatment={t} selection={booking.selection} />
      <div class="mobile-visual__price" aria-hidden="true">
        <span>{booking.price ? `CHF ${booking.price.total}.–` : ''}</span>
        <span>{booking.price ? formatDuration(booking.price.minutes) : ''}</span>
      </div>
    </div>
  {/if}

  <div class="notice-slot" aria-live="polite">
    {#if booking.notice}
      <p class="notice">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          aria-hidden="true"><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5M12 7.8v.2" /></svg
        >
        {booking.notice}
      </p>
    {/if}
  </div>

  {#if groups.length === 0}
    <p class="empty">
      Bei dieser Behandlung gibt es nichts zu konfigurieren – wir kümmern uns um alles. Auf Wunsch
      kannst du unten noch Extras hinzufügen.
    </p>
  {/if}

  <div class="groups">
    {#each groups as group (group.id)}
      <OptionGroup
        {group}
        treatment={t}
        selection={booking.selection}
        onchoose={(g, c) => booking.choose(g, c)}
      />
    {/each}
  </div>

  {#if t.addons.length}
    <fieldset class="addons">
      <legend>Extras <span>optional</span></legend>
      <div class="addons__list">
        {#each t.addons as addon (addon.id)}
          {@const on = booking.addons.includes(addon.id)}
          <label class="addon" class:is-on={on}>
            <input type="checkbox" checked={on} onchange={() => booking.toggleAddon(addon.id)} />
            <span class="addon__check" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg
              >
            </span>
            <span class="addon__body">
              <span class="addon__label">{addon.label}</span>
              <span class="addon__hint">{addon.hint}</span>
            </span>
            <span class="addon__price">+ {addon.price}.–<small>+{addon.minutes} Min.</small></span>
          </label>
        {/each}
      </div>
    </fieldset>
  {/if}

  {#if t.note}
    <p class="note">{t.note}</p>
  {/if}
{/if}

<style>
  .mobile-visual {
    position: sticky;
    top: calc(var(--header-h) + 0.5rem);
    z-index: 5;
    margin-bottom: 1.2rem;
    border-radius: var(--radius-l);
    box-shadow: var(--shadow-m);
    background: var(--white);
  }

  .mobile-visual__price {
    position: absolute;
    top: 0.85rem;
    right: 0.85rem;
    display: grid;
    justify-items: end;
    padding: 0.35rem 0.8rem;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.88);
    backdrop-filter: blur(8px);
    line-height: 1.25;
    box-shadow: var(--shadow-s);
  }

  .mobile-visual__price span:first-child {
    font-family: var(--font-display);
    font-size: 1.1rem;
  }

  .mobile-visual__price span:last-child {
    font-size: 0.72rem;
    color: var(--text-muted);
  }

  @media (max-width: 759px) {
    .mobile-visual :global(figcaption) {
      display: none;
    }

    .mobile-visual {
      margin-inline: calc(var(--gutter) * -0.4);
    }
  }

  .notice-slot:empty {
    display: none;
  }

  .notice {
    display: flex;
    gap: 0.6rem;
    align-items: flex-start;
    margin-bottom: 1.2rem;
    padding: 0.8rem 1rem;
    border-radius: 14px;
    background: var(--gold-200);
    color: #5d4520;
    font-size: 0.9rem;
    animation: pop 0.4s var(--ease-out);
  }

  .notice svg {
    width: 1.2rem;
    flex: none;
    margin-top: 0.1rem;
  }

  @keyframes pop {
    from {
      opacity: 0;
      transform: translateY(-6px);
    }
  }

  .groups {
    display: grid;
    gap: 2.2rem;
  }

  .empty {
    padding: 1.2rem 1.4rem;
    border-radius: var(--radius-m);
    background: var(--blush-50);
    color: var(--text-soft);
  }

  .addons {
    margin: 2.4rem 0 0;
    padding: 0;
    border: 0;
    min-width: 0;
  }

  .addons legend {
    padding: 0;
    font-family: var(--font-display);
    font-size: 1.25rem;
    margin-bottom: 0.8rem;
  }

  .addons legend span {
    font-family: var(--font-body);
    font-size: 0.8rem;
    color: var(--text-muted);
    margin-left: 0.4rem;
  }

  .addons__list {
    display: grid;
    gap: 0.6rem;
  }

  .addon {
    position: relative;
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 0.9rem;
    align-items: center;
    padding: 0.85rem 1rem;
    border: 1px solid var(--line);
    border-radius: 16px;
    background: var(--white);
    cursor: pointer;
    transition:
      border-color 0.25s,
      background-color 0.25s;
  }

  .addon:hover {
    border-color: var(--rose-400);
  }

  .addon input {
    position: absolute;
    opacity: 0;
    width: 1px;
    height: 1px;
  }

  .addon:has(input:focus-visible) {
    outline: 2px solid var(--focus);
    outline-offset: 2px;
  }

  .addon.is-on {
    border-color: var(--plum-900);
    background: var(--blush-50);
  }

  .addon__check {
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 7px;
    border: 1.5px solid var(--line-strong);
    display: grid;
    place-items: center;
    color: transparent;
    transition:
      background-color 0.2s,
      color 0.2s,
      border-color 0.2s;
  }

  .addon__check svg {
    width: 1rem;
  }

  .is-on .addon__check {
    background: var(--plum-900);
    border-color: var(--plum-900);
    color: var(--porcelain);
  }

  .addon__body {
    display: grid;
    gap: 0.1rem;
  }

  .addon__label {
    font-weight: 500;
  }

  .addon__hint {
    font-size: 0.84rem;
    color: var(--text-muted);
    line-height: 1.4;
  }

  .addon__price {
    display: grid;
    justify-items: end;
    font-weight: 500;
    color: var(--berry-700);
    white-space: nowrap;
  }

  .addon__price small {
    font-size: 0.72rem;
    font-weight: 400;
    color: var(--text-muted);
  }

  .note {
    margin-top: 1.6rem;
    padding: 0.9rem 1.1rem;
    border-left: 2px solid var(--gold-400);
    background: var(--cream);
    border-radius: 0 12px 12px 0;
    font-size: 0.92rem;
    color: var(--text-soft);
  }
</style>
