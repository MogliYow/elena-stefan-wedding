function initInvitation() {
  'use strict';
  const cfg = window.INVITATION_CONFIG || {};
  const $ = (selector) => document.querySelector(selector);
  const showToast = (message) => {
    const toast = $('#toast');
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('show'), 4200);
  };

  // Редактибилните линкови се земаат од config.js.
  if (cfg.churchMap) $('#churchLink').href = cfg.churchMap;
  if (cfg.celebrationMap) $('#restaurantLink').href = cfg.celebrationMap;

  // Анимиран плик; при прилагоден reduced motion не се чека непотребно.
  const cover = $('#cover');
  const content = $('#website');
  const openButton = $('#openInvitation');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let opened = false;
  openButton.addEventListener('click', () => {
    if (opened) return;
    opened = true;
    openButton.disabled = true;
    // Стартувај го звукот директно од корисничкиот клик, пред анимацијата.
    // Прелистувачите го блокираат autoplay без интеракција.
    startMusic();
    cover.classList.add('opening');
    setTimeout(() => {
      content.removeAttribute('aria-hidden'); content.inert = false;
      document.body.classList.remove('locked');
      cover.classList.add('is-gone');
      cover.setAttribute('aria-hidden', 'true');
      cover.removeAttribute('aria-modal');
      document.querySelectorAll('.reveal').forEach((el) => {
        if (reducedMotion) el.classList.add('visible');
      });
      window.scrollTo({ top: 0, behavior: 'instant' });
      $('#shareButton').focus({ preventScroll: true });
      if (!reducedMotion) updateReveal();
    }, reducedMotion ? 0 : 780);
  });

  // Scroll анимациите работат и во Safari и со fallback за стари прелистувачи.
  let observer;
  function updateReveal() {
    if (reducedMotion) return;
    if ('IntersectionObserver' in window) {
      if (observer) return;
      observer = new IntersectionObserver((items) => {
        items.forEach((item) => {
          if (item.isIntersecting) {
            item.target.classList.add('visible');
            observer.unobserve(item.target);
          }
        });
      }, { threshold: .08, rootMargin: '0px 0px -20px 0px' });
      document.querySelectorAll('.reveal').forEach((item) => observer.observe(item));
    } else document.querySelectorAll('.reveal').forEach((item) => item.classList.add('visible'));
  }

  // Споделувањето е вистинско само по објавување; file:// не се испраќа како јавен линк.
  $('#shareButton').addEventListener('click', async () => {
    if (location.protocol === 'file:') {
      showToast('За да ја споделиш со гости, прво објави ја поканата на Netlify.');
      return;
    }
    const shareData = { title: 'Светата крштевка на Огнен', text: 'Разгледај пример за дигитална покана за крштевка од Твои покани.', url: location.href.split('#')[0] };
    try {
      if (navigator.share) await navigator.share(shareData);
      else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareData.url);
        showToast('Линкот е копиран! Испрати го преку Viber или WhatsApp.');
      } else showToast('Копирај го линкот од адресната лента и испрати го на гостите.');
    } catch (error) { if (error.name !== 'AbortError') showToast('Копирај го линкот од адресната лента.'); }
  });

  // MP3 фајл: се стартува директно во обработувачот на кликот,
  // без чекање на анимација или Web Audio контекст.
  const invitationAudio = $('#invitationAudio');
  const musicButton = $('#musicButton');
  let musicRequest = 0;
  invitationAudio.volume = 0.8;

  function setMusicUI(playing) {
    musicButton.setAttribute('aria-pressed', String(playing));
    $('#musicLabel').textContent = playing ? 'Исклучи' : 'Музика';
    musicButton.title = playing ? 'Исклучи музика' : 'Пушти ја музиката';
  }

  function startMusic() {
    // Важно: .play() мора да се повика синхронизирано со корисничкиот клик.
    // Не користи await / setTimeout пред овој повик.
    const request = ++musicRequest;
    invitationAudio.muted = false;
    try {
      const playback = invitationAudio.play();
      if (playback && typeof playback.then === 'function') {
        playback.then(() => {
          if (request !== musicRequest) return;
          setMusicUI(true);
        }).catch((err) => {
          if (request !== musicRequest) return;
          setMusicUI(false);
          console.warn('Music playback could not start:', err);
          showToast('За музика, допрете го копчето „Музика“ горе и проверете дали звукот е вклучен.');
        });
      } else {
        setMusicUI(!invitationAudio.paused);
      }
    } catch (err) {
      if (request !== musicRequest) return;
      setMusicUI(false);
      showToast('Звукот е блокиран. Допрете „Музика“ за повторен обид.');
    }
  }

  function stopMusic() {
    ++musicRequest;
    invitationAudio.pause();
    setMusicUI(false);
  }

  musicButton.addEventListener('click', () => {
    if (!invitationAudio.paused) stopMusic();
    else startMusic();
  });

  invitationAudio.addEventListener('error', () => {
    setMusicUI(false);
    showToast('Музиката не можеше да се вчита. Проверете ја интернет-врската.');
  });
  invitationAudio.addEventListener('ended', () => setMusicUI(false));
  // На мобилен одржувај го звукот при префрлување меѓу апликации;
  // корисникот може да го запре со копчето „Исклучи“.

  const guests=[{name:'Јана',yes:true,table:1},{name:'Марко',yes:true,table:2}];
  function display() {
    const list=$('#guestList'); list.replaceChildren();
    guests.forEach(guest=>{
      const row=document.createElement('label');row.textContent=guest.name;
      if(guest.yes){
        const choice=document.createElement('select');
        ['Без маса','Маса 1','Маса 2','Маса 3'].forEach((v,i)=>choice.add(new Option(v,i)));
        choice.value=guest.table;choice.onchange=()=>guest.table=Number(choice.value);row.append(choice);
      } else {row.append(' · Отсуствува');}
      list.append(row);
    });
  }
  display();
  $('#rsvpForm').onsubmit=e=>{
    e.preventDefault();const name=$('#guestName').value.trim();if(!name)return;
    const yes=new FormData(e.target).get('attends')==='yes';
    guests[2]={name,yes,table:0};display();
    $('#result').textContent=yes?'Пробна потврда. Погледнете го името во распоредот подолу.':'Пробно е означено отсуство.';
  };
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initInvitation, { once: true });
else initInvitation();
