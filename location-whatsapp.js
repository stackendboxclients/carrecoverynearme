(() => {
  const trigger = document.querySelector('[data-location-whatsapp]');
  const status = document.querySelector('#hero-location-status');
  if (!trigger || !status) return;
  let busy = false;
  const message = text => { status.hidden = false; status.textContent = text; };
  const ready = () => { busy = false; trigger.removeAttribute('aria-busy'); trigger.removeAttribute('aria-disabled'); };
  trigger.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (busy) return;
    if (!navigator.geolocation) { message('Your browser cannot get a location. Open WhatsApp and share a landmark or a map pin.'); return; }
    let target;
    try {
      target = new URL(trigger.dataset.locationWhatsapp);
      if (target.protocol !== 'https:' || target.hostname !== 'wa.me' || !/^\/\d{7,15}$/.test(target.pathname) || target.username || target.password) throw new Error();
    } catch { message('WhatsApp contact is unavailable. Please use the Call now button.'); return; }
    busy = true; trigger.setAttribute('aria-busy', 'true'); trigger.setAttribute('aria-disabled', 'true');
    message('Finding your current location. Allow location access when your browser asks.');
    const fail = error => {
      ready();
      message(error?.code === 1 ? 'Location access was denied. Allow it in your browser and retry, or open WhatsApp and share a map pin manually.' : error?.code === 3 ? 'Finding your location timed out. Retry outdoors, or share a landmark in WhatsApp.' : 'Your location is unavailable. Retry, or share a map pin manually in WhatsApp.');
    };
    try {
      navigator.geolocation.getCurrentPosition(position => {
        const {latitude, longitude, accuracy} = position.coords || {};
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180 || !Number.isFinite(accuracy) || accuracy < 0 || accuracy > 1000) {
          ready(); message('Your location is not precise enough. Retry outdoors, or share a checked map pin in WhatsApp.'); return;
        }
        const pin = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(latitude.toFixed(6)+','+longitude.toFixed(6))}`;
        target.searchParams.set('text', `Hello Dubai Car Recovery, I need vehicle recovery.\nMy current pickup location:\n${pin}\nEstimated location accuracy: ${Math.ceil(accuracy)} m.`);
        ready(); message('Opening WhatsApp. Tap Send there to share your map pin.');
        window.location.assign(target.href);
      }, fail, {enableHighAccuracy:true, maximumAge:0, timeout:15000});
    } catch { fail(); }
  });
})();
