let vfxScriptPromise: Promise<void> | null = null;

export function loadVFXScript(): Promise<void> {
  if (vfxScriptPromise) return vfxScriptPromise;
  vfxScriptPromise = new Promise<void>((resolve, reject) => {
    if ((window as any).initEnterVFX) { resolve(); return; }
    const s = document.createElement('script');
    s.src = '/vfx-init.js';
    s.type = 'module';
    s.onload = () => resolve();
    s.onerror = () => {
      vfxScriptPromise = null;
      reject(new Error('Cannot load /vfx-init.js'));
    };
    document.head.appendChild(s);
  });
  return vfxScriptPromise;
}