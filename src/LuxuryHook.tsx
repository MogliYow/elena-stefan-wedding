import {useEffect, useRef, useState, type PointerEvent} from 'react';
import {invitation} from './data/invitation';
import './luxury-hook.css';

const silk = new URL('./assets/atelier/silk.webp', import.meta.url).href;
const clamp = (n: number) => Math.max(0, Math.min(1, n));
function easeAt(value: number, from: number, to: number) {
  const t = clamp((value - from) / (to - from));
  return t * t * (3 - 2 * t);
}

type Phase = 'closed' | 'moving' | 'open';
export default function LuxuryHook({motion, onComplete}: {motion: boolean; onComplete?: () => void}) {
  const stage = useRef<HTMLDivElement>(null);
  const position = useRef(0);
  const frame = useRef(0);
  const drag = useRef<{id: number; y: number; length: number; moved: boolean} | null>(null);
  const ignoreClick = useRef(false);
  const openControl = useRef<HTMLButtonElement>(null);
  const nextControl = useRef<HTMLButtonElement>(null);
  const [phase, setPhase] = useState<Phase>('closed');
  const [movingSilk, setMovingSilk] = useState(false);
  const silkLayer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let disposed = false;
    let release: (() => void) | undefined;
    if (motion && silkLayer.current) {
      const element = silkLayer.current;
      import('./silkRelief').then(async ({mountSilk}) => {
        if (disposed) return;
        release = await mountSilk(element, silk, () => position.current, visible => {
          if (!disposed) setMovingSilk(visible);
        });
        if (disposed) release?.();
      }).catch(() => { /* The photographic silk remains visible without WebGL. */ });
    }
    return () => { disposed = true; release?.(); cancelAnimationFrame(frame.current); };
  }, [motion]);

  function paint(value: number) {
    position.current = value;
    const node = stage.current;
    if (!node) return;
    const band = easeAt(value, 0, .55);
    const left = easeAt(value, .40, .88);
    const right = easeAt(value, .52, .98);
    const card = easeAt(value, .62, 1);
    const style = node.style;
    style.setProperty('--band-y', band * 340 + '%');
    style.setProperty('--band-x', (band * band * 51) + '%');
    style.setProperty('--band-twist', band * 12 + 'deg');
    style.setProperty('--band-opacity', String(1 - easeAt(value, .35, .55)));
    style.setProperty('--tag-swing', Math.sin(band * Math.PI * 1.8) * -16 + 'deg');
    style.setProperty('--left-angle', -147 * left + 'deg');
    style.setProperty('--right-angle', 143 * right + 'deg');
    style.setProperty('--left-dark', String(Math.sin(left * Math.PI) * .29));
    style.setProperty('--right-dark', String(Math.sin(right * Math.PI) * .31));
    style.setProperty('--tissue', String(1 - easeAt(value, .48, .80)));
    style.setProperty('--card-scale', String(1 + card * .035));
    style.setProperty('--stage-scale', String(1 - card * .12));
    style.setProperty('--card-depth', card * 17 + 'px');
    silkLayer.current?.dispatchEvent(new Event('silk-paint'));
  }

  function settle(target: 0 | 1) {
    cancelAnimationFrame(frame.current);
    drag.current = null;
    const from = position.current;
    const finish = () => {
      paint(target);
      setPhase(target ? 'open' : 'closed');
      frame.current = requestAnimationFrame(() => (target ? nextControl.current : openControl.current)?.focus({preventScroll: true}));
    };
    if (!motion || Math.abs(target - from) < .001) { finish(); return; }
    setPhase('moving');
    const start = performance.now();
    const duration = (target ? 2600 : 1900) * Math.abs(target - from);
    function draw(now: number) {
      const t = clamp((now - start) / duration);
      paint(from + (target - from) * t);
      if (t < 1) frame.current = requestAnimationFrame(draw);
      else finish();
    }
    frame.current = requestAnimationFrame(draw);
  }

  function pointerDown(e: PointerEvent<HTMLButtonElement>) {
    if (e.button !== 0 || !e.isPrimary || phase !== 'closed') return;
    ignoreClick.current = false;
    drag.current = {id: e.pointerId, y: e.clientY, length: Math.max(80, e.currentTarget.offsetWidth * .48), moved: false};
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function pointerMove(e: PointerEvent<HTMLButtonElement>) {
    const gesture = drag.current;
    if (!gesture || gesture.id !== e.pointerId || !motion) return;
    const distance = e.clientY - gesture.y;
    if (distance > 6) gesture.moved = true;
    if (gesture.moved) paint(clamp(distance / gesture.length) * .53);
  }
  function pointerEnd(e: PointerEvent<HTMLButtonElement>, cancelled = false) {
    const gesture = drag.current;
    if (!gesture || gesture.id !== e.pointerId) return;
    drag.current = null;
    ignoreClick.current = cancelled || gesture.moved;
    if (cancelled || gesture.moved) settle(!cancelled && position.current > .13 ? 1 : 0);
  }

  function tilt(e: PointerEvent<HTMLDivElement>) {
    if (!motion || e.pointerType !== 'mouse' || drag.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = clamp((e.clientX - rect.left) / rect.width) - .5;
    const y = clamp((e.clientY - rect.top) / rect.height) - .5;
    stage.current?.style.setProperty('--tilt-y', x * 6 + 'deg');
    stage.current?.style.setProperty('--tilt-x', -y * 4 + 'deg');
  }
  return <div className="atelier" data-phase={phase} role={onComplete ? 'dialog' : 'region'}
    aria-modal={onComplete ? true : undefined} aria-label="Свадбена покана на Елена и Стефан">
    {onComplete && <button className="atelier-skip" onClick={onComplete}>Прескокни го воведот</button>}
    <div className="atelier-composition" onPointerMove={tilt} onPointerLeave={() => {
      stage.current?.style.setProperty('--tilt-y','0deg');
      stage.current?.style.setProperty('--tilt-x','0deg');
    }}>
      <div className="atelier-object" ref={stage}>
        <div className="atelier-base" aria-hidden="true"/>
        <article className="atelier-letter" aria-hidden={phase !== 'open'}>
          <div className="atelier-letter-frame">
            <p className="atelier-overline">Свадбена покана</p>
            <h1><span>{invitation.names[0]}</span><i>&amp;</i><span>{invitation.names[1]}</span></h1>
            <p className="atelier-date">{invitation.dateLabel}</p>
            <p className="atelier-place">Скопје</p>
          </div>
        </article>
        <div className="atelier-tissue" aria-hidden="true"><span>Е <i>&amp;</i> С</span></div>
        {['left', 'right'].map(side => <div key={side} aria-hidden="true" className={'atelier-wing wing-' + side}>
          <div className="wing-face outside"/><div className="wing-face lining"/>
        </div>)}
        <div className="atelier-sash" aria-hidden="true">
          <div className="atelier-tag"><span className="tag-cord"/><div className="tag-paper"><i/>За вас</div></div>
          <div className="atelier-silk" data-mesh={movingSilk} ref={silkLayer}>
            <img src={silk} alt="" draggable="false" fetchPriority="high"/>
          </div>
        </div>
        {phase === 'closed' && <button className="atelier-hit" aria-label="Отвори ја поканата" ref={openControl}
          onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={e => pointerEnd(e)}
          onPointerCancel={e => pointerEnd(e,true)} onClick={e => {
          if (!e.detail || !ignoreClick.current) settle(1);
          ignoreClick.current = false;
        }}/>}
      </div>
    </div>
    <footer className="atelier-actions">
      {phase === 'closed' && <button onClick={() => settle(1)}>Допри ја панделката</button>}
      {phase === 'open' && <button ref={nextControl} onClick={() => onComplete ? onComplete() : settle(0)}>
        {onComplete ? 'Продолжи кон поканата' : 'Повтори го отворањето'}</button>}
    </footer>
  </div>;
}
