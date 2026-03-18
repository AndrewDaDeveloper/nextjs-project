import { gsap } from 'gsap';

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789·:°%█▓▒░';

export function typeIn(
  el: HTMLElement,
  finalText: string,
  duration = 0.8
): { tl: gsap.core.Timeline; cancel: () => void } {
  const tl = gsap.timeline();
  const chars = finalText.split('');
  const charDurationMs = (duration * 1000) / chars.length;
  let iv: ReturnType<typeof setInterval> | null = null;

  tl.add(() => {
    const start = performance.now();

    iv = setInterval(() => {
      const elapsed = performance.now() - start;
      const settled = Math.min(Math.floor(elapsed / charDurationMs), chars.length);
      const html = finalText.slice(0, settled).replace(/\n/g, '<br/>');

      if (settled >= chars.length) {
        el.innerHTML = html;
        if (iv !== null) { clearInterval(iv); iv = null; }
        return;
      }

      el.innerHTML = html + GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
    }, 28);
  }, 0);

  const cancel = () => {
    tl.kill();
    if (iv !== null) { clearInterval(iv); iv = null; }
  };

  return { tl, cancel };
}

interface HUDRefs {
  borderRef: React.RefObject<HTMLDivElement>;
  hudTLRef: React.RefObject<HTMLDivElement>;
  hudBLRef: React.RefObject<HTMLDivElement>;
  hudBRRef: React.RefObject<HTMLDivElement>;
  frameRef: React.RefObject<HTMLDivElement>;
  tickerRef: React.RefObject<HTMLDivElement>;
  leftWrapRef: React.RefObject<HTMLDivElement>;
  rightWrapRef: React.RefObject<HTMLDivElement>;
  statusRef: React.RefObject<HTMLDivElement>;
  cTL: React.RefObject<HTMLDivElement>;
  cTR: React.RefObject<HTMLDivElement>;
  cBL: React.RefObject<HTMLDivElement>;
  cBR: React.RefObject<HTMLDivElement>;
}

export function buildHUD(refs: HUDRefs): gsap.core.Timeline {
  const {
    borderRef, hudTLRef, hudBLRef, hudBRRef,
    frameRef, tickerRef, leftWrapRef, rightWrapRef,
    statusRef, cTL, cTR, cBL, cBR,
  } = refs;

  const m = gsap.timeline({ defaults: { ease: 'power2.out' } });

  m.set(borderRef.current, { opacity: 1 }, 0);

  m.fromTo('#sfb-frame-top',    { scaleX: 0, transformOrigin: 'left center' },   { scaleX: 1, duration: 0.65, ease: 'power3.inOut' }, 0);
  m.fromTo('#sfb-frame-bottom', { scaleX: 0, transformOrigin: 'right center' },  { scaleX: 1, duration: 0.65, ease: 'power3.inOut' }, 0.08);
  m.fromTo('#sfb-frame-left',   { scaleY: 0, transformOrigin: 'top center' },    { scaleY: 1, duration: 0.55, ease: 'power3.inOut' }, 0.25);
  m.fromTo('#sfb-frame-right',  { scaleY: 0, transformOrigin: 'bottom center' }, { scaleY: 1, duration: 0.55, ease: 'power3.inOut' }, 0.3);
  m.fromTo('#sfb-inner-frame',  { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.7);

  const cornerData = [
    { ref: cTL, at: 0.75, hO: 'left center',  vO: 'top center' },
    { ref: cTR, at: 0.82, hO: 'right center', vO: 'top center' },
    { ref: cBL, at: 0.89, hO: 'left center',  vO: 'bottom center' },
    { ref: cBR, at: 0.96, hO: 'right center', vO: 'bottom center' },
  ];

  cornerData.forEach(({ ref, at, hO, vO }) => {
    if (!ref.current) return;
    const h = ref.current.querySelector<HTMLElement>('.sfb-cl-h');
    const v = ref.current.querySelector<HTMLElement>('.sfb-cl-v');
    m.set(ref.current, { opacity: 1 }, at);
    if (h) m.fromTo(h, { scaleX: 0, transformOrigin: hO }, { scaleX: 1, duration: 0.22 }, at);
    if (v) m.fromTo(v, { scaleY: 0, transformOrigin: vO }, { scaleY: 1, duration: 0.22 }, at + 0.04);
  });

  m.fromTo('.sfb-tick',     { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: 0.15, stagger: 0.03, ease: 'back.out(2)' }, 1.2);
  m.fromTo('.sfb-tick-num', { opacity: 0, y: -4 },    { opacity: 1, y: 0, duration: 0.25, stagger: 0.07 }, 1.4);

  const tlEl = hudTLRef.current;
  if (tlEl) {
    m.set(tlEl, { opacity: 1 }, 1.5);
    const { tl } = typeIn(tlEl, 'SYS·ACTIVE\nINP·LOCKED\nVER 2.4.1', 0.65);
    m.add(tl, 1.51);
  }
  if (frameRef.current) m.fromTo(frameRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4 }, 1.6);

  const blEl = hudBLRef.current;
  if (blEl) { m.set(blEl, { opacity: 0 }, 1.75); }

  const brEl = hudBRRef.current;
  if (brEl) {
    m.set(brEl, { opacity: 1 }, 1.9);
    const { tl } = typeIn(brEl, 'SECTOR 17·C\nNODE 0x4A3F\nSIGNAL ████', 0.65);
    m.add(tl, 1.91);
  }

  if (tickerRef.current)    m.fromTo(tickerRef.current,  { opacity: 0, clipPath: 'inset(0 100% 0 0)' }, { opacity: 1, clipPath: 'inset(0 0% 0 0)', duration: 0.55, ease: 'power2.inOut' }, 2.1);
  if (leftWrapRef.current)  m.fromTo(leftWrapRef.current,  { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.45 }, 2.2);
  if (rightWrapRef.current) m.fromTo(rightWrapRef.current, { opacity: 0, x:  10 }, { opacity: 1, x: 0, duration: 0.45 }, 2.3);
  if (statusRef.current)    m.fromTo(statusRef.current.querySelectorAll<HTMLElement>('.sfb-status-dot'), { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: 0.2, stagger: 0.09, ease: 'back.out(3)' }, 2.5);

  return m;
}