import { readFile, mkdir, writeFile, cp, rm } from 'node:fs/promises';

const business = JSON.parse(await readFile('business.json', 'utf8'));
const services = [
  ['car-towing', 'Car towing', 'Arrange transport to a garage, home, or another destination.', '01'],
  ['emergency-recovery', 'Breakdown recovery', 'Arrange pickup when your vehicle can’t continue the journey.'],
  ['flatbed-towing', 'Flatbed towing', 'Ask about flatbed transport for a vehicle that needs to be carried off the road.', '03'],
  ['roadside-assistance', 'Roadside assistance', 'Describe the issue and your location so the team can assess the help you need.', '04'],
  ['accident-recovery', 'Accident recovery', 'Discuss pickup for a damaged vehicle once the scene is safe.', '05'],
  ['battery-assistance', 'Battery assistance', 'Describe the vehicle and symptoms so the team can assess jump-start assistance.', '06'],
  ['luxury-car-transport', 'Luxury car transport', 'Plan transport for a sports car, luxury vehicle, or low-clearance car.'],
  ['tyre-assistance', 'Tyre assistance', 'Get help assessing a puncture, flat tyre, or damaged wheel.'],
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
  'Tell the team which wheel is affected and whether you have a usable spare and wheel-lock key.',
  'Share the correct fuel type and a safe access point near your vehicle.',
  'Provide a map pin and describe the surface, slope, and whether the vehicle is stuck or damaged.',
  'Tell the team the type of bike, whether it rolls, and where it needs to go.',
  'Provide the loaded weight, height, length, and whether cargo is still on board.',
  'Share your inspection centre, appointment time, and whether the vehicle can roll and steer.',
];
const cards = services.map(([slug, title, description], index) => `<article class="service-card"><span class="service-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${serviceIcons[index]}</svg></span><h3>${title}</h3><p>${description}</p><a href="/services/${slug}/" data-service="${index}">Explore service <span aria-hidden="true">↗</span></a><template class="service-advice">${serviceAdvice[index]}</template></article>`).join('');
const serviceDialog = `<dialog id="service-dialog" aria-labelledby="service-dialog-title"><div class="dialog-panel"><button class="close-dialog" type="button" aria-label="Close service details">×</button><div class="dialog-icon"></div><h2 id="service-dialog-title"></h2><p class="dialog-description"></p><p class="dialog-advice"></p><div class="actions"><a class="button dialog-book">Request this service ↗</a><a class="button outline dialog-link">Service page</a></div><nav aria-label="Browse services"><button type="button" data-dialog-step="-1">← Previous</button><button type="button" data-dialog-step="1">Next →</button></nav></div></dialog>`;
const faq = `<section class="section wrap" id="faq"><h2>Recovery questions</h2>
<details><summary>What should I have ready for a recovery request?</summary><p>Share your pickup location, vehicle type, and what happened. Include your preferred destination if you already know it.</p></details>
<details><summary>Can I enter my pickup location manually?</summary><p>Yes. Enter an area, nearby landmark, or a map link. You can also use your device location if you choose.</p></details>
<details><summary>When is recovery confirmed?</summary><p>The recovery team confirms availability, price, and pickup arrangements directly with you.</p></details></section>`;
const booking = `<section class="section wrap narrow"><h1>Request vehicle recovery</h1><p>Enter your pickup details so the recovery team can assess your request.</p>
${business.whatsapp ? '' : '<p class="notice">Online booking is awaiting the business WhatsApp number.</p>'}
<form id="booking" data-whatsapp="${business.whatsapp}"><label>Name<input name="name" autocomplete="name" maxlength="100" required></label>
<label>Phone<input name="phone" type="tel" autocomplete="tel" maxlength="30" required></label>
<label>Service<select name="service" required><option value="">Choose a service</option>${services.map(([slug, title]) => `<option value="${slug}">${title}</option>`).join('')}</select></label>
<label>Pickup location<input name="pickup" maxlength="300" placeholder="Area, landmark, or map link" required></label>
<button class="button outline" type="button" id="location">Use my location</button><p id="location-status" role="status"></p>
<label>Vehicle <small>(optional)</small><input name="vehicle" maxlength="120" placeholder="Make and model"></label>
<label>Drop-off <small>(optional)</small><input name="destination" maxlength="300" placeholder="Garage or address"></label>
<label>Pickup timing <small>(optional)</small><select name="timing"><option>As soon as available</option><option>Scheduled pickup</option></select></label>
<label id="scheduled" hidden>Preferred date and time<input type="datetime-local" name="datetime"></label>
<label>Anything else? <small>(optional)</small><textarea name="details" rows="4" maxlength="700" placeholder="Vehicle condition or pickup access"></textarea></label>
<button class="button" type="submit" ${business.whatsapp ? '' : 'disabled'}>Continue on WhatsApp ↗</button>
<p>Review the details in WhatsApp before sending. The team confirms pickup and price directly.</p></form></section>`;
const home = `<section class="hero wrap"><div class="hero-content"><p class="eyebrow">Dubai towing & roadside assistance</p><h1>When the road<br>stops<span>.</span></h1><p class="hero-copy">From a flat tyre to a flatbed tow, find the right help for your vehicle and tell us exactly where to pick it up.</p><div class="actions">${actions}<a class="button outline" href="#services">Browse services</a></div></div><figure class="hero-scene"><img src="/assets/expressway.webp" alt="Illustration of a flatbed recovery truck transporting a car on a Dubai expressway" fetchpriority="high" width="1400" height="900"><div class="scene-light" aria-hidden="true"></div><span class="scene-caption">Dubai, UAE</span></figure></section>
<section class="service-band" id="services"><div class="section wrap"><div class="section-title"><div><p class="eyebrow">Recovery services</p><h2>Find the right help.</h2></div><div class="carousel-controls"><button data-slide="-1" aria-label="Previous services">←</button><button data-slide="1" aria-label="Next services">→</button></div></div><div class="service-grid carousel" tabindex="0" aria-label="Recovery services">${cards}</div><a class="all-services" href="/services/">View all 13 services ↗</a>${serviceDialog}</div></section>
<section class="process"><div class="section wrap"><h2>How to request recovery</h2><div class="steps"><article><span>01</span><h3>Tell us what happened</h3><p>Choose a service and describe your vehicle or the issue.</p></article><article><span>02</span><h3>Share your pickup point</h3><p>Enter a landmark, map link, or your device location.</p></article><article><span>03</span><h3>Confirm the details</h3><p>The team confirms availability, pickup, and pricing with you.</p></article></div></div></section>${faq}
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
  ['/book/', 'Request recovery', 'Share pickup and vehicle details with the recovery team.', booking],
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
for (const asset of ['expressway.webp', 'design.css', 'site.js']) await cp(asset, 'dist/assets/' + asset);
for (const [path, title, description, content] of pages) {
  const directory = `dist${path}`;
  await mkdir(directory, { recursive: true });
  const canonical = business.domain + path;
  await writeFile(directory + 'index.html', `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${path === '/' ? title : title + ' | ' + name}</title><meta name="description" content="${description}"><meta name="robots" content="${indexable ? 'index,follow' : 'noindex,nofollow'}"><link rel="canonical" href="${canonical}"><link rel="stylesheet" href="/assets/design.css"><script src="/assets/site.js" defer></script></head><body><a class="skip" href="#main">Skip to content</a><header><div class="wrap header-inner">${brand}<nav aria-label="Main"><a href="/services/">Services</a><a href="/#faq">FAQs</a><a href="/about/">About</a><a href="/contact/">Contact</a></nav><a class="button header-action" href="/book/">Plan a pickup ↗</a></div></header><main id="main">${content}</main><footer class="wrap">${brand}<div><a href="/services/">Services</a><a href="/contact/">Contact</a><a href="/blogs/">Guides</a><a href="/privacy/">Privacy</a></div><small>Developed by <a href="https://www.stackendbox.com/">StackEndBox</a></small></footer><aside class="mobile-actions" aria-label="Recovery actions">${actions}</aside></body></html>`);
}
await writeFile('dist/robots.txt', indexable ? `User-agent: *\nAllow: /\nSitemap: ${business.domain}/sitemap.xml\n` : 'User-agent: *\nAllow: /\n');
await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map(([path]) => `<url><loc>${business.domain}${path}</loc></url>`).join('')}</urlset>`);
console.log(`Built ${pages.length} pages for ${business.domain}`);
