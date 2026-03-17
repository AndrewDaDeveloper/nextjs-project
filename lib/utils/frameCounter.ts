/**
 * Drives the top-center frame-reference counter.
 * Returns a cancel function.
 */
export function startFrameCounter(el: HTMLSpanElement): () => void {
  let raf = 0;

  const tick = () => {
    const t = Date.now();
    el.textContent =
      String(Math.floor((t / 13)  % 100_000)).padStart(5, '0') +
      ' · ' +
      String(Math.floor((t / 71)  % 999)).padStart(3, '0');
    raf = requestAnimationFrame(tick);
  };

  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}