import { readFile, mkdir, writeFile, cp, rm } from 'node:fs/promises';

const business = JSON.parse(await readFile('business.json', 'utf8'));
const services = [
  ['car-towing', 'Car towing', 'Arrange transport to a garage, home, or another destination.', '01'],
  ['breakdown-recovery', 'Breakdown recovery', 'Share where your vehicle stopped and what happened so the team can assess pickup.', '02'],
  ['flatbed-towing', 'Flatbed towing', 'Ask about flatbed transport for a vehicle that needs to be carried off the road.', '03'],
  ['roadside-assistance', 'Roadside assistance', 'Describe the issue and your location so the team can assess the help you need.', '04'],
  ['accident-recovery', 'Accident recovery', 'Discuss pickup for a damaged vehicle once the scene is safe.', '05'],
  ['battery-assistance', 'Battery assistance', 'Describe the vehicle and symptoms so the team can assess jump-start assistance.', '06'],
];
const name = business.name;
const contactReady = Boolean(business.whatsapp || business.phone);
const indexable = business.launchReady && Boolean(business.whatsapp);
const coverage = `<section class="section wrap coverage" id="coverage"><div><p class="eyebrow">Pickup and drop-off</p><h2>Vehicle recovery in Dubai</h2><p>Use a map pin or landmark to show where the vehicle is. Share your drop-off address if you already know it. The team confirms availability for your location.</p><a class="button outline" href="/book/">Add your pickup point ↗</a></div><div class="route-art" aria-hidden="true"><span class="route-point pickup">Pickup</span><span class="route-point dropoff">Drop-off</span><span class="route-line"></span></div></section>`;
const pickupGuide = `<section class="section wrap pickup-guide" id="pickup-guide"><h2>Get ready for pickup</h2><div class="steps"><article><span>01</span><h3>Check your surroundings</h3><p>Move to a safe place if you can. If anyone is injured or there’s an immediate danger, contact emergency services.</p></article><article><span>02</span><h3>Save your map pin</h3><p>Share the nearest exit, landmark, or parking level so the team can find the vehicle.</p></article><article><span>03</span><h3>Describe the vehicle</h3><p>Include the make and model and whether it can steer or roll. Mention low clearance or limited access.</p></article></div></section>`;
const phone = business.phone ? `<a class="button outline" href="tel:${business.phone}">Call now</a>` : '';
const whatsapp = business.whatsapp ? `<a class="button outline" href="https://wa.me/${business.whatsapp}">WhatsApp</a>` : '';
const brand = `<a class="brand" href="/"><span class="brand-mark" aria-hidden="true">↗</span><span>Dubai Car Recovery <em>Near Me</em></span></a>`;
const actions = `<a class="button" href="/book/">Request recovery <span aria-hidden="true">↗</span></a>${phone}${whatsapp}`;
const serviceIcons = [
  '<path d="M2 6h13v11H2zM15 10h4l3 4v3h-7"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
  '<path d="m13 2-9 12h7l-1 8 10-12h-7z"/>',
  '<path d="M2 13h14V8h4l2 4v5H2z"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
  '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2"/>',
  '<path d="m12 3 8 3v6c0 4-3 7-8 9-5-2-8-5-8-9V6z"/><path d="m9 12 2 2 4-4"/>',
  '<rect x="3" y="7" width="17" height="10" rx="2"/><path d="M22 10v4M7 12h4M9 10v4m5-2h3"/>',
];
const serviceAdvice = [
  'Share where the car is parked, whether it can roll, and the address where it should be dropped off.',
  'Share a landmark or map pin. Describe any warning lights, leaks, or loss of power.',
  'Mention low clearance, locked wheels, and any access restrictions where the vehicle is parked.',
  'Describe the issue and say whether the vehicle is on a street or inside a parking structure.',
  'Arrange pickup once the scene is safe. Describe the damage and whether the vehicle can steer and roll.',
  'Share the make and model and describe what happens when you try to start the vehicle.',
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
<label>Destination or vehicle details <small>(optional)</small><textarea name="details" rows="4" maxlength="700"></textarea></label>
<button class="button" type="submit" ${business.whatsapp ? '' : 'disabled'}>Continue on WhatsApp ↗</button>
<p>Review the details in WhatsApp before sending. The team confirms pickup and price directly.</p></form></section>`;
const home = `<section class="hero"><div class="hero-art" aria-hidden="true"></div><div class="hero-light" aria-hidden="true"></div><div class="hero-sparks" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div><div class="wrap hero-content"><p class="eyebrow"><span></span> Dubai vehicle recovery</p><h1>Stuck on the road?<br><em>Request recovery.</em></h1><p class="hero-copy">Car towing, breakdown recovery, and roadside assistance in Dubai. Start with your vehicle details and pickup location.</p><div class="actions">${actions}<a class="button outline" href="#services">Explore services</a></div></div></section>
<section class="section wrap" id="services"><div class="section-title"><div><p class="eyebrow">Recovery and roadside assistance</p><h2>How can we help?</h2></div><div class="carousel-controls"><button data-slide="-1" aria-label="Previous services">←</button><button data-slide="1" aria-label="Next services">→</button></div></div><div class="service-grid carousel" tabindex="0" aria-label="Recovery services">${cards}</div>${serviceDialog}</section>
<section class="process"><div class="section wrap"><h2>How to request recovery</h2><div class="steps"><article><span>01</span><h3>Tell us what happened</h3><p>Choose a service and describe your vehicle or the issue.</p></article><article><span>02</span><h3>Share your pickup point</h3><p>Enter a landmark, map link, or your device location.</p></article><article><span>03</span><h3>Confirm the details</h3><p>The team confirms availability, pickup, and pricing with you.</p></article></div></div></section>${faq}
${coverage}${pickupGuide}<section class="section wrap final-call"><h2>Need to move your vehicle?</h2><div class="actions">${actions}</div></section>`;
const pages = [
  ['/', name, 'Car towing, breakdown recovery, and roadside assistance in Dubai.', home],
  ['/services/', 'Recovery services', 'Explore vehicle recovery and roadside assistance in Dubai.', `<section class="section wrap"><h1>Recovery services</h1><div class="service-grid">${cards}</div></section>`],
  ...services.map(([slug, title, description], index) => [`/services/${slug}/`, title, description, `<section class="section wrap narrow"><a class="back-link" href="/services/">← All services</a><h1>${title}</h1><p>${description}</p><h2>Before you request a pickup</h2><p>${serviceAdvice[index]}</p><a class="button" href="/book/?service=${slug}">Request ${title.toLowerCase()} ↗</a></section>`]),
  ['/book/', 'Request recovery', 'Share pickup and vehicle details with the recovery team.', booking],
  ['/about/', 'About', 'How Dubai Car Recovery Near Me handles vehicle recovery enquiries.', `<section class="section wrap narrow"><h1>About Dubai Car Recovery Near Me</h1><p>Tell us what happened, where your vehicle is, and where it needs to go. The recovery team uses those details to confirm what help is available and what it will cost.</p><a class="button" href="/services/">Explore services ↗</a></section>`],
  ['/contact/', 'Contact', 'Contact Dubai Car Recovery Near Me.', `<section class="section wrap narrow"><h1>Contact</h1>${contactReady ? `<div class="actions">${phone}${whatsapp}</div>` : '<p>Business contact details will be added before launch.</p>'}</section>`],
  ['/privacy/', 'Privacy', 'How this website handles enquiry details.', '<section class="section wrap narrow"><h1>Privacy</h1><p>Pickup and contact details entered in the form stay in your browser until you choose to open WhatsApp. If you allow location access, the site uses your position to fill the pickup field. WhatsApp handles the message when you choose to send it.</p></section>'],
];

await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await mkdir('dist/assets');
for (const asset of ['hero.webp', 'site.css', 'site.js']) await cp(asset, 'dist/assets/' + asset);
for (const [path, title, description, content] of pages) {
  const directory = `dist${path}`;
  await mkdir(directory, { recursive: true });
  const canonical = business.domain + path;
  await writeFile(directory + 'index.html', `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${path === '/' ? title : title + ' | ' + name}</title><meta name="description" content="${description}"><meta name="robots" content="${indexable ? 'index,follow' : 'noindex,nofollow'}"><link rel="canonical" href="${canonical}"><link rel="stylesheet" href="/assets/site.css"><script src="/assets/site.js" defer></script></head><body><a class="skip" href="#main">Skip to content</a><header><div class="wrap header-inner">${brand}<nav aria-label="Main"><a href="/services/">Services</a><a href="/#faq">FAQs</a><a href="/about/">About</a><a href="/contact/">Contact</a></nav><a class="button header-action" href="/book/">Request recovery ↗</a></div></header><main id="main">${content}</main><footer class="wrap">${brand}<div><a href="/services/">Services</a><a href="/contact/">Contact</a><a href="/privacy/">Privacy</a></div><small>Developed by <a href="https://www.stackendbox.com/">StackEndBox</a></small></footer><aside class="mobile-actions" aria-label="Recovery actions">${actions}</aside></body></html>`);
}
await writeFile('dist/robots.txt', indexable ? `User-agent: *\nAllow: /\nSitemap: ${business.domain}/sitemap.xml\n` : 'User-agent: *\nAllow: /\n');
await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map(([path]) => `<url><loc>${business.domain}${path}</loc></url>`).join('')}</urlset>`);
console.log(`Built ${pages.length} pages for ${business.domain}`);
