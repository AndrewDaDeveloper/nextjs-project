'use client';
import { useRef, useCallback } from 'react';
import { loadVFXScript } from '@/lib/utils/loadVFXScript';

type Phase = 'idle' | 'loading' | 'active' | 'leaving';

interface UseVFXOptions {
  abortRef:    React.MutableRefObject<boolean>;
  shaderRef:   React.MutableRefObject<string | null>;
  canvasRef:   React.RefObject<HTMLCanvasElement | null>;
  setPhase:    (p: Phase) => void;
}

export function useVFX({ abortRef, shaderRef, canvasRef, setPhase }: UseVFXOptions) {
  const vfxRef        = useRef<any>(null);
  const vfxBodyCanvas = useRef<HTMLCanvasElement | null>(null);

  const destroyVFX = useCallback(() => {
    if (vfxRef.current)        { try { vfxRef.current.destroy();       } catch {} vfxRef.current       = null; }
    if (vfxBodyCanvas.current) { try { vfxBodyCanvas.current.remove(); } catch {} vfxBodyCanvas.current = null; }
  }, []);

  const handleLoaderDone = useCallback(async () => {
    if (abortRef.current) return;
    setPhase('active');
    try {
      await loadVFXScript();
      await new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r())));
      if (abortRef.current) return;
      const el = canvasRef.current;
      if (!el) return;
      const vfx = await (window as any).initEnterVFX(el, shaderRef.current);
      if (abortRef.current) { try { vfx?.destroy(); } catch {} return; }
      if (!vfx) return;
      vfxRef.current = vfx;
      await new Promise<void>(r => setTimeout(r, 100));
      if (abortRef.current) { destroyVFX(); return; }
      const all = [...document.body.querySelectorAll('canvas')] as HTMLCanvasElement[];
      vfxBodyCanvas.current = all[all.length - 1] ?? null;
      if (vfxBodyCanvas.current) {
        vfxBodyCanvas.current.style.zIndex       = '10002';
        vfxBodyCanvas.current.style.pointerEvents = 'none';
      }
    } catch (err: any) {
      console.error('[ArchiveModal VFX]', err.message);
    }
  }, [abortRef, shaderRef, canvasRef, setPhase, destroyVFX]);

  return { destroyVFX, handleLoaderDone };
}