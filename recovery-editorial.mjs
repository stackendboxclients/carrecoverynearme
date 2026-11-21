const escape = text => text.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

export function recoveryEditorial(services, descriptions, icon) {
  const chapters = [
    ['Your pickup.', 'Put your pickup location and vehicle details together whenever you need to.', '/assets/service-art/emergency-car-recovery-towing.webp', 'Recovery truck ready for a vehicle pickup'],
    ['Your vehicle.', 'Tell us its condition, clearance and pickup access so we can discuss suitable transport.', '/assets/standard-art/advantage-loading-960.webp', 'Low-clearance car beside a flatbed recovery truck'],
    ['Your destination.', 'Choose a recovery service and add your pickup location if you know it. The recovery team confirms availability and pricing before dispatch.', '/assets/standard-art/night-960.webp', 'Dubai roads and skyline at night'],
  ];
  const featured = ['flatbed-towing', 'luxury-car-transport', 'desert-recovery', 'basement-car-recovery'];
  const statement = 'Vehicle pickup in Dubai, with delivery across all seven UAE emirates.';
  return `<section class="recovery-editorial" id="recovery-in-focus" aria-labelledby="editorial-heading">
  <div class="ed-cover ed-motion">
    <picture class="ed-cover-image ed-image">
      <source media="(max-width: 600px)" srcset="/assets/hero-dubai-gwagon-night-mobile.webp">
      <img src="/assets/hero-dubai-gwagon-night.webp" width="1672" height="941" loading="lazy" decoding="async" alt="Flatbed recovery truck carrying a black SUV in front of the Dubai skyline at night">
    </picture>
    <div class="ed-cover-inner">
      <p class="ed-kicker">Dubai Car Recovery / In focus</p>
      <h2 id="editorial-heading">Recovery planned<br>around your vehicle.</h2>
      <div class="ed-cover-copy"><p>Car towing &amp; Car recovery in Dubai 24/7</p><a class="ed-link" href="#request-recovery">Request a vehicle pickup ${icon('arrow')}</a></div>
    </div>
  </div>
  <div class="ed-chapters">
    ${chapters.map(([title, description, src, alt], index) => `<article class="ed-chapter ed-motion">
      <figure class="ed-photo"><div class="ed-image"><img src="${src}" width="960" height="640" alt="${alt}" loading="lazy" decoding="async"></div></figure>
      <div class="ed-chapter-copy ed-reveal"><p class="ed-kicker">0${index + 1} / 03</p><h3>${title}</h3><p>${description}</p><a class="ed-link" href="#request-recovery">Discuss your recovery needs ${icon('arrow')}</a></div>
    </article>`).join('')}
  </div>
  <div class="ed-statement ed-motion"><p aria-label="${statement}">${statement.split(' ').map(word => `<span aria-hidden="true">${word}</span>`).join(' ')}</p></div>
  <div class="ed-featured">
    ${featured.map((slug, index) => {
      const [, title] = services.find(([key]) => key === slug);
      return `<article class="ed-service ed-motion">
        <div class="ed-service-copy ed-reveal"><p class="ed-kicker">Service / 0${index + 1}</p><h3>${escape(title)}</h3><p>${escape(descriptions[slug])}</p><a class="ed-link" href="/services/${slug}/">Explore service ${icon('arrow')}</a></div>
        <figure class="ed-photo"><div class="ed-image"><img src="/assets/service-art/${slug}.webp" width="686" height="342" alt="${escape(title)} in Dubai" loading="lazy" decoding="async"></div></figure>
      </article>`;
    }).join('')}
  </div>
  <div class="ed-directory">
    <div><p class="ed-kicker">Our services</p><h3>Find your recovery service.</h3></div>
    <nav aria-label="Explore recovery services">${services.map(([slug, title]) => `<a href="/services/${slug}/">${escape(title)} ${icon('arrow')}</a>`).join('')}</nav>
    <a class="ed-link" href="#request-recovery">Request a vehicle pickup ${icon('arrow')}</a>
  </div>
</section>`;
}
