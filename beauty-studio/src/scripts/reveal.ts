/** Blendet Elemente mit .reveal / .reveal-mask beim Scrollen sanft ein. */
const selector = '.reveal, .reveal-mask';

function init() {
  const items = Array.from(document.querySelectorAll<HTMLElement>(selector)).filter(
    (el) => !el.classList.contains('is-visible'),
  );
  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
  );

  // Eine .reveal-mask ist per clip-path vollständig abgedeckt. Chromium rechnet den eigenen
  // clip-path mit ein, ihr Sichtbarkeitsanteil bleibt also 0 – deshalb das Elternelement beobachten.
  const masksByParent = new Map<Element, HTMLElement[]>();
  const maskObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          masksByParent.get(entry.target)?.forEach((el) => el.classList.add('is-visible'));
          maskObserver.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0 },
  );

  for (const el of items) {
    const parent = el.parentElement;
    if (el.classList.contains('reveal-mask') && parent) {
      masksByParent.set(parent, [...(masksByParent.get(parent) ?? []), el]);
    } else {
      observer.observe(el);
    }
  }
  masksByParent.forEach((_, parent) => maskObserver.observe(parent));
}

init();
