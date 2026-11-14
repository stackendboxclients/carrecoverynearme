const mobileMenu = document.querySelector('.mobile-menu');
mobileMenu?.addEventListener('click', event => {
  if (event.target.closest('a')) mobileMenu.open = false;
});
mobileMenu?.addEventListener('keydown', event => {
  if (event.key !== 'Escape' || !mobileMenu.open) return;
  mobileMenu.open = false;
  mobileMenu.querySelector('summary').focus();
});

const mobileActions = document.querySelector('.mobile-actions');
const heroActions = document.querySelector('.hero-actions');
if (mobileActions && heroActions) {
  let pending = false;
  const updateMobileActions = () => {
    mobileActions.hidden = heroActions.getBoundingClientRect().bottom > 0;
    pending = false;
  };
  const scheduleMobileActions = () => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(updateMobileActions);
  };
  updateMobileActions();
  window.addEventListener('scroll', scheduleMobileActions, { passive: true });
  window.addEventListener('resize', scheduleMobileActions);
}

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
const showcase = document.querySelector('.recovery-showcase');
const tape = document.querySelector('.service-tape');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) entry.target.dataset.inView = String(entry.isIntersecting);
  });
  if (tape) observer.observe(tape);
  if (showcase) {
    observer.observe(showcase);
    showcase.querySelectorAll('.showcase-card').forEach(card => observer.observe(card));
  }
}

const deferredSections = new Map([
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
        import(targets.get(entry.target)).catch(() => {
          // Static sections and native controls remain available.
        });
      }
    }, { rootMargin: '480px 0px' });
    for (const section of targets.keys()) observer.observe(section);
  }
}
const form = document.querySelector('#booking');
if (form) {
  const section = form.closest('.recovery-contact');
  if (section && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      section.dataset.inView = String(entry.isIntersecting);
    });
    observer.observe(section);
  }
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

const heroMotion = document.querySelector('meta[name="hero-motion"]')?.content;
const desktopMotion = matchMedia('(min-width: 851px) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
if (heroMotion && desktopMotion.matches && 'IntersectionObserver' in window) {
  const loadHeroMotion = () => {
    const startMotion = () => {
      if (desktopMotion.matches && !document.hidden) import(heroMotion).catch(() => {});
    };
    if (window.requestIdleCallback) window.requestIdleCallback(startMotion);
    else window.setTimeout(startMotion, 0);
  };
  if (document.readyState === 'complete') loadHeroMotion();
  else window.addEventListener('load', loadHeroMotion, { once: true });
}
