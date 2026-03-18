'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import EncryptedLoader from './EncryptedLoader';
import { useVFX } from './hooks/useVFX';
import { getShader, isMobile, SAMPLES_MOBILE, SAMPLES_DESKTOP } from '@/lib/vfxShaders/shader';

type Phase = 'idle' | 'loading' | 'active' | 'leaving';

interface ArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  discordInvite?: string;
}

const DiscordIcon = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 8 }}>
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

function ArchiveButton({ onClick, children }: { onClick: (e: React.MouseEvent<HTMLButtonElement>) => void; children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);

  const style: React.CSSProperties = {
    background:    'transparent',
    border:        `1px solid ${hovered ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.3)'}`,
    color:         hovered ? '#fff' : 'rgba(255,255,255,0.7)',
    boxShadow:     hovered ? '0 0 18px rgba(255,255,255,0.15)' : 'none',
    fontFamily:    "'Courier New',monospace",
    letterSpacing: '0.2em',
    fontSize:      12,
    padding:       '12px 36px',
    cursor:        'pointer',
    transition:    'border-color 0.2s,color 0.2s,box-shadow 0.2s',
    whiteSpace:    'nowrap',
  };

  return (
    <button
      style={style}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </button>
  );
}

export default function ArchiveModal({
  isOpen,
  onClose,
  discordInvite = 'https://discord.gg/Bn7V253dGp',
}: ArchiveModalProps) {
  const [phase,    setPhase]    = useState<Phase>('idle');
  const [progress, setProgress] = useState(0);
  const [mounted,  setMounted]  = useState(false);

  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef    = useRef(false);
  const shaderRef   = useRef<string | null>(null);

  useEffect(() => { setMounted(true); }, []);

  const clearTimers = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    if (timeoutRef.current)  { clearTimeout(timeoutRef.current);   timeoutRef.current  = null; }
  }, []);

  const { destroyVFX, handleLoaderDone } = useVFX({ abortRef, shaderRef, canvasRef, setPhase });

  useEffect(() => {
    if (!isOpen) return;

    abortRef.current  = false;
    shaderRef.current = getShader(isMobile() ? SAMPLES_MOBILE : SAMPLES_DESKTOP);

    setPhase('loading');
    setProgress(0);
    let prog = 0;

    intervalRef.current = setInterval(() => {
      prog += Math.random() * 0.035 + 0.012;
      if (prog >= 1) {
        prog = 1;
        setProgress(1);
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
      } else {
        setProgress(prog);
      }
    }, 30);

    return () => {
      abortRef.current = true;
      clearTimers();
      destroyVFX();
      setPhase('idle');
      setProgress(0);
    };
  }, [isOpen, clearTimers, destroyVFX]);

  const handleClose = useCallback(() => {
    if (phase !== 'active') return;
    setPhase('leaving');
    destroyVFX();
    timeoutRef.current = setTimeout(() => {
      onClose();
      setPhase('idle');
      setProgress(0);
    }, 600);
  }, [phase, destroyVFX, onClose]);

  if (!isOpen && phase === 'idle') return null;

  const buttons = mounted ? createPortal(
    <div style={{
      position: 'fixed', bottom: 48, left: '50%', transform: 'translateX(-50%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
      zIndex: 2147483647,
      pointerEvents: phase === 'active' ? 'auto' : 'none',
      opacity:       phase === 'active' ? 1 : 0,
      transition:    'opacity 0.45s 0.1s ease',
    }}>
      <ArchiveButton onClick={e => { e.stopPropagation(); window.open(discordInvite, '_blank'); }}>
        <DiscordIcon />JOIN US
      </ArchiveButton>
      <ArchiveButton onClick={e => { e.stopPropagation(); handleClose(); }}>
        [ BACK ]
      </ArchiveButton>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <style>{`@keyframes am-fadeIn{from{opacity:0}to{opacity:1}}`}</style>

      <div style={{
        position: 'fixed', inset: 0, zIndex: 10000, backgroundColor: '#000',
        opacity:    phase === 'leaving' ? 0 : 1,
        transform:  phase === 'leaving' ? 'scale(1.04)' : 'scale(1)',
        transition: 'opacity 0.55s cubic-bezier(0.4,0,0.2,1),transform 0.55s cubic-bezier(0.4,0,0.2,1)',
      }}>
        <div aria-hidden style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.15) 2px,rgba(0,0,0,0.15) 4px)',
          pointerEvents: 'none', zIndex: 1,
        }} />

        {phase === 'loading' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
            <EncryptedLoader progress={progress} onDone={handleLoaderDone} />
          </div>
        )}

        {phase === 'active' && (
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              display: 'block', zIndex: 10001,
              animation: 'am-fadeIn 0.5s ease forwards',
            }}
          />
        )}
      </div>

      {buttons}
    </>
  );
}