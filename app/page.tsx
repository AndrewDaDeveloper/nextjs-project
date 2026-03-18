'use client';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './global.css';
import { initBootScreen } from '../lib/interface/bootScreen';
import { initVFX } from '../lib/vfxShaders/initVFX';
import { buildHUD } from '../lib/interface/hud';
import { startFrameCounter } from '../lib/utils/frameCounter';
import { createScrollUpdater, registerScrollListeners } from '../lib/utils/scrollbar';
import ArchiveModal from './components/ArchiveModal/ArchiveModal';
import UIModal from '@/app/components/UIModal';

gsap.registerPlugin(ScrollTrigger);

function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return gl instanceof WebGLRenderingContext;
  } catch {
    return false;
  }
}

function showWebGLError(): void {
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;inset:0;background:#000;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:monospace;z-index:999999;padding:20px;text-align:center;';
  el.innerHTML = '<h1 style="color:#ff4444;margin-bottom:20px;">WebGL Not Available</h1><p style="max-width:500px;line-height:1.6;">Your browser does not support WebGL. Please enable hardware acceleration or try a different browser.</p>';
  document.body.appendChild(el);
}

const TICKS = ['t-c','t-l','t-r','b-c','b-l','b-r','l-c','l-t','l-b','r-c','r-t','r-b'] as const;
const CORNER_POSITIONS = ['tl','tr','bl','br'] as const;
const SIDE_BAR_SIDES = ['left','right'] as const;

function useHUDRefs() {
  const counterRef   = useRef<HTMLSpanElement>(null);
  const leftBarRef   = useRef<HTMLDivElement>(null);
  const rightBarRef  = useRef<HTMLDivElement>(null);
  const leftPctRef   = useRef<HTMLSpanElement>(null);
  const rightPctRef  = useRef<HTMLSpanElement>(null);
  const borderRef    = useRef<HTMLDivElement>(null);
  const hudTLRef     = useRef<HTMLDivElement>(null);
  const hudBLRef     = useRef<HTMLDivElement>(null);
  const hudBRRef     = useRef<HTMLDivElement>(null);
  const frameRef     = useRef<HTMLDivElement>(null);
  const tickerRef    = useRef<HTMLDivElement>(null);
  const statusRef    = useRef<HTMLDivElement>(null);
  const leftWrapRef  = useRef<HTMLDivElement>(null);
  const rightWrapRef = useRef<HTMLDivElement>(null);
  const cTL = useRef<HTMLDivElement>(null);
  const cTR = useRef<HTMLDivElement>(null);
  const cBL = useRef<HTMLDivElement>(null);
  const cBR = useRef<HTMLDivElement>(null);

  return {
    counterRef, leftBarRef, rightBarRef, leftPctRef, rightPctRef,
    borderRef, hudTLRef, hudBLRef, hudBRRef, frameRef,
    tickerRef, statusRef, leftWrapRef, rightWrapRef,
    cTL, cTR, cBL, cBR,
  };
}

function useVFX() {
  useEffect(() => {
    if (!isWebGLAvailable()) {
      showWebGLError();
      return;
    }
    const vfx = initVFX();
    return () => vfx.destroy();
  }, []);
}

function useHUD(refs: ReturnType<typeof useHUDRefs>) {
  useEffect(() => {
    const stopCounter = refs.counterRef.current
      ? startFrameCounter(refs.counterRef.current)
      : () => {};

    const updateBars = createScrollUpdater({
      leftBarRef:  refs.leftBarRef  as React.RefObject<HTMLDivElement>,
      rightBarRef: refs.rightBarRef as React.RefObject<HTMLDivElement>,
      leftPctRef:  refs.leftPctRef  as React.RefObject<HTMLSpanElement>,
      rightPctRef: refs.rightPctRef as React.RefObject<HTMLSpanElement>,
    });
    gsap.ticker.add(updateBars);
    const unregisterScroll = registerScrollListeners(updateBars);

    let fired = false;
    const fireHUD = () => {
      if (fired) return;
      fired = true;
      buildHUD({
        borderRef:    refs.borderRef    as React.RefObject<HTMLDivElement>,
        hudTLRef:     refs.hudTLRef     as React.RefObject<HTMLDivElement>,
        hudBLRef:     refs.hudBLRef     as React.RefObject<HTMLDivElement>,
        hudBRRef:     refs.hudBRRef     as React.RefObject<HTMLDivElement>,
        frameRef:     refs.frameRef     as React.RefObject<HTMLDivElement>,
        tickerRef:    refs.tickerRef    as React.RefObject<HTMLDivElement>,
        leftWrapRef:  refs.leftWrapRef  as React.RefObject<HTMLDivElement>,
        rightWrapRef: refs.rightWrapRef as React.RefObject<HTMLDivElement>,
        statusRef:    refs.statusRef    as React.RefObject<HTMLDivElement>,
        cTL: refs.cTL as React.RefObject<HTMLDivElement>,
        cTR: refs.cTR as React.RefObject<HTMLDivElement>,
        cBL: refs.cBL as React.RefObject<HTMLDivElement>,
        cBR: refs.cBR as React.RefObject<HTMLDivElement>,
      });
    };

    const bootEl = document.getElementById('boot-screen');
    const poll = setInterval(() => {
      if (!bootEl || parseFloat(getComputedStyle(bootEl).opacity) < 0.05) {
        clearInterval(poll);
        fireHUD();
      }
    }, 150);
    const fallback = setTimeout(() => { clearInterval(poll); fireHUD(); }, 5000);

    return () => {
      stopCounter();
      gsap.ticker.remove(updateBars);
      unregisterScroll();
      clearInterval(poll);
      clearTimeout(fallback);
    };
  }, []);
}

function useModalEvents(setUiModalOpen: (v: boolean) => void) {
  useEffect(() => {
    const onOpen  = () => setUiModalOpen(true);
    const onClose = () => setUiModalOpen(false);
    window.addEventListener('open-ui-modal',  onOpen);
    window.addEventListener('close-ui-modal', onClose);
    return () => {
      window.removeEventListener('open-ui-modal',  onOpen);
      window.removeEventListener('close-ui-modal', onClose);
    };
  }, [setUiModalOpen]);
}

function useArchiveGSAP(archiveOpen: boolean) {
  useEffect(() => {
    if (archiveOpen) {
      gsap.globalTimeline.pause();
      ScrollTrigger.getAll().forEach(t => t.disable());
    } else {
      gsap.globalTimeline.resume();
      ScrollTrigger.getAll().forEach(t => t.enable());
    }
  }, [archiveOpen]);
}

function useBootScreen() {
  useEffect(() => {
    initBootScreen();
  }, []);
}

export default function Home() {
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [uiModalOpen, setUiModalOpen] = useState(false);
  const refs = useHUDRefs();

  useBootScreen();
  useVFX();
  useHUD(refs);
  useModalEvents(setUiModalOpen);
  useArchiveGSAP(archiveOpen);

  const openArchive  = useCallback((e: React.MouseEvent) => { e.preventDefault(); setArchiveOpen(true); }, []);
  const closeArchive = useCallback(() => setArchiveOpen(false), []);

  const hudVisible = useMemo(() => !archiveOpen && !uiModalOpen, [archiveOpen, uiModalOpen]);

  const cornerRefs = useMemo(
    () => [refs.cTL, refs.cTR, refs.cBL, refs.cBR],
    [refs.cTL, refs.cTR, refs.cBL, refs.cBR],
  );

  return (
    <>
      <UIModal />
      <ArchiveModal isOpen={archiveOpen} onClose={closeArchive} />

      <div
        id="scifi-border"
        ref={refs.borderRef}
        role="region"
        aria-label="Game interface"
        aria-hidden={!hudVisible}
        style={{ opacity: 0, visibility: hudVisible ? 'visible' : 'hidden' }}
      >
        <div id="sfb-frame-top"    className="sfb-frame-line h" />
        <div id="sfb-frame-bottom" className="sfb-frame-line h bottom" />
        <div id="sfb-frame-left"   className="sfb-frame-line v" />
        <div id="sfb-frame-right"  className="sfb-frame-line v right" />
        <div id="sfb-inner-frame"  style={{ opacity: 0 }} />

        {CORNER_POSITIONS.map((pos, i) => (
          <div key={pos} className={`sfb-corner ${pos}`} ref={cornerRefs[i]} style={{ opacity: 0 }}>
            <div className="sfb-cl sfb-cl-h" />
            <div className="sfb-cl sfb-cl-v" />
          </div>
        ))}

        {TICKS.map(t => <div key={t} className={`sfb-tick ${t}`} style={{ opacity: 0 }} />)}
        <span className="sfb-tick-num t" style={{ opacity: 0 }}>X:0.500</span>
        <span className="sfb-tick-num b" style={{ opacity: 0 }}>X:0.500</span>
        <span className="sfb-tick-num l" style={{ opacity: 0 }}>Y:0.500</span>
        <span className="sfb-tick-num r" style={{ opacity: 0 }}>Y:0.500</span>

        <div className="sfb-hud tl sfb-flicker"   ref={refs.hudTLRef}  style={{ opacity: 0 }} />
        <div className="sfb-counter sfb-flicker-2" ref={refs.frameRef}  style={{ opacity: 0 }}>
          <span ref={refs.counterRef}>00000 · 000</span><br />FRAME·REF
        </div>
        <div className="sfb-hud bl sfb-flicker"   ref={refs.hudBLRef}  style={{ opacity: 0 }} />
        <div className="sfb-hud br sfb-flicker-2" ref={refs.hudBRRef}  style={{ opacity: 0 }} />

        <div className="sfb-ticker" ref={refs.tickerRef} style={{ opacity: 0 }}>
          <span className="sfb-ticker-inner">
            PROTOCOL·ACTIVE &nbsp;··&nbsp; UPLINK·ESTABLISHED &nbsp;··&nbsp; SCANNING·ENVIRONMENT
            &nbsp;··&nbsp; DATA·INTEGRITY·99.7% &nbsp;··&nbsp; CITY·17·SECTOR·DELTA
            &nbsp;··&nbsp; RESISTANCE·ACTIVE &nbsp;··&nbsp;
          </span>
        </div>

        {SIDE_BAR_SIDES.map(side => {
          const isLeft  = side === 'left';
          const wrapRef = isLeft ? refs.leftWrapRef  : refs.rightWrapRef;
          const barRef  = isLeft ? refs.leftBarRef   : refs.rightBarRef;
          const pctRef  = isLeft ? refs.leftPctRef   : refs.rightPctRef;
          return (
            <div key={side} className={`sfb-side-bar ${side}`} ref={wrapRef} style={{ opacity: 0 }}>
              <span className="sfb-side-label">{isLeft ? 'SCRL' : 'DPTH'}</span>
              <div className="sfb-side-track">
                <div className="sfb-side-fill" ref={barRef} />
                {['25%','50%','75%'].map(top => (
                  <div key={top} className="sfb-side-tick" style={{ top }} />
                ))}
              </div>
              <span className="sfb-side-label" ref={pctRef}>{isLeft ? '000%' : '00000px'}</span>
            </div>
          );
        })}

        <div className="sfb-status" ref={refs.statusRef}>
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="sfb-status-dot" style={{ opacity: 0 }} />
          ))}
        </div>
      </div>

      <div id="boot-screen" aria-hidden="true"><div id="boot-lines" /></div>

      <a
        href="#nav-overlay"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-black"
      >
        Skip to content
      </a>

      <nav
        id="nav-overlay"
        style={{ visibility: hudVisible ? 'visible' : 'hidden' }}
        aria-label="Main navigation"
      >
        <a
          href="#"
          className="nav-btn"
          onClick={openArchive}
          aria-label="Enter Archive"
          tabIndex={hudVisible ? 0 : -1}
        >
          [ ENTER ]
        </a>
      </nav>
    </>
  );
}