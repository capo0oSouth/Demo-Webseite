<script lang="ts">
  import { staffById, type StaffId } from '../../data/team';
  import type { BookingState } from './state.svelte';

  interface Props {
    booking: BookingState;
    photos: Partial<Record<StaffId, string>>;
  }

  let { booking, photos }: Props = $props();

  const dayNames = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  const capable = $derived(booking.treatment?.staff ?? []);
  const single = $derived(capable.length === 1);

  $effect(() => {
    if (single && booking.staff !== capable[0]) booking.chooseStaff(capable[0]);
  });
</script>

{#if single}
  <p class="intro">
    {booking.treatment?.name} bietet bei uns <strong>{staffById[capable[0]].firstName}</strong> an – sie
    ist auf diese Behandlung spezialisiert.
  </p>
{/if}

<div class="staff" role="radiogroup" aria-label="Artist wählen">
  {#if !single}
    <label class="person person--any" class:is-checked={booking.staff === 'any'}>
      <input
        type="radio"
        name="staff"
        value="any"
        checked={booking.staff === 'any'}
        onchange={() => booking.chooseStaff('any')}
      />
      <span class="avatar avatar--any" aria-hidden="true">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.4"
          stroke-linecap="round"
          ><path
            d="M12 2.8c.7 4.6 2.1 6 6.7 6.7-4.6.7-6 2.1-6.7 6.7-.7-4.6-2.1-6-6.7-6.7 4.6-.7 6-2.1 6.7-6.7Z"
          /></svg
        >
      </span>
      <span class="person__body">
        <span class="person__name">Keine Präferenz</span>
        <span class="person__role">Erste freie Artist · die meisten Termine</span>
        <span class="person__text"
          >Wir teilen dir die Expertin zu, die zu deinem Wunschtermin frei ist. Alle arbeiten nach
          denselben Standards.</span
        >
      </span>
      <span class="radio" aria-hidden="true"></span>
    </label>
  {/if}

  {#each capable as id (id)}
    {@const m = staffById[id]}
    <label class="person" class:is-checked={booking.staff === id}>
      <input
        type="radio"
        name="staff"
        value={id}
        checked={booking.staff === id}
        onchange={() => booking.chooseStaff(id)}
      />
      <span class="avatar" aria-hidden="true">
        {#if photos[id]}
          <img src={photos[id]} alt="" loading="lazy" />
        {:else}
          <span>{m.firstName[0]}</span>
        {/if}
      </span>
      <span class="person__body">
        <span class="person__name">{m.name}</span>
        <span class="person__role">{m.role}</span>
        <span class="person__tags">
          {#each m.specialties.slice(0, 3) as s (s)}<span class="chip">{s}</span>{/each}
        </span>
        <span class="person__days">Im Studio: {m.workdays.map((d) => dayNames[d]).join(' · ')}</span
        >
      </span>
      <span class="radio" aria-hidden="true"></span>
    </label>
  {/each}
</div>

<style>
  .intro {
    margin-bottom: 1.2rem;
    padding: 0.9rem 1.1rem;
    border-radius: 14px;
    background: var(--blush-50);
    color: var(--text-soft);
  }

  .staff {
    display: grid;
    gap: 0.8rem;
  }

  .person {
    position: relative;
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 1.1rem;
    align-items: center;
    padding: 1.1rem 1.2rem;
    border: 1px solid var(--line);
    border-radius: var(--radius-m);
    background: var(--white);
    cursor: pointer;
    transition:
      border-color 0.25s,
      box-shadow 0.3s,
      background-color 0.25s;
  }

  .person:hover {
    border-color: var(--rose-400);
  }

  .person input {
    position: absolute;
    opacity: 0;
    width: 1px;
    height: 1px;
  }

  .person:has(input:focus-visible) {
    outline: 2px solid var(--focus);
    outline-offset: 2px;
  }

  .person.is-checked {
    border-color: var(--plum-900);
    background: var(--blush-50);
    box-shadow: 0 0 0 1px var(--plum-900);
  }

  .avatar {
    width: 4.6rem;
    height: 4.6rem;
    border-radius: 50%;
    overflow: hidden;
    display: grid;
    place-items: center;
    background: linear-gradient(145deg, var(--blush-100), var(--blush-200));
    box-shadow:
      0 0 0 3px var(--white),
      0 0 0 4px var(--gold-300);
    font-family: var(--font-display);
    font-size: 1.8rem;
    font-style: italic;
    color: var(--berry-700);
  }

  .avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .avatar--any {
    background: var(--plum-900);
    color: var(--gold-300);
  }

  .avatar--any svg {
    width: 1.9rem;
  }

  .person__body {
    display: grid;
    gap: 0.25rem;
  }

  .person__name {
    font-family: var(--font-display);
    font-size: 1.3rem;
    line-height: 1.1;
  }

  .person__role {
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--berry-700);
  }

  .person__text,
  .person__days {
    font-size: 0.85rem;
    color: var(--text-muted);
  }

  .person__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    margin-block: 0.2rem;
  }

  .person__tags :global(.chip) {
    font-size: 0.72rem;
    padding: 0.15rem 0.6rem;
  }

  .radio {
    width: 1.35rem;
    height: 1.35rem;
    border-radius: 50%;
    border: 1.5px solid var(--line-strong);
    transition:
      border-color 0.2s,
      box-shadow 0.2s;
  }

  .is-checked .radio {
    border-color: var(--plum-900);
    box-shadow:
      inset 0 0 0 4px var(--white),
      inset 0 0 0 10px var(--plum-900);
  }

  @media (max-width: 520px) {
    .person {
      grid-template-columns: auto 1fr;
      gap: 0.9rem;
      padding: 1rem;
    }

    .avatar {
      width: 3.6rem;
      height: 3.6rem;
      align-self: start;
    }

    .radio {
      position: absolute;
      top: 1rem;
      right: 1rem;
    }

    .person__name {
      padding-right: 1.6rem;
    }
  }
</style>
