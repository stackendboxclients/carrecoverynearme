import { readFile, mkdir, writeFile, cp, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { build } from 'esbuild';

import { buildRecoveryHero } from './recovery-hero-build.mjs';
import { recoveryKinetic } from './recovery-kinetic.mjs';
import { recoveryFeedback } from './recovery-feedback.mjs';

const business = JSON.parse(await readFile('business.json', 'utf8'));
const services = [
  ['car-towing', 'Car towing', 'Arrange transport to a garage, home, or another destination.', '01'],
  ['emergency-recovery', 'Breakdown recovery', 'Arrange pickup when your vehicle can’t continue the journey.'],
  ['flatbed-towing', 'Flatbed towing', 'Ask about flatbed transport for a vehicle that needs to be carried off the road.', '03'],
  ['roadside-assistance', 'Roadside assistance', 'Describe the issue and your location so the team can assess the help you need.', '04'],
  ['accident-recovery', 'Accident recovery', 'Discuss pickup for a damaged vehicle once the scene is safe.', '05'],
  ['battery-assistance', 'Battery assistance', 'Describe the vehicle and symptoms so the team can assess jump-start assistance.', '06'],
  ['luxury-car-transport', 'Luxury car transport', 'Plan transport for a sports car, luxury vehicle, or low-clearance car.'],
  ['tyre-assistance', 'Towing after tyre damage', 'Arrange a tow if tyre or wheel damage leaves the vehicle unable to continue.'],
  ['fuel-delivery', 'Fuel assistance', 'Ask about help when you’ve run out of fuel.'],
  ['desert-recovery', 'Desert recovery', 'Share the terrain and your location for an off-road recovery assessment.'],
  ['motorcycle-towing', 'Motorcycle transport', 'Arrange pickup for a motorcycle or scooter.'],
  ['truck-recovery', 'Commercial vehicle recovery', 'Discuss recovery options for a van, truck, or commercial vehicle.'],
  ['passing-assistance', 'Vehicle inspection transport', 'Arrange transport to a vehicle inspection or testing location.'],
];
const name = business.name;
const contactReady = Boolean(business.whatsapp || business.phone);
const indexable = business.launchReady && Boolean(business.whatsapp);
const coverage = `<section class="section wrap coverage" id="coverage"><div><p class="eyebrow">Pickup and drop-off</p><h2>Start with a pin.</h2><p>Send the exact spot if you can. A road exit, parking level, or nearby landmark helps when a street address is hard to find.</p><a class="button outline" href="/book/">Add your pickup point ↗</a></div><div class="route-art" aria-hidden="true"><svg viewBox="0 0 500 260" preserveAspectRatio="none"><path class="map-street" d="M0 57H500M0 205H500M68 0V260M430 0V260M0 126H500M170 0V260M331 0V260"/><path class="map-route" d="M82 193H174Q198 193 198 169V137Q198 112 223 112H308Q333 112 333 86V74H413"/><circle cx="82" cy="193" r="8"/><circle cx="413" cy="74" r="8"/></svg><span class="route-point pickup">Pickup</span><span class="route-point dropoff">Drop-off</span></div></section>`;
const pickupGuide = `<section class="section wrap pickup-guide" id="pickup-guide"><h2>Get ready for pickup</h2><div class="steps"><article><span>01</span><h3>Check your surroundings</h3><p>Move to a safe place if you can. If anyone is injured or there’s an immediate danger, contact emergency services.</p></article><article><span>02</span><h3>Save your map pin</h3><p>Share the nearest exit, landmark, or parking level so the team can find the vehicle.</p></article><article><span>03</span><h3>Describe the vehicle</h3><p>Include the make and model and whether it can steer or roll. Mention low clearance or limited access.</p></article></div></section>`;
const phone = business.phone ? `<a class="button outline" href="tel:${business.phone}">Call now</a>` : '';
const whatsapp = business.whatsapp ? `<a class="button outline" href="https://wa.me/${business.whatsapp}">WhatsApp</a>` : '';
const brand = `<a class="brand" href="/"><span class="brand-mark" aria-hidden="true"><i></i><i></i><i></i></span><span>Dubai Car Recovery<em>Near Me</em></span></a>`;
const actions = `<a class="button" href="/book/">Plan a pickup <span aria-hidden="true">↗</span></a>${phone}${whatsapp}`;
const serviceIcons = [
  '<path d="M2 6h13v11H2zM15 10h4l3 4v3h-7"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
  '<path d="m13 2-9 12h7l-1 8 10-12h-7z"/>',
  '<path d="M2 13h14V8h4l2 4v5H2z"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
  '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2"/>',
  '<path d="m12 3 8 3v6c0 4-3 7-8 9-5-2-8-5-8-9V6z"/><path d="m9 12 2 2 4-4"/>',
  '<rect x="3" y="7" width="17" height="10" rx="2"/><path d="M22 10v4M7 12h4M9 10v4m5-2h3"/>',
  '<path d="m3 14 4-5h10l4 5v4H3zM7 18v2m10-2v2M8 14h8"/>',
  '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="m6 6 2 2m8 8 2 2m0-12-2 2m-8 8-2 2"/>',
  '<path d="M4 21V4h10v17m-8-9h6M2 21h14m0-9h2l2 2v5a1 1 0 0 0 2 0V9l-3-3"/>',
  '<path d="m2 19 7-10 4 5 3-4 6 9M6 19h12"/><circle cx="17" cy="5" r="2"/>',
  '<circle cx="5" cy="17" r="3"/><circle cx="19" cy="17" r="3"/><path d="m5 17 5-7 4 7h5l-3-9h-3"/>',
  '<path d="M2 7h13v11H2zm13 4h4l3 4v3h-7M5 11h7"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="19" r="2"/>',
  '<path d="M5 3h14v18H5zm4 9 2 2 4-4M9 17h6"/>',
];
const serviceAdvice = [
  'Share where the car is parked, whether it can roll, and the address where it should be dropped off.',
  'Share a landmark or map pin. Describe any warning lights, leaks, or loss of power.',
  'Mention low clearance, locked wheels, and any access restrictions where the vehicle is parked.',
  'Describe the issue and say whether the vehicle is on a street or inside a parking structure.',
  'Arrange pickup once the scene is safe. Describe the damage and whether the vehicle can steer and roll.',
  'Share the make and model and describe what happens when you try to start the vehicle.',
  'Mention ground clearance, steering lock, and any manufacturer guidance on loading the vehicle.',
  'Tell the team which wheel is damaged and whether the vehicle can roll, steer, or be shifted into neutral.',
  'Share the correct fuel type and a safe access point near your vehicle.',
  'Provide a map pin and describe the surface, slope, and whether the vehicle is stuck or damaged.',
  'Tell the team the type of bike, whether it rolls, and where it needs to go.',
  'Provide the loaded weight, height, length, and whether cargo is still on board.',
  'Share your inspection centre, appointment time, and whether the vehicle can roll and steer.',
];
const cards = services.map(([slug, title, description], index) => `<article class="service-card"><span class="service-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${serviceIcons[index]}</svg></span><h3>${title}</h3><p>${description}</p><a href="/services/${slug}/">Explore service <span aria-hidden="true">↗</span></a></article>`).join('');
const enquiryIcons = {
  person: '<circle cx="12" cy="8" r="3"/><path d="M5 20v-2a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v2"/>',
  phone: '<path d="M8 3H5a2 2 0 0 0-2 2 16 16 0 0 0 16 16 2 2 0 0 0 2-2v-3l-5-2-2 2a12 12 0 0 1-6-6l2-2z"/>',
  truck: '<path d="M2 6h12v11H2zM14 10h4l4 4v3h-8"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
  pin: '<path d="M19 10c0 5-7 10-7 10S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  locate: '<circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/><path d="M12 2v4m0 12v4M2 12h4m12 0h4"/>',
  whatsapp: '<path d="M4 19.8 5 16a8 8 0 1 1 3.1 3l-4.1.8Z"/><path d="M9 8c-1 1-.4 3.1 1.2 4.8 1.7 1.8 3.8 2.5 4.9 1.4l.6-.8-2.4-1.1-.8.7a5.5 5.5 0 0 1-2.1-2.2l.6-.8-.9-2.2z"/>',
  sliders: '<path d="M4 7h16M4 17h16M8 4v6m8 4v6"/>',
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  plus: '<path d="M5 12h14m-7-7v14"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
};
const enquiryIcon = (name) => `<svg class="enquiry-icon" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">${enquiryIcons[name]}</svg>`;
const recoveryQuestions = [
  ['What should I have ready for a pickup?', 'Share your pickup point, vehicle make and model, what happened, and where you’d like the vehicle taken. Mention if it can’t roll, steer, or shift into neutral.'],
  ['How much will recovery cost?', 'The quote depends on the vehicle, the distance to your destination, and what’s needed to reach and load it. Ask the recovery team to confirm the price before you agree to the pickup.'],
  ['How soon can a truck reach me?', 'Pickup timing depends on your location, road access, and which truck is available for the job. Ask the team for an estimated pickup window when you share your location.'],
  ['Can you move a sports car or a vehicle with low clearance?', 'Flatbed transport is available to request for sports and luxury cars. Mention low bumpers, steep ramps, or tight parking so the team can assess how to load the vehicle.'],
  ['What if my car is stuck in sand or off-road?', 'Share a map pin, the nearest road or track, and a photo of the terrain if you can take one safely. This helps the team assess access and what recovery equipment may be needed.'],
  ['Can I arrange towing after an accident?', 'Once the scene is safe and the vehicle can be moved, tell the team where it is, which parts are damaged, and whether the wheels and steering still move. Share the body shop or other drop-off address if you have it.'],
  ['Can I choose the drop-off point or schedule a pickup?', 'Use the pickup form’s optional details to add a garage, testing centre, or other destination. Choose scheduled pickup to include your preferred date and time, then confirm the arrangements with the recovery team.'],
  ['Can I enter my location without sharing GPS?', 'Yes. Enter a map link, nearby landmark, road exit, or parking level. If the address is hard to find, add the entrance or other access details.'],
];

const faq = `<section class="recovery-faq" id="faq" aria-labelledby="recovery-faq-heading">
  <div class="wrap recovery-faq-layout">
    <div class="recovery-faq-intro">
      <h2 id="recovery-faq-heading">Frequently asked <em>questions</em></h2>
      <p>What to know before you arrange towing or vehicle recovery in Dubai.</p>
      <a class="button recovery-faq-cta" href="#request-recovery">Open pickup form ${enquiryIcon('arrow')}</a>
    </div>
    <div class="recovery-faq-list">
      ${recoveryQuestions.map(([question, answer], index) => `<details class="recovery-faq-item" name="recovery-faq"${index === 0 ? ' open' : ''}>
        <summary><span>${question}</span><span class="recovery-faq-indicator" aria-hidden="true">${enquiryIcon('plus')}</span></summary>
        <p>${answer}</p>
      </details>`).join('')}
    </div>
  </div>
</section>`;

const pickupChannel = (icon, title, href) => {
  const content = `${enquiryIcon(icon)}<span>${title}</span>`;
  return href
    ? `<a class="pickup-channel" href="${href}">${content}${enquiryIcon('arrow')}</a>`
    : `<button type="button" class="pickup-channel" disabled>${content}</button>`;
};

const booking = (heading) => `<section class="recovery-contact" id="request-recovery" aria-labelledby="pickup-heading">
<div class="wrap recovery-contact-layout">
  <div class="pickup-intro">
    <p class="eyebrow">${enquiryIcon('pin')} Dubai vehicle recovery</p>
    <${heading} id="pickup-heading">Request a vehicle pickup</${heading}>
    <p>Share your pickup point and choose a service. The recovery team confirms availability and pricing before dispatch.</p>
  </div>
  <div class="pickup-form-stage">
    <div class="pickup-backdrop" aria-hidden="true">
      <div class="pickup-road-surface">
        <span class="pickup-lane-markings"></span>
        <span class="pickup-traffic-light"></span>
        <span class="pickup-traffic-light pickup-traffic-light-return"></span>
      </div>
    </div>
    <form id="booking" class="pickup-form" method="post" data-whatsapp="${business.whatsapp}">
    <div class="pickup-fields">
      <label><span>${enquiryIcon('person')} Your name <span aria-hidden="true">*</span></span><input name="name" autocomplete="name" maxlength="100" placeholder="Full name" required></label>
      <label><span>${enquiryIcon('phone')} Phone number <span aria-hidden="true">*</span></span><input name="phone" type="tel" autocomplete="tel" maxlength="30" minlength="7" placeholder="Include country code" required></label>
      <label class="pickup-wide"><span>${enquiryIcon('truck')} Recovery service <span aria-hidden="true">*</span></span><select name="service" required><option value="">Choose a service</option>${services.map(([slug, title]) => `<option value="${slug}">${title}</option>`).join('')}</select></label>
      <label class="pickup-wide"><span>${enquiryIcon('pin')} Pickup location <span aria-hidden="true">*</span></span><input name="pickup" maxlength="300" placeholder="Area, landmark, or map link" aria-describedby="pickup-location-help" required></label>
    </div>
    <div class="pickup-location">
      <button type="button" id="location" disabled>${enquiryIcon('locate')} Use my current location</button>
      <a id="pickup-map" target="_blank" rel="noopener noreferrer" hidden>Check map pin ↗</a>
      <p id="pickup-location-help">A landmark or map link works too.</p>
      <p id="location-status" role="status"></p>
    </div>
    <details class="pickup-extra">
      <summary>${enquiryIcon('sliders')}<span>Vehicle, destination, and timing <small>Optional</small></span><span class="pickup-expand">${enquiryIcon('plus')}</span></summary>
      <div class="pickup-fields">
        <label>Vehicle<input name="vehicle" maxlength="120" placeholder="Make and model"></label>
        <label>Drop-off<input name="destination" maxlength="300" placeholder="Garage or address"></label>
        <label>Pickup timing<select name="timing"><option>As soon as available</option><option>Scheduled pickup</option></select></label>
        <label id="scheduled" hidden>Preferred date and time<input type="datetime-local" name="datetime"></label>
        <label class="pickup-wide">Anything else?<textarea name="details" rows="3" maxlength="700" placeholder="Vehicle condition or pickup access"></textarea></label>
      </div>
    </details>
    <div class="pickup-send">
      <button class="button pickup-submit" type="submit" disabled>${enquiryIcon(business.whatsapp ? 'whatsapp' : 'copy')}<span>${business.whatsapp ? 'Continue on WhatsApp' : 'Copy enquiry'}</span>${enquiryIcon('arrow')}</button>
      <noscript><p>Enable JavaScript to prepare your enquiry.</p></noscript>
      <div class="pickup-send-note">
        <p>${business.whatsapp ? 'Review the message in WhatsApp and tap Send.' : 'Copy your pickup details to share later.'}</p>
        <a class="pickup-privacy" href="/privacy/">Privacy information</a>
      </div>
      <p id="pickup-send-status" role="status"></p>
      <textarea id="pickup-message" rows="5" readonly aria-label="Prepared recovery enquiry" hidden></textarea>
    </div>
    </form>
  </div>
  <aside class="pickup-channels" aria-labelledby="pickup-channels-heading">
    <h3 id="pickup-channels-heading">Contact the recovery team</h3>
    <div class="pickup-channel-list">
      ${pickupChannel('phone', 'Call the team', business.phone && 'tel:' + business.phone)}
      ${pickupChannel('whatsapp', 'Chat on WhatsApp', business.whatsapp && 'https://wa.me/' + business.whatsapp)}
    </div>
    ${business.phone && business.whatsapp ? '' : '<p>Direct contact options will be available once the business numbers are added.</p>'}
  </aside>
</div>
</section>`;
const showcaseServices = [
  ['car-towing', 'Car towing'],
  ['roadside-assistance', 'Roadside assistance'],
  ['emergency-recovery', 'Breakdown recovery'],
  ['accident-recovery', 'Accident recovery'],
  ['flatbed-towing', 'Flatbed towing'],
  ['desert-recovery', 'Desert & off-road'],
  ['luxury-car-transport', 'Luxury & sports'],
  ['motorcycle-towing', 'Motorcycle transport'],
];

const showcaseCards = showcaseServices.map(([slug, title], index) => {
  const image = `<img class="showcase-photo" src="/assets/service-art/${slug}.webp" alt="" loading="lazy" decoding="async">`;
  const heading = `<span class="showcase-number" aria-hidden="true">${String(index + 1).padStart(2, '0')} /</span><h3>${title}</h3>`;
  return `<a class="showcase-card" href="/services/${slug}/">
    ${image}
    <div class="showcase-card-content">${heading}</div>
    <svg class="showcase-frame" viewBox="0 0 300 240" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <rect class="showcase-frame-glow" x="2" y="2" width="296" height="236" rx="16" pathLength="100" vector-effect="non-scaling-stroke"/>
      <rect class="showcase-frame-light" x="2" y="2" width="296" height="236" rx="16" pathLength="100" vector-effect="non-scaling-stroke"/>
    </svg>
  </a>`;
});

const serviceShowcase = `<section class="recovery-showcase" id="services" aria-labelledby="showcase-heading">
  <svg class="showcase-road" viewBox="0 0 1440 700" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="showcase-asphalt" x2="0" y2="1">
        <stop stop-color="#17191b"/><stop offset="1" stop-color="#26201d"/>
      </linearGradient>
      <path id="showcase-road-center" d="M-100 731C187 721 205 555 501 542S1012 650 1530 332"/>
      <path id="showcase-road-near-lane" d="M-100 749C187 739 205 573 501 560S1012 668 1530 350" pathLength="100"/>
      <path id="showcase-road-far-lane" d="M-100 713C187 703 205 537 501 524S1012 632 1530 314" pathLength="100"/>
    </defs>
    <use href="#showcase-road-center" class="showcase-road-shoulder"/>
    <use href="#showcase-road-center" class="showcase-road-asphalt"/>
    <use href="#showcase-road-center" class="showcase-road-markings"/>
    <use href="#showcase-road-near-lane" class="showcase-road-reflection"/>
    <use href="#showcase-road-near-lane" class="showcase-road-light"/>
    <use href="#showcase-road-far-lane" class="showcase-road-light showcase-road-light-return"/>
  </svg>
  <div class="showcase-inner">
    <div class="showcase-intro">
      <p class="showcase-eyebrow">${enquiryIcon('pin')} <span>Dubai Car Recovery <b>/ Our services</b></span></p>
      <h2 id="showcase-heading">Recovery, <em>reengineered.</em></h2>
      <p>Towing, vehicle transport, and roadside assistance across Dubai.</p>
    </div>
    <div class="showcase-grid">${showcaseCards.join('')}</div>
    <a class="showcase-all" href="/services/">View all recovery services ${enquiryIcon('arrow')}</a>
  </div>
</section>`;

const home = `<!-- recovery-hero -->
${booking('h2')}
${serviceShowcase}
${recoveryKinetic(enquiryIcon, services)}
${recoveryFeedback(business, services, serviceIcons)}
${faq}
<section class="process"><div class="section wrap"><h2>How to request recovery</h2><div class="steps"><article><span>01</span><h3>Tell us what happened</h3><p>Choose a service and describe your vehicle or the issue.</p></article><article><span>02</span><h3>Share your pickup point</h3><p>Enter a landmark, map link, or your device location.</p></article><article><span>03</span><h3>Confirm the details</h3><p>The team confirms availability, pickup, and pricing with you.</p></article></div></div></section>
${coverage}${pickupGuide}<section class="section wrap final-call"><h2>Need to move your vehicle?</h2><div class="actions">${actions}</div></section>`;
const guides = [
  ['dubai-breakdown-recovery-checklist', 'Dubai breakdown checklist', 'Once you’re somewhere safe, note the nearest exit, parking level, or landmark. Share your map pin, vehicle make and model, and whether it can roll and steer. Mention warning lights, leaks, or damage before arranging transport.'],
  ['flatbed-luxury-vehicle-transport-dubai', 'Planning a flatbed pickup', 'Mention low ground clearance, wheel locks, or a car that cannot go into neutral. Tell the team about ramps, basement entrances, and tight turns at both addresses. Confirm the pickup plan before moving the vehicle.'],
  ['motorcycle-offroad-recovery-dubai', 'Motorcycle and off-road pickup', 'Share your bike type, approximate weight, and whether the wheels turn. For an off-road pickup, provide a map pin, terrain details, and the nearest point accessible by road. Ask the team what equipment is suitable.'],
];
const pages = [
  ['/', name, 'Car towing, breakdown recovery, and roadside assistance in Dubai.', home],
  ['/services/', 'Recovery services', 'Explore vehicle recovery and roadside assistance in Dubai.', `<section class="section wrap"><h1>Recovery services</h1><div class="service-grid">${cards}</div></section>`],
  ...services.map(([slug, title, description], index) => [`/services/${slug}/`, title, description, `<section class="section wrap narrow"><a class="back-link" href="/services/">← All services</a><h1>${title}</h1><p>${description}</p><h2>Before you request a pickup</h2><p>${serviceAdvice[index]}</p><a class="button" href="/book/?service=${slug}">Request ${title.toLowerCase()} ↗</a></section>`]),
  ['/book/', 'Request recovery', 'Share pickup and vehicle details with the recovery team.', booking('h1')],
  ['/about/', 'About', 'How Dubai Car Recovery Near Me handles vehicle recovery enquiries.', `<section class="section wrap narrow"><h1>About Dubai Car Recovery Near Me</h1><p>Tell us what happened, where your vehicle is, and where it needs to go. The recovery team uses those details to confirm what help is available and what it will cost.</p><a class="button" href="/services/">Explore services ↗</a></section>`],
  ['/contact/', 'Contact', 'Contact Dubai Car Recovery Near Me.', `<section class="section wrap narrow"><h1>Contact</h1>${contactReady ? `<div class="actions">${phone}${whatsapp}</div>` : '<p>Business contact details will be added before launch.</p>'}</section>`],
  ['/privacy/', 'Privacy', 'How this website handles enquiry details.', '<section class="section wrap narrow"><h1>Privacy</h1><p>Pickup and contact details entered in the form stay in your browser until you choose to open WhatsApp. If you allow location access, the site uses your position to fill the pickup field. WhatsApp handles the message when you choose to send it.</p></section>'],
  ['/terms/', 'Terms', 'How recovery enquiries are handled.', '<section class="section wrap narrow"><h1>Terms</h1><p>Submitting an enquiry starts a conversation. The recovery team confirms the pickup plan, price, and availability directly.</p></section>'],
  ['/disclaimer/', 'Disclaimer', 'About service availability and site photography.', '<section class="section wrap narrow"><h1>Disclaimer</h1><p>Service descriptions are general guidance. Ask the team to confirm availability for your vehicle and pickup location. The website photography is illustrative.</p></section>'],
  ['/blogs/', 'Recovery guides', 'Pickup guidance for drivers and riders in Dubai.', `<section class="section wrap"><h1>Recovery guides</h1><div class="service-grid">${guides.map(([slug,title]) => `<article class="service-card"><h2>${title}</h2><a href="/blogs/${slug}/">Read guide ↗</a></article>`).join('')}</div></section>`],
  ...guides.map(([slug,title,copy]) => [`/blogs/${slug}/`,title,copy,`<section class="section wrap narrow"><a class="back-link" href="/blogs/">← Recovery guides</a><h1>${title}</h1><p>${copy}</p><a class="button" href="/book/">Plan a pickup ↗</a></section>`]),
];

await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await mkdir('dist/assets');
const recoveryHero = await buildRecoveryHero();
const serviceTapeItems = services.map(([, title]) => `<li>${title}</li>`).join('');
const serviceTape = `<div class="service-tape">
  <input class="service-tape-pause" type="checkbox" id="pause-service-tape" aria-label="Pause service ticker">
  <label class="service-tape-control" for="pause-service-tape" title="Pause or resume service ticker"><svg viewBox="0 0 16 16" aria-hidden="true"><path class="tape-pause-icon" d="M5 3v10m6-10v10"/><path class="tape-play-icon" d="m5 3 7 5-7 5z"/></svg></label>
  <div class="service-tape-window"><div class="service-tape-track">
    <ul aria-label="Recovery services">${serviceTapeItems}</ul>
    <ul aria-hidden="true">${serviceTapeItems}</ul>
  </div></div>
</div>`;
await cp('expressway.webp', 'dist/assets/expressway.webp');
await mkdir('dist/assets/service-art');
for (const name of [...showcaseServices.map(([slug]) => slug), 'overpass', 'skyline']) {
  await cp('service-' + name + '.webp', 'dist/assets/service-art/' + name + '.webp');
}
await mkdir('dist/assets/standard-art');
for (const file of ['advantage-loading-540.webp', 'advantage-loading-960.webp', 'dubai-szr-840.webp', 'dubai-szr-1440.webp', 'night-540.webp', 'night-960.webp']) {
  await cp('section3-' + file, 'dist/assets/standard-art/' + file);
}
const assetUrls = {};
const kineticScript = await build({ entryPoints: ['recovery-kinetic.js'], bundle: true, minify: true, write: false, legalComments: 'inline' });
for (const [name, extension] of [['design', 'css'], ['site', 'js'], ['recovery-kinetic', 'css'], ['recovery-kinetic', 'js'], ['recovery-feedback', 'css'], ['recovery-feedback', 'js']]) {
  const contents = name === 'recovery-kinetic' && extension === 'js'
    ? kineticScript.outputFiles[0].contents
    : await readFile(`${name}.${extension}`);
  const version = createHash('sha256').update(contents).digest('hex').slice(0, 12);
  const url = `/assets/${name}.${version}.${extension}`;
  await writeFile('dist' + url, contents);
  assetUrls[`${name}.${extension}`] = url;
}
const homepageAssets = `<link rel="stylesheet" href="/assets/recovery-hero.css"><script type="module" src="/assets/recovery-hero.js"></script><link rel="stylesheet" href="${assetUrls['recovery-kinetic.css']}"><script src="${assetUrls['recovery-kinetic.js']}" defer></script><link rel="stylesheet" href="${assetUrls['recovery-feedback.css']}"><script type="module" src="${assetUrls['recovery-feedback.js']}"></script>`;
for (const [path, title, description, content] of pages) {
  const directory = `dist${path}`;
  await mkdir(directory, { recursive: true });
  const canonical = business.domain + path;
  await writeFile(directory + 'index.html', `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${path === '/' ? title : title + ' | ' + name}</title><meta name="description" content="${description}"><meta name="robots" content="${indexable ? 'index,follow' : 'noindex,nofollow'}"><link rel="canonical" href="${canonical}"><link rel="stylesheet" href="${assetUrls['design.css']}"><script src="${assetUrls['site.js']}" defer></script>${path === '/' ? homepageAssets : ''}</head><body><a class="skip" href="#main">Skip to content</a><header><div class="wrap header-inner">${brand}<nav aria-label="Main"><a href="/services/">Services</a><a href="/#faq">FAQs</a><a href="/about/">About</a><a href="/contact/">Contact</a></nav><a class="button header-action" href="/book/">Plan a pickup ↗</a></div></header><main id="main">${path === '/' ? content.replace('<!-- recovery-hero -->', serviceTape + recoveryHero) : content}</main><footer class="wrap">${brand}<div><a href="/services/">Services</a><a href="/contact/">Contact</a><a href="/blogs/">Guides</a><a href="/privacy/">Privacy</a></div><small>Developed by <a href="https://www.stackendbox.com/">StackEndBox</a></small></footer><aside class="mobile-actions" aria-label="Recovery actions">${actions}</aside></body></html>`);
}
await writeFile('dist/robots.txt', indexable ? `User-agent: *\nAllow: /\nSitemap: ${business.domain}/sitemap.xml\n` : 'User-agent: *\nAllow: /\n');
await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map(([path]) => `<url><loc>${business.domain}${path}</loc></url>`).join('')}</urlset>`);
console.log(`Built ${pages.length} pages for ${business.domain}`);
