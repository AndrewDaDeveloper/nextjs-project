const PIXEL_BS     = 6;
const PIXEL_FRAMES = 22;

export function shuffled(n: number): number[] {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function runPixels(
  canvas: HTMLCanvasElement,
  mode: 'reveal' | 'cover',
  onDone: () => void
): () => void {
  const W = canvas.offsetWidth;
  const H = canvas.offsetHeight;
  canvas.width  = W;
  canvas.height = H;
  const ctx   = canvas.getContext('2d')!;
  const cols  = Math.ceil(W / PIXEL_BS);
  const rows  = Math.ceil(H / PIXEL_BS);
  const total = cols * rows;
  const order = shuffled(total);
  const per   = Math.max(1, Math.ceil(total / PIXEL_FRAMES));

  if (mode === 'reveal') {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
  }

  let idx = 0;
  let raf = 0;

  const step = () => {
    if (mode === 'reveal') {
      for (let k = 0; k < per && idx < total; k++, idx++)
        ctx.clearRect(
          (order[idx] % cols) * PIXEL_BS,
          Math.floor(order[idx] / cols) * PIXEL_BS,
          PIXEL_BS, PIXEL_BS
        );
    } else {
      ctx.fillStyle = '#000';
      for (let k = 0; k < per && idx < total; k++, idx++)
        ctx.fillRect(
          (order[idx] % cols) * PIXEL_BS,
          Math.floor(order[idx] / cols) * PIXEL_BS,
          PIXEL_BS, PIXEL_BS
        );
    }
    if (idx < total) raf = requestAnimationFrame(step);
    else onDone();
  };

  raf = requestAnimationFrame(step);
  return () => cancelAnimationFrame(raf);
}