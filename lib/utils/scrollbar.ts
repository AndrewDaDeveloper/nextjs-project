import { gsap } from 'gsap';

function getScroll(): { top: number; max: number } {
  return {
    top: window.scrollY,
    max: document.documentElement.scrollHeight - window.innerHeight,
  };
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
  window.addEventListener('scroll', handler, { passive: true });
  return () => window.removeEventListener('scroll', handler);
}