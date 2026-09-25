<script lang="ts">
  import { Tween } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import TreatmentVisual from '../visuals/TreatmentVisual.svelte';
  import { staffById } from '../../data/team';
  import { formatDuration } from '../../lib/booking';
  import { formatDateShort, fromISO, minutesToTime } from '../../lib/availability';
  import type { BookingState } from './state.svelte';

  interface Props {
    booking: BookingState;
    showVisual?: boolean;
    large?: boolean;
    ongoto?: (step: number) => void;
  }

  let { booking, showVisual = true, large = false, ongoto }: Props = $props();

  const total = new Tween(0, { duration: 550, easing: cubicOut });
  $effect(() => {
    total.target = booking.price?.total ?? 0;
  });

  const t = $derived(booking.treatment);
  const extraLines = $derived(booking.price?.lines.filter((l) => l.price > 0) ?? []);
  const inclLines = $derived(booking.price?.lines.filter((l) => !l.price) ?? []);

  const timeRange = $derived.by(() => {
    if (!booking.time || !booking.price) return null;
    const [h, m] = booking.time.split(':').map(Number);
    return `${booking.time} – ${minutesToTime(h * 60 + m + booking.price.minutes)} Uhr`;
  });

  const artist = $derived(
    booking.assignedStaff
      ? staffById[booking.assignedStaff].firstName
      : booking.staff !== 'any'
        ? staffById[booking.staff].firstName
        : 'Erste freie Artist',
  );
</script>

<div class="summary" class:summary--large={large}>
  <p class="summary__eyebrow">Deine Auswahl</p>

  {#if t}
    {#if showVisual}
      <div class="summary__visual">
        <TreatmentVisual
          treatment={t}
          selection={booking.selection}
          compare={large}
          caption={large}
          compact={!large}
        />
      </div>
    {/if}

    <div class="summary__treatment">
      <span class="chip">{booking.categoryInfo?.name}</span>
      <h3>{t.name}</h3>
      {#if ongoto}
        <button type="button" class="edit" onclick={() => ongoto(2)}>Ändern</button>
      {/if}
    </div>

    <dl class="lines">
      <div class="line line--base">
        <dt>Grundpreis</dt>
        <dd>CHF {t.price}.–</dd>
      </div>
      {#each inclLines as l (l.label)}
        <div class="line">
          <dt>{l.label}</dt>
          <dd><span>{l.value}</span></dd>
        </div>
      {/each}
      {#each extraLines as l (l.label)}
        <div class="line line--extra">
          <dt>{l.label}: {l.value}</dt>
          <dd>+ {l.price}.–</dd>
        </div>
      {/each}
      {#each booking.price?.addons ?? [] as a (a.id)}
        <div class="line line--extra">
          <dt>{a.label}</dt>
          <dd>+ {a.price}.–</dd>
        </div>
      {/each}
    </dl>

    <dl class="meta">
      <div>
        <dt>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            aria-hidden="true"><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg
          >
          Dauer
        </dt>
        <dd>ca. {formatDuration(booking.price?.minutes ?? t.minutes)}</dd>
      </div>
      {#if booking.step >= 3}
        <div>
          <dt>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              aria-hidden="true"
              ><circle cx="12" cy="8.5" r="3.8" /><path d="M4.5 20a7.5 7.5 0 0 1 15 0" /></svg
            >
            Artist
          </dt>
          <dd>{artist}</dd>
        </div>
      {/if}
      {#if booking.date && booking.step >= 4}
        <div>
          <dt>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              aria-hidden="true"
              ><rect x="3.5" y="5" width="17" height="15.5" rx="3" /><path
                d="M3.5 10h17M8 3v4M16 3v4"
              /></svg
            >
            Termin
          </dt>
          <dd>
            {formatDateShort(fromISO(booking.date))}{timeRange
              ? `, ${timeRange}`
              : ' – Uhrzeit wählen'}
          </dd>
        </div>
      {/if}
    </dl>

    <div class="total">
      <span>Total</span>
      <strong aria-live="polite" aria-atomic="true">
        <span class="visually-hidden">Aktueller Preis: </span>CHF {Math.round(total.current)}.–
      </strong>
    </div>
    <p class="pay">Bezahlung nach der Behandlung im Studio · Karte, TWINT oder bar</p>
  {:else}
    <div class="summary__empty">
      <p>
        Wähle eine Kategorie und Behandlung – hier siehst du laufend Vorschau, Optionen und Preis.
      </p>
    </div>
  {/if}
</div>

<style>
  .summary {
    display: grid;
    gap: 1rem;
  }

  .summary__eyebrow {
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--gold-600);
  }

  .summary__visual :global(.stage) {
    box-shadow: var(--shadow-s);
  }

  .summary__treatment {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0.4rem 0.8rem;
    align-items: start;
  }

  .summary__treatment .chip {
    grid-column: 1 / -1;
    justify-self: start;
  }

  .summary__treatment h3 {
    font-size: 1.35rem;
    line-height: 1.15;
  }

  .edit {
    border: 0;
    background: none;
    padding: 0.2rem 0;
    font-size: 0.82rem;
    color: var(--berry-700);
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .lines,
  .meta {
    margin: 0;
    display: grid;
    gap: 0.4rem;
  }

  .line {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    font-size: 0.88rem;
    color: var(--text-soft);
  }

  .line dd {
    margin: 0;
    text-align: right;
    white-space: nowrap;
  }

  .line dd span {
    color: var(--plum-900);
    white-space: normal;
  }

  .line--base {
    color: var(--plum-900);
    font-weight: 500;
  }

  .line--extra dd {
    color: var(--berry-700);
    font-weight: 500;
  }

  .meta {
    padding-top: 0.8rem;
    border-top: 1px solid var(--line);
    gap: 0.55rem;
  }

  .meta div {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    font-size: 0.88rem;
  }

  .meta dt {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    color: var(--text-muted);
  }

  .meta dt svg {
    width: 1rem;
    color: var(--gold-600);
  }

  .meta dd {
    margin: 0;
    text-align: right;
    font-weight: 500;
  }

  .total {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding-top: 0.9rem;
    border-top: 1px solid var(--line-strong);
  }

  .total span {
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }

  .total strong {
    font-family: var(--font-display);
    font-size: 2rem;
    font-weight: 400;
    font-variant-numeric: tabular-nums;
  }

  .pay {
    font-size: 0.78rem;
    color: var(--text-muted);
  }

  .summary__empty {
    padding: 1.4rem;
    border: 1px dashed var(--line-strong);
    border-radius: var(--radius-m);
    color: var(--text-muted);
    font-size: 0.92rem;
  }
</style>
