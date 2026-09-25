<script lang="ts">
  import { tick } from 'svelte';
  import { formatPhone } from '../../lib/validation';
  import type { BookingState } from './state.svelte';

  interface Props {
    booking: BookingState;
    onnext: () => void;
  }

  let { booking, onnext }: Props = $props();

  let touched = $state<Record<string, boolean>>({});
  let submitted = $state(false);
  let summaryEl = $state<HTMLDivElement>();

  const show = (field: keyof typeof booking.errors) =>
    (touched[field] || submitted) && booking.errors[field] ? booking.errors[field] : '';

  const errorList = $derived(submitted ? Object.entries(booking.errors) : []);

  const labels: Record<string, string> = {
    firstName: 'Vorname',
    lastName: 'Nachname',
    email: 'E-Mail',
    phone: 'Mobilnummer',
    terms: 'Bedingungen',
  };

  async function submit(e: SubmitEvent) {
    e.preventDefault();
    submitted = true;
    if (Object.keys(booking.errors).length === 0) {
      onnext();
      return;
    }
    await tick();
    summaryEl?.focus();
  }

  function focusField(id: string) {
    document.getElementById(`f-${id}`)?.focus();
  }
</script>

<form id="details-form" class="form" novalidate onsubmit={submit}>
  {#if errorList.length}
    <div class="error-summary" tabindex="-1" bind:this={summaryEl} role="alert">
      <p>
        <strong
          >Bitte prüfe noch {errorList.length === 1
            ? 'ein Feld'
            : `${errorList.length} Felder`}:</strong
        >
      </p>
      <ul>
        {#each errorList as [field, msg] (field)}
          <li>
            <button type="button" onclick={() => focusField(field)}>{labels[field]}: {msg}</button>
          </li>
        {/each}
      </ul>
    </div>
  {/if}

  <div class="row2">
    <div class="field" class:has-error={show('firstName')}>
      <label for="f-firstName">Vorname <span aria-hidden="true">*</span></label>
      <input
        id="f-firstName"
        type="text"
        autocomplete="given-name"
        required
        bind:value={booking.customer.firstName}
        onblur={() => (touched.firstName = true)}
        aria-invalid={!!show('firstName')}
        aria-describedby={show('firstName') ? 'e-firstName' : undefined}
      />
      {#if show('firstName')}<p class="error" id="e-firstName">{show('firstName')}</p>{/if}
    </div>
    <div class="field" class:has-error={show('lastName')}>
      <label for="f-lastName">Nachname <span aria-hidden="true">*</span></label>
      <input
        id="f-lastName"
        type="text"
        autocomplete="family-name"
        required
        bind:value={booking.customer.lastName}
        onblur={() => (touched.lastName = true)}
        aria-invalid={!!show('lastName')}
        aria-describedby={show('lastName') ? 'e-lastName' : undefined}
      />
      {#if show('lastName')}<p class="error" id="e-lastName">{show('lastName')}</p>{/if}
    </div>
  </div>

  <div class="row2">
    <div class="field" class:has-error={show('email')}>
      <label for="f-email">E-Mail <span aria-hidden="true">*</span></label>
      <input
        id="f-email"
        type="email"
        autocomplete="email"
        inputmode="email"
        required
        placeholder="name@beispiel.ch"
        bind:value={booking.customer.email}
        onblur={() => (touched.email = true)}
        aria-invalid={!!show('email')}
        aria-describedby={show('email') ? 'e-email' : 'h-email'}
      />
      {#if show('email')}
        <p class="error" id="e-email">{show('email')}</p>
      {:else}
        <p class="hint" id="h-email">Hierhin ginge deine Terminbestätigung.</p>
      {/if}
    </div>
    <div class="field" class:has-error={show('phone')}>
      <label for="f-phone">Mobilnummer <span aria-hidden="true">*</span></label>
      <input
        id="f-phone"
        type="tel"
        autocomplete="tel"
        inputmode="tel"
        required
        placeholder="079 123 45 67"
        bind:value={booking.customer.phone}
        onblur={() => {
          touched.phone = true;
          if (!booking.errors.phone) booking.customer.phone = formatPhone(booking.customer.phone);
        }}
        aria-invalid={!!show('phone')}
        aria-describedby={show('phone') ? 'e-phone' : 'h-phone'}
      />
      {#if show('phone')}
        <p class="error" id="e-phone">{show('phone')}</p>
      {:else}
        <p class="hint" id="h-phone">Nur für kurzfristige Rückfragen zum Termin.</p>
      {/if}
    </div>
  </div>

  <fieldset class="field visit">
    <legend>Warst du schon bei uns?</legend>
    <div class="visit__options">
      <label class:is-checked={booking.customer.visit === 'new'}>
        <input type="radio" name="visit" value="new" bind:group={booking.customer.visit} />
        Ich bin zum ersten Mal hier
      </label>
      <label class:is-checked={booking.customer.visit === 'returning'}>
        <input type="radio" name="visit" value="returning" bind:group={booking.customer.visit} />
        Ich war schon bei euch
      </label>
    </div>
  </fieldset>

  <div class="field">
    <label for="f-notes">Wünsche & Hinweise <span class="optional">optional</span></label>
    <textarea
      id="f-notes"
      rows="3"
      maxlength="500"
      placeholder="z. B. Allergien, Inspirationsbild auf dem Handy, empfindliche Augen …"
      bind:value={booking.customer.notes}
      aria-describedby="h-notes"></textarea>
    <p class="hint" id="h-notes">{booking.customer.notes.length} / 500 Zeichen</p>
  </div>

  <label class="check">
    <input type="checkbox" bind:checked={booking.customer.reminder} />
    <span class="check__box" aria-hidden="true"></span>
    <span>Erinnere mich 24 Stunden vor dem Termin per SMS.</span>
  </label>

  <div class="field" class:has-error={show('terms')}>
    <label class="check">
      <input
        id="f-terms"
        type="checkbox"
        bind:checked={booking.customer.terms}
        onchange={() => (touched.terms = true)}
        aria-invalid={!!show('terms')}
        aria-describedby={show('terms') ? 'e-terms' : undefined}
      />
      <span class="check__box" aria-hidden="true"></span>
      <span>
        Ich akzeptiere die <a href="/agb" target="_blank" rel="noopener"
          >Termin- und Stornobedingungen</a
        >
        (kostenlos stornierbar bis 24 Std. vorher). <span aria-hidden="true">*</span>
      </span>
    </label>
    {#if show('terms')}<p class="error" id="e-terms">{show('terms')}</p>{/if}
  </div>

  <p class="privacy">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"
      ><path d="M12 3 5 5.8v5.5c0 4.3 3 8.2 7 9.7 4-1.5 7-5.4 7-9.7V5.8Z" /><path
        d="m9 12 2.2 2.2L15.5 10"
      /></svg
    >
    Demo-Hinweis: Deine Eingaben bleiben in diesem Browserfenster und werden nirgendwohin übertragen.
  </p>
</form>

<style>
  .form {
    display: grid;
    gap: 1.3rem;
  }

  .row2 {
    display: grid;
    gap: 1.3rem;
  }

  @media (min-width: 640px) {
    .row2 {
      grid-template-columns: 1fr 1fr;
    }
  }

  .field {
    display: grid;
    gap: 0.4rem;
    min-width: 0;
  }

  label,
  legend {
    font-size: 0.9rem;
    font-weight: 500;
  }

  label span[aria-hidden] {
    color: var(--berry-700);
  }

  .optional {
    font-weight: 400;
    color: var(--text-muted);
    font-size: 0.8rem;
    margin-left: 0.3rem;
  }

  input[type='text'],
  input[type='email'],
  input[type='tel'],
  textarea {
    width: 100%;
    padding: 0.85rem 1rem;
    border: 1px solid var(--line-strong);
    border-radius: 14px;
    background: var(--white);
    font-size: 1rem;
    transition:
      border-color 0.2s,
      box-shadow 0.2s;
  }

  textarea {
    resize: vertical;
    min-height: 6rem;
  }

  input::placeholder,
  textarea::placeholder {
    color: #8a7480;
  }

  input:focus,
  textarea:focus {
    outline: none;
    border-color: var(--plum-900);
    box-shadow: 0 0 0 3px rgba(122, 46, 73, 0.15);
  }

  .has-error input {
    border-color: var(--danger);
  }

  .error {
    display: flex;
    gap: 0.4rem;
    font-size: 0.84rem;
    color: var(--danger);
  }

  .error::before {
    content: '!';
    flex: none;
    width: 1.05rem;
    height: 1.05rem;
    margin-top: 0.15rem;
    border-radius: 50%;
    background: var(--danger);
    color: #fff;
    font-size: 0.7rem;
    font-weight: 700;
    display: grid;
    place-items: center;
  }

  .hint {
    font-size: 0.8rem;
    color: var(--text-muted);
  }

  .visit {
    border: 0;
    padding: 0;
    margin: 0;
  }

  .visit legend {
    margin-bottom: 0.5rem;
    padding: 0;
  }

  .visit__options {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .visit__options label {
    position: relative;
    padding: 0.6rem 1rem;
    border: 1px solid var(--line-strong);
    border-radius: var(--radius-pill);
    background: var(--white);
    font-weight: 400;
    cursor: pointer;
    transition:
      border-color 0.2s,
      background-color 0.2s,
      color 0.2s;
  }

  .visit__options label.is-checked {
    background: var(--plum-900);
    border-color: var(--plum-900);
    color: var(--porcelain);
  }

  .visit__options input {
    position: absolute;
    opacity: 0;
    width: 1px;
    height: 1px;
  }

  .visit__options label:has(input:focus-visible) {
    outline: 2px solid var(--focus);
    outline-offset: 2px;
  }

  .check {
    position: relative;
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.75rem;
    align-items: start;
    font-weight: 400;
    font-size: 0.93rem;
    cursor: pointer;
  }

  .check input {
    position: absolute;
    opacity: 0;
    width: 1.3rem;
    height: 1.3rem;
    margin: 0;
  }

  .check__box {
    width: 1.3rem;
    height: 1.3rem;
    margin-top: 0.12rem;
    border: 1.5px solid var(--line-strong);
    border-radius: 6px;
    background: var(--white) no-repeat center / 0.9rem;
    transition:
      background-color 0.2s,
      border-color 0.2s;
  }

  .check input:checked + .check__box {
    background-color: var(--plum-900);
    border-color: var(--plum-900);
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23FCF8F5' stroke-width='2.4' stroke-linecap='round'%3E%3Cpath d='m5 12.5 4.5 4.5L19 7.5'/%3E%3C/svg%3E");
  }

  .check input:focus-visible + .check__box {
    outline: 2px solid var(--focus);
    outline-offset: 2px;
  }

  .has-error .check__box {
    border-color: var(--danger);
  }

  .check a {
    color: var(--berry-700);
  }

  .privacy {
    display: flex;
    gap: 0.6rem;
    align-items: flex-start;
    padding: 0.9rem 1rem;
    border-radius: 14px;
    background: var(--cream);
    font-size: 0.85rem;
    color: var(--text-soft);
  }

  .privacy svg {
    width: 1.2rem;
    flex: none;
    color: var(--gold-600);
  }

  .error-summary {
    padding: 1rem 1.2rem;
    border-radius: 14px;
    border: 1px solid rgba(179, 54, 76, 0.35);
    background: #fdf0f2;
    color: #7c1f33;
  }

  .error-summary:focus {
    outline: 2px solid var(--danger);
    outline-offset: 2px;
  }

  .error-summary ul {
    margin: 0.4rem 0 0;
    padding-left: 1.1rem;
  }

  .error-summary button {
    border: 0;
    background: none;
    padding: 0.1rem 0;
    color: inherit;
    text-align: left;
    text-decoration: underline;
    text-underline-offset: 3px;
    font-size: 0.9rem;
  }
</style>
