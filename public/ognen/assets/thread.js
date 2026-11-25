// Follow the repeating cubic curve printed in the margin, in page coordinates.
(() => {
 const road=document.querySelector('.gold-thread'),car=document.querySelector('.thread-rider');
 const curves=[[[65,0],[65,105],[146,128],[93,213]],[[93,213],[40,298],[10,345],[65,420]]];
 const cubic=(a,b,c,d,t)=>a*(1-t)**3+3*b*(1-t)**2*t+3*c*(1-t)*t*t+d*t**3;
 let frame=0;
 function place(){
  frame=0;const rect=road.getBoundingClientRect();
  const y=Math.max(0,Math.min(rect.height-car.offsetHeight*.65,innerHeight*.64-rect.top)),local=y%420;
  const pts=curves[local<213?0:1],at=(axis,t)=>cubic(pts[0][axis],pts[1][axis],pts[2][axis],pts[3][axis],t);
  let low=0,high=1;for(let i=0;i<12;i++){const t=(low+high)/2;if(at(1,t)<local)low=t;else high=t}
  const x=road.offsetLeft+rect.width*at(0,high)/150;
  const angle=12*(at(0,Math.min(1,high+.02))-at(0,Math.max(0,high-.02)))/5;
  car.style.transform='translate3d('+(x-car.offsetWidth/2)+'px,'+(y-car.offsetHeight/2)+'px,0) rotate('+angle+'deg)';
  car.style.visibility='visible';
 }
 function queue(){if(!frame)frame=requestAnimationFrame(place)}
 addEventListener('scroll',queue,{passive:true});addEventListener('resize',queue);addEventListener('load',queue);queue();
})();
