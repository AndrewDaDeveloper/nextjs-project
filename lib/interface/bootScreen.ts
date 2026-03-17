export function initBootScreen() {
  const bootScreen = document.getElementById('boot-screen');
  if (!bootScreen) return;

  bootScreen.innerHTML = `
    <style>
      #boot-screen {
        background: #000;
        overflow: hidden;
      }

      #boot-line {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -60%);
        width: 1px;
        height: 0;
        background: linear-gradient(to bottom, transparent, #fff 20%, #fff 80%, transparent);
        box-shadow: 0 0 6px 1px rgba(255,255,255,0.6);
        animation: boot-grow 1.4s cubic-bezier(0.76, 0, 0.24, 1) forwards;
      }

      #boot-h-line {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -60%);
        width: 0;
        height: 1px;
        background: linear-gradient(to right, transparent, rgba(255,255,255,0.5) 20%, rgba(255,255,255,0.5) 80%, transparent);
        opacity: 0;
        animation: boot-h-grow 0.5s ease forwards;
        animation-delay: 1.1s;
      }

      #boot-corners {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -60%);
        width: 0;
        height: 0;
        opacity: 0;
        animation: corners-appear 0.4s ease forwards;
        animation-delay: 1.05s;
      }

      #boot-corners::before,
      #boot-corners::after {
        content: '';
        position: absolute;
        width: 8px;
        height: 8px;
      }

      #boot-corners::before {
        top: 0;
        left: -40px;
        border-top: 1px solid rgba(255,255,255,0.5);
        border-left: 1px solid rgba(255,255,255,0.5);
      }

      #boot-corners::after {
        top: 0;
        right: -40px;
        border-top: 1px solid rgba(255,255,255,0.5);
        border-right: 1px solid rgba(255,255,255,0.5);
      }

      #boot-dots {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -60%);
        display: flex;
        gap: 6px;
        opacity: 0;
        animation: boot-text-fade 0.6s ease forwards;
        animation-delay: 1.5s;
      }

      .boot-dot {
        width: 3px;
        height: 3px;
        border-radius: 50%;
        background: rgba(255,255,255,0.4);
        animation: dot-pulse 1s ease-in-out infinite;
      }

      .boot-dot:nth-child(2) { animation-delay: 0.2s; }
      .boot-dot:nth-child(3) { animation-delay: 0.4s; }

      #boot-text {
        position: fixed;
        top: calc(50% + 48px);
        left: 50%;
        transform: translateX(-50%);
        font-family: monospace;
        font-size: 11px;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        color: rgba(255,255,255,0.5);
        opacity: 0;
        white-space: nowrap;
        animation: boot-text-fade 0.8s ease forwards;
        animation-delay: 1.8s;
      }

      #boot-counter {
        position: fixed;
        bottom: 32px;
        right: 32px;
        font-family: monospace;
        font-size: 10px;
        letter-spacing: 0.15em;
        color: rgba(255,255,255,0.2);
        opacity: 0;
        animation: boot-text-fade 0.5s ease forwards;
        animation-delay: 0.3s;
      }

      @keyframes boot-grow {
        0%   { height: 0; opacity: 1; }
        60%  { height: 60vh; opacity: 1; }
        85%  { height: 60vh; opacity: 1; }
        100% { height: 2px; opacity: 1; }
      }

      @keyframes boot-h-grow {
        0%   { width: 0; opacity: 0.6; }
        100% { width: 80px; opacity: 0.6; }
      }

      @keyframes corners-appear {
        from { opacity: 0; }
        to   { opacity: 1; }
      }

      @keyframes boot-text-fade {
        from { opacity: 0; transform: translateX(-50%) translateY(6px); }
        to   { opacity: 1; transform: translateX(-50%) translateY(0); }
      }

      @keyframes dot-pulse {
        0%, 100% { opacity: 0.2; transform: scaleY(1); }
        50%       { opacity: 1;   transform: scaleY(1.6); }
      }
    </style>

    <div id="boot-line"></div>
    <div id="boot-h-line"></div>
    <div id="boot-corners"></div>
    <div id="boot-dots">
      <div class="boot-dot"></div>
      <div class="boot-dot"></div>
      <div class="boot-dot"></div>
    </div>
    <div id="boot-text">Click image for more info</div>
    <div id="boot-counter">SYS_INIT</div>
  `;

  const counter = document.getElementById('boot-counter');
  if (counter) {
    let val = 0;
    const iv = setInterval(() => {
      val = Math.min(val + Math.floor(Math.random() * 18) + 4, 100);
      counter.textContent = `${String(val).padStart(3, '0')}%`;
      if (val >= 100) clearInterval(iv);
    }, 60);
  }

  setTimeout(() => {
    bootScreen.style.transition = 'opacity 1.2s ease';
    bootScreen.style.opacity = '0';
    setTimeout(() => {
      bootScreen.style.display = 'none';
    }, 1200);
    const nav = document.getElementById('nav-overlay');
    if (nav) setTimeout(() => nav.classList.add('visible'), 800);
  }, 3200);
}