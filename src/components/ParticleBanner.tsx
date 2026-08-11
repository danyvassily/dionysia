import { useEffect, useRef, useCallback, useState } from 'react';
import type * as THREE from 'three';

// ─── CONFIG ────────────────────────────────────────────────────────────────
export interface ParticleBannerConfig {
  imageSrc: string;
  gap: number;
  particleScale: number;
  mouseRadius: number;
  repulsion: number;
  swirl: number;
  windDrift: number;
  windShare: number;
  scrollWind: number;
  scrollSensitivity: number;
  attack: number;
  release: number;
  hoverIntensity: number;
  idleDrift: number;
  fitMode: 'cover' | 'contain';
  maxPixelRatio: number;
  /** Cap studio : au-delà, on augmente gap automatiquement */
  maxPoints: number;
}

const DEFAULT_CONFIG: ParticleBannerConfig = {
  imageSrc: '/images/image_header.jpg',
  gap: 6, // C6: 6 par défaut (4 était 150k+ points)
  particleScale: 0.72,
  mouseRadius: 110,
  repulsion: 40,
  swirl: 14,
  windDrift: 220,
  windShare: 0.2,
  scrollWind: 200,
  scrollSensitivity: 0.06,
  attack: 0.14,
  release: 0.035,
  hoverIntensity: 0.5,
  idleDrift: 0.12,
  fitMode: 'cover',
  maxPixelRatio: 2,
  maxPoints: 36000, // C6: cap studio (WIRED/FT veil < 40k)
};

// ─── SHADERS ───────────────────────────────────────────────────────────────
// C6: 1 snoise principal + 1 gust = 2 noises au lieu de 4
const VERTEX_SHADER = /* glsl */ `
attribute vec3 aColor;
attribute float aRandom;

uniform float uTime;
uniform vec2  uMouse;
uniform float uMouseRadius;
uniform float uRepulsion;
uniform float uDisplacement;
uniform float uScroll;
uniform float uScrollWind;
uniform float uWindDrift;
uniform float uWindShare;
uniform float uSwirl;
uniform float uPointSize;
uniform float uPixelRatio;

varying vec3 vColor;
varying float vAlpha;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

void main() {
  vColor = aColor;
  vec3 pos = position;

  float lag = aRandom * 0.45;
  float local = clamp((uDisplacement - lag) / (1.0 - lag), 0.0, 1.0);
  local = local * local * (3.0 - 2.0 * local);

  vec2 toParticle = pos.xy - uMouse;
  float dist = length(toParticle);
  float force = 1.0 - smoothstep(0.0, uMouseRadius, dist);
  force = force * force;
  vec2 dir = dist > 0.001 ? toParticle / dist : vec2(0.0);
  pos.xy += dir * force * uRepulsion * local;
  pos.z  += force * uRepulsion * 0.35 * local;

  // C6: 1 bruit swirl + 1 gust partagé (était 2+2=4)
  float n1 = snoise(vec3(pos.xy * 0.012, uTime * 0.22 + aRandom * 10.0));
  pos.xy += vec2(n1, n1 * 0.7) * uSwirl * local;

  float mask = step(1.0 - uWindShare, aRandom);
  float gust = snoise(vec3(pos.x * 0.004 - uTime * 0.55, pos.y * 0.01, aRandom * 12.0));
  float drift = mask * local * (uWindDrift + abs(uScroll) * uScrollWind);
  pos.x += drift * (0.62 + 0.38 * gust);
  pos.y += drift * gust * 0.22;

  vAlpha = 1.0 - mask * local * 0.32 * (0.55 + 0.45 * gust);

  gl_PointSize = uPointSize * uPixelRatio * (1.0 + force * 0.6);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}`;

const FRAGMENT_SHADER = /* glsl */ `
precision mediump float;
varying vec3 vColor;
varying float vAlpha;
void main() {
  vec2 uv = gl_PointCoord - vec2(0.5);
  float d = length(uv);
  float alpha = smoothstep(0.5, 0.28, d);
  if (alpha < 0.01) discard;
  gl_FragColor = vec4(vColor, alpha * vAlpha);
}`;

// ─── Hook hydration-safe (C5) ────────────────────────────────────────────
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false); // C5: false initial = 0 mismatch SSR
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [breakpoint]);
  return isMobile;
}

// ─── COMPOSANT ─────────────────────────────────────────────────────────────
interface Props {
  className?: string;
  config?: Partial<ParticleBannerConfig>;
}

export default function ParticleBanner({ className = '', config = {} }: Props) {
  const isMobile = useIsMobile(768); // C5
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<{
    scene?: THREE.Scene;
    camera?: THREE.OrthographicCamera;
    renderer?: THREE.WebGLRenderer;
    animId?: number;
    points?: THREE.Points;
    fitScale: number;
    displacement: number;
    mouseInside: boolean;
    mousePx: { x: number; y: number };
    lastScrollY: number;
    scrollVelocity: number;
    visible: boolean; // C7
    pausedByHidden: boolean;
    disposed: boolean;
  }>({
    fitScale: 1,
    displacement: 0,
    mouseInside: false,
    mousePx: { x: 99999, y: 99999 },
    lastScrollY: 0,
    scrollVelocity: 0,
    visible: true,
    pausedByHidden: false,
    disposed: false,
  });
  const cfg = { ...DEFAULT_CONFIG, ...config };

  const cleanup = useCallback(() => {
    const s = stateRef.current;
    s.disposed = true;
    if (s.animId != null) cancelAnimationFrame(s.animId);
    if (s.renderer) {
      s.renderer.dispose();
      if (s.renderer.domElement.parentNode) {
        s.renderer.domElement.parentNode.removeChild(s.renderer.domElement);
      }
    }
    (s.scene as unknown as { clear?: () => void })?.clear?.();
  }, []);

  useEffect(() => {
    if (isMobile) return;
    // C7: prefers-reduced-motion → pas de WebGL animé
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const container = containerRef.current;
    if (!container) return;

    const s = stateRef.current;
    s.disposed = false;
    s.visible = true;
    s.pausedByHidden = document.hidden;
    s.lastScrollY = window.scrollY;
    s.scrollVelocity = 0;
    s.displacement = 0;
    s.mouseInside = false;

    // C7: respect Data Saver
    const saveData = (navigator as unknown as { connection?: { saveData?: boolean } }).connection?.saveData;
    if (saveData) return;

    let disposed = false;

    const init = async () => {
      try {
        const THREE = await import('three');

        const w = container.clientWidth;
        const h = container.clientHeight;
        if (w === 0 || h === 0) return;

        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-w / 2, w / 2, h / 2, -h / 2, -1000, 1000);

        const renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: false,
          powerPreference: 'high-performance',
        });
        renderer.setClearColor(0x000000, 0);
        const dpr = Math.min(window.devicePixelRatio || 1, cfg.maxPixelRatio);
        renderer.setPixelRatio(dpr);
        renderer.setSize(w, h);
        renderer.domElement.style.position = 'absolute';
        renderer.domElement.style.inset = '0';
        renderer.domElement.style.pointerEvents = 'none';
        renderer.domElement.style.zIndex = '0';
        container.appendChild(renderer.domElement);

        s.scene = scene;
        s.camera = camera;
        s.renderer = renderer;

        const uniforms = {
          uTime: { value: 0 },
          uMouse: { value: new THREE.Vector2(99999, 99999) },
          uMouseRadius: { value: cfg.mouseRadius },
          uRepulsion: { value: cfg.repulsion },
          uDisplacement: { value: 0 },
          uScroll: { value: 0 },
          uScrollWind: { value: cfg.scrollWind },
          uWindDrift: { value: cfg.windDrift },
          uWindShare: { value: cfg.windShare },
          uSwirl: { value: cfg.swirl },
          uPointSize: { value: 1 },
          uPixelRatio: { value: dpr },
        };

        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const el = new Image();
          el.onload = () => resolve(el);
          el.onerror = () => reject(new Error('Échec chargement image'));
          el.src = cfg.imageSrc;
        });

        if (disposed) {
          renderer.dispose();
          return;
        }

        const sampleCanvas = document.createElement('canvas');
        sampleCanvas.width = img.naturalWidth;
        sampleCanvas.height = img.naturalHeight;
        const ctx = sampleCanvas.getContext('2d', { willReadFrequently: true })!;
        ctx.drawImage(img, 0, 0);
        const pixels = ctx.getImageData(0, 0, sampleCanvas.width, sampleCanvas.height).data;

        // C6: cap adaptatif — si > maxPoints on augmente gap
        let gap = cfg.gap;
        let cols = Math.floor(img.naturalWidth / gap);
        let rows = Math.floor(img.naturalHeight / gap);
        let count = cols * rows;
        while (count > cfg.maxPoints && gap < 12) {
          gap += 1;
          cols = Math.floor(img.naturalWidth / gap);
          rows = Math.floor(img.naturalHeight / gap);
          count = cols * rows;
        }

        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const randoms = new Float32Array(count);

        let idx = 0;
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            const pxIdx = (y * gap * img.naturalWidth + x * gap) * 4;
            positions[idx * 3 + 0] = x * gap - img.naturalWidth / 2;
            positions[idx * 3 + 1] = -(y * gap - img.naturalHeight / 2);
            positions[idx * 3 + 2] = 0;
            colors[idx * 3 + 0] = pixels[pxIdx + 0] / 255;
            colors[idx * 3 + 1] = pixels[pxIdx + 1] / 255;
            colors[idx * 3 + 2] = pixels[pxIdx + 2] / 255;
            randoms[idx] = Math.random();
            idx++;
          }
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));

        const material = new THREE.ShaderMaterial({
          uniforms,
          vertexShader: VERTEX_SHADER,
          fragmentShader: FRAGMENT_SHADER,
          transparent: true,
          depthWrite: false,
        });

        const points = new THREE.Points(geometry, material);
        (points.userData as Record<string, unknown>).imgW = img.naturalWidth;
        (points.userData as Record<string, unknown>).imgH = img.naturalHeight;
        scene.add(points);
        s.points = points;

        const onResize = () => {
          if (s.disposed) return;
          const bw = container.clientWidth;
          const bh = container.clientHeight;
          camera.left = -bw / 2;
          camera.right = bw / 2;
          camera.top = bh / 2;
          camera.bottom = -bh / 2;
          camera.updateProjectionMatrix();
          const ndpr = Math.min(window.devicePixelRatio || 1, cfg.maxPixelRatio);
          renderer.setPixelRatio(ndpr);
          renderer.setSize(bw, bh);
          uniforms.uPixelRatio.value = ndpr;
          if (points) {
            const { imgW, imgH } = points.userData as { imgW: number; imgH: number };
            const scaleX = bw / imgW;
            const scaleY = bh / imgH;
            s.fitScale =
              cfg.fitMode === 'cover' ? Math.max(scaleX, scaleY) : Math.min(scaleX, scaleY);
            points.scale.set(s.fitScale, s.fitScale, 1);
            uniforms.uPointSize.value = gap * s.fitScale * cfg.particleScale;
          }
        };

        const onPointerMove = (e: PointerEvent) => {
          const rect = container.getBoundingClientRect();
          s.mousePx.x = e.clientX - rect.left - rect.width / 2;
          s.mousePx.y = -(e.clientY - rect.top - rect.height / 2);
          s.mouseInside = true;
        };
        const onPointerLeave = () => {
          s.mouseInside = false;
        };

        container.addEventListener('pointermove', onPointerMove, { passive: true });
        container.addEventListener('pointerleave', onPointerLeave);

        // C7: IntersectionObserver — pause RAF hors viewport
        const io = new IntersectionObserver(
          ([entry]) => {
            s.visible = entry.isIntersecting;
            // relance la boucle si on redevient visible et pas hidden
            if (s.visible && !s.pausedByHidden && s.animId == null && !s.disposed) {
              s.animId = requestAnimationFrame(animate);
            }
          },
          { threshold: 0 },
        );
        io.observe(container);

        // C7: visibilitychange — pause onglet caché
        const onVis = () => {
          s.pausedByHidden = document.hidden;
          if (!document.hidden && s.visible && s.animId == null && !s.disposed) {
            s.animId = requestAnimationFrame(animate);
          }
        };
        document.addEventListener('visibilitychange', onVis, { passive: true });

        window.addEventListener('resize', onResize, { passive: true });

        onResize();

        const clock = new THREE.Clock();
        const animate = () => {
          if (s.disposed) return;
          // C7: skip frame si hors vue ou onglet caché
          if (!s.visible || s.pausedByHidden) {
            s.animId = undefined as unknown as number;
            return;
          }
          s.animId = requestAnimationFrame(animate);

          uniforms.uTime.value = clock.getElapsedTime();

          const sy = window.scrollY;
          const delta = sy - s.lastScrollY;
          s.lastScrollY = sy;
          s.scrollVelocity += (delta - s.scrollVelocity) * 0.2;
          const scrollNorm = THREE.MathUtils.clamp(s.scrollVelocity * cfg.scrollSensitivity, -1, 1);
          uniforms.uScroll.value = scrollNorm;

          let target = cfg.idleDrift;
          if (s.mouseInside) target = Math.max(target, cfg.hoverIntensity);
          target = Math.max(target, Math.abs(scrollNorm));

          const ease = target > s.displacement ? cfg.attack : cfg.release;
          s.displacement += (target - s.displacement) * ease;
          uniforms.uDisplacement.value = s.displacement;

          if (s.mouseInside) {
            uniforms.uMouse.value.set(s.mousePx.x / s.fitScale, s.mousePx.y / s.fitScale);
          } else {
            uniforms.uMouse.value.set(99999, 99999);
          }

          renderer.render(scene, camera);
        };

        s.animId = requestAnimationFrame(animate);

        // cleanup additionnel
        const extraCleanup = () => {
          io.disconnect();
          document.removeEventListener('visibilitychange', onVis);
          container.removeEventListener('pointermove', onPointerMove);
          container.removeEventListener('pointerleave', onPointerLeave);
          window.removeEventListener('resize', onResize);
        };
        // stocker pour le return
        (s as unknown as { _extraCleanup?: () => void })._extraCleanup = extraCleanup;
      } catch (err) {
        console.warn('[ParticleBanner] Fallback activé:', err);
        if (container) {
          container.style.backgroundImage = `url(${cfg.imageSrc})`;
          container.style.backgroundSize = 'cover';
          container.style.backgroundPosition = 'center';
        }
        cleanup();
      }
    };

    init();

    return () => {
      disposed = true;
      (stateRef.current as unknown as { _extraCleanup?: () => void })._extraCleanup?.();
      cleanup();
    };
  }, [
    isMobile,
    cfg.imageSrc,
    cfg.gap,
    cfg.particleScale,
    cfg.mouseRadius,
    cfg.repulsion,
    cfg.swirl,
    cfg.windDrift,
    cfg.windShare,
    cfg.scrollWind,
    cfg.scrollSensitivity,
    cfg.attack,
    cfg.release,
    cfg.fitMode,
    cfg.maxPixelRatio,
    cfg.maxPoints,
    cleanup,
  ]);

  if (isMobile) return null;

  return (
    <div
      ref={containerRef}
      className={`particle-banner ${className}`}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        zIndex: 0,
      }}
    />
  );
}
