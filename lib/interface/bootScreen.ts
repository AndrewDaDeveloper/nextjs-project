export function initBootScreen() {
  const bootScreen = document.getElementById('boot-screen');
  if (!bootScreen) return;

  const bs = bootScreen as HTMLElement;

  bs.innerHTML = `
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
  let iv: ReturnType<typeof setInterval> | null = null;

  if (counter) {
    let val = 0;
    iv = setInterval(() => {
      val = Math.min(val + Math.floor(Math.random() * 18) + 4, 100);
      counter.textContent = `${String(val).padStart(3, '0')}%`;
      if (val >= 100 && iv) clearInterval(iv);
    }, 60);
  }

  function dismiss() {
    if (iv) clearInterval(iv);
    bs.style.transition = 'opacity 1.2s ease';
    bs.style.opacity = '0';
    bs.addEventListener('transitionend', () => {
      bs.style.display = 'none';
    }, { once: true });
    const nav = document.getElementById('nav-overlay');
    if (nav) setTimeout(() => nav.classList.add('visible'), 800);
  }

  if (document.readyState === 'complete') {
    window.requestAnimationFrame(() => window.requestAnimationFrame(dismiss));
  } else {
    window.addEventListener('load', () => {
      window.requestAnimationFrame(() => window.requestAnimationFrame(dismiss));
    }, { once: true });
  }
}