import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// Original, unbranded geometry. X is vehicle length and Z is axle width.
export function buildRecoveryVehicle(kind = 'gwagen') {
  const root = new THREE.Group();
  const materials = {};
  const mat = (key, color, metalness = .6, roughness = .25) => materials[key] ||= new THREE.MeshPhysicalMaterial({color,metalness,roughness,clearcoat:1,clearcoatRoughness:.18});
  const dark = mat('truck','#161b22',.4,.3), orange = mat('orange','#f8790d',.28,.28);
  const rubber = mat('rubber','#17191c',0,.83), chrome = mat('chrome','#b5bec8',.95,.2), black = mat('black','#090d12',.35,.3);
  const glass = mat('glass','#213340',.65,.1), lamp = mat('lamp','#e9f6ff',.45,.13), red = mat('red-lamp','#ce1025',.35,.18);
  const amber = mat('amber','#ff9d16',.3,.2); amber.emissive.set('#b44800'); amber.emissiveIntensity=.8;
  const paint = mat('paint',kind==='rolls'?'#bcc2c9':kind==='lamborghini'?'#f6be11':'#080b10',.38,.2);
  const redPaint = mat('red-paint','#a9132b',.35,.2);
  function mesh(parent, geometry, material, x=0,y=0,z=0) { const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m; }
  function box(parent,w,h,d,x,y,z,material,r=.035) { return mesh(parent,new RoundedBoxGeometry(w,h,d,2,Math.min(r,w/3,h/3,d/3)),material,x,y,z); }
  function cyl(parent,radius,length,x,y,z,material,segments=32) {const m=mesh(parent,new THREE.CylinderGeometry(radius,radius,length,segments),material,x,y,z);m.rotation.x=Math.PI/2;return m;}
  function line(parent,points,radius,material) {return mesh(parent,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),12,radius,6,false),material);}
  function profile(parent,points,width,x,y,material) {
    const shape=new THREE.Shape();points.forEach(([a,b],i)=>i?shape.lineTo(a,b):shape.moveTo(a,b));shape.closePath();
    const geo=new THREE.ExtrudeGeometry(shape,{depth:width,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.05,bevelThickness:.045});geo.translate(0,0,-width/2);return mesh(parent,geo,material,x,y,0);
  }
  function archedBody(parent,points,width,axle,radius,material) {
    const shape=new THREE.Shape();points.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));
    shape.lineTo(axle+radius+.07,.38);shape.absarc(axle,.38,radius+.07,0,Math.PI,false);
    shape.lineTo(-axle+radius+.07,.38);shape.absarc(-axle,.38,radius+.07,0,Math.PI,false);shape.closePath();
    const geo=new THREE.ExtrudeGeometry(shape,{depth:width,bevelEnabled:true,bevelSegments:4,bevelSize:.035,bevelThickness:.035,steps:1});geo.translate(0,0,-width/2);return mesh(parent,geo,material);
  }
  function loft(parent,sections,material,canopy=false,roof=false) {
    const positions=[],indices=[],uvs=[],steps=32;
    sections.forEach(([x,width,center,height],i)=>{
      for(let j=0;j<=steps;j++) {
        const angle=canopy?(roof?.88:0)+(roof?1.38:Math.PI)*j/steps:Math.PI*2*j/steps;
        let y=center+Math.sin(angle)*height,z=Math.cos(angle)*width;
        if(!canopy&&Math.abs(z)>.68) {
          for(const axle of [-1.52,1.52]) {
            const d=x-axle,r=.415;
            if(Math.abs(d)<r)y=Math.max(y,.365+Math.sqrt(r*r-d*d));
          }
        }
        positions.push(x,y,z);uvs.push(i/(sections.length-1),j/steps);
        if(i&&j){const a=i*(steps+1)+j,b=a-(steps+1);indices.push(a,b,a-1,b,b-1,a-1);}
      }
    });
    if(!canopy) for(const [i,flip] of [[0,false],[sections.length-1,true]]) {
      const center=positions.length/3;positions.push(sections[i][0],sections[i][2],0);uvs.push(.5,.5);
      for(let j=0;j<steps;j++){const a=i*(steps+1)+j;indices.push(center,flip?a+1:a,flip?a:a+1);}
    }
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.setIndex(indices);geometry.computeVertexNormals();
    return mesh(parent,geometry,material);
  }
  function wheel(parent,x,y,z,radius,width,luxury=false) {
    const w=new THREE.Group();w.position.set(x,y,z);parent.add(w);
    cyl(w,radius,width,0,0,0,rubber,48);
    const outward=Math.sign(z);
    cyl(w,radius*.68,.035,0,0,outward*(width/2+.008),black);
    const rim=cyl(w,radius*.59,.05,0,0,outward*(width/2+.035),luxury?black:chrome,48);
    const ring=mesh(w,new THREE.TorusGeometry(radius*.67,radius*.035,8,48),chrome,0,0,outward*(width/2+.045));
    for(let i=0;i<(luxury?10:8);i++) {
      const spoke=box(w,radius*.12,radius*.92,.03,0,0,outward*(width/2+.075),chrome,.012);
      spoke.rotation.z=i*Math.PI/(luxury?5:4);spoke.position.x=Math.sin(spoke.rotation.z)*radius*.17;spoke.position.y=Math.cos(spoke.rotation.z)*radius*.17;
    }
    cyl(w,radius*.18,.065,0,0,outward*(width/2+.09),chrome);
    for(let i=0;i<6;i++) cyl(w,radius*.035,.07,Math.sin(i*Math.PI/3)*radius*.28,Math.cos(i*Math.PI/3)*radius*.28,outward*(width/2+.08),chrome,8);
    // Circumferential grooves add tyre detail without bitmap textures.
    for(const side of [-1,1]) {const groove=mesh(w,new THREE.TorusGeometry(radius*.96,.012,5,48),black,0,0,side*width*.23);}
    return w;
  }
  // Recovery chassis, deck, rails, tool lockers and hydraulic equipment.
  box(root,8.15,.25,1.6,.05,.75,0,black);
  box(root,6.12,.18,2.37,1.18,1.28,0,orange);
  box(root,6.0,.07,2.18,1.18,1.405,0,dark,.02);
  for(const z of [-1.17,1.17]) {
    box(root,6.15,.12,.07,1.18,1.38,z,orange,.02);
    for(let x=-1.5;x<4.1;x+=.58) box(root,.2,.04,.08,x,1.47,z,chrome,.01);
    box(root,1.05,.65,.27,-.66,.85,z*.81,chrome);
    box(root,1.15,.5,.27,.55,.8,z*.81,dark);
    for(const x of [-.65,.55]) box(root,.16,.025,.035,x,.91,z*.94,chrome,.01);
    for(const x of [-1.05,.1,1.2,3.35,4.05]) box(root,.13,.07,.025,x,1.29,z*1.012,amber,.012);
    for(const x of [-3.12,2.67]) wheel(root,x,.65,z*.92,.64,.32);
    box(root,1.38,.12,.35,2.67,1.22,z*.94,dark);
    box(root,.3,.5,.36,3.38,.51,z*.88,rubber);
  }
  // Cab-over truck with sloped windscreen, grille, mirrors and lights.
  profile(root,[[-4.12,.8],[-4.13,2.12],[-3.86,2.92],[-2.05,2.92],[-1.84,2.62],[-1.84,.88]],2.07,0,0,dark);
  box(root,1.45,.77,1.86,-3.01,2.47,0,glass,.08);
  box(root,.08,.7,1.8,-3.83,2.36,0,glass,.02).rotation.z=-.24;
  box(root,.08,.08,1.87,-3.95,2.77,0,dark,.01);
  box(root,.1,.75,1.62,-4.16,1.55,0,black,.01);
  for(let y=1.24;y<1.9;y+=.15) box(root,.05,.035,1.55,-4.225,y,0,chrome,.008);
  box(root,.2,.22,2.14,-4.13,.91,0,chrome,.03);
  for(const z of [-.81,.81]) {
    box(root,.07,.17,.42,-4.23,1.06,z,lamp,.025);
    box(root,.1,.075,.18,-4.25,1.22,z,amber,.01);
    const side=z<0?-1:1;
    box(root,1.05,.61,.025,-2.73,2.45,side*1.073,glass,.05);
    box(root,.15,.025,.03,-2.15,1.98,side*1.09,chrome,.01);
    line(root,[[-3.8,2.6,side*1.05],[-4.0,2.6,side*1.38],[-4.0,2.1,side*1.38]],.027,chrome);
    box(root,.22,.48,.13,-4.02,2.32,side*1.39,dark,.04);
    box(root,.17,.35,.015,-4.02,2.32,side*1.47,chrome,.02);
    box(root,.9,.1,.22,-2.9,1.12,side*1.1,chrome,.02);
  }
  box(root,1.05,.11,1.55,-2.75,3.02,0,black);
  for(const z of [-.53,.53]) box(root,.65,.18,.43,-2.75,3.13,z,amber,.06);
  for(const z of [-.82,.82]) {box(root,.08,.18,.43,4.3,1.13,z,red);box(root,.08,.09,.13,4.31,1.13,z*.65,lamp);}
  box(root,.12,.12,2.18,4.25,.87,0,chrome,.02);
  cyl(root,.13,.38,-1.35,1.59,0,chrome);box(root,.45,.3,.55,-1.4,1.5,0,black);
  // Distinct loaded passenger vehicles, modelled as solid geometry.
  const car=new THREE.Group();car.position.set(1.18,1.46,0);root.add(car);
  const suv=kind==='gwagen', sedan=kind==='rolls', lambo=kind==='lamborghini';
  const length=suv?4.05:sedan?4.75:4.35, half=length/2, width=suv?1.86:sedan?1.95:2.04;
  const axle=suv?1.38:sedan?1.63:1.52, radius=suv?.41:.365;
  for(const x of [-axle,axle]) for(const z of [-width*.5,width*.5]) wheel(car,x,radius,z,radius,.22,true);
  if(suv) {
    archedBody(car,[[-2.04,.38],[-2.04,1.08],[2.04,1.08],[2.04,.38]],1.82,axle,radius,paint);
    box(car,2.85,1.12,1.7,.42,1.48,0,paint,.07);
    box(car,1.05,.14,1.77,-1.48,1.12,0,paint,.025);
    box(car,.045,.68,1.52,-1.045,1.6,0,glass,.015);
    box(car,.04,.64,1.5,1.87,1.6,0,glass,.02);
    for(const z of [-.865,.865]) {
      for(const [x,w] of [[-.47,.91],[.55,.89],[1.41,.58]]) box(car,w,.65,.025,x,1.6,z,glass,.035);
      for(const x of [-.98,.05,1.05]) box(car,.035,.8,.03,x,1.53,z,paint,.008);
      for(const x of [-.3,.75]) box(car,.19,.035,.045,x,1.12,z*1.04,chrome,.01);
      box(car,2.5,.075,.06,.4,2.09,z*.82,black,.02);
      box(car,3.05,.1,.16,0,.48,z*1.1,chrome,.02);

    }
    const spare=cyl(car,.4,.23,2.08,1.15,0,rubber); spare.rotation.y=Math.PI/2;
    box(car,.05,.37,1.2,-2.1,.86,0,black);
    for(const z of [-.7,.7]) {const light=mesh(car,new THREE.SphereGeometry(.17,20,12),lamp,-2.1,.96,z);light.scale.x=.18;}
  } else {
    const silhouette=sedan?[[-half,.4],[-half,.91],[-1.5,1.02],[1.55,.98],[half,.88],[half,.4]]:
      [[-half,.37],[-half,.61],[-1.25,.82],[1.3,.85],[half,.7],[half,.37]];
    if(sedan) archedBody(car,silhouette,width,axle,radius,paint);
    else {
      const xs=[-2.18,-2.04,-1.9,-1.75,-1.6,-1.52,-1.4,-1.25,-1.1,-.8,-.3,.3,.8,1.1,1.25,1.4,1.52,1.65,1.85,2.04,2.18];
      loft(car,xs.map(x=>[x,Math.abs(x)>2?.82:Math.abs(x)>1.8?.94:1.02,.66,Math.abs(x)>1.9?.17:.26]),paint);
    }
    const glassShape=sedan?[[-1.38,1.06],[-.76,1.46],[.9,1.46],[1.43,1.05]]:[[-1.1,.88],[-.48,1.18],[.57,1.2],[1.12,.9]];
    if(sedan) {
      profile(car,glassShape,width*.84,0,.015,glass);
      box(car,1.68,.045,width*.78,.08,1.54,0,black,.025);
    } else {
      const canopy=[[-1.16,.73,.83,.06],[-.96,.77,.88,.15],[-.66,.79,.92,.3],[-.3,.81,.92,.38],[.28,.8,.92,.38],[.65,.76,.9,.3],[.98,.7,.85,.16],[1.22,.64,.81,.03]];
      loft(car,canopy,glass,true);
      loft(car,canopy.slice(2,6).map(([x,w,y,h])=>[x,w,y+.015,h+.012]),paint,true,true);
    }
    for(const z of [-width*.52,width*.52]) {
      box(car,sedan?3.2:2.95,.12,.07,.05,.46,z,black,.02);
      box(car,.35,.13,.12,-.7,sedan?1.23:.97,z*1.07,paint,.04);
      box(car,.025,sedan?.48:.33,.04,.12,sedan?1.25:1.02,z*.84,sedan?chrome:paint,.006);
      box(car,.2,.025,.03,.38,.89,z,chrome,.005);
      if(kind==='bugatti') {
        box(car,1.56,.38,.035,.35,.73,z,redPaint,.1);
        line(car,[[-.05,1.17,z*.53],[.68,1.1,z*.85],[1.14,.84,z*1.005],[.73,.59,z*.99],[0,.53,z*.97]],.022,chrome);
      }
      if(lambo) profile(car,[[.25,.5],[1.25,.52],[1.08,.8],[.38,.83]],.035,0,0,black).position.z=z;
    }
    if(sedan) {
      box(car,.055,.48,.95,-half-.06,.78,0,chrome,.025);
      for(let z=-.4;z<=.4;z+=.075) box(car,.06,.4,.025,-half-.095,.78,z,black,.004);
      for(const z of [-.72,.72]) box(car,.06,.16,.34,-half-.06,.87,z,lamp,.02);
    } else {
      for(const z of [-.73,.73]) {const light=box(car,.06,.06,.4,-half-.055,.67,z,lamp,.01);light.rotation.x=lambo?.2:0;}
      box(car,.06,.27,.75,-half-.06,.51,0,black,.03);
      if(kind==='bugatti') box(car,.08,.29,.39,-half-.1,.53,0,chrome,.08);
    }
  }
  box(car,.06,.06,width*.82,half+.045,.72,0,red,.02);
  box(car,.09,.12,width*.88,half+.03,.42,0,black,.02);
  for(const z of [-.53,.53]) cyl(car,.055,.13,half+.08,.43,z,chrome,16).rotation.y=Math.PI/2;
  // Orange ratchet straps visibly secure each loaded wheel to the flatbed.
  for(const x of [-axle,axle]) for(const z of [-1,1]) {
    line(root,[[1.18+x-.34,1.48,z*1.09],[1.18+x-.22,1.94,z*.99],[1.18+x+.18,1.93,z*.99],[1.18+x+.41,1.48,z*1.09]],.025,orange);
    box(root,.12,.045,.08,1.18+x+.39,1.49,z*1.08,chrome,.01);
  }
  root.name=`Original ${kind} flatbed recovery assembly`;
  // The assembly is rigid, so batch surfaces by material instead of issuing
  // hundreds of small draw calls on phones.
  root.updateMatrixWorld(true);
  const batches=new Map();
  root.traverse(object=>{
    if(!object.isMesh)return;
    const geometry=object.geometry.clone().applyMatrix4(object.matrixWorld);
    const flat=geometry.index?geometry.toNonIndexed():geometry;
    if(flat!==geometry)geometry.dispose();
    if(!batches.has(object.material))batches.set(object.material,[]);
    batches.get(object.material).push(flat);
    object.geometry.dispose();
  });
  const result=new THREE.Group();result.name=root.name;
  for(const [material,geometries] of batches) {
    result.add(new THREE.Mesh(mergeGeometries(geometries),material));
    geometries.forEach(geometry=>geometry.dispose());
  }
  return result;
}
