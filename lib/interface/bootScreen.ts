const BOOT_TOTAL_MS   = 3200;
const BOOT_FADE_MS    = 1200;
const BOOT_NAV_DELAY  = 800;
const COUNTER_TICK_MS = 60;

export function initBootScreen() {
  const bootScreen = document.getElementById('boot-screen');
  if (!bootScreen) return;

  bootScreen.innerHTML = `
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
      if (val >= 100 && iv) {
        clearInterval(iv);
        iv = null;
      }
    }, COUNTER_TICK_MS);
  }

  const fadeTimer = setTimeout(() => {
    if (iv) { clearInterval(iv); iv = null; }
    bootScreen.style.transition = `opacity ${BOOT_FADE_MS}ms ease`;
    bootScreen.style.opacity = '0';

    const hideTimer = setTimeout(() => {
      bootScreen.style.display = 'none';
    }, BOOT_FADE_MS);

    const nav = document.getElementById('nav-overlay');
    const navTimer = setTimeout(() => {
      nav?.classList.add('visible');
    }, BOOT_NAV_DELAY);

    bootScreen.dataset.hideTimer = String(hideTimer);
    bootScreen.dataset.navTimer  = String(navTimer);
  }, BOOT_TOTAL_MS);

  bootScreen.dataset.fadeTimer = String(fadeTimer);
}

export function destroyBootScreen() {
  const bootScreen = document.getElementById('boot-screen');
  if (!bootScreen) return;
  clearTimeout(Number(bootScreen.dataset.fadeTimer));
  clearTimeout(Number(bootScreen.dataset.hideTimer));
  clearTimeout(Number(bootScreen.dataset.navTimer));
}