const $=s=>document.querySelector(s);
const combined=new URLSearchParams(location.search).get('proslava')==='zaedno';
const song=$('#melody'),wish=$('#wish'),form=$('form');
if(combined){document.title='Крштевка и трет роденден на Мила';$('#intro').textContent='Денес ја славиме мојата крштевка и мојот трет роденден.';$('#church').hidden=false}
async function play(){try{await song.play()}catch{$('#notice').textContent='Допрете „Музика“ за звук.'}}
song.onplaying=()=>{$('#music').textContent='♫ Исклучи';$('#music').setAttribute('aria-pressed','true')};
song.onpause=()=>{$('#music').textContent='♫ Музика';$('#music').setAttribute('aria-pressed','false')};
$('#music').onclick=()=>song.paused?play():song.pause();
let opened=false;
wish.onclick=()=>{if(!opened){opened=true;play();$('#cake').src='birthday-blown.webp';$('#cake').alt='Торта со три дувнати свеќички';$('#details').hidden=false;wish.textContent='Погледни ги деталите ↓';
 for(let i=0;i<32;i++){const c=document.createElement('i');c.style.left=(i*37%100)+'%';c.style.background=['#d99ca4','#94bca6','#bda5ce','#e4b769'][i%4];c.style.animationDelay=(i%7)*.06+'s';$('#confetti').append(c)}}
 $('#details').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})};
$('#share').onclick=async()=>{try{if(navigator.share)await navigator.share({title:document.title,url:location.href});else{await navigator.clipboard.writeText(location.href);$('#notice').textContent='Линкот е копиран.'}}catch(e){if(e.name!=='AbortError')$('#notice').textContent=location.href}};
const events=[...(combined?[['church','20270612T100000Z','Крштевката на Мила','Радишани']]:[]),['party','20270612T140000Z','Мила полни три','Градски парк Скопје']];
const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Tvoi Pokani//MK'];
for(const [id,time,title,place] of events)lines.push('BEGIN:VEVENT','UID:mila-'+id+'@mogliyow.github.io','DTSTAMP:20261125T090000Z','DTSTART:'+time,'SUMMARY:'+title+' (пример)','LOCATION:'+place,'END:VEVENT');
$('#calendar').href=URL.createObjectURL(new Blob([[...lines,'END:VCALENDAR',''].join('\r\n')],{type:'text/calendar'}));
form.querySelector('select').onchange=e=>{$('#count').hidden=e.target.value==='no';$('#count input').disabled=$('#count').hidden};
form.onsubmit=e=>{e.preventDefault();form.querySelector('output').textContent=form.querySelector('select').value==='yes'?'Пробната потврда е готова. Број на гости: '+$('#count input').value+'.':'Пробно е означено отсуство.'};
