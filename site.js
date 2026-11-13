const carousel = document.querySelector('.carousel');
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
const dialog = document.querySelector('#service-dialog');
if (dialog && typeof dialog.showModal === 'function') {
  const links = [...carousel.querySelectorAll('[data-service]')];
  let active = 0;
  function showService(index) {
    active = (index + links.length) % links.length;
    const link = links[active];
    const card = link.closest('.service-card');
    const slug = new URL(link.href).pathname.split('/')[2];
    dialog.querySelector('.dialog-icon').replaceChildren(card.querySelector('.service-icon').cloneNode(true));
    dialog.querySelector('h2').textContent = card.querySelector('h3').textContent;
    dialog.querySelector('.dialog-description').textContent = card.querySelector('p').textContent;
    dialog.querySelector('.dialog-advice').textContent = card.querySelector('template').content.textContent;
    dialog.querySelector('.dialog-link').href = link.href;
    dialog.querySelector('.dialog-book').href = '/book/?service=' + encodeURIComponent(slug);
  }
  links.forEach((link, index) => link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    showService(index);
    dialog.showModal();
  }));
  dialog.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.querySelectorAll('[data-dialog-step]').forEach(button => {
    button.addEventListener('click', () => showService(active + Number(button.dataset.dialogStep)));
  });
}
if (!reducedMotion.matches && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.process article, .coverage, .pickup-guide article, .final-call').forEach(element => observer.observe(element));
}
document.querySelectorAll('[data-slide]').forEach(button => {
  button.addEventListener('click', () => {
    const card = carousel.querySelector('.service-card');
    const gap = parseFloat(getComputedStyle(carousel).columnGap);
    const left = (card.offsetWidth + gap) * Number(button.dataset.slide);
    carousel.scrollBy({ left, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  });
});
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
  pickup.addEventListener('input', () => {
    pickupMap.hidden = true;
    status.textContent = '';
  });
  locationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
      status.textContent = 'Enter a landmark or map link manually.';
      return;
    }
    const previousPickup = pickup.value;
    locationButton.disabled = true;
    pickupMap.hidden = true;
    status.textContent = 'Looking for your location...';
    navigator.geolocation.getCurrentPosition(({coords}) => {
      locationButton.disabled = false;
      if (pickup.value !== previousPickup) return;
      pickup.value = 'https://www.google.com/maps?q=' + coords.latitude.toFixed(6) + ',' + coords.longitude.toFixed(6);
      pickupMap.href = pickup.value;
      pickupMap.hidden = false;
      status.textContent = 'Location added. Check the map pin before sending.';
    }, () => {
      locationButton.disabled = false;
      if (pickup.value === previousPickup) status.textContent = 'Could not get your location. Enter a landmark or map link manually.';
    }, { enableHighAccuracy: true, timeout: 10000 });
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
      'Pickup: ' + data.get('pickup').trim(),
    ];
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
