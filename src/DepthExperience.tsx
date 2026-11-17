import React, {Children, useEffect} from 'react';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function KineticText({children}:{children:React.ReactNode}) {
  return <>{Children.map(children, child => typeof child === 'string'
    ? child.split(/(\s+)/).map((word,i)=>/^\s+$/.test(word)?word:<span className="depth-word" key={i}>{word}</span>)
    : child)}</>;
}

export function useDepthMotion(opened:boolean,enabled:boolean){
  useEffect(()=>{
    if(!opened)return;
    const root=document.querySelector('main')!;
    root.querySelectorAll('.reveal').forEach(el=>el.classList.add('visible'));
    if(!enabled)return;
    const cleanups:Array<()=>void>=[];
    const context=gsap.context(()=>{
      const small=window.innerWidth<760;
      gsap.from('.hero h1 > *',{y:80,z:-180,rotationX:65,autoAlpha:0,stagger:.18,duration:1.5,ease:'power3.out'});
      gsap.from('.hero-content > p, .hero-nav, .scroll-cue',{y:25,autoAlpha:0,duration:1.2,stagger:.12,delay:.6});
      gsap.to('.hero-photo',{yPercent:18,scale:1.13,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1}});
      gsap.to('.hero-content',{y:small?45:100,z:-130,rotationX:small?3:9,autoAlpha:.15,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1}});
      gsap.utils.toArray<HTMLElement>('main > section:not(.hero)').forEach(section=>{
        const heading=section.querySelectorAll('.depth-word');
        gsap.from(heading,{y:34,z:-90,rotationX:65,autoAlpha:0,stagger:.045,duration:1.05,ease:'power3.out',scrollTrigger:{trigger:section,start:'top 88%',once:true}});
        const copy=section.querySelectorAll('p,blockquote,figcaption,.section-index,.rsvp-flourish,.closing-signature');
        gsap.from(copy,{y:22,rotationX:12,autoAlpha:0,stagger:.055,duration:1,ease:'power2.out',scrollTrigger:{trigger:section,start:'top 88%',once:true}});
      });
      gsap.utils.toArray<HTMLElement>('.story-portrait,.gallery-item,.location-art').forEach((card,i)=>{
        gsap.fromTo(card,{y:55,rotationY:(i%2?1:-1)*(small?5:13),rotationX:8,z:-70},{y:-20,rotationY:(i%2?-1:1)*(small?3:7),rotationX:-3,z:35,ease:'none',scrollTrigger:{trigger:card,start:'top bottom',end:'bottom top',scrub:1.5}});
      });
      gsap.utils.toArray<HTMLElement>('.timeline-item').forEach((row,i)=>{
        gsap.from(row,{x:i%2?40:-40,rotationY:i%2?-12:12,z:-60,autoAlpha:0,duration:1,scrollTrigger:{trigger:row,start:'top 94%',once:true}});
      });
      gsap.from('.countdown-unit',{y:65,rotationX:80,z:-100,autoAlpha:0,stagger:.15,duration:1.3,ease:'back.out(1.2)',scrollTrigger:{trigger:'.countdown',start:'top 90%',once:true}});
      gsap.utils.toArray<HTMLElement>('.welcome-sprig,.dress-sprig,.venue-sprig').forEach((sprig,i)=>{
        gsap.to(sprig,{y:i%2?-30:30,rotation:'+=12',ease:'none',scrollTrigger:{trigger:sprig.parentElement,start:'top bottom',end:'bottom top',scrub:2}});
      });
      if(window.matchMedia('(hover: hover)').matches){
        gsap.utils.toArray<HTMLElement>('.photo-arch,.gallery-image,.location-art').forEach(card=>{
          const rx=gsap.quickTo(card,'rotationX',{duration:.8,ease:'power3.out'}),ry=gsap.quickTo(card,'rotationY',{duration:.8,ease:'power3.out'});
          const move=(e:PointerEvent)=>{const b=card.getBoundingClientRect();rx(-(e.clientY-b.top-b.height/2)/b.height*12);ry((e.clientX-b.left-b.width/2)/b.width*16);};
          const leave=()=>{rx(0);ry(0);};
          card.addEventListener('pointermove',move);card.addEventListener('pointerleave',leave);
          cleanups.push(()=>{card.removeEventListener('pointermove',move);card.removeEventListener('pointerleave',leave);});
        });
      }
    },root);
    const refresh=()=>ScrollTrigger.refresh();
    document.fonts.ready.then(refresh);
    window.addEventListener('load',refresh);
    return()=>{window.removeEventListener('load',refresh);cleanups.forEach(fn=>fn());context.revert();};
  },[opened,enabled]);
}
