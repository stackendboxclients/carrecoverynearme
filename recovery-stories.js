const section = document.querySelector('.recovery-stories');
if (section) {
  const rail = section.querySelector('.stories-rail');
  const cards = [...rail.querySelectorAll('.story-card')];
  const dialog = section.querySelector('.story-dialog');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let selected = 0, cycle = 0, popupTimer = 0, scrollTimer = 0;
  let visible = false, paused = false, pointer = null, suppressClick = false, automaticUntil = 0;
  function stop() { clearTimeout(cycle); }
  function schedule(delay = 2000) {
    stop();
    if (visible && !document.hidden && !dialog.open && !paused && !pointer && !reduced.matches) cycle = setTimeout(() => move(1), delay);
  }
  function paint(index) {
    selected = (index + cards.length) % cards.length;
    cards.forEach((card, i) => {
      card.dataset.active = String(i === selected);
      card.setAttribute('aria-current', String(i === selected));
      if (i === selected || i === (selected + 1) % cards.length) card.querySelector('img').loading = 'eager';
    });
    section.style.setProperty('--story-background', `url("${cards[selected].querySelector('img').getAttribute('src')}")`);
    section.querySelector('[data-story-position]').textContent = `${String(selected + 1).padStart(2,'0')} / ${cards.length}`;
  }
  function move(direction, manual = false) {
    paint(selected + direction);
    automaticUntil = performance.now() + 1000;
    const card = cards[selected];
    rail.scrollTo({ left: card.offsetLeft - (rail.clientWidth - card.offsetWidth) / 2, behavior: reduced.matches ? 'instant' : 'smooth' });
    schedule(manual ? 5000 : 2000);
  }
  function closePopup() {
    clearTimeout(popupTimer);
    if (!dialog.open) return;
    dialog.close();
    move(1);
  }
  function openPopup(index) {
    stop();
    paint(index);
    const card = cards[selected];
    const image = dialog.querySelector('.story-dialog-image');
    image.src = card.querySelector('img').src;
    image.alt = card.querySelector('strong').textContent;
    dialog.querySelector('#story-dialog-title').textContent = image.alt;
    dialog.querySelector('#story-dialog-description').textContent = card.querySelector('.story-description').textContent;
    dialog.querySelector('.story-dialog-route').replaceChildren(card.querySelector('.story-route').cloneNode(true));
    dialog.showModal();
    popupTimer = setTimeout(closePopup, 5000);
  }
  cards.forEach((card,index) => card.addEventListener('click', () => {
    if (suppressClick) { suppressClick = false; return; }
    openPopup(index);
  }));
  dialog.addEventListener('click', closePopup);
  dialog.addEventListener('cancel', event => { event.preventDefault(); closePopup(); });
  rail.addEventListener('pointerdown', event => { stop(); pointer = { id: event.pointerId, x: event.clientX, y: event.clientY }; suppressClick = false; });
  window.addEventListener('pointerup', event => {
    if (!pointer || pointer.id !== event.pointerId) return;
    suppressClick = Math.hypot(event.clientX-pointer.x,event.clientY-pointer.y) > 10;
    pointer = null; schedule(5000);
  }, { passive:true });
  rail.addEventListener('pointercancel', () => { pointer = null; suppressClick = true; schedule(5000); }, { passive:true });
  rail.addEventListener('scroll', () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      const center = rail.scrollLeft + rail.clientWidth / 2;
      const nearest = cards.reduce((best,card,i) => Math.abs(card.offsetLeft+card.offsetWidth/2-center) < Math.abs(cards[best].offsetLeft+cards[best].offsetWidth/2-center) ? i : best, 0);
      paint(nearest);
      if (performance.now() > automaticUntil) schedule(5000);
    }, 100);
  }, { passive:true });
  section.querySelector('.stories-prev').addEventListener('click', () => move(-1,true));
  section.querySelector('.stories-next').addEventListener('click', () => move(1,true));
  rail.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1,true); }
    if (event.key === ' ' && event.target === rail) { event.preventDefault(); paused = !paused; schedule(); }
  });
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; schedule(); }, {threshold:.15}).observe(rail);
  document.addEventListener('visibilitychange', () => schedule());
  reduced.addEventListener('change', () => schedule());
  paint(0);
}
