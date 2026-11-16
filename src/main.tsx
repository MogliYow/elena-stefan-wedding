import React, {useEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import gsap from 'gsap';
import {invitation as data} from './data/invitation';
import './styles.css';

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function Sprig({className=''}:{className?:string}) {
  return <svg className={className} viewBox="0 0 160 300" fill="none" aria-hidden="true">
    <path d="M83 292C70 240 104 199 81 147S66 53 103 8" stroke="currentColor" strokeWidth="1.3"/>
    {[0,1,2,3,4,5].map(i=><g key={i} transform={'translate(0 '+i*43+')'}>
      <path d="M85 47C49 51 36 24 36 10C61 13 81 25 85 47Z" fill="currentColor" opacity=".55"/>
      <path d="M85 66C117 65 137 42 137 26C109 30 88 46 85 66Z" fill="currentColor" opacity=".7"/>
      <path d="M84 47L46 18M86 65L128 35" stroke="currentColor" opacity=".7"/>
    </g>)}
  </svg>;
}
function App(){
  const [opened,setOpened]=useState(false);
  const [opening,setOpening]=useState(false);
  const intro=useRef<HTMLDivElement>(null);
  const timeline=useRef<gsap.core.Timeline|null>(null);
  const open = (skip=false)=>{
    if(opening||opened)return;
    setOpening(true);
    const finish=()=>{setOpened(true);setOpening(false);requestAnimationFrame(()=>{document.getElementById('names')?.focus();window.scrollTo(0,0);});};
    if(skip||reduced()){finish();return;}
    timeline.current=gsap.timeline({onComplete:finish})
      .to('.wax-seal',{y:24,scale:.9,opacity:0,duration:.45,ease:'power2.in'})
      .to('.envelope-flap',{rotationX:-180,duration:1.05,ease:'power2.inOut'},.32)
      .set('.envelope-flap',{zIndex:1},.86)
      .to('.invitation-letter',{yPercent:-57,duration:1.1,ease:'power3.inOut'},1)
      .to('.intro-caption',{opacity:0,y:12,duration:.5},1.15)
      .to('.envelope-stage',{y:95,scale:1.04,duration:1.1,ease:'power2.inOut'},1.4)
      .to(intro.current,{opacity:0,duration:.9,ease:'power2.inOut'},2.25);
  };
  useEffect(()=>{document.body.style.overflow=opened?'':'hidden';return()=>{document.body.style.overflow='';};},[opened]);
  useEffect(()=>()=>{timeline.current?.kill();},[]);
  useEffect(()=>{
    if(!opened)return;
    const nodes=document.querySelectorAll('.reveal');
    if(reduced()){nodes.forEach(n=>n.classList.add('visible'));return;}
    const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target);}}),{threshold:.12});
    nodes.forEach(n=>observer.observe(n));
    return()=>observer.disconnect();
  },[opened]);
  return <>
    {!opened&&<div className="intro" ref={intro} role="dialog" aria-modal="true" aria-label="Отворете ја свадбената покана">
      <div className="intro-halo"/>
      <header className="intro-top"><span className="eyebrow">За еден незаборавен ден</span><button className="text-button" onClick={()=>open(true)} disabled={opening}>Прескокни го воведот ↗</button></header>
      <div className="envelope-stage"><Sprig className="intro-sprig intro-sprig-left"/><Sprig className="intro-sprig intro-sprig-right"/>
        <div className="envelope">
          <div className="envelope-back"/>
          <div className="invitation-letter"><span className="letter-monogram">{data.monogram}</span><span className="eyebrow">Со љубов ве покануваме</span><div className="letter-names">Елена & Стефан</div><span className="letter-rule"/><p>Некои приказни се пишуваат со срце.<br/>Нашата продолжува со вас.</p><span className="letter-date">{data.dateLabel} · Скопје</span></div>
          <div className="envelope-front"><div className="envelope-address"><span>За вас, со љубов</span><small>Една покана. Илјада емоции.</small></div></div>
          <div className="envelope-flap"><div className="flap-face flap-front"><span>E · S</span></div><div className="flap-face flap-back"/></div>
          <button className="wax-seal" onClick={()=>open()} disabled={opening} aria-label="Отвори ја поканата"><svg viewBox="0 0 100 100" aria-hidden="true"><path d="M32 76C9 56 17 28 37 19M68 76C91 56 83 28 63 19M24 61L15 55M23 50L14 42M25 38L20 29M29 29L29 20M76 61L85 55M77 50L86 42M75 38L80 29M71 29L71 20"/></svg><span>{data.monogram}</span></button>
        </div>
      </div>
      <footer className="intro-bottom intro-caption"><p className="intro-couple">Елена & Стефан</p><p className="eyebrow">{opening?'Една љубовна приказна се отвора…':'Допрете го печатот за да ја отворите поканата'}</p><span className="intro-line"/></footer>
    </div>}
    <main aria-hidden={!opened} {...(!opened?{inert:''} as Record<string,string>:{})}>
      <section className="hero" id="home">
        <div className="hero-photo"><img src={data.photos.hero} alt="Романтична свадбена прослава во градина" fetchPriority="high"/></div><div className="hero-shade"/>
        <nav className="hero-nav"><a className="nav-monogram" href="#home">{data.monogram}</a><div><a href="#day">Нашиот ден</a><a href="#location">Локација</a><a href="#rsvp">RSVP</a></div></nav>
        <div className="hero-content"><p className="eyebrow">Нашето засекогаш започнува тука</p><h1 id="names" tabIndex={-1}><span>Елена</span><em>&</em><span>Стефан</span></h1><p className="hero-date"><span/>{data.dateLabel}<span/></p><p className="hero-location">Скопје, Македонија</p></div>
        <a className="scroll-cue" href="#welcome"><span>Нашата приказна</span><i className="scroll-cue-line"/></a><span className="hero-side-note">Together is a beautiful place to be</span>
      </section>
      <section className="welcome section-pad" id="welcome"><Sprig className="welcome-sprig"/><div className="welcome-copy reveal"><span className="section-index">01 / Со љубов</span><p className="eyebrow">Драги наши</p><h2>Најубавите моменти<br/>се споделуваат.</h2><p className="body-copy">Со радост во срцата ве покануваме да бидете дел од денот кога нашите две приказни ќе станат една. Вашето присуство ќе биде најубавиот подарок.</p><p className="italic-note">Да создадеме спомени што траат.</p><div className="event-details"><div><p className="eyebrow">Кога</p><h3>Сабота, 12 јуни</h3><p>2027 <span className="detail-divider">/</span> 17:00 часот</p></div><div><p className="eyebrow">Каде</p><h3>Скопје</h3><p>Нашето место за убави спомени</p></div></div></div></section>
      <section className="story section-pad"><div className="story-portrait reveal"><div className="portrait-orbit"/><div className="photo-arch"><img src={data.photos.portrait} loading="lazy" alt="Младенци во романтична прегратка"/></div><span className="portrait-caption">It was always you.</span></div><div className="story-copy reveal"><p className="eyebrow">02 / Нашата приказна</p><h2>Од една насмевка,<br/>до едно засекогаш.</h2><p className="body-copy">Меѓу сите случајности, ние се најдовме. Во малите нешта, долгите разговори и обичните денови ја препознавме нашата најголема среќа.</p><blockquote>„Најубавото место на светот<br/>е покрај тебе.“</blockquote></div></section>
      <section className="day section-pad" id="day"><div className="section-heading reveal"><p className="eyebrow">03 / Моменти што ќе ги паметиме</p><h2>Еден ден. Цела љубов.</h2></div><ol className="timeline">{data.timeline.map((item,i)=><li className="timeline-item reveal" key={item.time}><time>{item.time}</time><span className="timeline-dot"/><div><span className="timeline-number">0{i+1}</span><h3>{item.title}</h3><p>{item.text}</p></div></li>)}</ol></section>
      <section className="gallery-section section-pad"><div className="section-heading reveal"><p className="eyebrow">04 / Парчиња од нашето засекогаш</p><h2>Љубов, во секој кадар.</h2></div><div className="gallery">{data.photos.gallery.map((src,i)=><figure className="gallery-item reveal" key={src}><div className="gallery-image"><img src={src} loading="lazy" alt={['Свадбени цветови и нежни детали','Прегратка на младенците','Свадбена градина'][i]}/></div><figcaption><span>0{i+1}</span>{['Малите нешта.','Нашето сè.','Убавината на моментот.'][i]}</figcaption></figure>)}</div></section>
      <section className="dress-code section-pad"><Sprig className="dress-sprig"/><div className="reveal"><p className="eyebrow">05 / Малку инспирација</p><h2>Елеганција, по ваше.</h2><p className="body-copy">Нежни тонови, природни материјали и вашата најубава насмевка. Оваа палета е само инспирација — најважно е да се чувствувате убаво.</p><div className="colour-palette" aria-label="Маслинеста, песочна, розова и кафена">{['#8d957b','#d5c3a2','#c5a69d','#8b7767'].map(c=><span key={c} style={{background:c}}/>)}</div></div></section>
      <Countdown/>
      <section className="location section-pad" id="location"><div className="location-art reveal"><div className="venue-illustration"><div className="venue-roof"/>{['one','two','three','four'].map(n=><span key={n} className={'venue-column column-'+n}/>)}<div className="venue-steps"/></div><Sprig className="venue-sprig venue-sprig-left"/><Sprig className="venue-sprig venue-sprig-right"/><span className="venue-art-caption">Таму каде што се среќаваме.</span></div><div className="location-copy reveal"><p className="eyebrow">07 / Сите патишта водат до нас</p><h2>Се гледаме<br/>во Скопје.</h2><p className="body-copy">Еден посебен ден, во друштво на нашите најблиски. Со нетрпение ја очекуваме секоја прегратка.</p><a className="button button-outline" href={data.venue.maps} target="_blank" rel="noopener noreferrer">Отвори во Google Maps <span>↗</span></a><p className="location-note">Демо локација — точниот ресторан се внесува пред испраќање.</p></div></section>
      <RSVP/>
      <section className="closing section-pad"><div className="reveal"><span className="closing-monogram">{data.monogram}</span><p className="eyebrow">Најубавото допрва доаѓа</p><h2>Приказната е наша.<br/>Спомените се заеднички.</h2><p>Ви благодариме што сте дел од нашето засекогаш.</p><div className="closing-signature"><span>Со љубов</span><strong>Елена & Стефан</strong></div><button className="text-button" onClick={()=>{window.scrollTo(0,0);setOpened(false);}}>Повторно отвори го пликот ↗</button><p className="demo-footer">Твои покани · Демонстрациска свадбена покана</p></div></section>
    </main>
    {opened&&<Music/>}
  </>;
}
function Countdown(){
 const [now,setNow]=useState(Date.now());
 useEffect(()=>{const id=window.setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(id);},[]);
 const seconds=Math.max(0,Math.floor((Date.parse(data.date)-now)/1000));
 const values=[Math.floor(seconds/86400),Math.floor(seconds/3600)%24,Math.floor(seconds/60)%60,seconds%60];
 return <section className="countdown-section section-pad"><div className="reveal"><p className="eyebrow">06 / Секој миг нè носи поблиску</p><h2>{seconds?'Одбројуваме до нас.':'Нашиот ден пристигна.'}</h2><div className="countdown" aria-label="Одбројување до свадбата">{values.map((n,i)=><div className="countdown-unit" key={i}><span>{String(n).padStart(2,'0')}</span><small>{['Дена','Часа','Минути','Секунди'][i]}</small></div>)}</div></div></section>;
}
function RSVP(){
 const [sent,setSent]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const [attendance,setAttendance]=useState('yes');
 async function submit(e:React.FormEvent<HTMLFormElement>){
   e.preventDefault();setError('');
   const form=e.currentTarget; const values=new FormData(form);
   if(!String(values.get('name')||'').trim()){setError('Внесете име и презиме.');return;}
   if(data.rsvp.mode==='demo'){setSent(true);return;}
   if(!/^https:\/\/formspree.io\/f\/[a-zA-Z0-9]+$/.test(data.rsvp.endpoint)){setError('Пријавувањето сè уште не е поврзано.');return;}
   setBusy(true);
   try{const response=await fetch(data.rsvp.endpoint,{method:'POST',body:values,headers:{Accept:'application/json'}});if(!response.ok)throw new Error();setSent(true);}catch{setError('Не успеавме да ја испратиме потврдата. Обидете се повторно.');}finally{setBusy(false);}
 }
 return <section className="rsvp-section section-pad" id="rsvp"><div className="rsvp-introduction reveal"><p className="eyebrow">08 / Вашето место е со нас</p><h2>Ќе бидете ли<br/>дел од приказната?</h2><p>Ни значи да знаеме дека ќе ја споделиме радоста со вас.</p><p className="rsvp-deadline">Ве молиме потврдете до<strong>{data.deadline}</strong></p><span className="rsvp-flourish">With love, E & S</span></div><div className="rsvp-paper reveal">{sent?<div className="rsvp-success" role="status"><span className="success-mark">✓</span><h3>{data.rsvp.mode==='demo'?'Демо-потврдата е готова.':'Ви благодариме!'}</h3><p>{data.rsvp.mode==='demo'?'Ова е демонстрација. Ниту еден податок не е испратен до организаторите.':'Вашиот одговор е успешно испратен.'}</p><button className="text-button" onClick={()=>setSent(false)}>Врати се на формуларот ↗</button></div>:<form onSubmit={submit}>{data.rsvp.mode==='demo'&&<p className="demo-notice">Демо RSVP · Можете да го испробате формуларот. Одговорите не се испраќаат и не се зачувуваат.</p>}<fieldset className="form-fields" disabled={busy}><label className="field"><span>Име и презиме *</span><input name="name" autoComplete="name" maxLength={120} required/></label><fieldset className="attendance"><legend>Ќе ни се придружите? *</legend><div className="attendance-options"><label className="radio-option"><input type="radio" name="attendance" value="yes" checked={attendance==='yes'} onChange={()=>setAttendance('yes')}/><span>Со радост, доаѓам!</span></label><label className="radio-option"><input type="radio" name="attendance" value="no" checked={attendance==='no'} onChange={()=>setAttendance('no')}/><span>За жал, нема да можам.</span></label></div></fieldset>{attendance==='yes'&&<label className="field"><span>Број на гости, вклучувајќи ве и вас *</span><input type="number" name="guests" min="1" max="10" defaultValue="1" required/></label>}<label className="field"><span>Порака за нас</span><textarea name="message" rows={2} maxLength={1000} placeholder="Неколку зборови од срце…"/></label><button className="button button-dark submit-button" type="submit">{busy?'Се испраќа…':data.rsvp.mode==='demo'?'Испробај ја потврдата':'Потврди присуство'}<span>↗</span></button></fieldset>{error&&<p className="form-error" role="alert">{error}</p>}<p className="privacy-note">Вашите убави зборови го прават овој ден уште посебен.</p></form>}</div></section>;
}
function Music(){
 const [playing,setPlaying]=useState(false),[error,setError]=useState('');
 const audio=useRef<AudioContext|null>(null),timer=useRef<number|undefined>();
 const position=useRef(0);
 const stop=()=>{if(timer.current)clearInterval(timer.current);timer.current=undefined;void audio.current?.suspend();setPlaying(false);};
 useEffect(()=>()=>{if(timer.current)clearInterval(timer.current);void audio.current?.close();},[]);
 async function toggle(){
   if(playing){stop();return;}
   try{
     if(!audio.current)audio.current=new AudioContext();
     const ctx=audio.current;await ctx.resume();setError('');
     const notes=[261.63,329.63,392,523.25,440,349.23,293.66,392];
     const play=()=>{const osc=ctx.createOscillator();const gain=ctx.createGain();osc.type='sine';osc.frequency.value=notes[position.current++%notes.length];const t=ctx.currentTime;gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(.045,t+.04);gain.gain.exponentialRampToValueAtTime(.001,t+2.6);osc.connect(gain);gain.connect(ctx.destination);osc.start(t);osc.stop(t+2.7);osc.onended=()=>{osc.disconnect();gain.disconnect();};};
     play();timer.current=window.setInterval(play,740);setPlaying(true);
   }catch{setError('Звукот не е достапен во овој прелистувач.');}
 }
 return <div className="music-control">{error&&<p className="music-error" role="status">{error}</p>}<button className={'music-button '+(playing?'is-playing':'')} onClick={toggle} aria-pressed={playing}><span className="equalizer" aria-hidden="true"><i/><i/><i/><i/></span>{playing?'Исклучи музика':'Вклучи музика'}</button></div>;
}
createRoot(document.getElementById('root')!).render(<App/>);
