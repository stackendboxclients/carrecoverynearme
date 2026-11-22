const escape = text => text.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
export function recoveryEditorial(services, descriptions, icon) {
  const scenes = [
    ['gwagen', 'Black G-Wagon', 'Every vehicle.\nA considered recovery.', 'Car towing, flatbed transport and specialist vehicle recovery, arranged around your pickup and destination.', ['car-towing', 'flatbed-towing', 'luxury-car-transport', 'car-recovery']],
    ['rolls', 'Rolls-Royce', 'When the journey stops.\nWe help you move.', 'Tell us what happened and where you are. Discuss the right assistance for your vehicle and its condition.', ['emergency-recovery', 'emergency-car-recovery-towing', 'accident-recovery', 'roadside-assistance', 'battery-assistance']],
    ['lamborghini', 'Lamborghini', 'Different situations.\nThe same attention.', 'From low-clearance parking to off-road locations, share the access and terrain before recovery is arranged.', ['desert-recovery', 'basement-car-recovery', 'motorcycle-towing', 'tyre-assistance', 'fuel-delivery']],
    ['bugatti', 'Bugatti', 'Your next destination.\nAcross the UAE.', 'Vehicle pickup in Dubai, with delivery anywhere within Dubai or across the UAE. Discuss transport for your vehicle type.', ['full-down-box-recovery', 'vehicle-recovery', 'heavy-bus-towing', 'truck-recovery', 'passing-assistance']],
  ];
  return `<section class="recovery-editorial recovery-turntable" id="recovery-in-focus" aria-labelledby="editorial-heading">
    <header class="rt-intro"><p class="rt-kicker">Dubai Car Recovery / In motion</p><h2 id="editorial-heading">Recovery.<br><span>From every angle.</span></h2><p>Car towing &amp; Car recovery in Dubai 24/7</p><a class="ed-link rt-start" href="#rt-gwagen">Explore our recovery services ${icon('arrow')}</a><span class="rt-scroll" aria-hidden="true">Automatic rotation</span></header>
    ${scenes.map(([key, car, title, copy, slugs], index) => `<article class="rt-story" id="rt-${key}" aria-labelledby="rt-heading-${key}"><div class="rt-stage">
      <div class="rt-topline"><span>0${index + 1} / 04</span><span>${car} / Flatbed recovery</span></div>
      <div class="rt-visual" role="img" aria-label="Automatically rotating 3D recovery truck carrying a ${car}"><div class="rt-model" data-model="${key}"><img class="rt-model-fallback" src="/assets/turntable-${key}-poster.webp" width="512" height="342" alt="" loading="lazy" decoding="async"></div><span class="rt-orbit" aria-hidden="true"></span></div>
      <div class="rt-copy"><p class="rt-kicker">Dubai Car Recovery / Our services</p><h3 id="rt-heading-${key}">${title.split('\n').map(escape).join('<br>')}</h3><p class="rt-description">${escape(copy)}</p>
        <nav class="rt-services" aria-label="${escape(car)} scene recovery services">${slugs.map(slug => {
          const service = services.find(([key]) => key === slug);
          if (!service) throw new Error(`Missing turntable service: ${slug}`);
          return `<a class="ed-link rt-service" href="/services/${slug}/"><span>${escape(service[1])}</span>${icon('arrow')}<small>${escape(descriptions[slug] || service[2])}</small></a>`;
        }).join('')}</nav><a class="ed-link rt-request" href="#request-recovery">Request a vehicle pickup ${icon('arrow')}</a></div>
      <div class="rt-bottomline"><span>Live 3D / Automatic rotation</span><span>${index < 3 ? 'Next / ' + scenes[index + 1][1] : 'Explore the FAQs below'} ↓</span></div>
    </div></article>`).join('')}
  </section>`;
}
