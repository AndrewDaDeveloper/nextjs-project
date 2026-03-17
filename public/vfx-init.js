window.initEnterVFX = async function (canvasEl, shader) {
  try {
    await new Promise((resolve, reject) => {
      if (document.querySelector('link[href*="Orbitron"]')) { resolve(); return; }
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Orbitron:wght@900&display=swap';
      link.onload = resolve;
      link.onerror = reject;
      document.head.appendChild(link);
    });

    await document.fonts.load('900 1em Orbitron');

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = canvasEl.clientWidth;
    const H = canvasEl.clientHeight;
    canvasEl.width  = W * dpr;
    canvasEl.height = H * dpr;

    const ctx = canvasEl.getContext('2d', { alpha: false });
    ctx.scale(dpr, dpr);

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, W, H);

    const fontSize = Math.min(W * 0.18, 240);
    ctx.font = `900 ${fontSize}px "Orbitron", sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SSM', W / 2, H / 2);

    const mod = await import('https://esm.sh/@vfx-js/core@0.8.0');
    const VFX = mod.VFX;
    if (!VFX) return null;

    const vfx = new VFX({ pixelRatio: Math.min(dpr, 1.5) });
    vfx.add(canvasEl, { shader, overflow: 300 });

    requestAnimationFrame(() => {
      const canvases = [...document.body.querySelectorAll('canvas')];
      const vfxCanvas = canvases[canvases.length - 1];
      if (vfxCanvas && vfxCanvas !== canvasEl) {
        vfxCanvas.style.zIndex = '10002';
        vfxCanvas.style.pointerEvents = 'none';
      }
    });

    return vfx;
  } catch (err) {
    console.error('[VFX]', err.message);
    return null;
  }
};