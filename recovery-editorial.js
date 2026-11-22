import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const section = document.querySelector('.recovery-turntable');
if (section) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const stages = [...section.querySelectorAll('.rt-model')];
  const states = new Map();
  let frame = 0, previous = 0;
  const visibleHosts = new Set();
  async function loadModel(kind) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(`/assets/recovery-model-${kind}.glb.gz`, { signal: controller.signal });
      if (!response.ok) throw new Error('Model unavailable');
      let bytes = await response.arrayBuffer();
      if (bytes.byteLength > 12000000) throw new Error('Unexpected model size');
      const header = new Uint8Array(bytes, 0, Math.min(4, bytes.byteLength));
      if (header[0] === 31 && header[1] === 139) {
        const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
        bytes = await new Response(stream).arrayBuffer();
      }
      if (new DataView(bytes).getUint32(0, true) !== 0x46546c67) throw new Error('Invalid model');
      return (await new GLTFLoader().parseAsync(bytes, '')).scene;
    } finally { clearTimeout(timeout); }
  }
  async function create(host) {
    if(host.dataset.fallback || host.dataset.loading)return null;
    host.dataset.loading = 'true';
    try {
      const model = await loadModel(host.dataset.model);
      const renderer = new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
      renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));
      renderer.setClearColor(0x000000,0);
      renderer.outputColorSpace=THREE.SRGBColorSpace;
      renderer.toneMapping=THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure=.92;
      const scene=new THREE.Scene();
      const room=new RoomEnvironment();
      const pmrem=new THREE.PMREMGenerator(renderer);
      const environment=pmrem.fromScene(room,.04);
      scene.environment=environment.texture;
      scene.environmentIntensity=.65;
      room.dispose();pmrem.dispose();
      scene.add(new THREE.HemisphereLight(0xeaf3ff,0x252032,1.4));
      const key=new THREE.DirectionalLight(0xffffff,2.8);key.position.set(-5,8,6);scene.add(key);
      const edge=new THREE.DirectionalLight(0xffd4b2,1.6);edge.position.set(5,4,-5);scene.add(edge);
      const camera=new THREE.PerspectiveCamera(32,1,.1,100);
      camera.position.set(-7.7,5.6,9.2);camera.lookAt(0,1.8,0);
      scene.add(model);
      model.rotation.y=-.15;
      const state={host,renderer,scene,camera,model,environment,active:false,visible:false,lost:false};
      const resize=()=>{const width=host.clientWidth,height=host.clientHeight;if(!width||!height)return;renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();renderer.render(scene,camera);};
      new ResizeObserver(resize).observe(host);resize();
      renderer.domElement.setAttribute('aria-hidden','true');
      renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();host.removeAttribute('data-ready');state.lost=true;state.active=false;});
      renderer.domElement.addEventListener('webglcontextrestored',()=>{host.dataset.ready='true';state.lost=false;state.active=state.visible;resize();requestFrame();});
      host.append(renderer.domElement);host.dataset.ready='true';states.set(host,state);return state;
    } catch(error) { host.dataset.fallback='true'; return null; }
    finally { delete host.dataset.loading; }
  }
  function requestFrame() {if(!frame&&!document.hidden&&[...states.values()].some(s=>s.active)&&!reduced.matches)frame=requestAnimationFrame(render);}
  function render(now) {
    frame=0;
    if(document.hidden||reduced.matches)return;
    if(now-previous>=1000/30-1) {
      const delta=Math.min(50,now-(previous||now));previous=now;
      for(const state of states.values()) if(state.active) {state.model.rotation.y+=delta*.00025;state.renderer.render(state.scene,state.camera);}
    }
    requestFrame();
  }
  const observer=new IntersectionObserver(entries=>{
    for(const entry of entries) {
      if(entry.isIntersecting)visibleHosts.add(entry.target);else visibleHosts.delete(entry.target);
      const state=states.get(entry.target);
      if(state){state.visible=entry.isIntersecting;state.active=entry.isIntersecting&&!state.lost;}
      else if(entry.isIntersecting)create(entry.target).then(created=>{
        if(created){created.visible=visibleHosts.has(entry.target);created.active=created.visible;previous=0;requestFrame();}
      });
    }
    previous=0;requestFrame();
  },{rootMargin:'120px 0px'});
  stages.forEach(host=>observer.observe(host));
  document.addEventListener('visibilitychange',()=>{previous=0;requestFrame();});
  reduced.addEventListener('change',()=>{previous=0;requestFrame();});
}
