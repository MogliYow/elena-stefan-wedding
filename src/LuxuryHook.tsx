import {useEffect, useRef, useState} from 'react';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import './cinematic.css';
import './luxury-hook.css';

const ease=(v:number)=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v);};
const segment=(t:number,a:number,b:number)=>ease((t-a)/(b-a));

// Original, procedural materials: no stock models, downloaded assets or baked text.
function texture(kind:'paper'|'satin'|'velvet'|'liner'|'card'|'monogram'){
 const c=document.createElement('canvas'); c.width=1024;c.height=kind==='card'?690:1024;const x=c.getContext('2d')!;
 let seed=312;const rand=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
 x.fillStyle=kind==='velvet'?'#36423b':kind==='satin'?'#d4bea0':'#f5f0e6';x.fillRect(0,0,1024,1024);
 for(let i=0;i<85000;i++){const a=rand()*1024,b=rand()*1024;x.fillStyle=rand()>.5?'rgba(255,255,255,.12)':'rgba(69,49,26,.16)';x.fillRect(a,b,kind==='satin'?1:rand()*2+.3,kind==='velvet'?3:1);}
 if(kind==='satin'){for(let i=0;i<1024;i+=2){x.fillStyle=i%4?'#ffffff0b':'#3f2c1a0a';x.fillRect(0,i,1024,1);}}
 if(kind==='liner'){
  x.strokeStyle='#78806b';x.lineWidth=1.2;
  for(let j=0;j<9;j++){x.save();x.translate((j%3)*360-40,Math.floor(j/3)*370);x.rotate(-.35+j*.07);x.beginPath();x.moveTo(0,320);x.bezierCurveTo(90,200,25,120,160,0);x.stroke();
   for(let k=0;k<6;k++){const y=280-k*45,xx=35+k*15;x.fillStyle=k%2?'#87917e80':'#6b7b614a';x.beginPath();x.ellipse(xx-24,y-20,13,36,-.7,0,Math.PI*2);x.fill();x.beginPath();x.ellipse(xx+18,y-36,12,32,.8,0,Math.PI*2);x.fill();}x.restore();}
 }
 if(kind==='card'){
  x.textAlign='center';x.strokeStyle='#a48b65';x.lineWidth=2;x.strokeRect(35,35,954,620);x.lineWidth=.7;x.strokeRect(46,46,932,598);
  x.fillStyle='#776044';x.font='22px Georgia';x.fillText('СО ЉУБОВ ВЕ ПОКАНУВАМЕ',512,145);
  x.fillStyle='#433c32';x.font='italic 86px Georgia';x.fillText('Елена & Стефан',512,315);
  x.strokeStyle='#ad9470';x.beginPath();x.moveTo(400,365);x.lineTo(624,365);x.stroke();
  x.font='30px Georgia';x.fillText('12 ЈУНИ 2027',512,440);x.font='24px Georgia';x.fillText('Скопје',512,500);
 }

 const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=4;return tex;
}

export default function LuxuryHook({motion,onComplete,opened=false}:{motion:boolean;onComplete:()=>void;opened?:boolean}){
 const host=useRef<HTMLDivElement>(null),started=useRef<number|null>(null),done=useRef(false),complete=useRef(onComplete);
 const [phase,setPhase]=useState<'sealed'|'opening'|'rings'>('sealed');
 const [renderMode,setRenderMode]=useState<'loading'|'webgl'|'fallback'>('loading');
 complete.current=onComplete;
 const finish=()=>{timers.current.forEach(clearTimeout);started.current=null;redraw.current=true;done.current=false;setPhase('sealed');complete.current();};
 const redraw=useRef(true);
 const timers=useRef<ReturnType<typeof setTimeout>[]>([]);
 const open=()=>{if(started.current!==null)return;started.current=performance.now()-(motion?0:3000);if(!motion){setPhase('rings');return;}setPhase('opening');timers.current=[setTimeout(()=>setPhase('rings'),3300)];};
 // Opening never navigates away: the guest chooses when to continue.
 useEffect(()=>()=>timers.current.forEach(clearTimeout),[]);
 useEffect(()=>{
  const el=host.current!;let renderer:THREE.WebGLRenderer;
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});}catch{setRenderMode('fallback');return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0xf1ede4,1);renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  el.appendChild(renderer.domElement);setRenderMode('webgl');
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,1,.1,50);
  camera.position.set(0,0,10);camera.lookAt(0,0,0);
  const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();const env=pmrem.fromScene(room,.04);scene.environment=env.texture;scene.environmentIntensity=.3;
  const textures=[texture('paper'),texture('satin'),texture('velvet'),texture('liner'),texture('card'),texture('monogram')];
  const paper=new THREE.MeshStandardMaterial({map:textures[0],bumpMap:textures[0],bumpScale:.09,color:0xf7eedc,roughness:.88});
  const grainCanvas=document.createElement('canvas');grainCanvas.width=512;grainCanvas.height=512;const gx=grainCanvas.getContext('2d')!;
  gx.fillStyle='#808080';gx.fillRect(0,0,512,512);let grainSeed=19;
  for(let i=0;i<19000;i++){grainSeed=(grainSeed*16807)%2147483647;const x=grainSeed%512;grainSeed=(grainSeed*16807)%2147483647;const y=grainSeed%512;const shade=100+grainSeed%55;gx.fillStyle=`rgb(${shade},${shade},${shade})`;gx.fillRect(x,y,1+grainSeed%3,.7);}
  const grain=new THREE.CanvasTexture(grainCanvas);grain.wrapS=grain.wrapT=THREE.RepeatWrapping;grain.repeat.set(2,2);textures.push(grain);paper.bumpMap=grain;paper.bumpScale=.025;
  const liner=new THREE.MeshStandardMaterial({map:textures[3],roughness:.95,side:THREE.DoubleSide});
  const satin=new THREE.MeshPhysicalMaterial({map:textures[1],color:0xd9c5af,metalness:0,roughness:.32,anisotropy:.55,sheen:1,sheenColor:new THREE.Color(0xffe8c8),sheenRoughness:.35,side:THREE.DoubleSide});
  const velvet=new THREE.MeshPhysicalMaterial({map:textures[2],bumpMap:textures[2],bumpScale:.035,color:0x708579,roughness:.93,sheen:1,sheenColor:new THREE.Color(0x9aaa8d),sheenRoughness:.8});
  const gold=new THREE.MeshStandardMaterial({color:0xd6ad61,metalness:1,roughness:.19,envMapIntensity:1.5});
  const diamond=new THREE.MeshPhysicalMaterial({color:0xffffff,metalness:0,roughness:.04,transmission:.3,thickness:.2,ior:2.4,envMapIntensity:2.8});
  const mats:THREE.Material[]=[paper,liner,satin,velvet,gold,diamond];
  scene.add(new THREE.HemisphereLight(0xfffaf1,0x514635,.45));
  const key=new THREE.DirectionalLight(0xfff5e4,3.0);key.position.set(-3,4,5);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-4.5;key.shadow.camera.right=4.5;key.shadow.camera.top=4.5;key.shadow.camera.bottom=-4.5;key.shadow.normalBias=.025;key.shadow.bias=-.0002;key.shadow.radius=3;key.shadow.blurSamples=8;scene.add(key);
  const fill=new THREE.DirectionalLight(0xcad6e5,.35);fill.position.set(5,0,3);scene.add(fill);
  const mesh=(geo:THREE.BufferGeometry,mat:THREE.Material,parent:THREE.Object3D,x=0,y=0,z=0)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=mat!==satin;parent.add(m);return m;};
  const rounded=(w:number,h:number,d:number,r=.06)=>new RoundedBoxGeometry(w,h,d,3,r);
  // Draped backdrop with shallow, irregular folds and woven surface detail.
  const clothGeo=new THREE.PlaneGeometry(28,24,100,100),pos=clothGeo.attributes.position;
  for(let i=0;i<pos.count;i++){const x=pos.getX(i),y=pos.getY(i);pos.setZ(i,.12*Math.sin(x*1.8+y*.42)+.04*Math.sin(x*4.4-y*.65));}clothGeo.computeVertexNormals();
  const clothMat=new THREE.MeshPhysicalMaterial({color:0xb5afa3,roughness:.72,sheen:.7,sheenColor:new THREE.Color(0xfff7e5)});mats.push(clothMat);const backdrop=mesh(clothGeo,clothMat,scene,0,0,-.7);backdrop.receiveShadow=false;
  const sc=document.createElement('canvas');sc.width=256;sc.height=256;const sx=sc.getContext('2d')!;const grad=sx.createRadialGradient(128,128,5,128,128,128);grad.addColorStop(0,'rgba(56,45,28,.32)');grad.addColorStop(.45,'rgba(56,45,28,.16)');grad.addColorStop(1,'rgba(56,45,28,0)');sx.fillStyle=grad;sx.fillRect(0,0,256,256);const st=new THREE.CanvasTexture(sc);textures.push(st);const sm=new THREE.MeshBasicMaterial({map:st,transparent:true,depthWrite:false});mats.push(sm);const softShadow=mesh(new THREE.PlaneGeometry(7,4),sm,scene,.2,-.2,-.35);softShadow.castShadow=false;softShadow.receiveShadow=false;

  const envelope=new THREE.Group();scene.add(envelope);envelope.rotation.set(-.09,-.1,-.035);
  mesh(rounded(5.4,3.55,.1,.025),paper,envelope,0,0,0);
  mesh(new THREE.PlaneGeometry(5.22,3.38),liner,envelope,0,0,.06);
  const cardMat=new THREE.MeshStandardMaterial({map:textures[4],roughness:.95});mats.push(cardMat);
  const card=new THREE.Group();envelope.add(card);mesh(rounded(4.55,3.07,.045,.018),paper,card,0,.08,.1);mesh(new THREE.PlaneGeometry(4.48,3.0),cardMat,card,0,.08,.13);
  function fold(points:number[][],parent:THREE.Object3D,z:number){const shape=new THREE.Shape();points.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();return mesh(new THREE.ExtrudeGeometry(shape,{depth:.035,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.008,bevelThickness:.008}),paper,parent,0,0,z);}
  fold([[-2.7,1.77],[-2.7,-1.77],[.35,-.12]],envelope,.17);
  fold([[2.7,1.77],[2.7,-1.77],[-.35,-.12]],envelope,.18);
  fold([[-2.7,-1.77],[2.7,-1.77],[2.7,-1.48],[.14,.44],[-.14,.44],[-2.7,-1.48]],envelope,.23);
  const flap=new THREE.Group();flap.position.set(0,1.77,.27);envelope.add(flap);
  fold([[-2.7,0],[2.7,0],[.18,-2.12],[-.18,-2.12]],flap,0);
  const insideShape=new THREE.Shape();insideShape.moveTo(-2.6,-.04);insideShape.lineTo(2.6,-.04);insideShape.lineTo(0,-2.04);insideShape.closePath();const inside=mesh(new THREE.ShapeGeometry(insideShape),liner,flap,0,0,-.012);inside.rotation.y=Math.PI;
  const relief=new THREE.MeshStandardMaterial({color:0xece2ce,roughness:.93});mats.push(relief);
  function stem(points:THREE.Vector3[],parent:THREE.Object3D,r=.009){return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),32,r,6,false),relief,parent);}
  for(const sign of [-1,1]){
   const branch=new THREE.Group();envelope.add(branch);branch.position.set(sign*2.25,-1.38,.285);branch.rotation.z=sign*.3;
   stem([new THREE.Vector3(0,0,0),new THREE.Vector3(-sign*.12,.25,.005),new THREE.Vector3(-sign*.2,.65,0),new THREE.Vector3(-sign*.42,1.0,0)],branch);
   for(let i=0;i<6;i++){
    const leaf=new THREE.SphereGeometry(1,20,10);leaf.scale(.06,.15,.014);
    const side=i%2?1:-1;const m=mesh(leaf,relief,branch,-sign*(.05+i*.047)+side*.07,.14+i*.13,.008);m.rotation.z=side*.55;
   }
  }
  // Restrained foil crest follows the flap as it opens.
  const crestCanvas=document.createElement('canvas');crestCanvas.width=512;crestCanvas.height=256;const cc=crestCanvas.getContext('2d')!;
  cc.fillStyle='#ffffff';cc.textAlign='center';cc.font='italic 100px Georgia';cc.fillText('Е & С',256,163);
  const crestTexture=new THREE.CanvasTexture(crestCanvas);textures.push(crestTexture);
  const crestMat=new THREE.MeshStandardMaterial({color:0x9c8056,metalness:.65,roughness:.45,map:crestTexture,transparent:true,depthWrite:false});mats.push(crestMat);
  const crest=mesh(new THREE.PlaneGeometry(1.12,.56),crestMat,flap,0,-.75,.055);crest.castShadow=false;crest.receiveShadow=false;
  // A satin ribbon is a curled fabric strip, with edge piping, not a flat SVG bow.
  const bow=new THREE.Group();bow.position.set(0,-.35,.42);envelope.add(bow);
  function ribbon(points:number[][],width:number,parent:THREE.Object3D){
   const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p as [number,number,number])));const n=160,positions:number[]=[],uv:number[]=[],indices:number[]=[];
   for(let i=0;i<=n;i++){const t=i/n,p=curve.getPoint(t),tangent=curve.getTangent(t);const side=new THREE.Vector3(-tangent.y,tangent.x,0).normalize();const twist=.65*Math.sin(t*Math.PI*2+.4);side.applyAxisAngle(tangent,twist);for(let j=0;j<13;j++){const v=j/12-.5,pp=p.clone().addScaledVector(side,v*width);pp.z+=Math.cos(v*Math.PI*2)*(.018+.028*Math.pow(Math.abs(2*t-1),5))+Math.sin(v*12+t*9)*.003;positions.push(pp.x,pp.y,pp.z);uv.push(t*3,j/12);}if(i<n)for(let j=0;j<12;j++){const a=i*13+j;indices.push(a,a+13,a+1,a+1,a+13,a+14);}}
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return mesh(g,satin,parent);
  }
  const bands=new THREE.Group();bow.add(bands);ribbon([[-2.75,.05,-.08],[-1.8,.04,-.03],[0,0,.04],[1.8,.04,-.03],[2.75,.05,-.08]],.4,bands);
  const left=new THREE.Group(),right=new THREE.Group();bow.add(left,right);
  const loopL=ribbon([[0,0,.15],[-.7,.65,.6],[-1.52,.82,.43],[-1.65,.4,.18],[-1.05,.14,.04],[0,-.06,.16]],.39,left);
  const loopR=ribbon([[0,0,.16],[.65,.72,.54],[1.45,.71,.4],[1.62,.27,.15],[1.05,.04,.02],[0,-.04,.18]],.39,right);
  for(const [loop,sign] of [[loopL,-1],[loopR,1]] as const){
   const a=loop.geometry.attributes.position,target=new Float32Array(a.count*3);
   for(let i=0;i<a.count;i++){const t=Math.floor(i/13)/160,v=i%13/12-.5;target[i*3]=sign*t*2.5;target[i*3+1]=Math.sin(t*Math.PI)*.15+v*.39;target[i*3+2]=.1+Math.sin(t*Math.PI)*.08;}
   loop.geometry.morphAttributes.position=[new THREE.Float32BufferAttribute(target,3)];loop.updateMorphTargets();
  }
  const tailL=ribbon([[-.12,0,.08],[-.5,-.5,.24],[-.9,-1.08,.3],[-1.43,-1.39,.16]],.42,left);
  const tailR=ribbon([[.12,0,.09],[.55,-.35,.26],[1.1,-.81,.28],[1.75,-.95,.19]],.42,right);
  tailL.rotation.z=.03;tailR.rotation.z=-.03;
  const knotGeo=new THREE.CylinderGeometry(.19,.16,.43,64,32); const kp=knotGeo.attributes.position; for(let i=0;i<kp.count;i++){const y=kp.getY(i),a=Math.atan2(kp.getZ(i),kp.getX(i));const r=1+.07*Math.sin(a*7+y*18);kp.setX(i,kp.getX(i)*r);kp.setZ(i,kp.getZ(i)*r);}knotGeo.computeVertexNormals();const knot=mesh(knotGeo,satin,bow,0,.02,.22);knot.scale.z=.7;knot.rotation.z=-.14;
  const tagMat=new THREE.MeshStandardMaterial({map:textures[5],roughness:.8});mats.push(tagMat);const tag=new THREE.Group();bow.add(tag);
  let frame=0,px=0,py=0,last=0,dirty=true,renderedTime=-1;
  const resize=()=>{const w=el.clientWidth,h=el.clientHeight;camera.aspect=w/h;camera.position.z=Math.max(13.5,3.2/(Math.tan(THREE.MathUtils.degToRad(17))*camera.aspect));camera.updateProjectionMatrix();renderer.setSize(Math.min(w,1600),Math.min(w,1600)/w*h,false);dirty=true;};
  const move=(e:PointerEvent)=>{px=(e.clientX/innerWidth-.5);py=(e.clientY/innerHeight-.5);dirty=true;};
  const draw=(now:number)=>{
   frame=requestAnimationFrame(draw);if(now-last<40)return;last=now;if((started.current===null||(now-started.current>8000&&renderedTime>=2.9))&&!dirty&&!redraw.current)return;dirty=false;redraw.current=false;
   const t=started.current===null?0:Math.min(2.9,(now-started.current)/1000);
   const untie=segment(t,.1,1.25),lift=segment(t,1,2.3),pull=segment(t,1.8,3.0);
   envelope.rotation.y=-.12+px*.16;envelope.rotation.x=.16+py*.12;envelope.position.set(0,-pull*.28,0);
   flap.rotation.x=-lift*Math.PI*.98;flap.position.z=.27-lift*.55;card.position.y=pull*1.9;
   loopL.morphTargetInfluences![0]=untie;loopR.morphTargetInfluences![0]=untie;left.position.set(-untie*2.9,-untie*.7,untie*.3);right.position.set(untie*2.9,-untie*.45,untie*.3);left.rotation.z=untie*.55;right.rotation.z=-untie*.5;
   knot.scale.setScalar(1-untie*.95);tag.position.y=-.65-untie*.7;bands.scale.x=1+untie*.5;bow.visible=t<2.5;
   key.position.x=-3+px*.35;
   renderer.render(scene,camera);renderedTime=t;
  };
  const lost=(e:Event)=>{e.preventDefault();setRenderMode('fallback');cancelAnimationFrame(frame);};
  resize();frame=requestAnimationFrame(draw);window.addEventListener('resize',resize);window.addEventListener('pointermove',move,{passive:true});renderer.domElement.addEventListener('webglcontextlost',lost);
  return()=>{cancelAnimationFrame(frame);window.removeEventListener('resize',resize);window.removeEventListener('pointermove',move);renderer.domElement.removeEventListener('webglcontextlost',lost);scene.traverse(o=>{if(o instanceof THREE.Mesh)o.geometry.dispose();});mats.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());env.dispose();pmrem.dispose();room.dispose();renderer.dispose();renderer.domElement.remove();};
 },[]);
 return <div className={'cinema-intro luxury-hook cinema-'+phase+' cinema-render-'+renderMode+(opened?' cinema-inline':'')} role={opened?'region':'dialog'} aria-modal={opened?undefined:true} aria-label="Отворете ја свадбената покана">
  <div className="cinema-canvas" ref={host} aria-hidden="true"/>
  <div className="cinema-vignette"/>
  {renderMode!=='webgl'&&<div className="cinema-fallback" aria-hidden="true"><div className="fallback-envelope"><div className="hook-fallback-card">Елена & Стефан<small>12 ЈУНИ 2027</small></div><div className="fallback-flap"/><div className="fallback-band"/><div className="fallback-bow"><i/><i/><b/></div><span>Е & С</span></div><div className="fallback-jewels"><div className="fallback-box-lid">Е & С</div><div className="fallback-box"><i/><i/><b>✧</b></div></div></div>}
  <header className="hook-heading"><span>ЕДНА ПРИКАЗНА. ЗАСЕКОГАШ.</span><h1>За вас, со љубов.</h1><p>Елена & Стефан</p></header>
  {phase==='sealed'&&<button className="cinema-open" onClick={open} aria-label="Отвори ја поканата"/>}
  <footer className="cinema-footer">{phase==='sealed'?<button onClick={open}>ОТВОРИ ГО ПЛИКОТ <span className="cinema-arrow" aria-hidden="true"/></button>:phase==='rings'?<button onClick={finish}>ПОВТОРИ ГО ОТВОРАЊЕТО</button>:<p>За еден незаборавен ден…</p>}</footer>
 </div>;
}
