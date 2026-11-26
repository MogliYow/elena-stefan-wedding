const el = id => document.getElementById(id);
const song = el('song');
const music = el('music');
function setMusicLabel() {
  music.textContent = song.paused ? '♫ Вклучи музика' : '♫ Исклучи музика';
  music.setAttribute('aria-pressed', String(!song.paused));
}
song.addEventListener('playing', setMusicLabel);
song.addEventListener('pause', setMusicLabel);
function playMusic() { song.play().catch(setMusicLabel); }
music.onclick = () => song.paused ? playMusic() : song.pause();
el('seal').onclick = () => {
  el('seal').disabled = true;
  el('cover').classList.add('opening');
  playMusic();
  setTimeout(() => {
    el('cover').hidden = true;
    el('invitation').hidden = false;
    el('greeting').focus({preventScroll:true});
    window.scrollTo(0,0);
  }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 780);
};
const flames = Array.from(document.querySelectorAll('.candle button'));
const status = el('status');
for (const flame of flames) {
  flame.onclick = () => {
    flame.disabled = true;
    flame.parentElement.classList.add('out');
    if (flames.some(b => !b.disabled)) {
      status.textContent = 'Уште едно пламенче за роденденската желба!';
      flames.find(b => !b.disabled).focus({preventScroll:true});
      return;
    }
    status.textContent = 'Среќен втор роденден, Стефи!';
    el('again').hidden = false;
    el('again').focus({preventScroll:true});
    for(let i=0;i<32;i++){
      const chip = document.createElement('i');
      chip.style.left = ((i*37)%100)+'%';
      chip.style.background = ['#ea8dae','#ffde83','#ad88c3','#fff1ed'][i%4];
      chip.style.animationDelay = (i%8)*.07+'s';
      el('confetti').append(chip);
    }
  };
}
el('again').onclick = () => {
  flames.forEach(b=>{b.disabled=false;b.parentElement.classList.remove('out');});
  el('confetti').replaceChildren();
  status.textContent='Замисли желба и допри ги двете пламенчиња!';
  el('again').hidden=true;
  flames[0].focus({preventScroll:true});
};
el('share').onclick = async () => {
  try {
    if (navigator.share) await navigator.share({title:document.title,url:location.href});
    else {await navigator.clipboard.writeText(location.href);el('message').textContent='Линкот е копиран.';}
  } catch(error){if(error.name!=='AbortError')el('message').textContent=location.href;}
};
