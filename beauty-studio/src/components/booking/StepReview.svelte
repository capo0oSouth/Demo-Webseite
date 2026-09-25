<script lang="ts">
  import TreatmentVisual from '../visuals/TreatmentVisual.svelte';
  import { staffById } from '../../data/team';
  import { site } from '../../data/site';
  import { policies } from '../../data/services';
  import { formatDuration } from '../../lib/booking';
  import { formatDateLong, fromISO, minutesToTime } from '../../lib/availability';
  import { formatPhone } from '../../lib/validation';
  import type { BookingState } from './state.svelte';

  interface Props {
    booking: BookingState;
    ongoto: (step: number) => void;
  }

  let { booking, ongoto }: Props = $props();

  const t = $derived(booking.treatment!);
  const p = $derived(booking.price!);
  const end = $derived.by(() => {
    if (!booking.time) return '';
    const [h, m] = booking.time.split(':').map(Number);
    return minutesToTime(h * 60 + m + p.minutes);
  });
</script>

{#if t && p}
  <div class="review">
    <section class="block">
      <header>
        <h3>Behandlung</h3>
        <button type="button" class="edit" onclick={() => ongoto(2)}
          >Ändern<span class="visually-hidden"> – Behandlung</span></button
        >
      </header>
      <div class="treat">
        <div class="treat__visual">
          <TreatmentVisual
            treatment={t}
            selection={booking.selection}
            compare={false}
            caption={false}
            compact
          />
        </div>
        <div>
          <p class="treat__cat">{booking.categoryInfo?.name}</p>
          <p class="treat__name">{t.name}</p>
          <ul class="opts">
            {#each p.lines as l (l.label)}
              <li><span>{l.label}</span> {l.value}</li>
            {/each}
            {#each p.addons as a (a.id)}
              <li><span>Extra</span> {a.label}</li>
            {/each}
          </ul>
        </div>
      </div>
    </section>

    <section class="block">
      <header>
        <h3>Termin</h3>
        <button type="button" class="edit" onclick={() => ongoto(4)}
          >Ändern<span class="visually-hidden"> – Termin</span></button
        >
      </header>
      <dl class="facts">
        <div>
          <dt>Datum</dt>
          <dd>{booking.date ? formatDateLong(fromISO(booking.date)) : '–'}</dd>
        </div>
        <div>
          <dt>Uhrzeit</dt>
          <dd>{booking.time} – {end} Uhr</dd>
        </div>
        <div>
          <dt>Dauer</dt>
          <dd>ca. {formatDuration(p.minutes)}</dd>
        </div>
        <div>
          <dt>Artist</dt>
          <dd>{booking.assignedStaff ? staffById[booking.assignedStaff].name : '–'}</dd>
        </div>
        <div>
          <dt>Ort</dt>
          <dd>{site.name}, {site.address.street}, {site.address.zip} {site.address.city}</dd>
        </div>
      </dl>
    </section>

    <section class="block">
      <header>
        <h3>Deine Angaben</h3>
        <button type="button" class="edit" onclick={() => ongoto(5)}
          >Ändern<span class="visually-hidden"> – Angaben</span></button
        >
      </header>
      <dl class="facts">
        <div>
          <dt>Name</dt>
          <dd>{booking.customer.firstName} {booking.customer.lastName}</dd>
        </div>
        <div>
          <dt>E-Mail</dt>
          <dd>{booking.customer.email}</dd>
        </div>
        <div>
          <dt>Mobile</dt>
          <dd>{formatPhone(booking.customer.phone)}</dd>
        </div>
        <div>
          <dt>Besuch</dt>
          <dd>{booking.customer.visit === 'new' ? 'Erster Besuch' : 'Stammkundin'}</dd>
        </div>
        {#if booking.customer.notes.trim()}
          <div>
            <dt>Hinweise</dt>
            <dd class="notes">{booking.customer.notes}</dd>
          </div>
        {/if}
        <div>
          <dt>Erinnerung</dt>
          <dd>{booking.customer.reminder ? 'SMS 24 Std. vorher' : 'Keine'}</dd>
        </div>
      </dl>
    </section>

    <section class="block block--price">
      <header><h3>Preis</h3></header>
      <dl class="price">
        <div>
          <dt>{t.name}</dt>
          <dd>CHF {t.price}.–</dd>
        </div>
        {#each p.lines.filter((l) => l.price > 0) as l (l.label)}
          <div>
            <dt>{l.label}: {l.value}</dt>
            <dd>+ {l.price}.–</dd>
          </div>
        {/each}
        {#each p.addons as a (a.id)}
          <div>
            <dt>{a.label}</dt>
            <dd>+ {a.price}.–</dd>
          </div>
        {/each}
        <div class="price__total">
          <dt>Total</dt>
          <dd>CHF {p.total}.–</dd>
        </div>
      </dl>
      <ul class="policies">
        <li>{policies.payment}</li>
        <li>{policies.cancellation}</li>
        {#if t.note}<li>{t.note}</li>{/if}
      </ul>
    </section>
  </div>
{/if}

<style>
  .review {
    display: grid;
    gap: 1rem;
  }

  .block {
    padding: 1.3rem 1.4rem;
    border: 1px solid var(--line);
    border-radius: var(--radius-m);
    background: var(--white);
  }

  .block header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 0.9rem;
  }

  .block h3 {
    font-size: 1.2rem;
  }

  .edit {
    border: 0;
    background: none;
    padding: 0.2rem 0;
    font-size: 0.85rem;
    color: var(--berry-700);
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .treat {
    display: grid;
    grid-template-columns: minmax(0, 150px) 1fr;
    gap: 1.1rem;
    align-items: start;
  }

  .treat__visual :global(.stage) {
    border-radius: 16px;
  }

  .treat__cat {
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--gold-600);
  }

  .treat__name {
    font-family: var(--font-display);
    font-size: 1.3rem;
    line-height: 1.2;
    margin-bottom: 0.5rem;
  }

  .opts {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 0.2rem;
    font-size: 0.9rem;
  }

  .opts span {
    display: inline-block;
    min-width: 6.5rem;
    color: var(--text-muted);
  }

  .facts,
  .price {
    margin: 0;
    display: grid;
    gap: 0.5rem;
  }

  .facts div {
    display: grid;
    grid-template-columns: 7rem 1fr;
    gap: 0.8rem;
    font-size: 0.93rem;
  }

  .facts dt {
    color: var(--text-muted);
  }

  .facts dd {
    margin: 0;
    overflow-wrap: anywhere;
  }

  .notes {
    white-space: pre-line;
  }

  .price div {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    font-size: 0.93rem;
  }

  .price dd {
    margin: 0;
    white-space: nowrap;
  }

  .price__total {
    margin-top: 0.4rem;
    padding-top: 0.8rem;
    border-top: 1px solid var(--line-strong);
    align-items: baseline;
  }

  .price__total dt {
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    font-size: 0.8rem;
  }

  .price__total dd {
    font-family: var(--font-display);
    font-size: 1.8rem;
  }

  .policies {
    margin: 1rem 0 0;
    padding: 0.9rem 0 0 1.1rem;
    border-top: 1px dashed var(--line);
    display: grid;
    gap: 0.3rem;
    font-size: 0.85rem;
    color: var(--text-soft);
  }

  @media (max-width: 520px) {
    .treat {
      grid-template-columns: 1fr;
    }

    .facts div {
      grid-template-columns: 1fr;
      gap: 0.05rem;
    }

    .block {
      padding: 1.1rem 1rem;
    }
  }
</style>
