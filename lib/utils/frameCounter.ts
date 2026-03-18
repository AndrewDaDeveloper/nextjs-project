export function startFrameCounter(el: HTMLSpanElement): () => void {
  let raf = 0;
  let last = 0;

  const tick = (now: number) => {
    raf = requestAnimationFrame(tick);
    if (now - last < 66) return;
    last = now;
    const t = Date.now();
    el.textContent =
      String(Math.floor((t / 13)  % 100_000)).padStart(5, '0') +
      ' · ' +
      String(Math.floor((t / 71)  % 999)).padStart(3, '0');
  };

  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}