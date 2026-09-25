<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { Tween } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { fly } from 'svelte/transition';
  import StepCategory from './StepCategory.svelte';
  import StepTreatment from './StepTreatment.svelte';
  import StepConfigure from './StepConfigure.svelte';
  import StepStaff from './StepStaff.svelte';
  import StepDate from './StepDate.svelte';
  import StepDetails from './StepDetails.svelte';
  import StepReview from './StepReview.svelte';
  import Confirmation from './Confirmation.svelte';
  import Summary from './Summary.svelte';
  import { BookingState, steps } from './state.svelte';
  import { treatmentById, type CategoryId } from '../../data/services';
  import type { StaffId } from '../../data/team';
  import { formatDuration } from '../../lib/booking';

  interface Props {
    photos?: Partial<Record<StaffId, string>>;
  }

  let { photos = {} }: Props = $props();

  const booking = new BookingState();
  let root = $state<HTMLElement>();
  let heading = $state<HTMLHeadingElement>();
  let sheet = $state<HTMLDialogElement>();
  let isDesktop = $state(true);
  let submitting = $state(false);
  let direction = $state(1);
  let ready = $state(false);
  // Anzahl eigener History-Einträge – damit «Zurück» nie die Seite verlässt
  let depth = 0;

  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const total = new Tween(0, { duration: 500, easing: cubicOut });
  $effect(() => {
    total.target = booking.price?.total ?? 0;
  });

  const subtitles = $derived([
    'Nails, Lashes oder Brows – starte mit dem, worauf du Lust hast.',
    'Jede Behandlung ist verständlich erklärt. Die Preise sind Grundpreise inklusive Beratung.',
    booking.treatment?.visual === 'hand' || booking.treatment?.visual === 'toes'
      ? 'Wähle Form, Länge, Farbe und Finish – die Vorschau zeigt dir sofort, wie deine Nägel aussehen.'
      : booking.treatment?.category === 'lashes'
        ? 'Probiere Technik, Look, Schwung und Länge aus – die Vorschau reagiert direkt auf jede Wahl.'
        : 'Wähle Technik und Farbton – mit dem Vorher-Nachher-Vergleich siehst du den Unterschied sofort.',
    'Alle drei Inhaberinnen sind Expertinnen in ihrem Bereich.',
    'Grün markierte Tage haben freie Termine. Die Uhrzeiten passen bereits zur Dauer deiner Behandlung.',
    'Wir brauchen nur das Nötigste, um dich bei Fragen zum Termin zu erreichen.',
    'Prüfe deine Auswahl in Ruhe. Mit dem letzten Klick buchst du den Termin (in dieser Demo ohne echte Reservierung).',
  ]);

  async function goTo(n: number, push = true) {
    if (n === booking.step) return;
    const target = Math.max(0, Math.min(n, booking.furthest, steps.length - 1));
    direction = target > booking.step ? 1 : -1;
    booking.step = target;
    if (push) {
      history.pushState({ bookingStep: target }, '');
      depth++;
    }
    await tick();
    const top = root ? root.getBoundingClientRect().top + window.scrollY - 90 : 0;
    if (window.scrollY > top) window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
    heading?.focus({ preventScroll: true });
  }

  function next() {
    if (booking.canContinue()) goTo(booking.step + 1);
  }

  function back() {
    if (booking.step === 0) return;
    if (depth > 0) {
      history.back();
    } else {
      goTo(booking.step - 1, false);
      history.replaceState({ bookingStep: booking.step }, '');
    }
  }

  async function confirm() {
    submitting = true;
    await new Promise((r) => setTimeout(r, reduced ? 200 : 1400));
    const code = `MT-${new Date().getFullYear().toString().slice(2)}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    booking.confirmed = { code };
    submitting = false;
    history.replaceState({ bookingStep: booking.step, confirmed: true }, '');
    await tick();
    root?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  }

  function restart() {
    depth = 0;
    booking.reset();
    history.replaceState({ bookingStep: 0 }, '');
    goTo(0, false);
    root?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  }

  const nextLabel = $derived.by(() => {
    switch (booking.step) {
      case 0:
        return 'Weiter zur Behandlung';
      case 1:
        return 'Weiter zur Gestaltung';
      case 2:
        return 'Weiter zur Artist';
      case 3:
        return 'Weiter zum Termin';
      case 4:
        return 'Weiter zu deinen Angaben';
      case 5:
        return 'Weiter zur Übersicht';
      default:
        return 'Termin verbindlich buchen';
    }
  });

  const blockedHint = $derived.by(() => {
    if (booking.canContinue()) return '';
    return [
      'Wähle eine Kategorie.',
      'Wähle eine Behandlung.',
      '',
      '',
      'Wähle einen Tag und eine Uhrzeit.',
      '',
      '',
    ][booking.step];
  });

  function openSheet() {
    sheet?.showModal();
  }

  onMount(() => {
    const mq = window.matchMedia('(min-width: 1100px)');
    isDesktop = mq.matches;
    const onMq = (e: MediaQueryListEvent) => (isDesktop = e.matches);
    mq.addEventListener('change', onMq);

    // Vorauswahl über Links von den Leistungsseiten, z. B. /buchen?behandlung=gel-neuset
    const params = new URLSearchParams(location.search);
    const tid = params.get('behandlung');
    const cat = params.get('kategorie') as CategoryId | null;
    const artist = params.get('artist') as StaffId | null;
    if (artist && ['noemi', 'alessia', 'lea'].includes(artist)) booking.staff = artist;
    if (tid && treatmentById[tid]) {
      booking.chooseTreatment(tid);
      // Optionen aus den Guides übernehmen, z. B. &shape=almond&length=long
      for (const g of treatmentById[tid].groups) {
        const v = params.get(g.id);
        if (v && g.choices.some((c) => c.id === v)) booking.choose(g.id, v);
      }
      booking.notice = null;
      booking.step = 2;
    } else if (cat && ['nails', 'lashes', 'brows'].includes(cat)) {
      booking.chooseCategory(cat);
      booking.step = 1;
    }
    history.replaceState({ bookingStep: booking.step }, '');

    const onPop = (e: PopStateEvent) => {
      const s = e.state?.bookingStep;
      if (typeof s === 'number') {
        if (booking.confirmed) booking.confirmed = null;
        depth = s < booking.step ? Math.max(0, depth - 1) : depth + 1;
        goTo(s, false);
      }
    };
    window.addEventListener('popstate', onPop);
    ready = true;
    return () => {
      mq.removeEventListener('change', onMq);
      window.removeEventListener('popstate', onPop);
    };
  });

  const current = $derived(steps[booking.step]);
</script>

<section class="booking" class:is-ready={ready} bind:this={root} aria-label="Online-Terminbuchung">
  {#if booking.confirmed}
    <Confirmation {booking} onrestart={restart} />
  {:else}
    <nav class="progress" aria-label="Buchungsschritte">
      <ol>
        {#each steps as s, i (s.id)}
          <li class:is-done={i < booking.step} class:is-current={i === booking.step}>
            <button
              type="button"
              disabled={i > booking.furthest || i === booking.step}
              aria-current={i === booking.step ? 'step' : undefined}
              onclick={() => goTo(i)}
            >
              <span class="progress__num" aria-hidden="true">
                {#if i < booking.step}
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.2"
                    stroke-linecap="round"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg
                  >
                {:else}{i + 1}{/if}
              </span>
              <span class="progress__label">{s.label}</span>
            </button>
          </li>
        {/each}
      </ol>
      <div class="progress__bar" aria-hidden="true">
        <span style="width: {((booking.step + 1) / steps.length) * 100}%"></span>
      </div>
    </nav>

    <div class="layout" class:layout--wide={booking.step === 0}>
      <div class="main">
        <header class="step-head">
          <div class="step-head__top">
            <p class="eyebrow">Schritt {booking.step + 1} von {steps.length} · {current.label}</p>
            {#if booking.step > 0}
              <button type="button" class="back" onclick={back}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                  aria-hidden="true"><path d="m15 6-6 6 6 6" /></svg
                >
                Zurück
              </button>
            {/if}
          </div>
          <h2 tabindex="-1" bind:this={heading}>
            {booking.step === 1 && booking.categoryInfo
              ? `${booking.categoryInfo.name}: ${current.title}`
              : current.title}
          </h2>
          <p class="step-head__sub">{subtitles[booking.step]}</p>
        </header>

        {#key booking.step}
          <div
            class="step"
            in:fly={{ x: reduced ? 0 : 26 * direction, duration: reduced ? 0 : 420, opacity: 0 }}
          >
            {#if booking.step === 0}
              <StepCategory {booking} onnext={next} />
            {:else if booking.step === 1}
              <StepTreatment {booking} onnext={next} />
            {:else if booking.step === 2}
              <StepConfigure {booking} showVisual={!isDesktop} />
            {:else if booking.step === 3}
              <StepStaff {booking} {photos} />
            {:else if booking.step === 4}
              <StepDate {booking} />
            {:else if booking.step === 5}
              <StepDetails {booking} onnext={next} />
            {:else}
              <StepReview {booking} ongoto={goTo} />
            {/if}
          </div>
        {/key}

        <div class="step-nav">
          {#if booking.step > 0}
            <button type="button" class="btn btn--outline" onclick={back}>Zurück</button>
          {:else}
            <span></span>
          {/if}
          {#if booking.step === 6}
            <button
              type="button"
              class="btn btn--accent btn--confirm"
              onclick={confirm}
              disabled={submitting}
            >
              {#if submitting}
                <span class="spinner" aria-hidden="true"></span> Termin wird reserviert …
              {:else}
                Termin verbindlich buchen
              {/if}
            </button>
          {:else if booking.step === 5}
            <button type="submit" form="details-form" class="btn">
              {nextLabel}
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
          {:else if booking.step > 1 || booking.canContinue()}
            <button type="button" class="btn" onclick={next} disabled={!booking.canContinue()}>
              {nextLabel}
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
          {/if}
        </div>
        {#if blockedHint && booking.step === 4}
          <p class="blocked" aria-live="polite">{blockedHint}</p>
        {/if}
        {#if booking.step === 6}
          <p class="demo-hint">
            Demo: Es wird keine echte Buchung ausgelöst und nichts übertragen.
          </p>
        {/if}
      </div>

      {#if booking.step > 0 && isDesktop}
        <aside class="aside" aria-label="Zusammenfassung deiner Auswahl">
          <div class="aside__inner">
            <Summary
              {booking}
              large={booking.step === 2}
              ongoto={booking.step > 2 ? goTo : undefined}
            />
          </div>
        </aside>
      {/if}
    </div>

    {#if !isDesktop && booking.treatment}
      <div class="mobile-bar">
        <button type="button" class="mobile-bar__info" onclick={openSheet} aria-haspopup="dialog">
          <span class="mobile-bar__total">CHF {Math.round(total.current)}.–</span>
          <span class="mobile-bar__meta">
            {formatDuration(booking.price?.minutes ?? 0)} · Details
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
              aria-hidden="true"><path d="m6 15 6-6 6 6" /></svg
            >
          </span>
        </button>
        {#if booking.step === 6}
          <button type="button" class="btn btn--accent" onclick={confirm} disabled={submitting}>
            {submitting ? 'Reserviere …' : 'Verbindlich buchen'}
          </button>
        {:else if booking.step === 5}
          <button type="submit" form="details-form" class="btn">Weiter</button>
        {:else if booking.step >= 2}
          <button type="button" class="btn" onclick={next} disabled={!booking.canContinue()}
            >Weiter</button
          >
        {/if}
      </div>
    {/if}
  {/if}
</section>

<dialog
  class="sheet"
  bind:this={sheet}
  aria-label="Deine Auswahl"
  onclick={(e) => e.target === sheet && sheet?.close()}
>
  <div class="sheet__inner">
    <button
      type="button"
      class="sheet__close"
      onclick={() => sheet?.close()}
      aria-label="Schliessen"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg
      >
    </button>
    <Summary {booking} showVisual={booking.step !== 2} />
  </div>
</dialog>

<style>
  .booking {
    position: relative;
    min-height: 60vh;
  }

  /* Fortschritt */
  .progress {
    margin-bottom: 2.2rem;
  }

  .progress ol {
    list-style: none;
    margin: 0;
    padding: 0;
    display: none;
    gap: 0.4rem;
    counter-reset: step;
  }

  .progress li {
    flex: 1;
    position: relative;
  }

  .progress li:not(:last-child)::after {
    content: '';
    position: absolute;
    top: 1.05rem;
    left: calc(2.1rem + 0.6rem);
    right: 0.4rem;
    height: 1px;
    background: var(--line-strong);
  }

  .progress li.is-done::after {
    background: var(--gold-500);
  }

  .progress button {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    border: 0;
    background: none;
    padding: 0;
    color: var(--text-muted);
    font-size: 0.85rem;
    position: relative;
    z-index: 1;
  }

  .progress button:disabled {
    cursor: default;
  }

  .progress__num {
    width: 2.1rem;
    height: 2.1rem;
    flex: none;
    display: grid;
    place-items: center;
    border-radius: 50%;
    border: 1px solid var(--line-strong);
    background: var(--porcelain);
    font-weight: 500;
    font-size: 0.85rem;
    transition:
      background-color 0.3s,
      color 0.3s,
      border-color 0.3s;
  }

  .progress__num svg {
    width: 1rem;
  }

  .progress__label {
    padding-right: 0.5rem;
    background: var(--porcelain);
  }

  .is-done .progress__num {
    background: var(--gold-200);
    border-color: var(--gold-400);
    color: var(--gold-600);
  }

  .is-done button:hover .progress__label {
    color: var(--plum-900);
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .is-current .progress__num {
    background: var(--plum-900);
    border-color: var(--plum-900);
    color: var(--porcelain);
  }

  .is-current button {
    color: var(--plum-900);
    font-weight: 500;
  }

  .progress__bar {
    height: 3px;
    border-radius: 3px;
    background: var(--blush-100);
    overflow: hidden;
  }

  .progress__bar span {
    display: block;
    height: 100%;
    background: linear-gradient(90deg, var(--rose-400), var(--berry-700));
    border-radius: 3px;
    transition: width 0.6s var(--ease-out);
  }

  @media (min-width: 960px) {
    .progress ol {
      display: flex;
    }

    .progress__bar {
      display: none;
    }
  }

  /* Layout */
  .layout {
    display: grid;
    gap: 2.5rem;
    align-items: start;
  }

  @media (min-width: 1100px) {
    .layout {
      grid-template-columns: minmax(0, 1fr) 380px;
      gap: 3rem;
    }

    .layout--wide {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  @media (min-width: 1280px) {
    .layout {
      grid-template-columns: minmax(0, 1fr) 410px;
    }
  }

  .main {
    min-width: 0;
  }

  .step-head {
    display: grid;
    gap: 0.5rem;
    margin-bottom: 1.8rem;
  }

  .step-head__top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }

  .step-head h2 {
    font-size: var(--step-3);
  }

  .step-head h2:focus {
    outline: none;
  }

  .step-head__sub {
    color: var(--text-soft);
    max-width: 42rem;
  }

  .back {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    border: 0;
    background: none;
    padding: 0.3rem 0;
    font-size: 0.88rem;
    color: var(--text-soft);
  }

  .back svg {
    width: 1rem;
  }

  .back:hover {
    color: var(--plum-900);
  }

  .step-nav {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    margin-top: 2.4rem;
    padding-top: 1.6rem;
    border-top: 1px solid var(--line);
  }

  .blocked,
  .demo-hint {
    margin-top: 0.8rem;
    text-align: right;
    font-size: 0.85rem;
    color: var(--text-muted);
  }

  .spinner {
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.35);
    border-top-color: #fff;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .aside {
    position: sticky;
    top: calc(var(--header-h) + 1.2rem);
    max-height: calc(100vh - var(--header-h) - 2.4rem);
    overflow-y: auto;
    border-radius: var(--radius-l);
    background: var(--white);
    box-shadow: var(--shadow-m);
    scrollbar-width: thin;
  }

  .aside__inner {
    padding: 1.4rem;
  }

  /* Mobile */
  .mobile-bar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 60;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.75rem var(--gutter) calc(0.75rem + env(safe-area-inset-bottom));
    background: rgba(252, 248, 245, 0.94);
    backdrop-filter: blur(14px);
    border-top: 1px solid var(--line);
    box-shadow: 0 -12px 30px -20px rgba(51, 24, 42, 0.35);
    animation: bar-in 0.5s var(--ease-out);
  }

  @keyframes bar-in {
    from {
      transform: translateY(100%);
    }
  }

  .mobile-bar__info {
    display: grid;
    text-align: left;
    border: 0;
    background: none;
    padding: 0;
  }

  .mobile-bar__total {
    font-family: var(--font-display);
    font-size: 1.35rem;
    line-height: 1.1;
    font-variant-numeric: tabular-nums;
  }

  .mobile-bar__meta {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.78rem;
    color: var(--text-muted);
  }

  .mobile-bar__meta svg {
    width: 0.9rem;
  }

  .mobile-bar .btn {
    min-width: 8.5rem;
  }

  @media (max-width: 1099px) {
    .booking {
      padding-bottom: 5rem;
    }

    .step-nav {
      display: none;
    }

    .demo-hint {
      text-align: left;
    }
  }

  .sheet {
    width: 100%;
    max-width: 560px;
    max-height: 88vh;
    margin: auto auto 0;
    padding: 0;
    border: 0;
    border-radius: 28px 28px 0 0;
    background: var(--porcelain);
    color: var(--text);
    box-shadow: var(--shadow-l);
  }

  .sheet[open] {
    animation: sheet-in 0.4s var(--ease-out);
  }

  @keyframes sheet-in {
    from {
      transform: translateY(40%);
      opacity: 0;
    }
  }

  .sheet::backdrop {
    background: rgba(51, 24, 42, 0.45);
    backdrop-filter: blur(2px);
  }

  .sheet__inner {
    position: relative;
    padding: 1.6rem var(--gutter) calc(1.6rem + env(safe-area-inset-bottom));
  }

  .sheet__close {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 2.4rem;
    height: 2.4rem;
    display: grid;
    place-items: center;
    border-radius: 50%;
    border: 1px solid var(--line);
    background: var(--white);
  }

  .sheet__close svg {
    width: 1.1rem;
  }
</style>
