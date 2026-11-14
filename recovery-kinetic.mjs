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

const briefingItems = [
  ['Pickup', 'Map pin or landmark', 'M12 21s6-4.5 6-10a6 6 0 1 0-12 0c0 5.5 6 10 6 10Z M12 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z'],
  ['Vehicle', 'Make and condition', 'M3 15v-2l3.5-6h11l3.5 6v2m-18 0h18v3H3v-3Zm2 3v2m14-2v2M4 13h16m-13 2h1m8 0h1'],
  ['Drop-off', 'Garage or address', 'M5 21V5m0 2 4-2 5 2 5-2v9l-5 2-5-2-4 2'],
  ['Timing', 'Soonest or scheduled', 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-14v5l3 2'],
];

const arrangements = `
  <div class="adv-photo adv-briefing-photo" aria-hidden="true">${dubai('(max-width: 600px) 42vw, 33vw')}</div>
  <div class="adv-briefing-grade" aria-hidden="true"></div>
  <div class="adv-scene-veil" aria-hidden="true"></div>
  <div class="adv-scene-reflection" aria-hidden="true"></div>
  <div class="adv-briefing">
    <p class="adv-briefing-title">Your pickup plan</p>
    <dl>
      ${briefingItems.map(([label, description, path]) => `<div><dt><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"><path d="${path}"/></svg>${label}</dt><dd>${description}</dd></div>`).join('')}
    </dl>
    <div class="adv-briefing-action">
      <span class="adv-briefing-highlight" aria-hidden="true"></span>
      <strong>The team confirms</strong>
      <span>Availability, pickup window and quote</span>
    </div>
  </div>`;

const panels = [
  { key: 'contact', label: 'Enquiries', title: 'Prepare an enquiry 24/7.', description: 'Put your pickup location and vehicle details together whenever you need to.', visual: contact },
  { key: 'services', label: 'Services', title: 'Eight ways to get help.', description: 'From car towing and flatbeds to motorcycles, luxury vehicles and off-road recovery.' },
  { key: 'handling', label: 'Handling', title: 'Recovery planned around your vehicle.', description: 'Tell us its condition, clearance and pickup access so we can discuss suitable transport.', visual: handling },
  { key: 'arrangements', label: 'Arrangements', title: 'Agree on the details before pickup.', description: 'Mention access limits like a basement ramp or narrow entrance so the team can check whether the recovery vehicle can reach you.', visual: arrangements },
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
          <div class="adv-scene"${key === 'contact' || key === 'handling' ? ' aria-hidden="true"' : ''}>${visual ?? capabilityDisplay(capabilities, tag)}</div>
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
      <button class="adv-pause" type="button" aria-label="Pause section animations" hidden>
        <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path class="adv-pause-icon" d="M7 5v10m6-10v10"/>
          <path class="adv-resume-icon" d="m7 4 9 6-9 6V4Z"/>
        </svg>
      </button>
    </div>
  </div>
</section>`;
}
