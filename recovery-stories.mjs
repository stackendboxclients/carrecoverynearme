const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);

export const storyRoutes = {
  'car-towing': ['Dubai Marina', 'Al Quoz, Dubai'],
  'roadside-assistance': ['Jumeirah, Dubai', 'Al Barsha, Dubai'],
  'emergency-recovery': ['Downtown Dubai', 'Ras Al Khor, Dubai'],
  'accident-recovery': ['Business Bay, Dubai', 'Al Quoz, Dubai'],
  'flatbed-towing': ['Motor City, Dubai', 'Dubai Investment Park'],
  'desert-recovery': ['Al Qudra, Dubai', 'Al Quoz, Dubai'],
  'luxury-car-transport': ['Palm Jumeirah, Dubai', 'Yas Island, Abu Dhabi'],
  'motorcycle-towing': ['Deira, Dubai', 'Al Garhoud, Dubai'],
  'full-down-box-recovery': ['DIFC, Dubai', 'Al Hamra, Ras Al Khaimah'],
  'vehicle-recovery': ['Dubai Hills', 'Industrial Area, Sharjah'],
  'car-recovery': ['JLT, Dubai', 'Al Quoz, Dubai'],
  'emergency-car-recovery-towing': ['Al Barsha, Dubai', 'Ras Al Khor, Dubai'],
  'basement-car-recovery': ['Business Bay basement, Dubai', 'Al Quoz, Dubai'],
};

export function recoveryStories(services, descriptions, icon, details, arrival, contact) {
  return `<section class="recovery-stories" id="recovery-stories" aria-labelledby="stories-heading">
    <div class="stories-background" aria-hidden="true"></div>
    <header class="stories-header"><p>Dubai pickup. Your next destination.</p><h2 id="stories-heading">Recovery, wherever your journey leads.</h2><p>Explore our services and illustrative pickup and drop-off routes across Dubai and the UAE.</p></header>
    <div class="stories-stage">
      <div class="stories-rail" tabindex="0" aria-label="Recovery service images. Swipe to browse, tap to expand. Press Space to pause automatic movement.">
        ${services.map(([slug, title], index) => {
          const [pickup, dropoff] = storyRoutes[slug];
          return `<button type="button" class="story-card" data-story="${slug}" data-index="${index}" data-detail="${escape(details[slug])}" aria-label="Explore ${escape(title)}" aria-haspopup="dialog">
            <img src="/assets/recovery-scenes/${slug}.webp" alt="" width="1024" height="1280" loading="lazy" decoding="async">
            <span class="story-copy"><strong>${escape(title)}</strong><span class="story-description">${escape(descriptions[slug])}</span><span class="story-route"><span><small>Pickup</small>${escape(pickup)}</span><span aria-hidden="true">→</span><span><small>Drop-off</small>${escape(dropoff)}</span></span><span class="story-expand-hint">Tap to explore ${icon('plus')}</span></span>
          </button>`;
        }).join('')}
      </div>
      <button class="stories-arrow stories-prev" type="button" aria-label="Previous recovery image">${icon('arrow')}</button>
      <button class="stories-arrow stories-next" type="button" aria-label="Next recovery image">${icon('arrow')}</button>
    </div>
    <p class="stories-footnote"><span>Illustrative routes · Swipe to browse · Tap to expand</span></p>
    <dialog class="story-dialog" aria-labelledby="story-dialog-title" aria-describedby="story-dialog-description">
      <div class="story-dialog-content"><img class="story-dialog-image" alt=""><button class="story-dialog-close" type="button" aria-label="Close recovery image">×</button><div class="story-dialog-copy"><p>Illustrative recovery route</p><h3 id="story-dialog-title"></h3><p id="story-dialog-description"></p><p class="story-dialog-arrival">${escape(arrival)}</p><div class="story-dialog-route"></div><div class="service-contact-actions">${contact}</div><p class="story-dialog-hint">Tap again to close. Automatically closes after 5 seconds.</p></div></div>
    </dialog>
  </section>`;
}
