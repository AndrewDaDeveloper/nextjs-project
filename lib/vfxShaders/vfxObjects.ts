import * as THREE from 'three';
import { GalleryShader, CenterImageShader } from './postFX';

const IMG_PATHS = [
  '/illustrations/img1.png',
  '/illustrations/img2.png',
  '/illustrations/img3.png',
  '/illustrations/img4.png',
];
const N    = IMG_PATHS.length;
const POOL = N * 3;
const CAM_H = 2.2;
export const CAM_PAD = 1.4;

const isSmall       = () => window.innerWidth < 480;
const isMobile      = () => window.innerWidth < 768;
export const camHalfW      = () => CAM_H * (window.innerWidth / window.innerHeight);
const itemW         = () => isSmall() ? 1.3 : isMobile() ? 1.5 : 1.8;
const itemH         = () => isSmall() ? 0.9 : isMobile() ? 1.05 : 1.25;
const galStep       = () => itemW() + (isSmall() ? 0.15 : 0.2);
export const galStrip      = () => galStep() * N;
const textY         = () => isSmall() ? -0.9 : window.innerHeight > window.innerWidth ? -1.1 : -1.3;
const scrollRange   = () => window.innerHeight > window.innerWidth ? 2.5 : 3.0;
const uiOffsetY     = () => isSmall() ? 1.7 : isMobile() ? 1.5 : 1.4;
const galLabelW     = () => isSmall() ? 2.0 : isMobile() ? 2.4 : 2.8;
const centerImgSize = () => isSmall() ? 1.4 : isMobile() ? 1.7 : 2.1;

export { scrollRange };

function makeTex(w: number, h: number, fn: (ctx: CanvasRenderingContext2D, w: number, h: number) => void) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  fn(c.getContext('2d')!, w, h);
  const t = new THREE.CanvasTexture(c);
  t.minFilter = t.magFilter = THREE.LinearFilter;
  return t;
}

function clearArr(arr: THREE.Mesh[]) {
  arr.forEach(m => {
    if (m.parent) m.parent.remove(m);
    m.geometry.dispose();
    if ((m.material as any).map) (m.material as any).map.dispose();
    (m.material as THREE.Material).dispose();
  });
  arr.length = 0;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export interface GalleryState {
  group: THREE.Group | null;
  meshes: THREE.Mesh[];
  offset: number;
  drag: { on: boolean; sx: number; so: number; vx: number; lx: number; lt: number };
  imgTex: THREE.Texture[];
  _labelTex: THREE.Texture | null;
}

export function createGalleryState(): GalleryState {
  return {
    group: null,
    meshes: [],
    offset: 0,
    drag: { on: false, sx: 0, so: 0, vx: 0, lx: 0, lt: 0 },
    imgTex: [],
    _labelTex: null,
  };
}

export function buildGallery(scene: THREE.Scene, state: GalleryState) {
  if (state.group) {
    clearArr(state.meshes);
    if (state._labelTex) {
      state._labelTex.dispose();
      state._labelTex = null;
    }
    scene.remove(state.group);
    state.group = null;
  }
  state.group = new THREE.Group();
  scene.add(state.group);
  state.group.position.set(0, textY() - uiOffsetY(), 0.1);

  const hw = camHalfW();
  const wf = (hw + CAM_PAD) / hw;

  const lFontSize = isSmall() ? 26 : 34;
  const ltex = makeTex(512, 64, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${lFontSize}px "Courier New",monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(255,255,255,0.8)';
    ctx.shadowBlur = 14;
    ctx.fillText('OUR MISSIONS', w / 2, h / 2);
  });
  state._labelTex = ltex;

  const iw = itemW() * wf, ih = itemH();
  const lm = new THREE.Mesh(
    new THREE.PlaneGeometry(galLabelW() * wf, 0.32),
    new THREE.MeshBasicMaterial({ map: ltex, transparent: true, depthWrite: false, opacity: 1.0 }),
  );
  lm.position.set(0, ih / 2 + 0.24, 0);
  state.group.add(lm);
  state.meshes.push(lm);

  const loader = new THREE.TextureLoader();

  for (let i = 0; i < POOL; i++) {
    const idx = i % N;
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: state.imgTex[idx] || null },
        time:     { value: 0 },
        seed:     { value: idx * 2.17 },
        opacity:  { value: 1 },
      },
      vertexShader:   GalleryShader.vertexShader,
      fragmentShader: GalleryShader.fragmentShader,
      transparent: true,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(iw, ih), mat);
    mesh.userData = { idx, slot: i };
    state.group.add(mesh);
    state.meshes.push(mesh);

    if (!state.imgTex[idx]) {
      loader.load(IMG_PATHS[idx], tex => {
        tex.minFilter = tex.magFilter = THREE.LinearFilter;
        state.imgTex[idx] = tex;
        state.meshes.forEach(m => {
          if (m.userData.idx === idx && (m.material as any).uniforms)
            (m.material as any).uniforms.tDiffuse.value = tex;
        });
      });
    }
  }
}

export function updateGallery(state: GalleryState, t: number) {
  if (!state.group) return;
  const hw = camHalfW();
  const wf = (hw + CAM_PAD) / hw;
  const step = galStep() * wf;
  const strip = galStrip() * wf;
  const fadeStart = hw * 0.42;
  const fadeEnd   = hw * 0.92;

  state.meshes.forEach(m => {
    if (m.userData.slot == null) return;
    let x = m.userData.slot * step - state.offset * wf;
    while (x >  strip / 2) x -= strip;
    while (x < -strip / 2) x += strip;
    m.position.x = x;
    const u = (m.material as any).uniforms;
    if (u) {
      const dist = Math.abs(x);
      u.opacity.value = 1 - smoothstep(fadeStart, fadeEnd, dist);
      u.time.value    = t;
    }
  });
}

export interface CenterImageState {
  mesh: THREE.Mesh | null;
  hover: boolean;
  evapState: 'idle' | 'evaporating' | 'done' | 'reforming';
  evapT: number;
  reformTimer: number;
}

const EVAP_SPEED   = 0.55;
const REFORM_SPEED = 0.45;
const REFORM_DELAY = 0.7;

export function createCenterImageState(): CenterImageState {
  return { mesh: null, hover: false, evapState: 'idle', evapT: 0, reformTimer: 0 };
}

export function buildCenterImage(scene: THREE.Scene, state: CenterImageState) {
  if (state.mesh) {
    const oldTex = (state.mesh.material as any).uniforms?.tDiffuse?.value as THREE.Texture | null;
    if (oldTex) oldTex.dispose();
    scene.remove(state.mesh);
    state.mesh.geometry.dispose();
    (state.mesh.material as THREE.Material).dispose();
    state.mesh = null;
  }
  const size = centerImgSize();
  const hw = camHalfW();
  const widthFix = (hw + CAM_PAD) / hw;
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      tDiffuse:  { value: null },
      time:      { value: 0 },
      hover:     { value: 0.0 },
      evaporate: { value: state.evapT },
      evapSeed:  { value: Math.random() * 100 },
    },
    vertexShader:   CenterImageShader.vertexShader,
    fragmentShader: CenterImageShader.fragmentShader,
    transparent: true,
    depthWrite: false,
  });
  state.mesh = new THREE.Mesh(new THREE.PlaneGeometry(size * widthFix, size), mat);
  state.mesh.position.set(0, 0, 0.2);
  scene.add(state.mesh);

  new THREE.TextureLoader().load('/SsPepHc3.png', tex => {
    tex.minFilter = tex.magFilter = THREE.LinearFilter;
    mat.uniforms.tDiffuse.value = tex;
  });
}

export function triggerEvaporation(state: CenterImageState) {
  if (state.evapState === 'idle' || state.evapState === 'done') {
    state.evapState = 'evaporating';
    const u = (state.mesh?.material as any)?.uniforms;
    if (u) u.evapSeed.value = Math.random() * 100;
  }
}

export function tickCenterImage(state: CenterImageState, dt: number, t: number) {
  if (!state.mesh) return;
  const u = (state.mesh.material as any).uniforms;

  if (state.evapState === 'evaporating') {
    state.evapT = Math.min(state.evapT + dt * EVAP_SPEED, 1.0);
    if (state.evapT >= 1.0) { state.evapT = 1.0; state.evapState = 'done'; state.reformTimer = 0; }
  } else if (state.evapState === 'done') {
    state.reformTimer += dt;
    if (state.reformTimer >= REFORM_DELAY) state.evapState = 'reforming';
  } else if (state.evapState === 'reforming') {
    state.evapT = Math.max(state.evapT - dt * REFORM_SPEED, 0.0);
    if (state.evapT <= 0.0) { state.evapT = 0.0; state.evapState = 'idle'; }
  }

  u.evaporate.value = state.evapT;
  u.time.value      = t;
  const targetHover = state.hover ? 1.0 : 0.0;
  u.hover.value += (targetHover - u.hover.value) * 0.08;
}