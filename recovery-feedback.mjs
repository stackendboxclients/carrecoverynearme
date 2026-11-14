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

const samples = [
  ['Nadia A.', 5, 'We got stuck in soft sand near Al Qudra. I sent a pin and a photo of the track, and they pulled us back to firm ground.'],
  ['Omar R.', 4.5, 'My coupe sits low and I was worried about the front bumper. The driver adjusted the flatbed angle and kept an eye on the clearance as it went up.'],
  ['Leila M.', 5, 'The car overheated coming off Al Khail Road. I left it at a petrol station and met the driver there for the tow to my garage.'],
  ['Samir K.', 4, 'The car lost power in the mall car park and I needed a tow. We went to different entrances at first, but the parking level and ramp number helped the driver find me.'],
  ['Hana S.', 5, 'After someone hit my front wheel, I couldn’t steer the car. Once we were clear to move it, the team loaded it and took it straight to the body shop.'],
  ['Daniel V.', 5, 'I bought a car that had been sitting for months. I met the driver at the seller’s place and followed the flatbed to my mechanic.'],
  ['Mariam T.', 4.5, 'My car was two levels down in a tight basement. I sent a photo of the height sign before booking so we could work out how to get it up to the street.'],
  ['Karim B.', 5, 'My car wouldn’t start when I finished my shift. The driver met me by the loading gate and took it to the garage I use.'],
  ['Aisha N.', 4, 'My car lost power on a service road, so I booked a tow to my garage. The pickup took a little longer than expected, but they called with an update.'],
  ['Faris J.', 5, 'My bike started leaking coolant, so I called for transport. The driver strapped it upright and dropped it at the shop I use.'],
  ['Sana D.', 4.5, 'The rear wheel on my hatchback wouldn’t turn. The driver spotted it before loading and explained how he was going to get the car onto the truck.'],
  ['Yusuf H.', 5, 'Our SUV caught underneath on a ridge off the track. I sent a photo of where it was sitting, and they helped us get it back onto the track.'],
  ['Rania E.', 5, 'I needed my convertible moved from my building to a workshop in Al Quoz. My brother handed over the keys and the driver called me when he reached the workshop.'],
  ['Bilal C.', 4, 'Our delivery van broke down halfway through the morning run. It took a second call to confirm the load and roof height, but the team got it to our workshop.'],
  ['Zara F.', 5, 'I had a morning appointment at the vehicle testing centre and needed the car brought in on a flatbed. We picked a time and I met the driver at the entrance.'],
].map(([author, rating, text]) => ({ author, rating, text }));

function ratingStars(rating) {
  return `<span class="feedback-stars" aria-hidden="true">${star.repeat(5)}<span class="feedback-stars-fill" style="width:${100 * rating / 5}%">${star.repeat(5)}</span></span>`;
}

function reviewCard({ author, text, rating, url }, sample) {
  const initials = author.trim().split(/\s+/).slice(0, 2).map(part => [...part][0]).join('').toUpperCase();
  const stars = Number.isFinite(rating) && rating >= 1 && rating <= 5
    ? `<div class="feedback-rating" role="img" aria-label="${rating} out of 5 stars">${ratingStars(rating)}<span aria-hidden="true">${rating}</span></div>`
    : '';
  return `<li class="feedback-card">
    <figure class="feedback-surface">
      <figcaption class="feedback-card-meta">
        <span class="feedback-author"><span class="feedback-initials" aria-hidden="true">${escape(initials)}</span><span>${escape(author)}${sample ? '<small class="feedback-example-label">Fictional review</small>' : ''}</span></span>
        ${stars}
      </figcaption>
      <blockquote><p>${escape(text)}</p></blockquote>
      ${url ? `<a class="feedback-source" href="${escape(url)}">Read original review <span aria-hidden="true">↗</span></a>` : ''}
    </figure>
  </li>`;
}

function feedbackSection(reviews, profile, sample) {
  return `<section class="recovery-feedback" id="customer-feedback" aria-labelledby="feedback-title">
    <div class="wrap feedback-layout">
      <div class="feedback-intro${sample ? ' feedback-intro-with-stats' : ''}">
        <div>
          <h2 id="feedback-title">Customer <em>feedback</em></h2>
          ${sample ? '' : '<p>Vehicle recovery and transport in Dubai.</p>'}
          ${profile ? `<a class="feedback-source" href="${escape(profile)}">Open review profile <span aria-hidden="true">↗</span></a>` : ''}
        </div>
        ${sample ? `<dl class="feedback-preview-stats">
          <div><dt>Illustrative customer count</dt><dd><span class="feedback-visually-hidden">4,000+</span><span aria-hidden="true"><span data-feedback-count>4,000</span><span class="feedback-count-plus">+</span></span></dd></div>
          <div><dt>Illustrative rating</dt><dd><span class="feedback-visually-hidden">4.5 out of 5 stars</span><span data-feedback-score aria-hidden="true">4.5</span>${ratingStars(4.5)}</dd></div>
        </dl>` : ''}
      </div>
      <div class="feedback-deck">
        <ul class="feedback-track" tabindex="0" aria-label="${sample ? 'Fictional review examples' : 'Customer reviews'}. Use the left and right arrow keys to browse.">
          ${reviews.map(review => reviewCard(review, sample)).join('')}
        </ul>
      </div>
    </div>
  </section>`;
}

export function recoveryFeedback({ customerReviews, reviewProfile } = {}) {
  const entries = Array.isArray(customerReviews) ? customerReviews : [];
  const reviews = entries.flatMap(review => {
    const url = httpsUrl(review?.sourceUrl);
    if (!url || typeof review?.author !== 'string' || !review.author.trim() || typeof review.text !== 'string' || !review.text.trim()) return [];
    return [{ author: review.author, text: review.text, rating: review.rating, url }];
  });
  return reviews.length ? feedbackSection(reviews, httpsUrl(reviewProfile), false) : feedbackSection(samples, httpsUrl(reviewProfile), true);
}
