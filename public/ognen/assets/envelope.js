(() => {
  const cover = document.querySelector('#cover');
  const stage = cover.querySelector('.atelier-object');
  const host = stage.querySelector('.atelier-silk');
  const silk = host.querySelector('img');
  const hit = stage.querySelector('.atelier-hit');
  const untie = document.querySelector('#untie');
  const next = document.querySelector('#openInvitation');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let progress = 0, frame = 0, drag = null, ignoreClick = false, release;
  const clamp = x => Math.max(0, Math.min(1, x));
  function ease(x, a, b) {
    const t = clamp((x-a)/(b-a));
    return t*t*(3-2*t);
  }
  function paint(p) {
    progress = p;
    const apart = ease(p,.475,.72), sweep = ease(p,.65,.92);
    const left = ease(p,.735,.965), right = ease(p,.76,.985), card = ease(p,.78,1);
    const style = stage.style;
    style.setProperty('--silk-photo', String(release ? Number(p===0) : 1-ease(p,.08,.65)));
    style.setProperty('--tag-x',(-198*apart-620*sweep)/6.9+'cqw');
    style.setProperty('--tag-y',(3*apart+81*sweep)/6.9+'cqw');
    style.setProperty('--tag-swing',(8*Math.sin(ease(p,.34,.545)*Math.PI)-24*apart+34*sweep)+'deg');
    style.setProperty('--left-angle',-147*left+'deg');
    style.setProperty('--right-angle',143*right+'deg');
    style.setProperty('--left-dark',String(Math.sin(left*Math.PI)*.29));
    style.setProperty('--right-dark',String(Math.sin(right*Math.PI)*.31));
    style.setProperty('--tissue',String(1-ease(p,.74,.88)));
    style.setProperty('--stage-scale',String(1-card*.12));
    style.setProperty('--card-depth',card*17+'px');
    host.dispatchEvent(new Event('silk-paint'));
  }
  function initialize() {
    if (!reduce.matches && silk.naturalWidth && window.OgnenSilk) release=OgnenSilk.mountSilk(host,silk,()=>progress);
  }
  if(silk.complete) initialize(); else silk.addEventListener('load',initialize,{once:true});
  function settle(target) {
    if(next.hidden===false) return;
    cancelAnimationFrame(frame);
    const start=performance.now(), from=progress, duration=3900*Math.abs(target-from);
    hit.disabled=untie.disabled=true;
    function step(now) {
      const t=reduce.matches || !duration ? 1 : clamp((now-start)/duration);
      paint(from+(target-from)*t);
      if(t<1){frame=requestAnimationFrame(step);return;}
      if(target){
        hit.hidden=untie.hidden=true;
        next.hidden=false;
        stage.querySelector('.atelier-letter').setAttribute('aria-hidden','false');
        next.focus({preventScroll:true});
      } else hit.disabled=untie.disabled=false;
    }
    frame=requestAnimationFrame(step);
  }
  hit.onpointerdown=e=>{
    if(!e.isPrimary || e.button!==0 || hit.disabled)return;
    ignoreClick=false;drag={id:e.pointerId,x:e.clientX,y:e.clientY,moved:false};
    hit.setPointerCapture(e.pointerId);
  };
  hit.onpointermove=e=>{
    if(!drag || drag.id!==e.pointerId)return;
    const dy=e.clientY-drag.y,dx=e.clientX-drag.x;
    if(dy>5)drag.moved=true;
    if(drag.moved && !reduce.matches)paint(.59*clamp(Math.max(dy,.78*dy+.54*dx)/Math.max(80,hit.offsetWidth*.48)));
  };
  function end(e,cancelled) {
    if(!drag || drag.id!==e.pointerId)return;
    ignoreClick=cancelled||drag.moved;
    if(ignoreClick)settle(!cancelled && (progress>.13||reduce.matches)?1:0);
    drag=null;
  }
  hit.onpointerup=e=>end(e,false);
  hit.onpointercancel=e=>end(e,true);
  hit.onclick=e=>{if(!e.detail || !ignoreClick)settle(1);ignoreClick=false};
  untie.onclick=()=>settle(1);
  next.addEventListener('click',()=>release?.(),{once:true});
})();
