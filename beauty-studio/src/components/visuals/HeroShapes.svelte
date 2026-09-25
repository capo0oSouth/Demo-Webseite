<script lang="ts">
  import { onMount } from 'svelte';
  import NailVisual from './NailVisual.svelte';

  const looks = [
    {
      shape: 'almond',
      length: 'medium',
      color: '#D6969C',
      finish: 'solid',
      label: 'Mandel · Rosé',
    },
    {
      shape: 'square',
      length: 'short',
      color: '#F3ECE6',
      finish: 'french',
      label: 'Eckig · French',
    },
    {
      shape: 'coffin',
      length: 'long',
      color: '#5A1426',
      finish: 'solid',
      label: 'Ballerina · Bordeaux',
    },
    {
      shape: 'oval',
      length: 'short',
      color: '#F0CFCC',
      finish: 'solid',
      label: 'Oval · Ballet Pink',
    },
    {
      shape: 'stiletto',
      length: 'long',
      color: '#A26B7A',
      finish: 'chrome',
      label: 'Stiletto · Chrome',
    },
    {
      shape: 'squoval',
      length: 'natural',
      color: '#A3182D',
      finish: 'solid',
      label: 'Squoval · Cherry',
    },
  ];

  let i = $state(0);
  let paused = $state(false);
  const look = $derived(looks[i]);

  onMount(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => {
      if (!paused && document.visibilityState === 'visible') i = (i + 1) % looks.length;
    }, 2600);
    return () => clearInterval(id);
  });
</script>

<div
  class="hero-shapes"
  role="group"
  aria-label="Beispiel-Looks"
  onmouseenter={() => (paused = true)}
  onmouseleave={() => (paused = false)}
>
  <div class="hero-shapes__visual">
    <NailVisual
      shape={look.shape}
      length={look.length}
      color={look.color}
      finish={look.finish}
      label="Beispiel-Look: {look.label}"
    />
  </div>
  <div class="hero-shapes__meta">
    <span class="hero-shapes__label">Live-Vorschau</span>
    {#key i}
      <span class="hero-shapes__name">{look.label}</span>
    {/key}
    <div class="hero-shapes__dots">
      {#each looks as l, n (l.label)}
        <button
          type="button"
          aria-label="Look {l.label} zeigen"
          aria-pressed={n === i}
          onclick={() => ((i = n), (paused = true))}
        ></button>
      {/each}
    </div>
  </div>
</div>

<style>
  .hero-shapes {
    display: grid;
    grid-template-columns: 5.2rem 1fr;
    gap: 0.9rem;
    align-items: center;
    padding: 0.7rem 1.1rem 0.7rem 0.7rem;
    border-radius: 22px;
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(10px);
    box-shadow: var(--shadow-m);
  }

  .hero-shapes__visual {
    aspect-ratio: 1;
    border-radius: 16px;
    background: linear-gradient(160deg, var(--blush-100), var(--cream));
    overflow: hidden;
  }

  .hero-shapes__meta {
    display: grid;
    gap: 0.15rem;
  }

  .hero-shapes__label {
    font-size: 0.64rem;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--gold-600);
  }

  .hero-shapes__name {
    font-family: var(--font-display);
    font-size: 1.05rem;
    white-space: nowrap;
    animation: name-in 0.5s var(--ease-out);
  }

  @keyframes name-in {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
  }

  .hero-shapes__dots {
    display: flex;
    gap: 2px;
    margin-top: 0.3rem;
  }

  .hero-shapes__dots button {
    width: 20px;
    height: 20px;
    padding: 0;
    border: 0;
    background: none;
    display: grid;
    place-items: center;
  }

  .hero-shapes__dots button::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--blush-200);
    transition:
      background-color 0.3s,
      width 0.3s;
  }

  .hero-shapes__dots button[aria-pressed='true']::before {
    width: 16px;
    border-radius: 4px;
    background: var(--berry-700);
  }
</style>
