import {useEffect, useRef, useState} from 'react';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import './cinematic.css';

const ease=(v:number)=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v);};
const segment=(t:number,a:number,b:number)=>ease((t-a)/(b-a));

// Original, procedural materials: no stock models, downloaded assets or baked text.
function texture(kind:'paper'|'satin'|'velvet'|'liner'|'card'|'monogram'){
 const c=document.createElement('canvas'); c.width=1024;c.height=1024;const x=c.getContext('2d')!;
 let seed=312;const rand=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
 x.fillStyle=kind==='velvet'?'#36423b':kind==='satin'?'#d4bea0':'#f5f0e6';x.fillRect(0,0,1024,1024);
 for(let i=0;i<85000;i++){const a=rand()*1024,b=rand()*1024;x.fillStyle=rand()>.5?'rgba(255,255,255,.12)':'rgba(69,49,26,.16)';x.fillRect(a,b,kind==='satin'?1:rand()*2+.3,kind==='velvet'?3:1);}
 if(kind==='satin'){for(let i=0;i<1024;i+=2){x.fillStyle=i%4?'#ffffff0b':'#3f2c1a0a';x.fillRect(0,i,1024,1);}}
 if(kind==='liner'){
  x.strokeStyle='#78806b';x.lineWidth=1.2;
  for(let j=0;j<9;j++){x.save();x.translate((j%3)*360-40,Math.floor(j/3)*370);x.rotate(-.35+j*.07);x.beginPath();x.moveTo(0,320);x.bezierCurveTo(90,200,25,120,160,0);x.stroke();
   for(let k=0;k<6;k++){const y=280-k*45,xx=35+k*15;x.fillStyle=k%2?'#87917e80':'#6b7b614a';x.beginPath();x.ellipse(xx-24,y-20,13,36,-.7,0,Math.PI*2);x.fill();x.beginPath();x.ellipse(xx+18,y-36,12,32,.8,0,Math.PI*2);x.fill();}x.restore();}
 }
 if(kind==='card'||kind==='monogram'){
  x.textAlign='center';x.fillStyle='#8d734a';x.font='italic 80px Georgia';x.fillText('Е & С',512,kind==='card'?220:560);
  if(kind==='card'){x.strokeStyle='#b9a47a';x.lineWidth=1;x.strokeRect(45,45,934,934);x.font='25px Georgia';x.fillText('СО ЉУБОВ ВЕ ПОКАНУВАМЕ',512,350);x.font='68px Georgia';x.fillText('Елена',512,475);x.font='italic 45px Georgia';x.fillText('&',512,545);x.font='68px Georgia';x.fillText('Стефан',512,625);x.font='28px Georgia';x.fillText('12 ЈУНИ 2027',512,795);}
 }
 const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=4;return tex;
}

export default function CinematicIntro({motion,onComplete,opened=false}:{motion:boolean;onComplete:()=>void;opened?:boolean}){
 const host=useRef<HTMLDivElement>(null),started=useRef<number|null>(opened ? performance.now()-8000 : null),done=useRef(false),complete=useRef(onComplete);
 const [phase,setPhase]=useState<'sealed'|'opening'|'rings'>(opened ? 'rings' : 'sealed');
 const [renderMode,setRenderMode]=useState<'loading'|'webgl'|'fallback'>('loading');
 complete.current=onComplete;
 const finish=()=>{if(!done.current){done.current=true;started.current=performance.now()-8000;setPhase('rings');complete.current();}};
 const timers=useRef<ReturnType<typeof setTimeout>[]>([]);
 const open=()=>{if(started.current!==null)return;if(!motion){finish();return;}started.current=performance.now();setPhase('opening');timers.current=[setTimeout(()=>setPhase('rings'),3300)];};
 // Opening never navigates away: the guest chooses when to continue.
 useEffect(()=>()=>timers.current.forEach(clearTimeout),[]);
 useEffect(()=>{
  const el=host.current!;let renderer:THREE.WebGLRenderer;
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});}catch{setRenderMode('fallback');return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0xf1ede4,1);renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.93;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  el.appendChild(renderer.domElement);setRenderMode('webgl');
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,1,.1,50);
  camera.position.set(0,0,10);camera.lookAt(0,0,0);
  const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();const env=pmrem.fromScene(room,.04);scene.environment=env.texture;scene.environmentIntensity=.65;
  const textures=[texture('paper'),texture('satin'),texture('velvet'),texture('liner'),texture('card'),texture('monogram')];
  const paper=new THREE.MeshStandardMaterial({map:textures[0],bumpMap:textures[0],bumpScale:.035,color:0xe8ddca,roughness:.88});
  const liner=new THREE.MeshStandardMaterial({map:textures[3],roughness:.95,side:THREE.DoubleSide});
  const satin=new THREE.MeshPhysicalMaterial({map:textures[1],bumpMap:textures[1],bumpScale:.018,color:0xf0e1cc,metalness:0,roughness:.46,sheen:1,sheenColor:new THREE.Color(0xffebcc),sheenRoughness:.35,side:THREE.DoubleSide});
  const velvet=new THREE.MeshPhysicalMaterial({map:textures[2],bumpMap:textures[2],bumpScale:.035,color:0x708579,roughness:.93,sheen:1,sheenColor:new THREE.Color(0x9aaa8d),sheenRoughness:.8});
  const gold=new THREE.MeshStandardMaterial({color:0xd6ad61,metalness:1,roughness:.19,envMapIntensity:1.5});
  const diamond=new THREE.MeshPhysicalMaterial({color:0xffffff,metalness:0,roughness:.04,transmission:.3,thickness:.2,ior:2.4,envMapIntensity:2.8});
  const mats:THREE.Material[]=[paper,liner,satin,velvet,gold,diamond];
  scene.add(new THREE.HemisphereLight(0xfffaf1,0x9c8f7e,1.1));
  const key=new THREE.DirectionalLight(0xfff5e4,2.6);key.position.set(-3,5,7);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-4.5;key.shadow.camera.right=4.5;key.shadow.camera.top=4.5;key.shadow.camera.bottom=-4.5;key.shadow.normalBias=.025;key.shadow.bias=-.0002;key.shadow.radius=4;scene.add(key);
  const fill=new THREE.DirectionalLight(0xffffff,.65);fill.position.set(5,0,3);scene.add(fill);
  const mesh=(geo:THREE.BufferGeometry,mat:THREE.Material,parent:THREE.Object3D,x=0,y=0,z=0)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
  const rounded=(w:number,h:number,d:number,r=.06)=>new RoundedBoxGeometry(w,h,d,3,r);
  // Draped backdrop with shallow, irregular folds and woven surface detail.
  const clothGeo=new THREE.PlaneGeometry(28,24,100,100),pos=clothGeo.attributes.position;
  for(let i=0;i<pos.count;i++){const x=pos.getX(i),y=pos.getY(i);pos.setZ(i,.12*Math.sin(x*1.8+y*.42)+.04*Math.sin(x*4.4-y*.65));}clothGeo.computeVertexNormals();
  const clothMat=new THREE.MeshPhysicalMaterial({color:0xe5dfd2,roughness:.72,sheen:.7,sheenColor:new THREE.Color(0xfff7e5)});mats.push(clothMat);const backdrop=mesh(clothGeo,clothMat,scene,0,0,-.7);backdrop.receiveShadow=false;
  const sc=document.createElement('canvas');sc.width=256;sc.height=256;const sx=sc.getContext('2d')!;const grad=sx.createRadialGradient(128,128,5,128,128,128);grad.addColorStop(0,'rgba(56,45,28,.32)');grad.addColorStop(.45,'rgba(56,45,28,.16)');grad.addColorStop(1,'rgba(56,45,28,0)');sx.fillStyle=grad;sx.fillRect(0,0,256,256);const st=new THREE.CanvasTexture(sc);textures.push(st);const sm=new THREE.MeshBasicMaterial({map:st,transparent:true,depthWrite:false});mats.push(sm);const softShadow=mesh(new THREE.PlaneGeometry(7,4),sm,scene,.2,-.2,-.35);softShadow.castShadow=false;softShadow.receiveShadow=false;

  const envelope=new THREE.Group();scene.add(envelope);envelope.rotation.set(-.09,-.1,-.035);
  mesh(rounded(5.4,3.55,.1,.025),paper,envelope,0,0,0);
  mesh(new THREE.PlaneGeometry(5.22,3.38),liner,envelope,0,0,.06);
  const cardMat=new THREE.MeshStandardMaterial({map:textures[4],roughness:.8});mats.push(cardMat);
  const card=new THREE.Group();envelope.add(card);mesh(rounded(4.55,3.07,.045,.018),paper,card,0,.08,.1);mesh(new THREE.PlaneGeometry(4.48,3.0),cardMat,card,0,.08,.13);
  function fold(points:number[][],parent:THREE.Object3D,z:number){const shape=new THREE.Shape();points.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();return mesh(new THREE.ExtrudeGeometry(shape,{depth:.035,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.008,bevelThickness:.008}),paper,parent,0,0,z);}
  fold([[-2.7,1.77],[-2.7,-1.77],[.35,-.12]],envelope,.17);
  fold([[2.7,1.77],[2.7,-1.77],[-.35,-.12]],envelope,.18);
  fold([[-2.7,-1.77],[2.7,-1.77],[2.7,-1.48],[.14,.44],[-.14,.44],[-2.7,-1.48]],envelope,.23);
  const flap=new THREE.Group();flap.position.set(0,1.77,.27);envelope.add(flap);
  fold([[-2.7,0],[2.7,0],[.18,-2.12],[-.18,-2.12]],flap,0);
  const insideShape=new THREE.Shape();insideShape.moveTo(-2.6,-.04);insideShape.lineTo(2.6,-.04);insideShape.lineTo(0,-2.04);insideShape.closePath();const inside=mesh(new THREE.ShapeGeometry(insideShape),liner,flap,0,0,-.012);inside.rotation.y=Math.PI;
  // A satin ribbon is a curled fabric strip, with edge piping, not a flat SVG bow.
  const bow=new THREE.Group();bow.position.set(0,-.35,.42);envelope.add(bow);
  function ribbon(points:number[][],width:number,parent:THREE.Object3D){
   const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p as [number,number,number])));const n=100,positions:number[]=[],uv:number[]=[],indices:number[]=[];
   for(let i=0;i<=n;i++){const t=i/n,p=curve.getPoint(t),tangent=curve.getTangent(t);const side=new THREE.Vector3(-tangent.y,tangent.x,0).normalize();const twist=.5*Math.sin(t*Math.PI*2);side.z=twist;side.normalize();for(let j=0;j<5;j++){const v=j/4-.5,pp=p.clone().addScaledVector(side,v*width);pp.z+=Math.cos(v*Math.PI)*.035;positions.push(pp.x,pp.y,pp.z);uv.push(t*3,j/4);}if(i<n)for(let j=0;j<4;j++){const a=i*5+j;indices.push(a,a+5,a+1,a+1,a+5,a+6);}}
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return mesh(g,satin,parent);
  }
  const bands=new THREE.Group();bow.add(bands);ribbon([[-2.75,.05,-.08],[-1.8,.04,-.03],[0,0,.04],[1.8,.04,-.03],[2.75,.05,-.08]],.4,bands);
  const left=new THREE.Group(),right=new THREE.Group();bow.add(left,right);
  const loopL=ribbon([[0,0,.15],[-.7,.6,.32],[-1.6,.73,.28],[-1.78,.37,.12],[-1.25,.08,.06],[0,-.06,.16]],.39,left);
  const loopR=ribbon([[0,0,.16],[.65,.6,.34],[1.6,.67,.2],[1.73,.3,.11],[1.05,.04,.09],[0,-.04,.18]],.39,right);
  for(const [loop,sign] of [[loopL,-1],[loopR,1]] as const){
   const a=loop.geometry.attributes.position,target=new Float32Array(a.count*3);
   for(let i=0;i<a.count;i++){const t=Math.floor(i/5)/100,v=i%5/4-.5;target[i*3]=sign*t*2.5;target[i*3+1]=Math.sin(t*Math.PI)*.15+v*.39;target[i*3+2]=.1+Math.sin(t*Math.PI)*.08;}
   loop.geometry.morphAttributes.position=[new THREE.Float32BufferAttribute(target,3)];loop.updateMorphTargets();
  }
  const tailL=ribbon([[-.12,0,.08],[-.5,-.5,.24],[-.9,-1.08,.3],[-1.43,-1.39,.16]],.42,left);
  const tailR=ribbon([[.12,0,.09],[.55,-.35,.26],[1.1,-.81,.28],[1.75,-.95,.19]],.42,right);
  tailL.rotation.z=.03;tailR.rotation.z=-.03;
  const knot=mesh(new THREE.CylinderGeometry(.19,.16,.4,40,12),satin,bow,0,.02,.22);knot.scale.z=.7;knot.rotation.z=-.14;
  const tagMat=new THREE.MeshStandardMaterial({map:textures[5],roughness:.8});mats.push(tagMat);const tag=mesh(rounded(.61,.78,.025,.04),tagMat,bow,.18,-.65,.09);tag.rotation.z=.18;
  // Second scene: hinged, upholstered jewellery box and physically shaded gold rings.
  const boxScene=new THREE.Group();scene.add(boxScene);boxScene.visible=false;boxScene.rotation.set(.38,-.2,0);
  mesh(rounded(3.1,.7,2.25,.16),velvet,boxScene,0,-.53,0);
  const trim=mesh(rounded(3.12,.045,2.27,.05),gold,boxScene,0,-.24,0);
  const pad=mesh(rounded(2.85,.18,2.02,.1),velvet,boxScene,0,-.18,0);
  const seamMat=new THREE.MeshStandardMaterial({color:0x28352c,roughness:1});mats.push(seamMat);mesh(rounded(2.3,.012,.045,.006),seamMat,boxScene,0,-.083,.15);
  const lid=new THREE.Group();lid.position.set(0,-.18,-1.03);boxScene.add(lid);
  mesh(rounded(3.1,.32,2.25,.14),velvet,lid,0,.05,1.03);mesh(rounded(2.84,.035,2.0,.08),velvet,lid,0,-.13,1.03);
  const lidMonogramMat=new THREE.MeshStandardMaterial({color:0xd0b681,metalness:.7,roughness:.4});mats.push(lidMonogramMat);
  const lidBadge=mesh(new THREE.TorusGeometry(.22,.009,6,64),lidMonogramMat,lid,0,-.153,1.03);lidBadge.rotation.x=Math.PI/2;
  const ringGroup=new THREE.Group();boxScene.add(ringGroup);ringGroup.position.set(0,.27,.24);
  const bandGeo=new THREE.TorusGeometry(.43,.055,18,96);
  const wedding=mesh(bandGeo,gold,ringGroup,-.55,0,0);wedding.rotation.set(-.23,-.15,-.14);
  const engagement=mesh(new THREE.TorusGeometry(.43,.037,16,96),gold,ringGroup,.55,0,0);engagement.rotation.set(-.2,.22,.14);
  const gem=mesh(new THREE.OctahedronGeometry(.18,0),diamond,engagement,0,.46,0);gem.scale.set(1,.8,1);
  for(let i=0;i<4;i++){const a=i*Math.PI/2;mesh(new THREE.SphereGeometry(.018,8,8),gold,engagement,Math.cos(a)*.095,.46+Math.sin(a)*.065,.075);}
  // Sculpted ivory blossom beside the box: nested thin petals and golden stamens.
  const flower=new THREE.Group();boxScene.add(flower);flower.position.set(-1.8,-.32,.6);flower.rotation.set(-.85,.3,.3);flower.scale.setScalar(.75);
  const petalMat=new THREE.MeshPhysicalMaterial({color:0xfff5e8,roughness:.65,side:THREE.DoubleSide,sheen:.7,sheenColor:new THREE.Color(0xffffff)});mats.push(petalMat);
  for(let k=0;k<18;k++){const a=k*2.4,r=k<6?.18:k<12?.37:.56;const g=new THREE.SphereGeometry(1,18,12,0,Math.PI*2,0,Math.PI*.67);g.scale(.24,.36,.065);const p=mesh(g,petalMat,flower,Math.cos(a)*r,Math.sin(a)*r,k<6?.2:.05);p.rotation.set(.3*Math.cos(a),.3*Math.sin(a),a-Math.PI/2);}
  for(let k=0;k<9;k++){const a=k*2.4;mesh(new THREE.SphereGeometry(.025,8,8),gold,flower,Math.cos(a)*.13,Math.sin(a)*.13,.28);}
  let frame=0,px=0,py=0,last=0,dirty=true;
  const resize=()=>{const w=el.clientWidth,h=el.clientHeight;camera.aspect=w/h;camera.position.z=Math.max(10,3.2/(Math.tan(THREE.MathUtils.degToRad(17))*camera.aspect));camera.updateProjectionMatrix();renderer.setSize(Math.min(w,1200),Math.min(w,1200)/w*h,false);dirty=true;};
  const move=(e:PointerEvent)=>{px=(e.clientX/innerWidth-.5);py=(e.clientY/innerHeight-.5);dirty=true;};
  const draw=(now:number)=>{
   frame=requestAnimationFrame(draw);if(now-last<40)return;last=now;if((started.current===null||now-started.current>8000)&&!dirty)return;dirty=false;
   const t=started.current===null?0:(now-started.current)/1000;
   const untie=segment(t,.1,1.25),lift=segment(t,1,2.3),pull=segment(t,1.8,3.0),out=segment(t,2.9,3.7),reveal=segment(t,3.3,4.5);
   envelope.rotation.y=-.1+px*.055;envelope.rotation.x=-.09+py*.035;envelope.position.set(-out*12,-out*1.4,0);envelope.visible=t<3.7;
   flap.rotation.x=-lift*Math.PI*.98;card.position.y=pull*1.9;
   loopL.morphTargetInfluences![0]=untie;loopR.morphTargetInfluences![0]=untie;left.position.set(-untie*2.9,-untie*.7,untie*.3);right.position.set(untie*2.9,-untie*.45,untie*.3);left.rotation.z=untie*.55;right.rotation.z=-untie*.5;
   knot.scale.setScalar(1-untie*.95);tag.position.y=-.65-untie*.7;bands.scale.x=1+untie*.5;bow.visible=t<2.5;
   backdrop.position.z=-.7-reveal*2.8;softShadow.position.set(.2,-.2-reveal*1.3,-.35-reveal*2.6);softShadow.scale.set(1-reveal*.2,1-reveal*.6,1);boxScene.visible=t>3.25;boxScene.scale.setScalar((.65+reveal*.35)*(camera.aspect<.8?1.2:.78));boxScene.position.set((1-reveal)*2,-.35,0);boxScene.rotation.y=-.2+px*.08+(1-reveal)*.35;
   lid.rotation.x=-segment(t,3.7,5)*1.85;
   key.position.x=-3+segment(t,4.8,7.2)*2;
   renderer.render(scene,camera);
  };
  const lost=(e:Event)=>{e.preventDefault();setRenderMode('fallback');cancelAnimationFrame(frame);};
  resize();frame=requestAnimationFrame(draw);window.addEventListener('resize',resize);window.addEventListener('pointermove',move,{passive:true});renderer.domElement.addEventListener('webglcontextlost',lost);
  return()=>{cancelAnimationFrame(frame);window.removeEventListener('resize',resize);window.removeEventListener('pointermove',move);renderer.domElement.removeEventListener('webglcontextlost',lost);scene.traverse(o=>{if(o instanceof THREE.Mesh)o.geometry.dispose();});mats.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());env.dispose();pmrem.dispose();room.dispose();renderer.dispose();renderer.domElement.remove();};
 },[]);
 return <div className={'cinema-intro cinema-'+phase+' cinema-render-'+renderMode+(opened?' cinema-inline':'')} role={opened?'region':'dialog'} aria-modal={opened?undefined:true} aria-label="Отворете ја свадбената покана">
  <div className="cinema-canvas" ref={host} aria-hidden="true"/>
  <div className="cinema-vignette"/>
  {renderMode!=='webgl'&&<div className="cinema-fallback" aria-hidden="true"><div className="fallback-envelope"><div className="fallback-flap"/><div className="fallback-band"/><div className="fallback-bow"><i/><i/><b/></div><span>Е & С</span></div><div className="fallback-jewels"><div className="fallback-box-lid">Е & С</div><div className="fallback-box"><i/><i/><b>✧</b></div></div></div>}
  <header className="cinema-header"><span>ЕДНА ПРИКАЗНА. ЗАСЕКОГАШ.</span><button onClick={finish}>Прескокни го воведот </button></header>
  <div className="cinema-ring-title" aria-hidden={phase!=='rings'}><span>ДВЕ СРЦА. ЕДНО ВЕТУВАЊЕ.</span><h2>Елена <em>&</em> Стефан</h2><p>12 јуни 2027</p></div>
  {phase==='sealed'&&<button className="cinema-open" onClick={open} aria-label="Отвори ја поканата"><span className="sr-only">Допрете ја панделката</span></button>}
  <footer className="cinema-footer"><p>{phase==='sealed'?'За вас, со љубов':phase==='opening'?'Нашата приказна се отвора…':'Најубавото допрва доаѓа'}</p>{phase==='sealed'?<button onClick={open}>ДОПРЕТЕ ЈА ПАНДЕЛКАТА <span className="cinema-arrow" aria-hidden="true"/></button>:phase==='rings'?<button onClick={()=>{if(opened)document.getElementById("welcome")?.scrollIntoView({behavior:motion?"smooth":"instant"});else finish();}}>ПРОДОЛЖИ КОН ПОКАНАТА <span className="cinema-arrow" aria-hidden="true"/></button>:<span className="cinema-progress"/>}</footer>
 </div>;
}
