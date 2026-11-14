const deck = document.querySelector('.feedback-deck');
const track = deck?.querySelector('.feedback-track');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

if (track) {
  const advanceDelay = 4500;
  const cards = [...track.children];
  let timer;
  let visible = false;
  let direction = 1;
  let pointerActive = false;

  function shift(direction) {
    const current = track.scrollLeft;
    const start = cards[0].getBoundingClientRect().left;
    const max = track.scrollWidth - track.clientWidth;
    const stops = cards.map(card => Math.min(max, card.getBoundingClientRect().left - start));
    const next = direction > 0 ? stops.find(stop => stop > current + 2) : stops.findLast(stop => stop < current - 2);
    if (next === undefined) return false;
    track.scrollTo({ left: next, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    return true;
  }

  function schedule() {
    clearTimeout(timer);
    if (!visible || pointerActive || reducedMotion.matches || document.hidden || deck.matches(':hover, :focus-within') || track.scrollWidth <= track.clientWidth) return;
    timer = setTimeout(() => {
      if (!shift(direction)) {
        direction *= -1;
        shift(direction);
      }
      schedule();
    }, advanceDelay);
  }

  function releasePointer() {
    if (!pointerActive) return;
    pointerActive = false;
    schedule();
  }

  track.addEventListener('keydown', event => {
    if (event.target !== track || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    shift(event.key === 'ArrowRight' ? 1 : -1);
  });
  deck.addEventListener('focusin', schedule);
  deck.addEventListener('focusout', () => requestAnimationFrame(schedule));
  deck.addEventListener('pointerdown', () => {
    pointerActive = true;
    schedule();
  }, { passive: true });
  window.addEventListener('pointerup', releasePointer);
  window.addEventListener('pointercancel', releasePointer);
  track.addEventListener('wheel', event => {
    if (event.deltaX || event.shiftKey) schedule();
  }, { passive: true });
  deck.addEventListener('mouseenter', schedule);
  deck.addEventListener('mouseleave', schedule);
  document.addEventListener('visibilitychange', schedule);
  reducedMotion.addEventListener('change', schedule);
  new ResizeObserver(schedule).observe(track);
  new IntersectionObserver(([entry]) => {
    visible = entry.intersectionRatio >= .55;
    schedule();
  }, { threshold: .55 }).observe(track);
  deck.dataset.enhanced = '';
}

const summary = document.querySelector('.feedback-summary');
if (summary && !reducedMotion.matches) {
  const counters = [...summary.querySelectorAll('[data-scenario-total]')].map(node => ({ node, total: Number(node.textContent) }));
  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    observer.disconnect();
    if (reducedMotion.matches) return;

    const start = performance.now();
    function draw(time) {
      const progress = Math.min(1, (time - start) / 1100);
      const fraction = reducedMotion.matches ? 1 : 1 - (1 - progress) ** 3;
      for (const { node, total } of counters) node.textContent = Math.round(fraction * total);
      if (fraction < 1) requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }, { threshold: .55 });
  observer.observe(summary);
}
