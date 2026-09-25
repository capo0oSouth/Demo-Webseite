<script lang="ts">
  import { onMount, tick } from 'svelte';

  const subjects = ['Allgemeine Frage', 'Gutschein', 'Permanent Make-up: Vorgespräch', 'Feedback'];

  let name = $state('');
  let email = $state('');
  let phone = $state('');
  let subject = $state(subjects[0]);
  let message = $state('');
  let privacy = $state(false);
  let submitted = $state(false);
  let touched = $state<Record<string, boolean>>({});
  let sending = $state(false);
  let sent = $state(false);
  let successEl = $state<HTMLDivElement>();

  const errors = $derived.by(() => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Bitte gib deinen Namen ein.';
    if (!email.trim()) e.email = 'Bitte gib deine E-Mail-Adresse ein.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()))
      e.email = 'Bitte prüfe deine E-Mail-Adresse.';
    if (message.trim().length < 10)
      e.message = 'Bitte schreib uns ein paar Worte (mind. 10 Zeichen).';
    if (!privacy) e.privacy = 'Bitte bestätige den Datenschutzhinweis.';
    return e;
  });

  const show = (f: string) => ((touched[f] || submitted) && errors[f] ? errors[f] : '');

  async function submit(e: SubmitEvent) {
    e.preventDefault();
    submitted = true;
    if (Object.keys(errors).length) {
      await tick();
      document.querySelector<HTMLElement>('.cf [aria-invalid="true"]')?.focus();
      return;
    }
    sending = true;
    await new Promise((r) => setTimeout(r, 900));
    sending = false;
    sent = true;
    await tick();
    successEl?.focus();
  }

  function reset() {
    name = email = phone = message = '';
    subject = subjects[0];
    privacy = false;
    submitted = false;
    touched = {};
    sent = false;
  }

  onMount(() => {
    const onVoucher = (e: Event) => {
      const d = (e as CustomEvent<{ text: string }>).detail;
      sent = false;
      subject = 'Gutschein';
      message = d.text;
      document
        .getElementById('kontaktformular')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => document.getElementById('cf-name')?.focus({ preventScroll: true }), 600);
    };
    window.addEventListener('voucher-request', onVoucher);
    return () => window.removeEventListener('voucher-request', onVoucher);
  });
</script>

{#if sent}
  <div class="success" tabindex="-1" bind:this={successEl} role="status">
    <span class="success__icon" aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg
      >
    </span>
    <h3>Danke, {name.split(' ')[0]}!</h3>
    <p>So sähe die Bestätigung aus: Wir würden uns innerhalb eines Arbeitstages bei dir melden.</p>
    <p class="success__demo">
      <strong>Demo-Hinweis:</strong> Es wurde keine Nachricht versendet und keine Daten übertragen.
    </p>
    <button type="button" class="btn btn--outline btn--small" onclick={reset}
      >Neue Nachricht schreiben</button
    >
  </div>
{:else}
  <form class="cf" novalidate onsubmit={submit}>
    <div class="row2">
      <div class="field">
        <label for="cf-name">Name <span aria-hidden="true">*</span></label>
        <input
          id="cf-name"
          type="text"
          autocomplete="name"
          bind:value={name}
          onblur={() => (touched.name = true)}
          aria-invalid={!!show('name')}
          aria-describedby={show('name') ? 'cf-e-name' : undefined}
        />
        {#if show('name')}<p class="error" id="cf-e-name">{show('name')}</p>{/if}
      </div>
      <div class="field">
        <label for="cf-email">E-Mail <span aria-hidden="true">*</span></label>
        <input
          id="cf-email"
          type="email"
          autocomplete="email"
          inputmode="email"
          bind:value={email}
          onblur={() => (touched.email = true)}
          aria-invalid={!!show('email')}
          aria-describedby={show('email') ? 'cf-e-email' : undefined}
        />
        {#if show('email')}<p class="error" id="cf-e-email">{show('email')}</p>{/if}
      </div>
    </div>
    <div class="row2">
      <div class="field">
        <label for="cf-phone">Telefon <span class="optional">optional</span></label>
        <input id="cf-phone" type="tel" autocomplete="tel" inputmode="tel" bind:value={phone} />
      </div>
      <div class="field">
        <label for="cf-subject">Anliegen</label>
        <div class="select">
          <select id="cf-subject" bind:value={subject}>
            {#each subjects as s (s)}<option value={s}>{s}</option>{/each}
          </select>
        </div>
      </div>
    </div>
    <div class="field">
      <label for="cf-message">Nachricht <span aria-hidden="true">*</span></label>
      <textarea
        id="cf-message"
        rows="5"
        maxlength="1000"
        bind:value={message}
        onblur={() => (touched.message = true)}
        aria-invalid={!!show('message')}
        aria-describedby={show('message') ? 'cf-e-message' : undefined}></textarea>
      {#if show('message')}<p class="error" id="cf-e-message">{show('message')}</p>{/if}
    </div>
    <div class="field">
      <label class="check">
        <input
          type="checkbox"
          bind:checked={privacy}
          onchange={() => (touched.privacy = true)}
          aria-invalid={!!show('privacy')}
          aria-describedby={show('privacy') ? 'cf-e-privacy' : undefined}
        />
        <span class="check__box" aria-hidden="true"></span>
        <span
          >Ich habe den <a href="/datenschutz">Datenschutzhinweis</a> gelesen.
          <span aria-hidden="true">*</span></span
        >
      </label>
      {#if show('privacy')}<p class="error" id="cf-e-privacy">{show('privacy')}</p>{/if}
    </div>
    <div class="actions">
      <button type="submit" class="btn btn--accent" disabled={sending}>
        {sending ? 'Wird gesendet …' : 'Nachricht senden'}
      </button>
      <p class="demo">Demo: Das Formular sendet keine Daten.</p>
    </div>
  </form>
{/if}

<style>
  .cf {
    display: grid;
    gap: 1.2rem;
  }

  .row2 {
    display: grid;
    gap: 1.2rem;
  }

  @media (min-width: 620px) {
    .row2 {
      grid-template-columns: 1fr 1fr;
    }
  }

  .field {
    display: grid;
    gap: 0.4rem;
    min-width: 0;
  }

  label {
    font-size: 0.9rem;
    font-weight: 500;
  }

  label > span[aria-hidden] {
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
  select,
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

  .select {
    position: relative;
  }

  .select::after {
    content: '';
    position: absolute;
    right: 1.1rem;
    top: 50%;
    width: 0.5rem;
    height: 0.5rem;
    border-right: 1.5px solid var(--plum-900);
    border-bottom: 1.5px solid var(--plum-900);
    transform: translateY(-70%) rotate(45deg);
    pointer-events: none;
  }

  select {
    appearance: none;
    padding-right: 2.5rem;
  }

  textarea {
    resize: vertical;
  }

  input:focus,
  select:focus,
  textarea:focus {
    outline: none;
    border-color: var(--plum-900);
    box-shadow: 0 0 0 3px rgba(122, 46, 73, 0.15);
  }

  [aria-invalid='true'] {
    border-color: var(--danger) !important;
  }

  .error {
    font-size: 0.84rem;
    color: var(--danger);
  }

  .check {
    position: relative;
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.75rem;
    align-items: start;
    font-weight: 400;
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

  .check input[aria-invalid='true'] + .check__box {
    border-color: var(--danger);
  }

  .check a {
    color: var(--berry-700);
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1rem;
  }

  .demo {
    font-size: 0.82rem;
    color: var(--text-muted);
  }

  .success {
    display: grid;
    justify-items: start;
    gap: 0.8rem;
    padding: 2rem;
    border-radius: var(--radius-l);
    background: var(--white);
    box-shadow: var(--shadow-s);
  }

  .success:focus {
    outline: none;
  }

  .success__icon {
    width: 3rem;
    height: 3rem;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: var(--plum-900);
    color: var(--gold-300);
  }

  .success__icon svg {
    width: 1.4rem;
  }

  .success h3 {
    font-size: 1.6rem;
  }

  .success p {
    color: var(--text-soft);
  }

  .success__demo {
    padding: 0.7rem 0.9rem;
    border-radius: 12px;
    background: var(--gold-200);
    color: #574120 !important;
    font-size: 0.9rem;
  }
</style>
