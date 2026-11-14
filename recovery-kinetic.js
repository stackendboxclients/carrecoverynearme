import { gsap } from 'gsap';

const section = document.querySelector('.recovery-kinetic');

if (section) {
  const stage = section.querySelector('.adv-stage');
  const panels = [...stage.querySelectorAll('.adv-panel')];
  const buttons = panels.map(panel => panel.querySelector('.adv-select'));
  const pause = section.querySelector('.adv-pause');
  const effects = new EventTarget();
  const events = new AbortController();
  const listen = { signal: events.signal };

  function choose(index, focus = false) {
    stage.dataset.selected = panels[index].dataset.panel;
    buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
    if (focus) buttons[index].focus();
    effects.dispatchEvent(new Event('selection'));
  }

  stage.dataset.enhanced = '';
  buttons.forEach((button, index) => {
    button.hidden = false;
    button.addEventListener('click', () => choose(index), listen);
    button.addEventListener('keydown', event => {
      const directions = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 };
      let next;
      if (Object.hasOwn(directions, event.key)) next = (index + directions[event.key] + buttons.length) % buttons.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = buttons.length - 1;
      else return;
      event.preventDefault();
      choose(next, true);
    }, listen);
  });

  const service = panels.find(panel => panel.dataset.panel === 'services');
  service.addEventListener('change', event => {
    if (event.target.name === 'recovery-capability' && stage.dataset.selected !== 'services') {
      choose(panels.indexOf(service));
    }
  }, listen);

  if ('IntersectionObserver' in window) {
    const queries = gsap.matchMedia();
    queries.add('(prefers-reduced-motion: no-preference)', () => {
      const motionEvents = new AbortController();
      const motionListen = { signal: motionEvents.signal };
      const backdrop = section.querySelector('.adv-backdrop img');
      const ambient = gsap.timeline({ paused: true, repeat: -1 })
        .fromTo(backdrop, { scale: 1.025, xPercent: -1 }, { scale: 1.065, xPercent: 1, duration: 7, ease: 'sine.inOut', yoyo: true, repeat: 1 });
      const contact = panels.find(panel => panel.dataset.panel === 'contact');
      const contactLoop = contactScene(contact);
      const capability = capabilityMotion(service, motionListen);
      const contextual = new Map(panels.filter(panel => panel !== contact && panel !== service).map(panel => [panel, contextualScene(panel)]));
      const activePanels = new Set();
      const introduced = new Set();
      const pending = new Set();
      const started = new Set();
      let selected = stage.dataset.selected;
      let paused = false;
      let revealed = false;

      function sync() {
        const canPlay = !paused && !document.hidden;
        ambient.paused(!canPlay || !activePanels.size);
        contactLoop.timeScale(selected === 'contact' ? 1 : .82).paused(!canPlay || !activePanels.has(contact));
        capability.sync(canPlay && activePanels.has(service));
        for (const [panel, { reveal, reflection }] of contextual) {
          const visible = canPlay && activePanels.has(panel);
          reflection.paused(!visible);
          if (!visible) reveal.pause();
          else if (pending.delete(panel)) {
            started.add(panel);
            reveal.restart();
          } else if (started.has(panel) && reveal.progress() < 1) reveal.resume();
        }
        stage.toggleAttribute('data-playing', canPlay && activePanels.size > 0);
        stage.toggleAttribute('data-paused', paused);
      }

      const observer = new IntersectionObserver(entries => {
        for (const {target, isIntersecting, intersectionRatio} of entries) {
          if (isIntersecting && intersectionRatio >= .25) {
            activePanels.add(target);
            if (contextual.has(target) && !introduced.has(target)) {
              introduced.add(target);
              pending.add(target);
            }
          } else activePanels.delete(target);
        }
        if (!revealed && activePanels.size && !paused) {
          revealed = true;
          gsap.fromTo(panels.map(panel => panel.querySelector('.adv-scene')), { opacity: .78 }, { opacity: 1, duration: .62, stagger: .06 });
        }
        sync();
      }, { threshold: [0, .25] });
      panels.forEach(panel => observer.observe(panel));
      pause.hidden = false;

      effects.addEventListener('selection', () => {
        selected = stage.dataset.selected;
        for (const [panel, { reveal }] of contextual) {
          if (panel.dataset.panel === selected) {
            introduced.add(panel);
            if (!started.has(panel) || reveal.progress() === 1) pending.add(panel);
          } else {
            pending.delete(panel);
            if (started.delete(panel) && reveal.progress() < 1) reveal.progress(1).pause();
          }
        }
        sync();
      }, motionListen);
      const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
      for (const panel of panels) {
        if (panel === service) continue;
        if (contextual.has(panel)) {
          const requestReveal = () => {
            if (paused || !activePanels.has(panel)) return;
            const { reveal } = contextual.get(panel);
            if (started.has(panel) && reveal.progress() < 1) return;
            pending.add(panel);
            sync();
          };
          panel.addEventListener('pointerenter', event => {
            if (finePointer.matches && event.pointerType !== 'touch') requestReveal();
          }, motionListen);
          panel.querySelector('.adv-select').addEventListener('focus', event => {
            if (event.target.matches(':focus-visible')) requestReveal();
          }, motionListen);
          continue;
        }
        const photo = panel.querySelector('.adv-photo');
        const nudge = gsap.quickTo(photo, 'x', { duration: .55, ease: 'power3.out' });
        let middle = 0;
        panel.addEventListener('pointerenter', () => {
          const bounds = panel.getBoundingClientRect();
          middle = bounds.left + bounds.width / 2;
        }, motionListen);
        panel.addEventListener('pointermove', event => {
          if (paused || selected !== panel.dataset.panel || !finePointer.matches || event.pointerType === 'touch') return;
          nudge(gsap.utils.clamp(-3, 3, (event.clientX - middle) * .025));
        }, motionListen);
        panel.addEventListener('pointerleave', () => { if (!paused) nudge(0); }, motionListen);
      }
      pause.addEventListener('click', () => {
        paused = !paused;
        pause.setAttribute('aria-label', paused ? 'Resume section animations' : 'Pause section animations');
        sync();
      }, motionListen);
      document.addEventListener('visibilitychange', sync, motionListen);

      return () => {
        observer.disconnect();
        capability.cleanup();
        motionEvents.abort();
        pause.hidden = true;
        pause.setAttribute('aria-label', 'Pause section animations');
        stage.removeAttribute('data-playing');
        stage.removeAttribute('data-paused');
      };
    }, section);
  }
}

function contactScene(panel) {
  const pick = gsap.utils.selector(panel);
  return gsap.timeline({ paused: true, repeat: -1, defaults: { ease: 'power2.inOut', immediateRender: false } })
    .fromTo(pick('.adv-phone-shine'), { opacity: .08, xPercent: -45 }, { opacity: .88, xPercent: 35, duration: 1.55, yoyo: true, repeat: 1 }, 0)
    .fromTo(pick('.adv-signal-rings i'), { scale: .48, opacity: .88 }, { scale: 1.12, opacity: 0, duration: 1.8, stagger: .32, ease: 'power1.out' }, .13)
    .to(pick('.adv-device'), { y: -7, rotation: -5, duration: 1.55, yoyo: true, repeat: 1 }, 0);
}

function capabilityMotion(panel, listen) {
  const display = panel.querySelector('.cap-display');
  const pick = gsap.utils.selector(display);
  const previews = new Map(pick('.cap-preview').map(preview => [preview.dataset.capability, preview]));
  const light = pick('.cap-reflection');
  let current = previews.get(display.querySelector('input:checked').value);
  let visible = false;
  let entered = false;
  let transition;

  const intro = gsap.timeline({ paused: true, defaults: { ease: 'power2.out', immediateRender: false } })
    .fromTo(pick('.cap-count span'), { yPercent: 82, opacity: .22 }, { yPercent: 0, opacity: 1, duration: .4 }, .08)
    .fromTo(pick('.cap-key .cap-icon'), { y: 3, opacity: .38 }, { y: 0, opacity: 1, stagger: .035, duration: .28 }, .22)
    .fromTo(pick('.cap-preview-stage'), { opacity: .45 }, { opacity: 1, duration: .42 }, .55);
  const ambient = gsap.timeline({ paused: true, repeat: -1, yoyo: true })
    .fromTo(light, { xPercent: -10, opacity: .4 }, { xPercent: 9, opacity: .85, duration: 5.5, ease: 'sine.inOut' });

  function settle() {
    transition?.revert();
    transition = undefined;
    const outgoing = display.querySelector('.is-exiting');
    outgoing?.classList.remove('is-exiting');
    outgoing?.removeAttribute('aria-hidden');
  }

  display.addEventListener('change', event => {
    const next = previews.get(event.target.value);
    if (!next || current === next) return;
    settle();
    const outgoing = current;
    current = next;
    if (!visible) return;
    outgoing.classList.add('is-exiting');
    outgoing.setAttribute('aria-hidden', 'true');
    transition = gsap.timeline({ defaults: { ease: 'power2.out' }, onComplete: settle })
      .to(outgoing, { opacity: 0, duration: .14 }, 0)
      .fromTo(next, { opacity: 0 }, { opacity: 1, duration: .27 }, .14)
      .fromTo(next.querySelector('.cap-art .cap-accent'), { strokeDashoffset: 1, opacity: .45 }, { strokeDashoffset: 0, opacity: 1, duration: .5 }, .16);
  }, listen);

  return {
    sync(canPlay) {
      visible = canPlay;
      ambient.paused(!visible);
      if (!visible) {
        intro.pause();
        settle();
        return;
      }
      if (!entered) { entered = true; intro.play(); }
      else intro.resume();
    },
    cleanup: settle,
  };
}

function contextualScene(panel) {
  const pick = gsap.utils.selector(panel);
  const reveal = gsap.timeline({ paused: true, defaults: { ease: 'power2.out', immediateRender: false } });
  const reflection = gsap.timeline({ paused: true, repeat: -1, yoyo: true, repeatDelay: 2.5 });
  reflection.fromTo(pick('.adv-scene-reflection'), { opacity: .12 }, { opacity: .27, duration: 4, ease: 'sine.inOut' });
  reveal.fromTo(pick('.adv-scene-veil'), { opacity: .82, xPercent: -12 }, { opacity: 0, xPercent: 18, duration: .46 }, 0);

  if (panel.dataset.panel === 'handling') {
    reveal.addLabel('clearance', .45).addLabel('annotations', .96)
      .set(pick('.adv-loading-note span, .adv-loading-note i'), { opacity: 0 }, 0)
      .fromTo(pick('.adv-loading-light'), { xPercent: -21, opacity: 0 }, { xPercent: 2, opacity: .9, duration: .49 }, 'clearance')
      .fromTo(pick('.adv-loading-note i'), { scaleY: .25, opacity: 0 }, { scaleY: 1, opacity: 1, duration: .29, stagger: .23 }, 'annotations')
      .fromTo(pick('.adv-loading-note span'), { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: .33, stagger: .23 }, 'annotations+=.13')
      .to(pick('.adv-loading-light'), { xPercent: 14, opacity: 0, duration: .72, ease: 'power1.inOut' }, 1.58);
  } else {
    reveal.addLabel('briefing', .4).addLabel('details', .85).addLabel('quote', 1.64)
      .fromTo(pick('.adv-briefing-photo img'), { xPercent: -1.5, scale: 1.035 }, { xPercent: 0, scale: 1.035, duration: .85, ease: 'power1.out' }, 0)
      .set(pick('.adv-briefing, .adv-briefing dl div, .adv-briefing-action'), { opacity: 0 }, 0)
      .fromTo(pick('.adv-briefing'), { opacity: 0, y: 7, clipPath: 'inset(0% 0% 94% 0%)' }, { opacity: 1, y: 0, clipPath: 'inset(0% 0% 0% 0%)', duration: .45 }, 'briefing')
      .fromTo(pick('.adv-briefing dl div'), { y: 3, opacity: 0 }, { y: 0, opacity: 1, duration: .28, stagger: .14 }, 'details')
      .fromTo(pick('.adv-briefing-action'), { opacity: 0 }, { opacity: 1, duration: .35 }, 'quote')
      .fromTo(pick('.adv-briefing-highlight'), { xPercent: -68, opacity: .85 }, { xPercent: 60, opacity: 0, duration: .65 }, 'quote');
  }
  return { reveal, reflection };
}
