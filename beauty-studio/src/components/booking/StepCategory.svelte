<script lang="ts">
  import NailVisual from '../visuals/NailVisual.svelte';
  import EyeVisual from '../visuals/EyeVisual.svelte';
  import { categories, treatmentsFor, type CategoryId } from '../../data/services';
  import type { BookingState } from './state.svelte';

  interface Props {
    booking: BookingState;
    onnext: () => void;
  }

  let { booking, onnext }: Props = $props();

  const fromPrice = (id: CategoryId) => Math.min(...treatmentsFor(id).map((t) => t.price));

  function pick(id: CategoryId) {
    booking.chooseCategory(id);
    onnext();
  }
</script>

<div class="cats">
  {#each categories as cat, i (cat.id)}
    <button
      type="button"
      class="cat"
      class:is-active={booking.category === cat.id}
      style="--i: {i}"
      onclick={() => pick(cat.id)}
    >
      <span class="cat__visual" aria-hidden="true">
        {#if cat.id === 'nails'}
          <NailVisual shape="almond" length="medium" color="#D6969C" instant />
        {:else if cat.id === 'lashes'}
          <EyeVisual focus="lashes" lashMode="extension" technique="volume" look="cat" instant />
        {:else}
          <EyeVisual focus="brows" browMode="lamination" browTinted browColor="#5A3F30" instant />
        {/if}
      </span>
      <span class="cat__body">
        <span class="cat__name">{cat.name}</span>
        <span class="cat__intro">{cat.intro}</span>
        <span class="cat__meta">
          <span>{treatmentsFor(cat.id).length} Behandlungen</span>
          <span>ab CHF {fromPrice(cat.id)}.–</span>
        </span>
      </span>
      <span class="cat__cta" aria-hidden="true">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"><path d="M4 12h15M13 6l6 6-6 6" /></svg
        >
      </span>
    </button>
  {/each}
</div>

<style>
  .cats {
    display: grid;
    gap: 1rem;
  }

  .cat {
    position: relative;
    display: grid;
    grid-template-columns: 1fr;
    text-align: left;
    padding: 0;
    border: 1px solid var(--line);
    border-radius: var(--radius-l);
    background: var(--white);
    overflow: hidden;
    box-shadow: var(--shadow-s);
    transition:
      transform 0.45s var(--ease-out),
      box-shadow 0.45s var(--ease-out),
      border-color 0.3s;
    animation: rise 0.7s var(--ease-out) both;
    animation-delay: calc(var(--i) * 90ms);
  }

  @keyframes rise {
    from {
      opacity: 0;
      transform: translateY(18px);
    }
  }

  .cat:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-m);
    border-color: var(--rose-400);
  }

  .cat.is-active {
    border-color: var(--plum-900);
  }

  .cat__visual {
    display: block;
    aspect-ratio: 1.6;
    background: linear-gradient(160deg, var(--blush-100), var(--cream));
    overflow: hidden;
  }

  .cat__visual :global(svg) {
    width: 100%;
    height: 100%;
    transition: transform 0.9s var(--ease-out);
  }

  .cat:hover .cat__visual :global(svg) {
    transform: scale(1.04);
  }

  .cat__body {
    display: grid;
    gap: 0.45rem;
    padding: 1.2rem 1.4rem 1.4rem;
  }

  .cat__name {
    font-family: var(--font-display);
    font-size: 1.9rem;
    line-height: 1;
    font-weight: 360;
  }

  .cat__intro {
    color: var(--text-soft);
    font-size: 0.95rem;
    line-height: 1.5;
  }

  .cat__meta {
    display: flex;
    gap: 1rem;
    font-size: 0.8rem;
    font-weight: 500;
    letter-spacing: 0.04em;
    color: var(--gold-600);
    text-transform: uppercase;
  }

  .cat__cta {
    position: absolute;
    right: 1.1rem;
    bottom: 1.2rem;
    width: 2.6rem;
    height: 2.6rem;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: var(--plum-900);
    color: var(--porcelain);
    transition: transform 0.4s var(--ease-out);
  }

  .cat__cta svg {
    width: 1.1rem;
  }

  .cat:hover .cat__cta {
    transform: translateX(4px);
  }

  @media (min-width: 760px) {
    .cats {
      grid-template-columns: repeat(3, 1fr);
    }

    .cat__body {
      padding-bottom: 4.4rem;
    }
  }

  @media (max-width: 759px) {
    .cat {
      grid-template-columns: 42% 1fr;
    }

    .cat__visual {
      aspect-ratio: auto;
      height: 100%;
      min-height: 8.5rem;
    }

    .cat__visual :global(svg) {
      height: 100%;
      width: 100%;
    }

    .cat__body {
      padding: 1rem 3.6rem 1rem 1rem;
    }

    .cat__name {
      font-size: 1.55rem;
    }

    .cat__intro {
      font-size: 0.85rem;
    }

    .cat__meta {
      flex-direction: column;
      gap: 0.1rem;
      font-size: 0.72rem;
    }

    .cat__cta {
      right: 0.9rem;
      bottom: auto;
      top: 50%;
      translate: 0 -50%;
      width: 2.2rem;
      height: 2.2rem;
    }
  }
</style>
