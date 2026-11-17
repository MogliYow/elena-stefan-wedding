import {useEffect,useRef} from 'react';
import * as THREE from 'three';
/** A single scene, capped at 30fps, with shared geometry and no external assets. */
export default function GoldScene({active}:{active:boolean}) {
  const host=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    if(!active||!host.current)return;
    const container=host.current;
    let renderer:THREE.WebGLRenderer;
    try {renderer=new THREE.WebGLRenderer({alpha:true,antialias:window.innerWidth>760,powerPreference:'low-power'});}
    catch {return;}
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));
    renderer.setClearColor(0x000000,0);
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);
    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(38,1,.1,60);camera.position.z=14;
    scene.add(new THREE.HemisphereLight(0xfff5dc,0x776442,3));
    const key=new THREE.DirectionalLight(0xffefc5,5);key.position.set(-4,6,6);scene.add(key);
    const rim=new THREE.DirectionalLight(0xffffff,4);rim.position.set(5,-1,4);scene.add(rim);
    const gold=new THREE.MeshStandardMaterial({color:0xc9a25e,metalness:.78,roughness:.25});
    const ringGeometry=new THREE.TorusGeometry(.78,.065,12,72);
    const pair=new THREE.Group();
    const ringA=new THREE.Mesh(ringGeometry,gold),ringB=new THREE.Mesh(ringGeometry,gold);
    ringA.position.x=-.38;ringB.position.x=.38;ringA.rotation.set(.48,.25,-.38);ringB.rotation.set(-.35,-.45,.45);
    pair.add(ringA,ringB);scene.add(pair);
    const gemGeometry=new THREE.OctahedronGeometry(.16);
    const gemMaterial=new THREE.MeshStandardMaterial({color:0xfff8e2,metalness:.35,roughness:.1});
    const gem=new THREE.Mesh(gemGeometry,gemMaterial);gem.position.set(.38,.8,0);pair.add(gem);
    const petalGeometry=new THREE.SphereGeometry(.08,8,6);petalGeometry.scale(.55,1.8,.18);
    const petals=Array.from({length:window.innerWidth<760?12:24},(_,i)=>{
      const mesh=new THREE.Mesh(petalGeometry,gold);scene.add(mesh);
      return {mesh,x:Math.sin(i*7.17)*7,y:(i*2.71)%12-6,z:-2-(i%5),phase:i*1.73};
    });
    let frame=0,last=0,time=0,scroll=window.scrollY,pointerX=0,pointerY=0;
    const resize=()=>{camera.aspect=window.innerWidth/window.innerHeight;camera.updateProjectionMatrix();renderer.setSize(window.innerWidth,window.innerHeight);};
    const onScroll=()=>{scroll=window.scrollY;};
    const move=(e:PointerEvent)=>{pointerX=e.clientX/window.innerWidth-.5;pointerY=e.clientY/window.innerHeight-.5;};
    const draw=(stamp:number)=>{
      frame=requestAnimationFrame(draw);
      if(stamp-last<33)return;
      time+=Math.min((stamp-last)/1000,.05);last=stamp;
      const page=scroll/window.innerHeight;
      const halfWidth=14*Math.tan(THREE.MathUtils.degToRad(19))*camera.aspect;
      const mobile=window.innerWidth<760;
      pair.position.set(Math.cos(page*.72)*(halfWidth*.72),Math.sin(page*.9)*1.8+(mobile?2.5:1.6),0);
      pair.scale.setScalar(mobile?.48:.9);
      pair.rotation.set(.18+Math.sin(time*.32)*.18+pointerY*.12,time*.18+page*.32,pointerX*.16);
      petals.forEach(({mesh,x,y,z,phase})=>{
        mesh.position.set(x+Math.sin(time*.3+phase)*.45,((y-time*.19-page*.2+18)%12)-6,z);
        mesh.rotation.set(time*.42+phase,time*.27+phase,Math.sin(time*.28+phase));
      });
      renderer.render(scene,camera);
    };
    const visibility=()=>{cancelAnimationFrame(frame);if(!document.hidden){last=performance.now();frame=requestAnimationFrame(draw);}};
    resize();last=performance.now();frame=requestAnimationFrame(draw);
    window.addEventListener('resize',resize);window.addEventListener('scroll',onScroll,{passive:true});
    window.addEventListener('pointermove',move,{passive:true});document.addEventListener('visibilitychange',visibility);
    return()=>{cancelAnimationFrame(frame);window.removeEventListener('resize',resize);window.removeEventListener('scroll',onScroll);window.removeEventListener('pointermove',move);document.removeEventListener('visibilitychange',visibility);ringGeometry.dispose();petalGeometry.dispose();gemGeometry.dispose();gold.dispose();gemMaterial.dispose();renderer.dispose();renderer.domElement.remove();};
  },[active]);
  return <div className="gold-scene" ref={host} aria-hidden="true"/>;
}

