<script lang="ts">
  import { staffById } from '../../data/team';
  import {
    BOOKING_WINDOW_DAYS,
    dayStatus,
    formatDateLong,
    fromISO,
    holidayName,
    minutesToTime,
    slotsFor,
    toISO,
    type Slot,
  } from '../../lib/availability';
  import type { BookingState } from './state.svelte';

  interface Props {
    booking: BookingState;
  }

  let { booking }: Props = $props();

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastDay = new Date(today);
  lastDay.setDate(lastDay.getDate() + BOOKING_WINDOW_DAYS);

  const duration = $derived(booking.price?.minutes ?? 60);
  const pool = $derived(booking.staffPool);

  let view = $state(
    (() => {
      const d = booking.date ? fromISO(booking.date) : today;
      return { y: d.getFullYear(), m: d.getMonth() };
    })(),
  );

  const monthLabel = $derived(
    new Date(view.y, view.m, 1).toLocaleDateString('de-CH', { month: 'long', year: 'numeric' }),
  );
  const canPrev = $derived(view.y > today.getFullYear() || view.m > today.getMonth());
  const canNext = $derived(new Date(view.y, view.m + 1, 1) <= lastDay);

  const days = $derived.by(() => {
    const first = new Date(view.y, view.m, 1);
    const offset = (first.getDay() + 6) % 7;
    const count = new Date(view.y, view.m + 1, 0).getDate();
    const cells: ({ date: Date; iso: string; status: string; count: number } | null)[] = [];
    for (let i = 0; i < offset; i++) cells.push(null);
    for (let d = 1; d <= count; d++) {
      const date = new Date(view.y, view.m, d);
      const s = dayStatus(pool, date, duration, now);
      cells.push({ date, iso: toISO(date), status: s.status, count: s.count });
    }
    return cells;
  });

  const nextFree = $derived.by(() => {
    const d = new Date(today);
    for (let i = 0; i <= BOOKING_WINDOW_DAYS; i++) {
      const slots = slotsFor(pool, d, duration, now);
      if (slots.length) return { iso: toISO(d), slot: slots[0], date: new Date(d) };
      d.setDate(d.getDate() + 1);
    }
    return null;
  });

  // Beim ersten Öffnen direkt den nächsten Tag mit freien Terminen zeigen
  $effect(() => {
    if (!booking.date && nextFree) {
      booking.date = nextFree.iso;
      view = { y: nextFree.date.getFullYear(), m: nextFree.date.getMonth() };
    }
  });

  const slots = $derived(booking.date ? slotsFor(pool, fromISO(booking.date), duration, now) : []);
  const groups = $derived([
    { label: 'Vormittag', items: slots.filter((s) => s.minutes < 12 * 60) },
    {
      label: 'Nachmittag',
      items: slots.filter((s) => s.minutes >= 12 * 60 && s.minutes < 17 * 60),
    },
    { label: 'Abend', items: slots.filter((s) => s.minutes >= 17 * 60) },
  ]);

  function pickDay(iso: string) {
    if (booking.date !== iso) {
      booking.date = iso;
      booking.time = null;
      booking.assignedStaff = null;
    }
  }

  function pickSlot(slot: Slot) {
    booking.time = slot.time;
    const preferred = booking.treatment?.staff.find((id) => slot.staff.includes(id));
    booking.assignedStaff = preferred ?? slot.staff[0];
  }

  function takeNextFree() {
    if (!nextFree) return;
    booking.date = nextFree.iso;
    view = { y: nextFree.date.getFullYear(), m: nextFree.date.getMonth() };
    pickSlot(nextFree.slot);
  }

  function shift(delta: number) {
    const d = new Date(view.y, view.m + delta, 1);
    view = { y: d.getFullYear(), m: d.getMonth() };
  }

  const statusText: Record<string, string> = {
    available: 'freie Termine',
    few: 'nur noch wenige Termine',
    full: 'ausgebucht',
    closed: 'geschlossen',
    holiday: 'Feiertag',
    past: 'vergangen',
    off: 'nicht buchbar',
  };

  function dayLabel(c: { date: Date; status: string; count: number }) {
    const base = c.date.toLocaleDateString('de-CH', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    if (c.status === 'holiday') return `${base}, ${holidayName(c.date)} – geschlossen`;
    if (c.status === 'available' || c.status === 'few') return `${base}, ${c.count} freie Termine`;
    return `${base}, ${statusText[c.status]}`;
  }

  const endTime = (start: number) => minutesToTime(start + duration);
</script>

{#if nextFree}
  <button type="button" class="quick" onclick={takeNextFree}>
    <span class="quick__icon" aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        ><path
          d="M12 2.8c.7 4.6 2.1 6 6.7 6.7-4.6.7-6 2.1-6.7 6.7-.7-4.6-2.1-6-6.7-6.7 4.6-.7 6-2.1 6.7-6.7Z"
        /></svg
      >
    </span>
    <span>
      <span class="quick__label">Nächster freier Termin</span>
      <span class="quick__value">
        {nextFree.date.toLocaleDateString('de-CH', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })}, {nextFree.slot.time} Uhr
      </span>
    </span>
    <span class="quick__cta">Übernehmen</span>
  </button>
{/if}

<div class="date-layout">
  <div class="calendar">
    <div class="calendar__head">
      <button
        type="button"
        class="nav"
        onclick={() => shift(-1)}
        disabled={!canPrev}
        aria-label="Vorheriger Monat"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"><path d="m15 6-6 6 6 6" /></svg
        >
      </button>
      <h3 aria-live="polite">{monthLabel}</h3>
      <button
        type="button"
        class="nav"
        onclick={() => shift(1)}
        disabled={!canNext}
        aria-label="Nächster Monat"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"><path d="m9 6 6 6-6 6" /></svg
        >
      </button>
    </div>
    <div class="grid" role="group" aria-label="Kalender {monthLabel}">
      <div class="row weekdays" aria-hidden="true">
        {#each ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'] as wd (wd)}
          <span>{wd}</span>
        {/each}
      </div>
      <div class="days">
        {#each days as c, i (c ? c.iso : `e${i}`)}
          {#if c}
            {@const bookable = c.status === 'available' || c.status === 'few'}
            <span>
              <button
                type="button"
                class="day day--{c.status}"
                class:is-selected={booking.date === c.iso}
                class:is-today={c.iso === toISO(today)}
                disabled={!bookable}
                aria-pressed={booking.date === c.iso}
                aria-label={dayLabel(c)}
                onclick={() => pickDay(c.iso)}
              >
                <span>{c.date.getDate()}</span>
                {#if bookable}<i aria-hidden="true"></i>{/if}
              </button>
            </span>
          {:else}
            <span class="blank"></span>
          {/if}
        {/each}
      </div>
    </div>
    <ul class="legend">
      <li><i class="dot dot--available"></i>freie Termine</li>
      <li><i class="dot dot--few"></i>nur noch wenige</li>
      <li><i class="dot dot--full"></i>ausgebucht / geschlossen</li>
    </ul>
  </div>

  <div class="slots">
    {#if booking.date}
      <h3 class="slots__title">{formatDateLong(fromISO(booking.date))}</h3>
      <p class="slots__sub">
        Dauer ca. {duration} Min. · {booking.staff === 'any'
          ? 'alle Artists'
          : `mit ${staffById[booking.staff].firstName}`}
      </p>
      {#if slots.length === 0}
        <p class="empty">
          An diesem Tag ist leider alles ausgebucht. Wähle bitte einen anderen Tag.
        </p>
      {:else}
        <div class="slot-groups" role="radiogroup" aria-label="Uhrzeit wählen">
          {#each groups as g (g.label)}
            {#if g.items.length}
              <div class="slot-group">
                <h4>{g.label}</h4>
                <div class="slot-list">
                  {#each g.items as s (s.time)}
                    <button
                      type="button"
                      role="radio"
                      aria-checked={booking.time === s.time}
                      class="slot"
                      class:is-selected={booking.time === s.time}
                      onclick={() => pickSlot(s)}
                    >
                      {s.time}
                    </button>
                  {/each}
                </div>
              </div>
            {/if}
          {/each}
        </div>
      {/if}
      {#if booking.time && booking.assignedStaff}
        <p class="chosen" aria-live="polite">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg
          >
          <span>
            <strong
              >{booking.time} – {endTime(slots.find((s) => s.time === booking.time)?.minutes ?? 0)} Uhr</strong
            >
            mit {staffById[booking.assignedStaff].firstName}
          </span>
        </p>
      {/if}
    {:else}
      <p class="empty">Wähle links einen Tag, um die freien Uhrzeiten zu sehen.</p>
    {/if}
  </div>
</div>

<style>
  .quick {
    width: 100%;
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 1rem;
    align-items: center;
    text-align: left;
    margin-bottom: 1.4rem;
    padding: 0.9rem 1.1rem;
    border: 1px dashed var(--gold-400);
    border-radius: var(--radius-m);
    background: linear-gradient(120deg, #fffaf1, var(--white));
    transition:
      border-color 0.25s,
      box-shadow 0.3s;
  }

  .quick:hover {
    border-style: solid;
    box-shadow: var(--shadow-s);
  }

  .quick__icon {
    width: 2.4rem;
    height: 2.4rem;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: var(--gold-200);
    color: var(--gold-600);
  }

  .quick__icon svg {
    width: 1.3rem;
  }

  .quick__label {
    display: block;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--gold-600);
  }

  .quick__value {
    display: block;
    font-weight: 500;
  }

  .quick__cta {
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--berry-700);
  }

  .date-layout {
    display: grid;
    gap: 1.6rem;
  }

  .calendar {
    padding: 1.2rem;
    border: 1px solid var(--line);
    border-radius: var(--radius-m);
    background: var(--white);
  }

  .calendar__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.8rem;
  }

  .calendar__head h3 {
    font-size: 1.3rem;
    text-transform: capitalize;
  }

  .nav {
    width: 2.5rem;
    height: 2.5rem;
    display: grid;
    place-items: center;
    border-radius: 50%;
    border: 1px solid var(--line);
    background: var(--white);
  }

  .nav svg {
    width: 1.1rem;
  }

  .nav:disabled {
    opacity: 0.3;
    cursor: default;
  }

  .nav:not(:disabled):hover {
    border-color: var(--plum-900);
  }

  .row,
  .days {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0.25rem;
  }

  .weekdays span {
    text-align: center;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    color: var(--text-muted);
    padding-bottom: 0.4rem;
  }

  .day {
    position: relative;
    width: 100%;
    aspect-ratio: 1;
    max-height: 3.2rem;
    display: grid;
    place-items: center;
    border: 0;
    border-radius: 12px;
    background: transparent;
    font-size: 0.95rem;
    font-variant-numeric: tabular-nums;
    transition:
      background-color 0.2s,
      color 0.2s;
  }

  .day i {
    position: absolute;
    bottom: 18%;
    left: 50%;
    width: 5px;
    height: 5px;
    translate: -50% 0;
    border-radius: 50%;
    background: var(--success);
  }

  .day--few i {
    background: var(--gold-500);
  }

  .day:not(:disabled):hover {
    background: var(--blush-100);
  }

  .day:disabled {
    color: rgba(51, 24, 42, 0.28);
    cursor: default;
  }

  .day--full:disabled span {
    text-decoration: line-through;
  }

  .day.is-today span {
    font-weight: 600;
    text-decoration: underline;
    text-decoration-color: var(--gold-500);
    text-underline-offset: 4px;
  }

  .day.is-selected {
    background: var(--plum-900);
    color: var(--porcelain);
  }

  .day.is-selected i {
    background: var(--gold-300);
  }

  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem 1rem;
    list-style: none;
    margin: 0.9rem 0 0;
    padding: 0.8rem 0 0;
    border-top: 1px solid var(--line);
    font-size: 0.78rem;
    color: var(--text-muted);
  }

  .legend li {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
  }

  .dot--available {
    background: var(--success);
  }

  .dot--few {
    background: var(--gold-500);
  }

  .dot--full {
    background: rgba(51, 24, 42, 0.2);
  }

  .slots__title {
    font-size: 1.35rem;
  }

  .slots__sub {
    font-size: 0.88rem;
    color: var(--text-muted);
    margin: 0.2rem 0 1rem;
  }

  .slot-groups {
    display: grid;
    gap: 1rem;
  }

  .slot-group h4 {
    font-family: var(--font-body);
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--gold-600);
    margin-bottom: 0.5rem;
  }

  .slot-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(78px, 1fr));
    gap: 0.45rem;
  }

  .slot {
    padding: 0.6rem 0.3rem;
    border: 1px solid var(--line);
    border-radius: 12px;
    background: var(--white);
    font-variant-numeric: tabular-nums;
    font-weight: 500;
    transition:
      border-color 0.2s,
      background-color 0.2s,
      color 0.2s,
      transform 0.25s var(--ease-out);
  }

  .slot:hover {
    border-color: var(--plum-900);
    transform: translateY(-1px);
  }

  .slot.is-selected {
    background: var(--plum-900);
    border-color: var(--plum-900);
    color: var(--porcelain);
  }

  .chosen {
    display: flex;
    gap: 0.6rem;
    align-items: center;
    margin-top: 1.2rem;
    padding: 0.8rem 1rem;
    border-radius: 14px;
    background: #eaf3ee;
    color: #2c5a43;
  }

  .chosen svg {
    width: 1.2rem;
    flex: none;
  }

  .empty {
    padding: 1rem 1.2rem;
    border-radius: 14px;
    background: var(--blush-50);
    color: var(--text-soft);
  }

  @media (min-width: 1280px) {
    .date-layout {
      grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
      align-items: start;
    }
  }

  @media (max-width: 520px) {
    .calendar {
      padding: 0.9rem 0.6rem;
    }

    .quick {
      grid-template-columns: auto 1fr;
    }

    .quick__cta {
      grid-column: 2;
    }
  }
</style>
