<script lang="ts">
  import { onMount } from 'svelte';
  import TreatmentVisual from '../visuals/TreatmentVisual.svelte';
  import { staffById } from '../../data/team';
  import { site } from '../../data/site';
  import { formatDateLong, fromISO, minutesToTime } from '../../lib/availability';
  import type { BookingState } from './state.svelte';

  interface Props {
    booking: BookingState;
    onrestart: () => void;
  }

  let { booking, onrestart }: Props = $props();
  let heading = $state<HTMLHeadingElement>();

  const t = $derived(booking.treatment!);
  const p = $derived(booking.price!);
  const end = $derived.by(() => {
    if (!booking.time || !p) return '';
    const [h, m] = booking.time.split(':').map(Number);
    return minutesToTime(h * 60 + m + p.minutes);
  });

  onMount(() => heading?.focus());
</script>

<section class="confirm" aria-labelledby="confirm-title">
  <div class="confirm__badge" aria-hidden="true">
    <svg viewBox="0 0 80 80">
      <circle class="ring" cx="40" cy="40" r="36" />
      <path class="tick" d="M25 41.5 35.5 52 56 30" />
    </svg>
    {#each [0, 1, 2, 3, 4, 5] as i (i)}
      <span class="spark" style="--i: {i}"></span>
    {/each}
  </div>

  <p class="eyebrow">Demo-Bestätigung</p>
  <h2 id="confirm-title" tabindex="-1" bind:this={heading}>
    Danke, {booking.customer.firstName}! <em class="accent">Dein Termin wäre jetzt gebucht.</em>
  </h2>
  <p class="lead">
    Du hast den kompletten Buchungsablauf erfolgreich durchgespielt – von der Auswahl bis zur
    verbindlichen Buchung.
  </p>

  <div class="demo-note" role="note">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"
      ><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5M12 7.8v.2" /></svg
    >
    <div>
      <strong>Dies ist eine Demo-Website.</strong>
      Es wurde keine Reservierung erstellt, keine E-Mail oder SMS versendet und keine persönlichen Daten
      übertragen. Deine Eingaben existieren nur in diesem Browserfenster und sind beim Schliessen weg.
    </div>
  </div>

  {#if t && p}
    <article class="ticket">
      <header class="ticket__head">
        <span>So sähe deine Bestätigung aus</span>
        <span class="ticket__code">Demo-Nr. {booking.confirmed?.code}</span>
      </header>
      <div class="ticket__body">
        <div class="ticket__visual">
          <TreatmentVisual
            treatment={t}
            selection={booking.selection}
            compare={false}
            caption={false}
            compact
          />
        </div>
        <dl>
          <div>
            <dt>Behandlung</dt>
            <dd>{t.name}</dd>
          </div>
          <div>
            <dt>Details</dt>
            <dd>
              {p.lines.map((l) => l.value).join(' · ') || 'Standard'}{p.addons.length
                ? ` · ${p.addons.map((a) => a.label).join(' · ')}`
                : ''}
            </dd>
          </div>
          <div>
            <dt>Termin</dt>
            <dd>
              {booking.date ? formatDateLong(fromISO(booking.date)) : ''}, {booking.time} – {end} Uhr
            </dd>
          </div>
          <div>
            <dt>Artist</dt>
            <dd>{booking.assignedStaff ? staffById[booking.assignedStaff].name : ''}</dd>
          </div>
          <div>
            <dt>Adresse</dt>
            <dd>
              {site.address.street}, {site.address.zip}
              {site.address.city} · {site.address.floor}
            </dd>
          </div>
          <div class="ticket__total">
            <dt>Total</dt>
            <dd>CHF {p.total}.–</dd>
          </div>
        </dl>
      </div>
    </article>
  {/if}

  <div class="next">
    <h3>Was bei einer echten Buchung als Nächstes passieren würde</h3>
    <ol>
      <li><strong>Bestätigung per E-Mail</strong> mit allen Details und Kalendereintrag.</li>
      <li>
        <strong>SMS-Erinnerung</strong> 24 Stunden vor dem Termin{booking.customer.reminder
          ? ''
          : ' (von dir abgewählt)'}.
      </li>
      <li>
        <strong>Kostenlos verschieben oder stornieren</strong> bis 24 Stunden vorher über den Link in
        der E-Mail.
      </li>
    </ol>
  </div>

  <div class="actions">
    <button type="button" class="btn btn--accent" onclick={onrestart}>
      Neue Buchung durchspielen
    </button>
    <a class="btn btn--outline" href="/">Zur Startseite</a>
  </div>
</section>

<style>
  .confirm {
    display: grid;
    justify-items: center;
    text-align: center;
    gap: 1.1rem;
    max-width: 760px;
    margin-inline: auto;
    padding-block: 1rem 2rem;
  }

  .confirm__badge {
    position: relative;
    width: 6rem;
    height: 6rem;
  }

  .confirm__badge svg {
    width: 100%;
    height: 100%;
  }

  .ring {
    fill: var(--plum-900);
    stroke: var(--gold-400);
    stroke-width: 1.5;
    transform-origin: center;
    animation: ring 0.7s var(--ease-out) both;
  }

  .tick {
    fill: none;
    stroke: var(--gold-300);
    stroke-width: 4;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-dasharray: 50;
    stroke-dashoffset: 50;
    animation: tick 0.6s 0.45s var(--ease-out) forwards;
  }

  @keyframes ring {
    from {
      transform: scale(0.4);
      opacity: 0;
    }
  }

  @keyframes tick {
    to {
      stroke-dashoffset: 0;
    }
  }

  .spark {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 8px;
    height: 8px;
    background: var(--gold-400);
    clip-path: polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%);
    opacity: 0;
    animation: spark 1.1s calc(0.5s + var(--i) * 60ms) var(--ease-out) forwards;
    --angle: calc(var(--i) * 60deg);
  }

  @keyframes spark {
    0% {
      opacity: 0;
      transform: rotate(var(--angle)) translateY(0) scale(0.5);
    }
    40% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: rotate(var(--angle)) translateY(-62px) scale(1.2);
    }
  }

  h2 {
    font-size: var(--step-3);
    max-width: 18ch;
  }

  h2:focus {
    outline: none;
  }

  h2 em {
    display: block;
  }

  .lead {
    max-width: 38rem;
  }

  .demo-note {
    display: flex;
    gap: 0.8rem;
    text-align: left;
    padding: 1rem 1.2rem;
    border-radius: var(--radius-m);
    background: var(--gold-200);
    color: #574120;
    font-size: 0.93rem;
    max-width: 40rem;
  }

  .demo-note svg {
    width: 1.4rem;
    flex: none;
  }

  .ticket {
    width: 100%;
    margin-top: 0.6rem;
    text-align: left;
    border-radius: var(--radius-l);
    background: var(--white);
    box-shadow: var(--shadow-m);
    overflow: hidden;
  }

  .ticket__head {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 0.4rem 1rem;
    padding: 0.9rem 1.4rem;
    background: var(--plum-900);
    color: var(--blush-100);
    font-size: 0.8rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .ticket__code {
    color: var(--gold-300);
    font-variant-numeric: tabular-nums;
  }

  .ticket__body {
    display: grid;
    grid-template-columns: minmax(0, 190px) 1fr;
    gap: 1.4rem;
    padding: 1.4rem;
  }

  .ticket dl {
    margin: 0;
    display: grid;
    gap: 0.55rem;
  }

  .ticket dl div {
    display: grid;
    grid-template-columns: 6.5rem 1fr;
    gap: 0.8rem;
    font-size: 0.93rem;
  }

  .ticket dt {
    color: var(--text-muted);
  }

  .ticket dd {
    margin: 0;
  }

  .ticket__total {
    padding-top: 0.6rem;
    border-top: 1px solid var(--line);
    align-items: baseline;
  }

  .ticket__total dd {
    font-family: var(--font-display);
    font-size: 1.5rem;
  }

  .next {
    width: 100%;
    text-align: left;
    padding: 1.3rem 1.4rem;
    border: 1px solid var(--line);
    border-radius: var(--radius-m);
  }

  .next h3 {
    font-size: 1.15rem;
    margin-bottom: 0.6rem;
  }

  .next ol {
    margin: 0;
    padding-left: 1.2rem;
    display: grid;
    gap: 0.35rem;
    color: var(--text-soft);
    font-size: 0.93rem;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.8rem;
    margin-top: 0.6rem;
  }

  @media (max-width: 600px) {
    .ticket__body {
      grid-template-columns: 1fr;
    }

    .ticket dl div {
      grid-template-columns: 1fr;
      gap: 0;
    }
  }
</style>
