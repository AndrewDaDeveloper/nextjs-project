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

// Throttle helper to limit execution frequency
function throttle<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): T & { cancel: () => void } {
  let lastCall = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;

  const throttled = ((...args: Parameters<T>) => {
    const now = Date.now();
    const remaining = delay - (now - lastCall);

    lastArgs = args;

    if (remaining <= 0) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      lastCall = now;
      fn(...args);
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        timeoutId = null;
        if (lastArgs) fn(...lastArgs);
      }, remaining);
    }
  }) as T & { cancel: () => void };

  throttled.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return throttled;
}

export function createScrollUpdater(refs: ScrollBarRefs): () => void {
  const { leftBarRef, rightBarRef, leftPctRef, rightPctRef } = refs;

  // Throttled update function - runs max once per 16ms (~60fps)
  const updateBars = throttle(() => {
    const { top, max } = getScroll();
    const pct = max > 0 ? Math.min(top / max, 1) : 0;

    if (leftBarRef.current)  gsap.set(leftBarRef.current,  { scaleY: pct, transformOrigin: 'top center' });
    if (rightBarRef.current) gsap.set(rightBarRef.current, { scaleY: pct, transformOrigin: 'top center' });
    if (leftPctRef.current)  leftPctRef.current.textContent  = String(Math.round(pct * 100)).padStart(3, '0') + '%';
    if (rightPctRef.current) rightPctRef.current.textContent = String(Math.round(top)).padStart(5, '0') + 'px';
  }, 16);

  return updateBars;
}

export function registerScrollListeners(handler: () => void): () => void {
  window.addEventListener('scroll', handler, { passive: true });
  return () => window.removeEventListener('scroll', handler);
}