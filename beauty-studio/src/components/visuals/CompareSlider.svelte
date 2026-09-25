<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    before: Snippet;
    after: Snippet;
    label?: string;
    start?: number;
  }

  let { before, after, label = 'Vorher-Nachher-Vergleich', start = 50 }: Props = $props();

  // svelte-ignore state_referenced_locally
  let pos = $state(start);
  let el = $state<HTMLDivElement>();
  let dragging = $state(false);

  function setFromEvent(e: PointerEvent) {
    if (!el) return;
    const r = el.getBoundingClientRect();
    pos = Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100));
  }

  function down(e: PointerEvent) {
    dragging = true;
    el?.setPointerCapture(e.pointerId);
    setFromEvent(e);
  }

  function move(e: PointerEvent) {
    if (dragging) setFromEvent(e);
  }

  function up() {
    dragging = false;
  }
</script>

<div
  class="compare"
  class:is-dragging={dragging}
  bind:this={el}
  style="--pos: {pos}%"
  onpointerdown={down}
  onpointermove={move}
  onpointerup={up}
  onpointercancel={up}
  role="group"
  aria-label={label}
>
  <div class="compare__layer">{@render before()}</div>
  <div class="compare__layer compare__layer--after">{@render after()}</div>

  <span class="tag tag--before" aria-hidden="true">Vorher</span>
  <span class="tag tag--after" aria-hidden="true">Nachher</span>

  <div class="handle" aria-hidden="true">
    <span class="handle__knob">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"><path d="m9 7-5 5 5 5M15 7l5 5-5 5" /></svg
      >
    </span>
  </div>
  <input
    class="range"
    type="range"
    min="0"
    max="100"
    step="1"
    bind:value={pos}
    aria-label="Vergleich verschieben: links Vorher, rechts Nachher"
    aria-valuetext="{Math.round(100 - pos)} % Nachher sichtbar"
  />
</div>

<style>
  .compare {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    touch-action: pan-y;
    user-select: none;
    cursor: ew-resize;
  }

  .compare__layer {
    position: absolute;
    inset: 0;
  }

  .compare__layer--after {
    clip-path: inset(0 0 0 var(--pos));
  }

  .compare:not(.is-dragging) .compare__layer--after {
    transition: clip-path 0.08s linear;
  }

  .handle {
    position: absolute;
    top: 0;
    bottom: 0;
    left: var(--pos);
    width: 2px;
    translate: -1px 0;
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 0 12px rgba(51, 24, 42, 0.25);
    pointer-events: none;
  }

  .handle__knob {
    position: absolute;
    top: 50%;
    left: 50%;
    translate: -50% -50%;
    width: 2.8rem;
    height: 2.8rem;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: var(--white);
    color: var(--plum-900);
    box-shadow: var(--shadow-m);
    transition: transform 0.25s var(--ease-out);
  }

  .is-dragging .handle__knob {
    transform: scale(1.08);
  }

  .handle__knob svg {
    width: 1.3rem;
  }

  .tag {
    position: absolute;
    bottom: 0.8rem;
    padding: 0.25rem 0.7rem;
    border-radius: var(--radius-pill);
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(6px);
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--plum-900);
    pointer-events: none;
  }

  .tag--before {
    left: 0.8rem;
  }

  .tag--after {
    right: 0.8rem;
  }

  .range {
    position: absolute;
    inset: auto 0 0 0;
    width: 100%;
    height: 100%;
    margin: 0;
    opacity: 0;
    cursor: ew-resize;
    pointer-events: none;
  }

  .range:focus-visible {
    opacity: 0;
  }

  .compare:has(.range:focus-visible) {
    outline: 2px solid var(--focus);
    outline-offset: 3px;
  }
</style>
