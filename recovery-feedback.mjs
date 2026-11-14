const escape = text => text.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

function httpsUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : '';
  } catch {
    return '';
  }
}

const star = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 3 6 6.6 1-4.8 4.7 1.1 6.6-5.9-3.1-5.9 3.1 1.1-6.6L2.4 9l6.6-1Z"/></svg>';
const scenarios = [
  ['desert-recovery', 'Stuck in soft sand near Al Qudra', 'Send a map pin and a photo of where the wheels have sunk. Describe the track in so the team can assess access.'],
  ['flatbed-towing', 'A coupe with a low front bumper', 'Mention the ground clearance and any steep ramps when arranging a flatbed pickup.'],
  ['accident-recovery', 'A car that won’t steer after a collision', 'Once the scene is safe, describe the damage and share the address of the body shop.'],
  ['emergency-recovery', 'An engine that overheated near Al Khail Road', 'Share the vehicle’s exact location, the closest exit or landmark, and the garage you want it taken to.'],
  ['car-towing', 'A parked car that needs to go to the garage', 'Send both addresses and say whether the car can roll, steer, and shift into neutral.'],
  ['roadside-assistance', 'A breakdown on a service road', 'Share your pin, direction of travel, and what happened just before the car stopped.'],
  ['luxury-car-transport', 'A sports car in basement parking', 'Send the ramp height and ground clearance so the team can assess how to reach and load the vehicle.'],
  ['car-towing', 'A car that’s been sitting for months', 'If the vehicle was just bought or taken out of storage, share its condition and where someone can hand over the keys.'],
  ['motorcycle-towing', 'A motorcycle that needs workshop transport', 'Share the bike model, whether it rolls, and the workshop address.'],
  ['flatbed-towing', 'A hatchback with a locked rear wheel', 'Say which wheel won’t move and how much space there is around the car so the team can plan loading.'],
  ['desert-recovery', 'An SUV caught on a ridge off the track', 'Share photos of the underside and the nearest firm track so the team can assess the terrain.'],
  ['luxury-car-transport', 'A convertible headed to an Al Quoz workshop', 'Confirm who will hand over the keys and who can receive the car at the workshop.'],
  ['truck-recovery', 'A loaded van that broke down mid-route', 'Share the loaded weight and roof height, plus the address of your depot or workshop.'],
  ['passing-assistance', 'A flatbed pickup for a testing appointment', 'Share the testing centre and appointment time so you can discuss a pickup window.'],
  ['accident-recovery', 'A damaged car already parked off the road', 'Tell the team where it’s parked and whether the wheels and steering move freely before arranging pickup.'],
];

function ratingStars(rating) {
  return `<span class="feedback-stars" aria-hidden="true">${star.repeat(5)}<span class="feedback-stars-fill" style="width:${100 * rating / 5}%">${star.repeat(5)}</span></span>`;
}

function reviewCard({ author, text, rating, url }) {
  const initials = author.trim().split(/\s+/).slice(0, 2).map(part => [...part][0]).join('').toUpperCase();
  const stars = Number.isFinite(rating) && rating >= 1 && rating <= 5
    ? `<div class="feedback-rating" role="img" aria-label="${rating} out of 5 stars">${ratingStars(rating)}<span aria-hidden="true">${rating}</span></div>`
    : '';
  return `<li class="feedback-card">
    <figure class="feedback-surface">
      <figcaption class="feedback-card-meta">
        <span class="feedback-author"><span class="feedback-initials" aria-hidden="true">${escape(initials)}</span><span>${escape(author)}</span></span>
        ${stars}
      </figcaption>
      <blockquote><p>${escape(text)}</p></blockquote>
      ${url ? `<a class="feedback-source" href="${escape(url)}">Read original review <span aria-hidden="true">↗</span></a>` : ''}
    </figure>
  </li>`;
}

function scenarioCard([slug, title, text], serviceDetails) {
  const { name, icon } = serviceDetails.get(slug);
  return `<li class="feedback-card"><article class="feedback-surface feedback-scenario">
    <div class="feedback-card-meta">
      <span class="feedback-author"><span class="feedback-initials" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${icon}</svg></span><span>${escape(name)}</span></span>
    </div>
    <h3>${escape(title)}</h3>
    <p>${escape(text)}</p>
  </article></li>`;
}

function feedbackSection(reviews, profile, serviceDetails) {
  const showScenarios = reviews.length === 0;
  const totals = [[scenarios.length, 'Recovery scenarios'], [new Set(scenarios.map(([slug]) => slug)).size, 'Service types featured']];
  return `<section class="recovery-feedback" id="customer-feedback" aria-labelledby="feedback-title">
    <div class="wrap feedback-layout">
      <div class="feedback-intro${showScenarios ? ' feedback-intro-with-stats' : ''}">
        <div>
          <h2 id="feedback-title">${showScenarios ? 'What recovery <em>looks like</em>' : 'Customer <em>feedback</em>'}</h2>
          <p>${showScenarios ? 'Common recovery situations in Dubai and what to share when you book.' : 'Vehicle recovery and transport in Dubai.'}</p>
          ${profile ? `<a class="feedback-source" href="${escape(profile)}">Open review profile <span aria-hidden="true">↗</span></a>` : ''}
        </div>
        ${showScenarios ? `<dl class="feedback-summary">
          ${totals.map(([total, label]) => `<div><dt>${label}</dt><dd aria-label="${total}"><span aria-hidden="true" data-scenario-total>${total}</span></dd></div>`).join('')}
        </dl>` : ''}
      </div>
      <div class="feedback-deck">
        <ul class="feedback-track" tabindex="0" aria-label="${showScenarios ? 'Recovery scenarios' : 'Customer reviews'}. Use the left and right arrow keys to browse.">
          ${(showScenarios ? scenarios.map(scenario => scenarioCard(scenario, serviceDetails)) : reviews.map(reviewCard)).join('')}
        </ul>
      </div>
    </div>
  </section>`;
}

export function recoveryFeedback({ customerReviews, reviewProfile }, services, serviceIcons) {
  const entries = Array.isArray(customerReviews) ? customerReviews : [];
  const reviews = entries.flatMap(review => {
    const url = httpsUrl(review?.sourceUrl);
    if (!url || typeof review?.author !== 'string' || !review.author.trim() || typeof review.text !== 'string' || !review.text.trim()) return [];
    return [{ author: review.author, text: review.text, rating: review.rating, url }];
  });
  const serviceDetails = new Map(services.map(([slug, name], index) => [slug, { name, icon: serviceIcons[index] }]));
  return feedbackSection(reviews, httpsUrl(reviewProfile), serviceDetails);
}
