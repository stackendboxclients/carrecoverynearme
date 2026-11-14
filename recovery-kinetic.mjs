import { capabilityDisplay, recoveryCapabilities } from './recovery-capabilities.mjs';

const art = '/assets/standard-art/';

function picture(name, sizes = '(max-width: 600px) 42vw, 29vw', height = 360) {
  return `<img src="${art}${name}-540.webp" srcset="${art}${name}-540.webp 540w, ${art}${name}-960.webp 960w" sizes="${sizes}" width="540" height="${height}" alt="" decoding="async" fetchpriority="low">`;
}

const dubai = (sizes) => `<img src="${art}dubai-szr-840.webp" srcset="${art}dubai-szr-840.webp 840w, ${art}dubai-szr-1440.webp 1440w" sizes="${sizes}" alt="" decoding="async" fetchpriority="low">`;

const contact = `
  <div class="adv-photo adv-contact-photo">${picture('night')}</div>
  <div class="adv-contact-art">
    <div class="adv-signal-rings"><i></i><i></i><i></i></div>
    <div class="adv-device">
      <div class="adv-device-screen">
        <span class="adv-phone-shine"></span>
        <svg viewBox="0 0 48 52" class="adv-pin-icon" fill="none" aria-hidden="true">
          <path d="M24 47S7 35 7 21a17 17 0 1 1 34 0C41 35 24 47 24 47Zm0-19a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z" stroke="currentColor" stroke-width="2.7" stroke-linejoin="round"/>
        </svg>
        <strong>24/7</strong>
        <span>Prepare an enquiry</span>
      </div>
    </div>
  </div>`;

const handling = `
  <div class="adv-loading-frame">
    <div class="adv-photo adv-loading-photo">${picture('advantage-loading', '(max-width: 600px) 48vw, (max-width: 919px) 50vw, 33vw', 264)}</div>
    <div class="adv-loading-light"></div>
    <div class="adv-loading-note adv-loading-clearance"><i></i><span>Ground clearance</span></div>
    <div class="adv-loading-note adv-loading-access"><i></i><span>Loading access</span></div>
  </div>
  <div class="adv-scene-veil"></div>
  <div class="adv-scene-reflection"></div>`;

const arrangements = `
  <div class="adv-photo adv-briefing-photo">${dubai('(max-width: 600px) 42vw, 33vw')}</div>
  <div class="adv-briefing-grade"></div>
  <div class="adv-scene-veil"></div>
  <div class="adv-scene-reflection"></div>
  <div class="adv-briefing">
    <div class="adv-briefing-title">Recovery briefing</div>
    <dl>
      <div><dt>Pickup</dt><dd>Where you need help</dd></div>
      <div><dt>Vehicle</dt><dd>Type and condition</dd></div>
      <div><dt>Destination</dt><dd>Where it needs to go</dd></div>
    </dl>
    <div class="adv-briefing-action">
      <span class="adv-briefing-highlight"></span>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11.5a7 7 0 0 1-7 7H8l-4 3v-5a7 7 0 0 1 0-10A7 7 0 0 1 9 4.5h4a7 7 0 0 1 7 7ZM8 10h8m-8 4h5"/></svg>
      <span>Discuss availability &amp; quote</span>
    </div>
  </div>`;

const panels = [
  { key: 'contact', label: 'Enquiries', title: 'Prepare an enquiry 24/7.', description: 'Put your pickup location and vehicle details together whenever you need to.', visual: contact },
  { key: 'services', label: 'Services', title: 'Eight ways to get help.', description: 'From car towing and flatbeds to motorcycles, luxury vehicles and off-road recovery.' },
  { key: 'handling', label: 'Handling', title: 'Recovery planned around your vehicle.', description: 'Tell us its condition, clearance and pickup access so we can discuss suitable transport.', visual: handling },
  { key: 'arrangements', label: 'Arrangements', title: 'Know the plan before you proceed.', description: 'Share your pickup, vehicle and destination. Discuss availability and the quote before confirming recovery.', visual: arrangements },
];

export function recoveryKinetic(icon, services) {
  const capabilities = recoveryCapabilities(services);
  return `
<section class="recovery-kinetic" id="why-choose-us" aria-labelledby="kinetic-heading">
  <div class="adv-backdrop" aria-hidden="true">${dubai('100vw')}</div>
  <div class="adv-layout wrap">
    <div class="adv-intro">
      <h2 id="kinetic-heading">Why choose <em>Dubai Car Recovery?</em></h2>
      <p class="adv-lede">Eight ways to get help, with recovery arrangements shaped around your vehicle and where it’s stopped.</p>
    </div>
    <div class="adv-stage" data-selected="contact" role="group" aria-label="Recovery advantages">
      ${panels.map(({ key, label, title, description, visual }, index) => {
        const tag = `<div class="adv-tag"><span>0${index + 1}</span>${key === 'services' ? ' /' : ''} ${label}</div>`;
        return `
        <article class="adv-panel" data-panel="${key}">
          ${visual ? tag : ''}
          <div class="adv-scene"${visual ? ' aria-hidden="true"' : ''}>${visual ?? capabilityDisplay(capabilities, tag)}</div>
          <div class="adv-copy">
            <h3 id="adv-title-${key}">${title}</h3>
            <p>${description}</p>
          </div>
          <button class="adv-select" type="button" aria-labelledby="adv-title-${key}" aria-pressed="${key === 'contact'}" hidden><span aria-hidden="true"></span></button>
        </article>`;
      }).join('')}
    </div>
    <div class="adv-footer">
      <a class="adv-cta" href="#request-recovery">Discuss your recovery needs ${icon('arrow')}</a>
      <details class="adv-catalog"><summary>View all eight services</summary>
        <ul>${capabilities.map(({ name }) => `<li>${name.replaceAll('&', '&amp;')}</li>`).join('')}</ul>
      </details>
      <div class="adv-credit">
        <span>Illustrative scenes · <a href="https://unsplash.com/photos/a-night-view-of-a-city-with-a-freeway-sTOQG-SAFqY">Dubai photo by Michael Starkie</a></span>
        <button class="adv-pause" type="button" hidden>Pause motion</button>
      </div>
    </div>
  </div>
</section>`;
}
