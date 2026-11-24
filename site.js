const mobileMenu = document.querySelector('.mobile-menu');
mobileMenu?.addEventListener('click', event => {
  if (event.target.closest('a')) mobileMenu.open = false;
});
mobileMenu?.addEventListener('keydown', event => {
  if (event.key !== 'Escape' || !mobileMenu.open) return;
  mobileMenu.open = false;
  mobileMenu.querySelector('summary').focus();
});

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const closingImage = document.querySelector('.closing-recovery-image');
if (closingImage && 'IntersectionObserver' in window) {
  const visibleEndSurfaces = new Set();
  const endObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) visibleEndSurfaces.add(entry.target);
      else visibleEndSurfaces.delete(entry.target);
    }
    document.body.classList.toggle('viewing-closing-recovery', visibleEndSurfaces.size > 0);
  });
  endObserver.observe(closingImage);
  endObserver.observe(document.querySelector('footer'));
}
const hero = document.querySelector('.hero');
if (hero && !reducedMotion.matches) {
  const motion = document.createElement('button');
  motion.type = 'button';
  motion.className = 'motion-control';
  motion.textContent = 'Pause animation';
  motion.addEventListener('click', () => {
    const paused = hero.classList.toggle('motion-paused');
    motion.textContent = paused ? 'Play animation' : 'Pause animation';
  });
  hero.append(motion);
}
const compactLayout = matchMedia('(max-width: 850px)');
const showcase = document.querySelector('.recovery-showcase');
const tape = document.querySelector('.service-tape');
const recoveryContact = document.querySelector('.recovery-contact');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) entry.target.dataset.inView = String(entry.isIntersecting);
  });
  if (tape) observer.observe(tape);
  if (recoveryContact) observer.observe(recoveryContact);
  if (showcase) {
    observer.observe(showcase);
    showcase.querySelectorAll('.showcase-card').forEach(card => observer.observe(card));
  }
}

const deferredSections = new Map([
  ['.recovery-stories', document.querySelector('meta[name="stories-motion"]')?.content],
  ['.recovery-hero', document.querySelector('meta[name="hero-motion"]')?.content],
  ['.recovery-kinetic', document.querySelector('meta[name="kinetic-motion"]')?.content],
  ['#customer-feedback', document.querySelector('meta[name="feedback-motion"]')?.content],
].filter(([, source]) => source));
if (deferredSections.size) {
  const targets = new Map();
  for (const [selector, source] of deferredSections) {
    const section = document.querySelector(selector);
    if (section) targets.set(section, source);
  }
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        const load = () => import(targets.get(entry.target)).catch(() => {
          // Static sections and native controls remain available.
        });
        if (entry.target.matches('.recovery-hero')) {
          // Let the static hero paint before building the canvas and SVG motion.
          requestAnimationFrame(() => requestAnimationFrame(load));
        } else load();
      }
    }, { rootMargin: compactLayout.matches ? '240px 0px' : '480px 0px' });
    for (const section of targets.keys()) observer.observe(section);
  }
}
const form = document.querySelector('#booking');
if (form) {
  const service = new URLSearchParams(location.search).get('service');
  const serviceField = form.elements.namedItem('service');
  const timing = form.elements.namedItem('timing');
  const date = form.elements.namedItem('datetime');
  timing.addEventListener('change', () => {
    const scheduled = timing.value === 'Scheduled pickup';
    document.querySelector('#scheduled').hidden = !scheduled;
    date.required = scheduled;
  });
  if ([...serviceField.options].some(option => option.value === service)) serviceField.value = service;
  const status = document.querySelector('#location-status');
  const pickup = form.elements.namedItem('pickup');
  const locationButton = form.querySelector('#location');
  const pickupMap = form.querySelector('#pickup-map');
  const maxPickupAccuracy = 100;
  let pickupEditVersion = 0;
  pickup.addEventListener('input', () => {
    pickupEditVersion += 1;
    pickupMap.hidden = true;
    status.textContent = '';
  });
  locationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
      status.textContent = 'Location is unavailable in this browser. Enter a landmark or map link.';
      return;
    }
    const requestVersion = pickupEditVersion;
    locationButton.disabled = true;
    status.textContent = 'Looking for your location...';
    navigator.geolocation.getCurrentPosition(({coords}) => {
      locationButton.disabled = false;
      if (pickupEditVersion !== requestVersion) return;
      const { latitude, longitude, accuracy } = coords;
      if (!Number.isFinite(latitude) || Math.abs(latitude) > 90 ||
          !Number.isFinite(longitude) || Math.abs(longitude) > 180 ||
          !Number.isFinite(accuracy) || accuracy <= 0 || accuracy > maxPickupAccuracy) {
        status.textContent = 'Could not get a precise location. Retry outdoors or enter a landmark or map link.';
        return;
      }
      const mapUrl = 'https://www.google.com/maps/search/?api=1&query=' +
        encodeURIComponent(latitude + ',' + longitude);
      pickup.value = mapUrl;
      pickupMap.href = mapUrl;
      pickupMap.hidden = false;
      status.textContent = 'Location added. Estimated accuracy: ' + Math.ceil(accuracy) +
        ' m. Check the map pin before sending.';
    }, error => {
      locationButton.disabled = false;
      if (pickupEditVersion !== requestVersion) return;
      status.textContent = error.code === 1
        ? 'Location access was denied. Allow access and retry, or enter a landmark or map link.'
        : 'Could not get your location. Retry or enter a landmark or map link.';
    }, { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 });
  });
  const sendStatus = form.querySelector('#pickup-send-status');
  const preparedMessage = form.querySelector('#pickup-message');
  form.addEventListener('invalid', event => {
    const extra = event.target.closest('details');
    if (extra) extra.open = true;
  }, true);
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const data = new FormData(form);
    const message = [
      'Vehicle recovery enquiry',
      'Name: ' + data.get('name').trim(),
      'Phone: ' + data.get('phone').trim(),
      'Service: ' + serviceField.selectedOptions[0].textContent,
    ];
    const pickupLocation = data.get('pickup').trim();
    if (pickupLocation) message.push('Pickup: ' + pickupLocation);
    for (const [field, label] of [['vehicle', 'Vehicle'], ['destination', 'Drop-off'], ['timing', 'Timing'], ['datetime', 'Preferred time']]) {
      const value = data.get(field).trim();
      if (value && (field !== 'datetime' || date.required)) message.push(label + ': ' + value);
    }
    if (data.get('details').trim()) message.push('Details: ' + data.get('details'));
    const text = message.join('\n');
    if (form.dataset.whatsapp) {
      location.assign('https://wa.me/' + form.dataset.whatsapp + '?text=' + encodeURIComponent(text));
      return;
    }
    preparedMessage.hidden = true;
    try {
      await navigator.clipboard.writeText(text);
      sendStatus.textContent = 'Enquiry copied.';
    } catch {
      preparedMessage.value = text;
      preparedMessage.hidden = false;
      preparedMessage.select();
      sendStatus.textContent = 'Your enquiry is ready. Select and copy the text below.';
    }
  });
  locationButton.disabled = false;
  form.querySelector('.pickup-submit').disabled = false;
}


// Only the active service is visible; the next vehicle moves into the foreground.
const serviceDeck = document.querySelector('.showcase-grid');
if (serviceDeck) {
  const cards = [...serviceDeck.querySelectorAll('.showcase-card')];
  let current = 0, timer = 0, detailTimer = 0, visible = false, pointer = null, suppressClick = false, paused = false;
  const wrap = n => (n + cards.length) % cards.length;
  function closeDetails() {
    clearTimeout(detailTimer);
    cards.forEach(card => { card.removeAttribute('data-expanded'); card.querySelector('.showcase-detail').hidden = true; card.querySelector('button').setAttribute('aria-expanded', 'false'); });
  }
  function paint() {
    cards.forEach((card, index) => {
      let offset = wrap(index - current);
      if (offset > cards.length / 2) offset -= cards.length;
      const depth = Math.abs(offset);
      const show = depth === 0;
      if (depth <= 1) card.querySelector('.showcase-photo').loading = 'eager';
      card.style.setProperty('--deck-x', `${offset * 64}%`);
      card.style.setProperty('--deck-y', `${depth * 18}px`);
      card.style.setProperty('--deck-z', `${-depth * 180}px`);
      card.style.setProperty('--deck-angle', `${offset * -18}deg`);
      card.style.setProperty('--deck-scale', String(depth === 0 ? 1 : depth === 1 ? .72 : .5));
      card.style.zIndex = String(5 - depth);
      card.style.opacity = show ? '1' : '0';
      card.style.visibility = show ? 'visible' : 'hidden';
      card.inert = offset !== 0;
      card.dataset.active = String(offset === 0);
    });
    serviceDeck.dataset.current = String(current);
  }
  function schedule(delay = 2000) {
    clearTimeout(timer);
    if (visible && !document.hidden && !reducedMotion.matches && !pointer && !paused && !serviceDeck.querySelector('[data-expanded]')) timer = setTimeout(() => move(1), delay);
  }
  function move(direction, manual = false) {
    const outgoing = cards[current];
    if(outgoing.contains(document.activeElement))serviceDeck.focus({preventScroll:true});
    closeDetails(); current = wrap(current + direction); paint();
    schedule(manual ? 5000 : 2000);
  }
  serviceDeck.dataset.deck = 'true'; paint();
  document.querySelector('[data-service-prev]').addEventListener('click', () => move(-1, true));
  document.querySelector('[data-service-next]').addEventListener('click', () => move(1, true));

  serviceDeck.addEventListener('click', event => {
    if (event.target.closest('.showcase-close')) { closeDetails(); move(1); return; }
    const button = event.target.closest('.showcase-open');
    if (!button || suppressClick) { suppressClick = false; return; }
    const card = button.closest('.showcase-card');
    const expanded = button.getAttribute('aria-expanded') !== 'true';
    closeDetails();
    if (expanded) { card.dataset.expanded = 'true'; button.setAttribute('aria-expanded','true'); card.querySelector('.showcase-detail').hidden = false; detailTimer = setTimeout(() => move(1), 5000); } else { move(1); return; }
    schedule(5000);
  });
  serviceDeck.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1, true); }
    if (event.key === 'Escape') { closeDetails(); schedule(5000); }
    if (event.key === ' ' && event.target === serviceDeck) { event.preventDefault(); paused = !paused; schedule(); }
  });
  serviceDeck.addEventListener('pointerdown', event => {
    if (event.button !== 0 || event.target.closest('.showcase-detail a')) return;
    clearTimeout(timer); pointer = { id: event.pointerId, x: event.clientX, y: event.clientY }; suppressClick = false;
  });
  window.addEventListener('pointerup', event => {
    if (!pointer || pointer.id !== event.pointerId) return;
    const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y; pointer = null;
    if (Math.abs(dx) > 30 && Math.abs(dx) > Math.abs(dy)) { suppressClick = true; move(dx < 0 ? 1 : -1, true); }
    else schedule(5000);
  }, { passive: true });
  window.addEventListener('pointercancel', () => { pointer = null; schedule(5000); }, { passive: true });
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; schedule(); }, { threshold: .15 }).observe(serviceDeck);
  document.addEventListener('visibilitychange', () => schedule());
  reducedMotion.addEventListener('change', () => schedule());
}

// Load the detailed wallpaper only as visitors approach a section that uses it.
if (document.body.classList.contains('is-home')) {
  const revealWallpaper = () => document.body.classList.add('wallpaper-ready');
  if ('IntersectionObserver' in window) {
    const wallpaperObserver = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      revealWallpaper(); wallpaperObserver.disconnect();
    }, {rootMargin:'200px'});
    document.querySelectorAll('.recovery-map,.recovery-contact,.recovery-kinetic,.recovery-feedback,.recovery-faq,.closing-recovery,footer').forEach(element => wallpaperObserver.observe(element));
  } else revealWallpaper();
}
