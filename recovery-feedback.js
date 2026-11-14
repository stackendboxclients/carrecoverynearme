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

const stats = document.querySelector('.feedback-preview-stats');
if (stats && !reducedMotion.matches) {
  const count = stats.querySelector('[data-feedback-count]');
  const score = stats.querySelector('[data-feedback-score]');
  const stars = stats.querySelector('.feedback-stars-fill');
  const countText = count.textContent;
  const scoreText = score.textContent;
  const total = Number(countText.replaceAll(',', ''));
  const rating = Number(scoreText);
  const formatter = new Intl.NumberFormat('en');

  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    observer.disconnect();
    if (reducedMotion.matches) return;

    const start = performance.now();
    function draw(time) {
      const progress = Math.min(1, Math.max(0, (time - start) / 1450));
      if (progress === 1 || reducedMotion.matches) {
        count.textContent = countText;
        score.textContent = scoreText;
        stars.style.width = `${rating / 5 * 100}%`;
        return;
      }

      const eased = 1 - (1 - progress) ** 3;
      count.textContent = formatter.format(Math.floor(total * eased));
      score.textContent = (rating * eased).toFixed(1);
      stars.style.width = `${rating * eased / 5 * 100}%`;
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }, { threshold: .55 });
  observer.observe(stats);
}

if (track && !reducedMotion.matches) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.intersectionRatio < .6) continue;
      observer.unobserve(entry.target);
      if (reducedMotion.matches) continue;

      const stars = entry.target.querySelector('.feedback-stars-fill');
      if (stars) stars.animate([{ width: 0 }, { width: stars.style.width }], { duration: 620, easing: 'ease-out' });
    }
  }, { root: track, threshold: .6 });
  for (const card of track.children) observer.observe(card);
}
