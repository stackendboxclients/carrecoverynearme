const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);

const serviceCare = {
  'car-towing': ['Careful loading', 'Secure transport'],
  'roadside-assistance': ['Issue assessed', 'Practical support'],
  'emergency-recovery': ['Clear updates', 'Suitable recovery'],
  'accident-recovery': ['Damage-aware handling', 'Planned loading'],
  'flatbed-towing': ['Platform transport', 'Wheel restraints'],
  'desert-recovery': ['Terrain assessed', 'Recovery planned'],
  'luxury-car-transport': ['Clearance checks', 'Careful handover'],
  'motorcycle-towing': ['Upright loading', 'Secure restraints'],
  'full-down-box-recovery': ['Enclosed transport', 'Protected loading'],
  'vehicle-recovery': ['Suitable equipment', 'Planned handover'],
  'car-recovery': ['Careful handling', 'Garage transport'],
  'emergency-car-recovery-towing': ['Availability confirmed', 'Clear arrival updates'],
  'basement-car-recovery': ['Height checked', 'Access planned'],
};

export function recoveryStories(services, descriptions, icon, details, arrival, contact) {
  return `<section class="recovery-stories" id="recovery-stories" aria-labelledby="stories-heading">
    <div class="stories-background" aria-hidden="true"></div>
    <header class="stories-header"><p>Dubai pickup. Your next destination.</p><h2 id="stories-heading">Recovery, wherever your journey leads.</h2><p>Explore recovery services, careful loading and vehicle transport across Dubai and the UAE.</p></header>
    <div class="stories-stage">
      <div class="stories-rail" tabindex="0" aria-label="Recovery service images. Swipe to browse, tap to expand. Press Space to pause automatic movement.">
        ${services.map(([slug, title], index) => {
          const [handling, transport] = serviceCare[slug];
          return `<button type="button" class="story-card" data-story="${slug}" data-index="${index}" data-detail="${escape(details[slug])}" aria-label="Explore ${escape(title)}" aria-haspopup="dialog">
            <img src="/assets/recovery-scenes/${slug}-640.webp" srcset="/assets/recovery-scenes/${slug}-360.webp 360w, /assets/recovery-scenes/${slug}-640.webp 640w, /assets/recovery-scenes/${slug}.webp 1120w" sizes="(max-width:600px) 82vw, (max-width:899px) 65vw, 390px" alt="" width="1024" height="1280" loading="lazy" decoding="async">
            <span class="story-copy"><strong>${escape(title)}</strong><span class="story-description">${escape(descriptions[slug])}</span><span class="story-service-highlights"><span>${escape(handling)}</span><span>${escape(transport)}</span></span><span class="story-expand-hint">Tap to explore ${icon('plus')}</span></span>
          </button>`;
        }).join('')}
      </div>
      <button class="stories-arrow stories-prev" type="button" aria-label="Previous recovery image">${icon('arrow')}</button>
      <button class="stories-arrow stories-next" type="button" aria-label="Next recovery image">${icon('arrow')}</button>
    </div>

    <dialog class="story-dialog" aria-labelledby="story-dialog-title" aria-describedby="story-dialog-description">
      <div class="story-dialog-content"><img class="story-dialog-image" alt=""><button class="story-dialog-close" type="button" aria-label="Close recovery image">×</button><div class="story-dialog-copy"><p>Careful recovery, planned around your vehicle</p><h3 id="story-dialog-title"></h3><p id="story-dialog-description"></p><p class="story-dialog-arrival">${escape(arrival)}</p><div class="story-dialog-highlights"></div><div class="service-contact-actions">${contact}</div><p class="story-dialog-hint">Tap again to close. Automatically closes after 5 seconds.</p></div></div>
    </dialog>
  </section>`;
}
