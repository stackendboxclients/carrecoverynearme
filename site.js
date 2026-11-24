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
  ['.recovery-hero', document.querySelector('meta[name="hero-motion"]')?.content],
  ['.recovery-kinetic', document.querySelector('meta[name="kinetic-motion"]')?.content],
  ['.feedback-deck', document.querySelector('meta[name="feedback-motion"]')?.content],
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
  document.querySelector('[data-use-pickup-location]')?.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    locationButton.click();
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


const backgroundVideo = document.querySelector('.site-background-video');
if (backgroundVideo) {
  const heroBoundary = document.querySelector('.recovery-hero');
  const boundary = heroBoundary || document.querySelector('body > header');
  let videoFrame = 0;
  let backgroundStarted = false;
  let backgroundQueued = false;
  let backgroundCovered = true;
  backgroundVideo.muted = true;
  backgroundVideo.defaultMuted = true;
  backgroundVideo.volume = 0;
  const updateBoundary = () => {
    videoFrame = 0;
    const top = Math.max(0, Math.min(innerHeight, boundary?.getBoundingClientRect().bottom ?? 0));
    backgroundCovered = top >= innerHeight;
    if (!backgroundStarted && (!heroBoundary || window.scrollY > 0)) queueBackground();
    // Opaque hero/map surfaces cover the fixed video without a scroll-driven mask.
    // Keep this check for playback only, so scrolling cannot expose a white seam.
    syncBackground();
  };
  const scheduleBoundary = () => {
    if (!videoFrame) videoFrame = requestAnimationFrame(updateBoundary);
  };
  const syncBackground = () => {
    if (!backgroundStarted) return;
    if (document.hidden || backgroundCovered) backgroundVideo.pause();
    else if (backgroundVideo.paused) backgroundVideo.play().catch(() => {
      // The poster stays visible if the browser blocks autoplay.
    });
  };
  const startBackground = () => {
    if (backgroundStarted) return;
    const source = backgroundVideo.querySelector('source[data-src]');
    if (!source) return;
    backgroundStarted = true;
    backgroundVideo.preload = 'auto';
    source.src = source.dataset.src;
    source.removeAttribute('data-src');
    backgroundVideo.load();
    syncBackground();
  };
  // Let the hero load first. Start warming the video when visitors begin scrolling.
  const queueBackground = () => {
    if (backgroundQueued || (heroBoundary && window.scrollY === 0) || document.readyState !== 'complete') return;
    backgroundQueued = true;
    if ('requestIdleCallback' in window) requestIdleCallback(startBackground, { timeout: 2000 });
    else setTimeout(startBackground, 0);
  };
  if (document.readyState === 'complete') queueBackground();
  else window.addEventListener('load', queueBackground, { once: true });
  backgroundVideo.addEventListener('error', () => { backgroundVideo.hidden = true; });
  document.addEventListener('visibilitychange', syncBackground);
  document.addEventListener('pointerdown', syncBackground, { once: true, passive: true });
  window.addEventListener('scroll', scheduleBoundary, { passive: true });
  window.addEventListener('resize', scheduleBoundary);
  if (boundary) new ResizeObserver(scheduleBoundary).observe(boundary);
  updateBoundary();
  syncBackground();
}

// The 14 existing services become an automatically cycling, swipeable card stack.
const serviceDeck = document.querySelector('.showcase-grid');
if (serviceDeck) {
  const cards = [...serviceDeck.querySelectorAll('.showcase-card')];
  const counter = document.querySelector('[data-service-position]');
  let current = 0, timer = 0, visible = false, pointer = null, suppressClick = false;
  const wrap = n => (n + cards.length) % cards.length;
  function closeDetails() {
    cards.forEach(card => { card.removeAttribute('data-expanded'); card.querySelector('.showcase-detail').hidden = true; card.querySelector('button').setAttribute('aria-expanded', 'false'); });
  }
  function paint() {
    cards.forEach((card, index) => {
      let offset = wrap(index - current);
      if (offset === cards.length - 1) offset = -1;
      const show = offset >= -1 && offset <= 2;
      card.style.setProperty('--deck-x', `${offset === 0 ? 0 : offset * 22}px`);
      card.style.setProperty('--deck-y', `${offset === 0 ? 0 : 18 + Math.abs(offset) * 7}px`);
      card.style.setProperty('--deck-angle', `${offset * 10}deg`);
      card.style.setProperty('--deck-scale', String(offset === 0 ? 1 : .96 - Math.abs(offset) * .025));
      card.style.zIndex = String(offset === 0 ? 5 : offset === -1 ? 2 : 4 - offset);
      card.style.opacity = show ? String(offset === 0 ? 1 : .38) : '0';
      card.style.visibility = show ? 'visible' : 'hidden';
      card.inert = offset !== 0;
      card.dataset.active = String(offset === 0);
    });
    serviceDeck.dataset.current = String(current);
    counter.textContent = `${String(current + 1).padStart(2,'0')} / ${cards.length}`;
  }
  function schedule(delay = 2000) {
    clearTimeout(timer);
    if (visible && !document.hidden && !reducedMotion.matches && !pointer) timer = setTimeout(() => move(1), delay);
  }
  function move(direction, manual = false) {
    const outgoing=cards[current];
    const from=getComputedStyle(outgoing).transform;
    if(outgoing.contains(document.activeElement))serviceDeck.focus({preventScroll:true});
    closeDetails(); current = wrap(current + direction); paint();
    if(!reducedMotion.matches) outgoing.animate([{transform:from,opacity:1,zIndex:10},{transform:`translate3d(${direction>0?'-125%':'25%'},15px,0) rotate(${direction>0?-26:26}deg) scale(.9)`,opacity:0,zIndex:10}],{duration:620,easing:'cubic-bezier(.2,.75,.2,1)'});
    schedule(manual ? 5000 : 2000);
  }
  serviceDeck.dataset.deck = 'true'; paint();
  serviceDeck.addEventListener('click', event => {
    const button = event.target.closest('.showcase-open');
    if (!button || suppressClick) { suppressClick = false; return; }
    const card = button.closest('.showcase-card');
    const expanded = button.getAttribute('aria-expanded') !== 'true';
    closeDetails();
    if (expanded) { card.dataset.expanded = 'true'; button.setAttribute('aria-expanded','true'); card.querySelector('.showcase-detail').hidden = false; }
    schedule(5000);
  });
  serviceDeck.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1, true); }
    if (event.key === 'Escape') { closeDetails(); schedule(5000); }
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
