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
  items.forEach((el) => observer.observe(el));
}

init();
