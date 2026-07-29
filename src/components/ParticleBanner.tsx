import { useEffect, useRef, useCallback, useState } from 'react';
import type * as THREE from 'three';

// ─── CONFIG ────────────────────────────────────────────────────────────────
export interface ParticleBannerConfig {
  imageSrc: string;
  gap: number;              // 1 particule tous les N px
  particleScale: number;    // taille = gap × particleScale
  mouseRadius: number;
  repulsion: number;
  swirl: number;
  windDrift: number;        // vent permanent vers la droite
  windShare: number;        // fraction des particules emportées (0..1)
  scrollWind: number;       // surcroît de vent au scroll
  scrollSensitivity: number;
  attack: number;           // vitesse de dispersion
  release: number;          // vitesse de retour
  hoverIntensity: number;   // intensité dispersion au hover (0..1, défaut 0.5)
  idleDrift: number;        // vent permanent sans interaction (0..1, défaut 0.12)
  fitMode: 'cover' | 'contain';
  maxPixelRatio: number;
}

const DEFAULT_CONFIG: ParticleBannerConfig = {
  imageSrc: '/images/image_header.jpg',
  gap: 4,
  particleScale: 0.7,
  mouseRadius: 110,
  repulsion: 40,
  swirl: 16,
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
};

// ─── SHADERS ───────────────────────────────────────────────────────────────
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

  float n1 = snoise(vec3(pos.xy * 0.012, uTime * 0.25 + aRandom * 10.0));
  float n2 = snoise(vec3(pos.yx * 0.012 + 100.0, uTime * 0.22 + aRandom * 10.0));
  pos.xy += vec2(n1, n2) * uSwirl * local;

  float mask = step(1.0 - uWindShare, aRandom);
  float gust = snoise(vec3(pos.x * 0.004 - uTime * 0.6, pos.y * 0.01, aRandom * 20.0));
  float gust2 = snoise(vec3(pos.xy * 0.008, uTime * 0.4 + aRandom * 5.0));
  float drift = mask * local * (uWindDrift + abs(uScroll) * uScrollWind);
  pos.x += drift * (0.55 + 0.45 * gust);
  pos.y += drift * gust2 * 0.35;

  vAlpha = 1.0 - mask * local * 0.35 * (0.5 + 0.5 * gust);

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

// ─── COMPOSANT ─────────────────────────────────────────────────────────────
interface Props {
  className?: string;
  config?: Partial<ParticleBannerConfig>;
}

export default function ParticleBanner({ className = '', config = {} }: Props) {
  // Pas de WebGL sur mobile — header épuré
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' && window.innerWidth < 768,
  );

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

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
    disposed: boolean;
  }>({
    fitScale: 1,
    displacement: 0,
    mouseInside: false,
    mousePx: { x: 99999, y: 99999 },
    lastScrollY: 0,
    scrollVelocity: 0,
    disposed: false,
  });
  const cfg = { ...DEFAULT_CONFIG, ...config };

  // ── Cleanup ──────────────────────────────────────────────────────────
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
    const container = containerRef.current;
    if (!container) return;

    const s = stateRef.current;
    s.disposed = false;
    s.lastScrollY = window.scrollY;
    s.scrollVelocity = 0;
    s.displacement = 0;
    s.mouseInside = false;

    let disposed = false;

    const init = async () => {
      try {
        const THREE = await import('three');

        const w = container.clientWidth;
        const h = container.clientHeight;
        if (w === 0 || h === 0) return;

        // Détection mobile pour optimisations GPU
        const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)
                       || window.innerWidth < 768;

        // ── Scene + Camera (orthographique, 1 unité = 1 px CSS) ──────
        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(
          -w / 2, w / 2, h / 2, -h / 2, -1000, 1000,
        );

        const renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: false,
          powerPreference: 'high-performance',
        });
        renderer.setClearColor(0x000000, 0);
        const maxDpr = isMobile ? 1 : cfg.maxPixelRatio;
        const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
        renderer.setPixelRatio(dpr);
        renderer.setSize(w, h);
        renderer.domElement.style.position = 'absolute';
        renderer.domElement.style.inset = '0';
        renderer.domElement.style.pointerEvents = 'none'; // ← clics traversent
        renderer.domElement.style.zIndex = '0';
        container.appendChild(renderer.domElement);

        s.scene = scene;
        s.camera = camera;
        s.renderer = renderer;

        // ── Uniforms ─────────────────────────────────────────────────
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

        // ── Chargement image + échantillonnage pixels ────────────────
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const el = new Image();
          el.onload = () => resolve(el);
          el.onerror = () => reject(new Error('Échec chargement image'));
          el.src = cfg.imageSrc;
        });

        if (disposed) { renderer.dispose(); return; }

        const sampleCanvas = document.createElement('canvas');
        sampleCanvas.width = img.naturalWidth;
        sampleCanvas.height = img.naturalHeight;
        const ctx = sampleCanvas.getContext('2d', { willReadFrequently: true })!;
        ctx.drawImage(img, 0, 0);
        const pixels = ctx.getImageData(
          0, 0, sampleCanvas.width, sampleCanvas.height,
        ).data;

        // ── Géométrie ────────────────────────────────────────────────
        const gap = isMobile ? Math.max(cfg.gap, 6) : cfg.gap;
        const cols = Math.floor(img.naturalWidth / gap);
        const rows = Math.floor(img.naturalHeight / gap);
        const count = cols * rows;

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

        // ── Resize ───────────────────────────────────────────────────
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
            s.fitScale = cfg.fitMode === 'cover'
              ? Math.max(scaleX, scaleY)
              : Math.min(scaleX, scaleY);
            points.scale.set(s.fitScale, s.fitScale, 1);
            uniforms.uPointSize.value = cfg.gap * s.fitScale * cfg.particleScale;
          }
        };

        // ── Événements souris ────────────────────────────────────────
        const onPointerMove = (e: PointerEvent) => {
          const rect = container.getBoundingClientRect();
          s.mousePx.x = e.clientX - rect.left - rect.width / 2;
          s.mousePx.y = -(e.clientY - rect.top - rect.height / 2);
          s.mouseInside = true;
        };
        const onPointerLeave = () => { s.mouseInside = false; };
        const onPointerDown = (e: PointerEvent) => {
          const rect = container.getBoundingClientRect();
          s.mousePx.x = e.clientX - rect.left - rect.width / 2;
          s.mousePx.y = -(e.clientY - rect.top - rect.height / 2);
          s.mouseInside = true;
        };
        const onPointerUp = () => { s.mouseInside = false; };
        const onScroll = () => { /* handled in animate */ };

        container.addEventListener('pointermove', onPointerMove, { passive: true });
        container.addEventListener('pointerleave', onPointerLeave);
        container.addEventListener('pointerdown', onPointerDown);
        container.addEventListener('pointerup', onPointerUp);
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onResize, { passive: true });

        // ── Resize initial ───────────────────────────────────────────
        onResize();

        // ── Boucle d'animation ───────────────────────────────────────
        const clock = new THREE.Clock();
        const animate = () => {
          if (s.disposed) return;
          s.animId = requestAnimationFrame(animate);

          uniforms.uTime.value = clock.getElapsedTime();

          // Scroll velocity
          const sy = window.scrollY;
          const delta = sy - s.lastScrollY;
          s.lastScrollY = sy;
          s.scrollVelocity += (delta - s.scrollVelocity) * 0.2;
          const scrollNorm = THREE.MathUtils.clamp(
            s.scrollVelocity * cfg.scrollSensitivity, -1, 1,
          );
          uniforms.uScroll.value = scrollNorm;

          // Target displacement — vent permanent + hover adouci
          let target = cfg.idleDrift;
          if (s.mouseInside) target = Math.max(target, cfg.hoverIntensity);
          target = Math.max(target, Math.abs(scrollNorm));

          const ease = target > s.displacement ? cfg.attack : cfg.release;
          s.displacement += (target - s.displacement) * ease;
          uniforms.uDisplacement.value = s.displacement;

          // Mouse in geometry space
          if (s.mouseInside) {
            uniforms.uMouse.value.set(
              s.mousePx.x / s.fitScale,
              s.mousePx.y / s.fitScale,
            );
          } else {
            uniforms.uMouse.value.set(99999, 99999);
          }

          renderer.render(scene, camera);
        };

        s.animId = requestAnimationFrame(animate);

      } catch (err) {
        // Silencieux — l'image de fond CSS fait office de fallback
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
      cleanup();
    };
  }, [cfg.imageSrc, cfg.gap, cfg.particleScale, cfg.mouseRadius, cfg.repulsion,
      cfg.swirl, cfg.windDrift, cfg.windShare, cfg.scrollWind,
      cfg.scrollSensitivity, cfg.attack, cfg.release, cfg.fitMode,
      cfg.maxPixelRatio, cleanup]);

  if (isMobile) return null;

  return (
    <div
      ref={containerRef}
      className={`particle-banner ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        zIndex: 0,
      }}
    />
  );
}
