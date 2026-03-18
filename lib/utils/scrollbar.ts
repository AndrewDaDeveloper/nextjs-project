import { gsap } from 'gsap';

let cachedEl: HTMLElement | null | undefined = undefined;

function resolveScrollEl(): HTMLElement {
  if (cachedEl !== undefined) return cachedEl ?? document.documentElement;

  const candidates = [
    document.querySelector<HTMLElement>('[data-scroll-container]'),
    document.querySelector<HTMLElement>('.scroll-container'),
    document.querySelector<HTMLElement>('#scroll-container'),
    document.querySelector<HTMLElement>('main'),
  ];

  for (const el of candidates) {
    if (el && el.scrollHeight - el.clientHeight > 10) {
      cachedEl = el;
      return el;
    }
  }

  cachedEl = null;
  return document.documentElement;
}

function getScroll(): { top: number; max: number } {
  const el = resolveScrollEl();
  const top = el === document.documentElement ? window.scrollY : el.scrollTop;
  const max = Math.max(el.scrollHeight - el.clientHeight, 0);
  return { top, max };
}

interface ScrollBarRefs {
  leftBarRef: React.RefObject<HTMLDivElement>;
  rightBarRef: React.RefObject<HTMLDivElement>;
  leftPctRef: React.RefObject<HTMLSpanElement>;
  rightPctRef: React.RefObject<HTMLSpanElement>;
}

export function createScrollUpdater(refs: ScrollBarRefs): () => void {
  const { leftBarRef, rightBarRef, leftPctRef, rightPctRef } = refs;

  return function updateBars() {
    const { top, max } = getScroll();
    const pct = max > 0 ? Math.min(top / max, 1) : 0;

    if (leftBarRef.current)  gsap.set(leftBarRef.current,  { scaleY: pct, transformOrigin: 'top center' });
    if (rightBarRef.current) gsap.set(rightBarRef.current, { scaleY: pct, transformOrigin: 'top center' });
    if (leftPctRef.current)  leftPctRef.current.textContent  = String(Math.round(pct * 100)).padStart(3, '0') + '%';
    if (rightPctRef.current) rightPctRef.current.textContent = String(Math.round(top)).padStart(5, '0') + 'px';
  };
}

export function registerScrollListeners(handler: () => void): () => void {
  const el = resolveScrollEl();
  const target: EventTarget = el === document.documentElement ? window : el;
  target.addEventListener('scroll', handler, { passive: true });
  return () => target.removeEventListener('scroll', handler);
}