<script lang="ts">
  import { treatmentsFor } from '../../data/services';
  import { formatDuration } from '../../lib/booking';
  import type { BookingState } from './state.svelte';

  interface Props {
    booking: BookingState;
    onnext: () => void;
  }

  let { booking, onnext }: Props = $props();

  const list = $derived(booking.category ? treatmentsFor(booking.category) : []);
  const hasOptions = (id: string) =>
    list.find((t) => t.id === id)?.groups.some((g) => g.choices.some((c) => c.price));

  function pick(id: string) {
    booking.chooseTreatment(id);
    onnext();
  }
</script>

<ul class="list">
  {#each list as t, i (t.id)}
    <li style="--i: {i}">
      <article class="item" class:is-active={booking.treatmentId === t.id}>
        <div class="item__head">
          <h3>{t.name}</h3>
          {#if t.badge}<span class="chip chip--gold">{t.badge}</span>{/if}
        </div>
        <p class="item__tagline">{t.tagline}</p>
        <p class="item__desc">{t.description}</p>
        <dl class="item__facts">
          <div>
            <dt>Dauer</dt>
            <dd>ca. {formatDuration(t.minutes)}</dd>
          </div>
          <div>
            <dt>Haltbarkeit</dt>
            <dd>{t.durability}</dd>
          </div>
          <div>
            <dt>Ideal für</dt>
            <dd>{t.idealFor}</dd>
          </div>
        </dl>
        <div class="item__foot">
          <span class="item__price">
            {hasOptions(t.id) ? 'ab ' : ''}<strong>CHF {t.price}.–</strong>
          </span>
          <button
            type="button"
            class="btn btn--small"
            class:btn--accent={booking.treatmentId === t.id}
            aria-label="{booking.treatmentId === t.id
              ? 'Ausgewählt, weiter'
              : 'Auswählen'}: {t.name}"
            onclick={() => pick(t.id)}
          >
            {booking.treatmentId === t.id ? 'Ausgewählt – weiter' : 'Auswählen'}
            <svg
              class="arrow"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6" /></svg
            >
          </button>
        </div>
      </article>
    </li>
  {/each}
</ul>

<style>
  .list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 1rem;
  }

  li {
    animation: rise 0.6s var(--ease-out) both;
    animation-delay: calc(var(--i) * 60ms);
  }

  @keyframes rise {
    from {
      opacity: 0;
      transform: translateY(14px);
    }
  }

  .item {
    display: grid;
    gap: 0.6rem;
    padding: 1.4rem 1.5rem;
    border: 1px solid var(--line);
    border-radius: var(--radius-m);
    background: var(--white);
    transition:
      border-color 0.3s,
      box-shadow 0.3s;
  }

  .item:hover {
    border-color: var(--rose-400);
    box-shadow: var(--shadow-s);
  }

  .item.is-active {
    border-color: var(--plum-900);
    box-shadow: 0 0 0 1px var(--plum-900);
  }

  .item__head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem 0.8rem;
  }

  h3 {
    font-size: 1.45rem;
  }

  .item__tagline {
    font-family: var(--font-display);
    font-style: italic;
    color: var(--berry-700);
  }

  .item__desc {
    color: var(--text-soft);
    font-size: 0.95rem;
  }

  .item__facts {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 0.6rem 1.2rem;
    margin: 0.3rem 0 0;
    padding: 0.9rem 0;
    border-block: 1px solid var(--line);
  }

  .item__facts dt {
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--gold-600);
  }

  .item__facts dd {
    margin: 0.15rem 0 0;
    font-size: 0.9rem;
    line-height: 1.4;
  }

  .item__foot {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.8rem;
    margin-top: 0.2rem;
  }

  .item__price {
    color: var(--text-soft);
  }

  .item__price strong {
    font-family: var(--font-display);
    font-size: 1.5rem;
    font-weight: 400;
    color: var(--plum-900);
  }
</style>
