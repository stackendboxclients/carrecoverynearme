const section = document.querySelector('.recovery-editorial');
if (section && 'IntersectionObserver' in window) {
  const motion = matchMedia('(prefers-reduced-motion: no-preference)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const scenes = [...section.querySelectorAll('.ed-motion')];
  const visible = new Set();
  const pointer = new Map();
  let frame = 0;
  const clamp = value => Math.max(0, Math.min(1, value));

  function requestFrame() {
    if (!frame && motion.matches && !document.hidden && visible.size) frame = requestAnimationFrame(render);
  }
  function render() {
    frame = 0;
    if (!motion.matches || document.hidden) return;
    // Read geometry together, then update only visible scenes. Native scrolling stays untouched.
    const views = [...visible].map(scene => ({ scene, rect: scene.getBoundingClientRect(), imageHeight: scene.querySelector('.ed-photo')?.clientHeight }));
    let settling = false;
    for (const { scene, rect, imageHeight } of views) {
      const progress = clamp((innerHeight - rect.top) / (innerHeight + rect.height));
      const point = pointer.get(scene);
      if (point) {
        point.x += (point.targetX - point.x) * .13;
        point.y += (point.targetY - point.y) * .13;
        scene.style.setProperty('--ed-x', `${point.x.toFixed(2)}px`);
        scene.style.setProperty('--ed-y', `${point.y.toFixed(2)}px`);
        if (Math.abs(point.targetX - point.x) + Math.abs(point.targetY - point.y) > .05) settling = true;
      }
      scene.style.setProperty('--ed-scroll', `${((progress - .5) * Math.min(36, (imageHeight || rect.height) * .06)).toFixed(2)}px`);
      const entered = clamp((innerHeight * .94 - rect.top) / (innerHeight * .48));
      scene.style.setProperty('--ed-opacity', String(.45 + entered * .55));
      scene.style.setProperty('--ed-rise', `${((1 - entered) * 26).toFixed(2)}px`);
      if (scene.classList.contains('ed-statement')) {
        const words = [...scene.querySelectorAll('span')];
        const fill = clamp((innerHeight * .85 - rect.top) / (rect.height + innerHeight * .15));
        words.forEach((word, index) => {
          word.style.opacity = String(.28 + .72 * clamp(fill * (words.length + 2) - index));
        });
      }
    }
    if (settling) requestFrame();
  }
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) visible.add(entry.target);
      else visible.delete(entry.target);
    }
    requestFrame();
  }, { rootMargin: '80px 0px' });
  scenes.forEach(scene => {
    observer.observe(scene);
    pointer.set(scene, { x: 0, y: 0, targetX: 0, targetY: 0 });
    scene.addEventListener('pointermove', event => {
      if (!motion.matches || !finePointer.matches || event.pointerType === 'touch') return;
      const rect = scene.getBoundingClientRect();
      const point = pointer.get(scene);
      point.targetX = (clamp((event.clientX - rect.left) / rect.width) - .5) * 14;
      point.targetY = (clamp((event.clientY - rect.top) / rect.height) - .5) * 10;
      requestFrame();
    }, { passive: true });
    scene.addEventListener('pointerleave', () => {
      const point = pointer.get(scene);
      point.targetX = 0;
      point.targetY = 0;
      requestFrame();
    }, { passive: true });
  });
  const configure = () => {
    section.toggleAttribute('data-motion', motion.matches);
    if (!motion.matches) section.querySelectorAll('.ed-statement span').forEach(word => word.style.removeProperty('opacity'));
    requestFrame();
  };
  window.addEventListener('scroll', requestFrame, { passive: true });
  window.addEventListener('resize', requestFrame, { passive: true });
  document.addEventListener('visibilitychange', requestFrame);
  motion.addEventListener('change', configure);
  configure();
}
