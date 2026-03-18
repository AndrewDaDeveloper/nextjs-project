'use client';
import { useEffect, useRef, useState } from 'react';
import { runPixels } from '@/lib/utils/pixelCanvas';

const CIPHER_CHARS = '0123456789ABCDEF!@#$%^&*<>?/';
const BAR_WIDTH    = 24;

interface EncryptedLoaderProps {
  progress: number;
  onDone?: () => void;
}

export default function EncryptedLoader({ progress, onDone }: EncryptedLoaderProps) {
  const [cipherLine, setCipherLine] = useState('');
  const [dotCount,   setDotCount]   = useState(0);
  const [pixelMode,  setPixelMode]  = useState<'reveal' | 'cover' | null>('reveal');

  const frameRef   = useRef(0);
  const rafRef     = useRef(0);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const cancelRef  = useRef<(() => void) | null>(null);
  const coveredRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || pixelMode === null) return;
    cancelRef.current?.();
    cancelRef.current = runPixels(canvas, pixelMode, () => {
      cancelRef.current = null;
      if (pixelMode === 'cover') onDone?.();
      setPixelMode(null);
    });
    return () => { cancelRef.current?.(); cancelRef.current = null; };
  }, [pixelMode, onDone]);

  useEffect(() => {
    if (progress >= 1 && !coveredRef.current) {
      coveredRef.current = true;
      cancelRef.current?.();
      cancelRef.current = null;
      setTimeout(() => setPixelMode('cover'), 320);
    }
  }, [progress]);

  useEffect(() => {
    const tick = () => {
      frameRef.current += 1;
      if (frameRef.current % 2 === 0) {
        const revealed = Math.floor(progress * BAR_WIDTH);
        let line = '';
        for (let i = 0; i < BAR_WIDTH; i++)
          line += i < revealed
            ? '█'
            : CIPHER_CHARS[Math.floor(Math.random() * CIPHER_CHARS.length)];
        setCipherLine(line);
      }
      if (frameRef.current % 14 === 0) setDotCount(d => (d + 1) % 4);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [progress]);

  const pct  = Math.floor(progress * 100);
  const dots = '.'.repeat(dotCount).padEnd(3, '\u00a0');

  return (
    <div style={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18,
        fontFamily: 'Courier New, monospace', userSelect: 'none',
        padding: '32px 40px',
      }}>
        <div style={{ fontSize: 9, letterSpacing: 7, color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase' }}>
          ENCRYPTED·ACCESS
        </div>

        <div style={{ fontSize: 14, letterSpacing: 3, color: 'rgba(255,255,255,0.65)', minWidth: `${BAR_WIDTH}ch`, textAlign: 'center' }}>
          {cipherLine}
        </div>

        <div style={{ fontSize: 13, letterSpacing: 1, lineHeight: 1 }}>
          <span style={{ color: 'rgba(255,255,255,0.3)' }}>[</span>
          <span style={{ display: 'inline-block', width: `${BAR_WIDTH}ch`, position: 'relative', overflow: 'hidden', verticalAlign: 'top' }}>
            <span style={{ color: 'rgba(255,255,255,0.12)' }}>{'░'.repeat(BAR_WIDTH)}</span>
            <span style={{
              position: 'absolute', left: 0, top: 0,
              width: `${progress * 100}%`,
              overflow: 'hidden', whiteSpace: 'nowrap',
              color: 'rgba(255,255,255,0.85)',
              transition: 'width 0.35s cubic-bezier(0.4,0,0.2,1)',
            }}>
              {'▓'.repeat(BAR_WIDTH)}
            </span>
          </span>
          <span style={{ color: 'rgba(255,255,255,0.3)' }}>]</span>
        </div>

        <div style={{ display: 'flex', gap: 16, fontSize: 10, letterSpacing: 4, color: 'rgba(255,255,255,0.3)' }}>
          <span>DECRYPTING{dots}</span>
          <span style={{
            color: pct === 100 ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.6)',
            transition: 'color 0.5s ease',
          }}>
            {String(pct).padStart(3, '0')}%
          </span>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          display: pixelMode !== null ? 'block' : 'none',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}