<script lang="ts">
  const amounts = [50, 100, 150, 200];
  const experiences = [
    { id: 'lift-lami', label: 'Lash Lift & Brow Lamination', price: 169 },
    { id: 'gel-lack', label: 'Gel-Lack mit Maniküre', price: 75 },
    { id: 'pedicure', label: 'Pediküre mit Gel-Lack', price: 95 },
  ];
  const designs = [
    { id: 'blush', label: 'Blush' },
    { id: 'plum', label: 'Aubergine' },
    { id: 'gold', label: 'Champagner' },
  ];

  let type = $state<'amount' | 'experience'>('amount');
  let amount = $state(100);
  let experience = $state(experiences[0].id);
  let design = $state('blush');
  let to = $state('');
  let from = $state('');

  const exp = $derived(experiences.find((e) => e.id === experience)!);
  const value = $derived(type === 'amount' ? amount : exp.price);
  const title = $derived(type === 'amount' ? `CHF ${amount}.–` : exp.label);

  function request() {
    const text =
      `Hallo zusammen, ich möchte gerne einen Gutschein bestellen:\n` +
      `• ${type === 'amount' ? `Wertgutschein über CHF ${amount}.–` : `${exp.label} (CHF ${exp.price}.–)`}\n` +
      `• Design: ${designs.find((d) => d.id === design)?.label}\n` +
      (to.trim() ? `• Für: ${to.trim()}\n` : '') +
      (from.trim() ? `• Von: ${from.trim()}\n` : '') +
      `Bitte meldet euch wegen Bezahlung und Abholung. Danke!`;
    window.dispatchEvent(new CustomEvent('voucher-request', { detail: { text } }));
  }
</script>

<div class="voucher">
  <div class="voucher__preview">
    <div class="card card--{design}" aria-live="polite">
      <div class="card__top">
        <span class="card__brand">Maison <em>Trois</em></span>
        <span class="card__label">Gutschein</span>
      </div>
      <p class="card__value">{title}</p>
      <div class="card__bottom">
        <span>{to.trim() ? `Für ${to.trim()}` : 'Für dich'}</span>
        <span>{from.trim() ? `Von ${from.trim()}` : 'Mit Liebe'}</span>
      </div>
      <svg class="card__mark" viewBox="-20 -20 40 40" aria-hidden="true">
        <g fill="none" stroke="currentColor" stroke-width="0.7">
          <ellipse cx="0" cy="-7.2" rx="5.2" ry="9.6"></ellipse>
          <ellipse cx="0" cy="-7.2" rx="5.2" ry="9.6" transform="rotate(120)"></ellipse>
          <ellipse cx="0" cy="-7.2" rx="5.2" ry="9.6" transform="rotate(240)"></ellipse>
        </g>
      </svg>
    </div>
  </div>

  <div class="voucher__form">
    <div class="seg" role="group" aria-label="Gutscheinart">
      <button type="button" aria-pressed={type === 'amount'} onclick={() => (type = 'amount')}
        >Wertgutschein</button
      >
      <button
        type="button"
        aria-pressed={type === 'experience'}
        onclick={() => (type = 'experience')}>Behandlung</button
      >
    </div>

    {#if type === 'amount'}
      <fieldset>
        <legend>Betrag</legend>
        <div class="chips">
          {#each amounts as a (a)}
            <button type="button" aria-pressed={amount === a} onclick={() => (amount = a)}
              >CHF {a}.–</button
            >
          {/each}
        </div>
      </fieldset>
    {:else}
      <fieldset>
        <legend>Behandlung</legend>
        <div class="chips chips--col">
          {#each experiences as e (e.id)}
            <button
              type="button"
              aria-pressed={experience === e.id}
              onclick={() => (experience = e.id)}
            >
              {e.label}<span>CHF {e.price}.–</span>
            </button>
          {/each}
        </div>
      </fieldset>
    {/if}

    <fieldset>
      <legend>Design</legend>
      <div class="chips">
        {#each designs as d (d.id)}
          <button
            type="button"
            class="design design--{d.id}"
            aria-pressed={design === d.id}
            onclick={() => (design = d.id)}
          >
            <i aria-hidden="true"></i>{d.label}
          </button>
        {/each}
      </div>
    </fieldset>

    <div class="names">
      <label
        >Für <input type="text" bind:value={to} maxlength="30" placeholder="z. B. Sarah" /></label
      >
      <label
        >Von <input type="text" bind:value={from} maxlength="30" placeholder="z. B. Mia" /></label
      >
    </div>

    <div class="voucher__cta">
      <span class="voucher__total">CHF {value}.–</span>
      <button type="button" class="btn btn--accent" onclick={request}>Gutschein anfragen</button>
    </div>
    <p class="voucher__hint">
      Wir füllen das Kontaktformular für dich aus – du musst nur noch deine Angaben ergänzen.
    </p>
  </div>
</div>

<style>
  .voucher {
    display: grid;
    gap: clamp(1.5rem, 1rem + 2vw, 3rem);
    align-items: center;
  }

  @media (min-width: 900px) {
    .voucher {
      grid-template-columns: 1fr 1fr;
    }
  }

  .voucher__preview {
    perspective: 1200px;
    display: grid;
    place-items: center;
  }

  .card {
    position: relative;
    width: min(100%, 440px);
    aspect-ratio: 1.6;
    padding: 1.6rem 1.8rem;
    border-radius: 22px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
    box-shadow: var(--shadow-l);
    transform: rotate(-3deg);
    transition:
      background 0.5s,
      color 0.5s,
      transform 0.6s var(--ease-out);
  }

  .card:hover {
    transform: rotate(0deg) translateY(-4px);
  }

  .card--blush {
    background: linear-gradient(140deg, #f8e3dd, #efcfc6 60%, #e8bfb5);
    color: var(--plum-900);
  }

  .card--plum {
    background: linear-gradient(140deg, #4a2438, #33182a 70%);
    color: var(--gold-300);
  }

  .card--gold {
    background: linear-gradient(130deg, #f4e6c8 0%, #d8b77e 45%, #f0dcb0 70%, #c29c5e 100%);
    color: #3d2717;
  }

  .card__top,
  .card__bottom {
    position: relative;
    z-index: 1;
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 1rem;
  }

  .card__brand {
    font-family: var(--font-display);
    font-size: 1.3rem;
  }

  .card__label {
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    opacity: 0.8;
  }

  .card__value {
    position: relative;
    z-index: 1;
    font-family: var(--font-display);
    font-style: italic;
    font-size: clamp(1.6rem, 1.2rem + 1.6vw, 2.4rem);
    line-height: 1.1;
  }

  .card__bottom {
    font-size: 0.9rem;
    opacity: 0.85;
  }

  .card__mark {
    position: absolute;
    right: -12%;
    top: 50%;
    width: 60%;
    translate: 0 -50%;
    opacity: 0.25;
  }

  .voucher__form {
    display: grid;
    gap: 1.2rem;
  }

  .seg {
    display: inline-flex;
    justify-self: start;
    padding: 4px;
    border-radius: var(--radius-pill);
    background: var(--blush-100);
  }

  .seg button {
    border: 0;
    background: none;
    padding: 0.5rem 1.1rem;
    border-radius: var(--radius-pill);
    font-weight: 500;
    color: var(--text-soft);
  }

  .seg button[aria-pressed='true'] {
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
    margin-bottom: 0.5rem;
    font-size: 0.74rem;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--gold-600);
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .chips--col {
    display: grid;
  }

  .chips button {
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.8rem;
    padding: 0.55rem 1rem;
    border: 1px solid var(--line-strong);
    border-radius: var(--radius-pill);
    background: var(--white);
    font-size: 0.92rem;
    text-align: left;
    transition:
      background-color 0.2s,
      color 0.2s,
      border-color 0.2s;
  }

  .chips button span {
    font-size: 0.82rem;
    opacity: 0.8;
  }

  .chips button[aria-pressed='true'] {
    background: var(--plum-900);
    border-color: var(--plum-900);
    color: var(--porcelain);
  }

  .design i {
    width: 0.9rem;
    height: 0.9rem;
    border-radius: 50%;
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
  }

  .design--blush i {
    background: #efcfc6;
  }

  .design--plum i {
    background: #33182a;
  }

  .design--gold i {
    background: #d8b77e;
  }

  .names {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.8rem;
  }

  .names label {
    display: grid;
    gap: 0.35rem;
    font-size: 0.85rem;
    font-weight: 500;
  }

  .names input {
    width: 100%;
    padding: 0.7rem 0.9rem;
    border: 1px solid var(--line-strong);
    border-radius: 12px;
    background: var(--white);
    font-size: 1rem;
    font-weight: 400;
  }

  .names input:focus {
    outline: none;
    border-color: var(--plum-900);
    box-shadow: 0 0 0 3px rgba(122, 46, 73, 0.15);
  }

  .voucher__cta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--line);
  }

  .voucher__total {
    font-family: var(--font-display);
    font-size: 1.6rem;
  }

  .voucher__hint {
    font-size: 0.82rem;
    color: var(--text-muted);
  }
</style>
