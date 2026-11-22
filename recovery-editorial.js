const section = document.querySelector('.recovery-turntable');
if (section && 'IntersectionObserver' in window) {
  const preference = matchMedia('(prefers-reduced-motion: no-preference)');
  const enoughHeight = matchMedia('(min-height: 641px)');
  const active = new Set();
  const scenes = [...section.querySelectorAll('.rt-story')].map(element => ({ element, video: element.querySelector('video'), progress: 0, time: 0, loaded: false }));
  let frame = 0;
  let lastFrame = 0;
  const enabled = () => preference.matches && enoughHeight.matches;
  const clamp = value => Math.max(0, Math.min(1, value));
  function requestFrame() {
    if (!frame && enabled() && !document.hidden && active.size) frame = requestAnimationFrame(render);
  }
  function seek(scene) {
    const video = scene.video;
    if (video.readyState < 2 || video.seeking || !Number.isFinite(video.duration)) return;
    const time = Math.min(video.duration - 1 / 24, scene.time * video.duration);
    if (Math.abs(video.currentTime - time) >= 1 / 48) video.currentTime = time;
  }
  function load(scene) {
    if (scene.loaded || !enabled()) return;
    scene.loaded = true;
    scene.video.src = scene.video.dataset.src;
    scene.video.load();
  }
  function render(now) {
    frame = 0;
    if (!enabled() || document.hidden) return;
    const delta = Math.min(50, now - (lastFrame || now - 16));
    lastFrame = now;
    const ease = 1 - Math.exp(-delta / 90);
    let settling = false;
    const geometry = [...active].map(scene => ({ scene, rect: scene.element.getBoundingClientRect() }));
    for (const { scene, rect } of geometry) {
      const target = clamp(-rect.top / Math.max(1, rect.height - innerHeight));
      scene.progress += (target - scene.progress) * ease;
      if (Math.abs(target - scene.progress) < .0004) scene.progress = target;
      else settling = true;
      // Settle on a source view so the vehicle remains crisp when scrolling stops.
      scene.time = scene.progress === target ? Math.round(scene.progress * 16) / 16 : scene.progress;
      seek(scene);
      scene.element.style.setProperty('--rt-progress', scene.progress.toFixed(4));
      scene.element.style.setProperty('--rt-scale', (1 + Math.sin(scene.progress * Math.PI) * .085).toFixed(4));
      scene.element.style.setProperty('--rt-rise', `${(-Math.sin(scene.progress * Math.PI * 2) * 10).toFixed(2)}px`);
    }
    if (settling) requestFrame();
  }
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const scene = scenes.find(item => item.element === entry.target);
      if (entry.isIntersecting) { active.add(scene); load(scene); }
      else active.delete(scene);
    }
    requestFrame();
  }, { rootMargin: '120px 0px' });
  scenes.forEach(scene => {
    observer.observe(scene.element);
    scene.video.addEventListener('loadeddata', requestFrame);
    scene.video.addEventListener('seeked', () => { if (active.has(scene) && enabled()) seek(scene); });
    scene.video.addEventListener('error', () => {
      // Retain the poster when a media request or decoder fails.
      scene.video.removeAttribute('src');
      scene.video.load();
    }, { once: true });
  });
  function configure() {
    section.toggleAttribute('data-motion', enabled());
    if (enabled()) active.forEach(load);
    requestFrame();
  }
  window.addEventListener('scroll', requestFrame, { passive: true });
  window.addEventListener('resize', configure, { passive: true });
  document.addEventListener('visibilitychange', requestFrame);
  preference.addEventListener('change', configure);
  enoughHeight.addEventListener('change', configure);
  configure();
}
