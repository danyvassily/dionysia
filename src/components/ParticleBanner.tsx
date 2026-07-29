import { useEffect, useRef, useCallback } from 'react';
import type * as THREE from 'three';

// ─── Types ────────────────────────────────────────────────────────────────
interface ParticleBannerConfig {
  /** Nombre de segments horizontaux (densité). ex: 200 → 200×113 = ~22 600 particules */
  particleDensity: number;
  /** Vitesse de suivi de la souris (lerp) */
  mouseLerpSpeed: number;
  /** Vitesse de retour après scroll */
  scrollLerpSpeed: number;
  /** Chemin de l'image dans /public (ex: '/images/default-ai.jpg') */
  imagePath: string;
}

const DEFAULT_CONFIG: ParticleBannerConfig = {
  particleDensity: 200,
  mouseLerpSpeed: 0.1,
  scrollLerpSpeed: 0.05,
  imagePath: '/images/default-ai.jpg',
};

// ─── SHADERS GLSL ─────────────────────────────────────────────────────────
const VERTEX_SHADER = /* glsl */ `
uniform float uTime;
uniform vec2 uMouse;
uniform float uHoverForce;
uniform float uScrollForce;
uniform float uPixelRatio;
uniform sampler2D uTexture;
attribute vec2 aUv;
varying vec3 vColor;
varying float vAlpha;

// Simplex 3D noise
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 1.0/7.0;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
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
  vec4 texColor = texture2D(uTexture, aUv);
  vColor = texColor.rgb;
  vec3 pos = position;

  float distToMouse = distance(aUv, uMouse);
  float mouseRadius = 0.15;
  float mouseInfluence = 1.0 - smoothstep(0.0, mouseRadius, distToMouse);
  vec2 dir = normalize(aUv - uMouse);
  if (length(dir) == 0.0) dir = vec2(1.0, 0.0);

  float scrollInfluence = abs(uScrollForce);
  float scrollDir = sign(uScrollForce);

  float noiseX = snoise(vec3(pos.x * 5.0, pos.y * 5.0, uTime * 0.5));
  float noiseY = snoise(vec3(pos.x * 5.0, pos.y * 5.0, uTime * 0.5 + 10.0));
  float noiseZ = snoise(vec3(pos.x * 5.0, pos.y * 5.0, uTime * 0.5 + 20.0));

  pos.xy += dir * mouseInfluence * uHoverForce * 0.3;
  pos.z  += mouseInfluence * uHoverForce * 0.5;
  pos.y  -= scrollDir * scrollInfluence * 0.8;
  pos.x  += noiseX * scrollInfluence * 0.5;
  pos.z  += noiseZ * scrollInfluence * 0.5;
  pos.x  += noiseX * mouseInfluence * uHoverForce * 0.2;
  pos.y  += noiseY * mouseInfluence * uHoverForce * 0.2;

  vAlpha = 1.0 - smoothstep(0.0, 1.0, abs(pos.z));
  vAlpha *= texColor.a;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = (3.0 * uPixelRatio) * (1.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}`;

const FRAGMENT_SHADER = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;
void main() {
  float dist = distance(gl_PointCoord, vec2(0.5));
  if (dist > 0.5) discard;
  gl_FragColor = vec4(vColor, vAlpha);
}`;

// ─── COMPOSANT ────────────────────────────────────────────────────────────
interface Props {
  className?: string;
  config?: Partial<ParticleBannerConfig>;
}

export default function ParticleBanner({ className = '', config = {} }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    material: THREE.ShaderMaterial | null;
    clock: THREE.Clock;
    animId: number;
    targetMouse: THREE.Vector2;
    targetHover: number;
    targetScroll: number;
  } | null>(null);
  const failedRef = useRef(false);

  const cfg = { ...DEFAULT_CONFIG, ...config };

  const lerp = useCallback((start: number, end: number, factor: number) => {
    return start + (end - start) * factor;
  }, []);

  // ── Nettoyage ───────────────────────────────────────────────────────
  const cleanup = useCallback(() => {
    const s = stateRef.current;
    if (!s) return;
    cancelAnimationFrame(s.animId);
    s.renderer.dispose();
    s.material?.dispose();
    s.scene.clear();
    if (canvasRef.current?.parentNode) {
      canvasRef.current.parentNode.removeChild(canvasRef.current);
    }
    canvasRef.current = null;
    stateRef.current = null;
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || failedRef.current) return;

    let disposed = false;

    // ── Chargement async de Three.js ──────────────────────────────────
    const init = async () => {
      try {
        const THREE = await import('three');

        const width = container.clientWidth;
        const height = container.clientHeight;
        if (width === 0 || height === 0) return;

        // Scene + Camera
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
        camera.position.z = 2;

        // Renderer
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(width, height);
        renderer.domElement.style.position = 'absolute';
        renderer.domElement.style.top = '0';
        renderer.domElement.style.left = '0';
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        renderer.domElement.style.pointerEvents = 'none'; // ← clics traversent
        renderer.domElement.style.zIndex = '0';
        container.appendChild(renderer.domElement);
        canvasRef.current = renderer.domElement;

        // Texture — fetch + blob URL (contourne tout problème CORS/navigateur)
        const blobResp = await fetch(cfg.imagePath);
        if (!blobResp.ok) throw new Error(`HTTP ${blobResp.status}`);
        const blob = await blobResp.blob();
        const objectUrl = URL.createObjectURL(blob);
        const textureImg = await new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            URL.revokeObjectURL(objectUrl);
            resolve(img);
          };
          img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error('Échec chargement image'));
          };
          img.src = objectUrl;
        });
        const texture = new THREE.Texture(textureImg);
        texture.needsUpdate = true;

        if (disposed) {
          renderer.dispose();
          return;
        }

        // Géométrie de particules
        const imgRatio = texture.image.width / texture.image.height;
        const planeWidth = 2.5;
        const planeHeight = planeWidth / imgRatio;
        const segmentsX = cfg.particleDensity;
        const segmentsY = Math.floor(cfg.particleDensity / imgRatio);
        const particleCount = segmentsX * segmentsY;

        const positions = new Float32Array(particleCount * 3);
        const uvs = new Float32Array(particleCount * 2);
        let i3 = 0;
        let i2 = 0;

        for (let y = 0; y < segmentsY; y++) {
          for (let x = 0; x < segmentsX; x++) {
            positions[i3] = (x / segmentsX - 0.5) * planeWidth;
            positions[i3 + 1] = (y / segmentsY - 0.5) * planeHeight;
            positions[i3 + 2] = 0;
            uvs[i2] = x / segmentsX;
            uvs[i2 + 1] = y / segmentsY;
            i3 += 3;
            i2 += 2;
          }
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('aUv', new THREE.BufferAttribute(uvs, 2));

        const material = new THREE.ShaderMaterial({
          vertexShader: VERTEX_SHADER,
          fragmentShader: FRAGMENT_SHADER,
          uniforms: {
            uTime: { value: 0 },
            uMouse: { value: new THREE.Vector2(-10, -10) },
            uHoverForce: { value: 0 },
            uScrollForce: { value: 0 },
            uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
            uTexture: { value: texture },
          },
          transparent: true,
          depthWrite: false,
          blending: THREE.NormalBlending,
        });

        const particles = new THREE.Points(geometry, material);
        scene.add(particles);

        const clock = new THREE.Clock();
        const targetMouse = new THREE.Vector2(-10, -10);
        let targetHover = 0;
        let targetScroll = 0;

        // ── Gestionnaires d'événements ─────────────────────────────────
        let lastScrollY = window.scrollY;
        let scrollTimer: ReturnType<typeof setTimeout>;

        const onMouseMove = (e: MouseEvent) => {
          const rect = container.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width;
          const y = 1.0 - (e.clientY - rect.top) / rect.height;
          targetMouse.set(x, y);
          targetHover = 1.0;
        };

        const onMouseLeave = () => {
          targetHover = 0;
        };

        const onScroll = () => {
          const currentScrollY = window.scrollY;
          const deltaY = currentScrollY - lastScrollY;
          lastScrollY = currentScrollY;
          targetScroll = Math.min(Math.abs(deltaY) * 0.02, 1.5) * Math.sign(deltaY);
          clearTimeout(scrollTimer);
          scrollTimer = setTimeout(() => {
            targetScroll = 0;
          }, 50);
        };

        const onResize = () => {
          if (disposed) return;
          const w = container.clientWidth;
          const h = container.clientHeight;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
          if (material) {
            material.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
          }
        };

        container.addEventListener('mousemove', onMouseMove, { passive: true });
        container.addEventListener('mouseleave', onMouseLeave);
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onResize, { passive: true });

        // ── Stockage de l'état ────────────────────────────────────────
        stateRef.current = {
          scene,
          camera,
          renderer,
          material,
          clock,
          animId: 0,
          targetMouse,
          targetHover,
          targetScroll,
        };

        // ── Boucle d'animation ────────────────────────────────────────
        const animate = () => {
          if (disposed) return;
          const elapsedTime = clock.getElapsedTime();
          if (material) {
            material.uniforms.uTime.value = elapsedTime;
            material.uniforms.uMouse.value.lerp(targetMouse, cfg.mouseLerpSpeed);
            material.uniforms.uHoverForce.value = lerp(
              material.uniforms.uHoverForce.value,
              targetHover,
              cfg.mouseLerpSpeed,
            );
            material.uniforms.uScrollForce.value = lerp(
              material.uniforms.uScrollForce.value,
              targetScroll,
              cfg.scrollLerpSpeed,
            );
          }
          renderer.render(scene, camera);
          stateRef.current!.animId = requestAnimationFrame(animate);
        };
        stateRef.current.animId = requestAnimationFrame(animate);

        // Nettoyer les event listeners
        (stateRef.current as unknown as Record<string, unknown>)._cleanup = () => {
          container.removeEventListener('mousemove', onMouseMove);
          container.removeEventListener('mouseleave', onMouseLeave);
          window.removeEventListener('scroll', onScroll);
          window.removeEventListener('resize', onResize);
          clearTimeout(scrollTimer);
        };
      } catch (err) {
        // Silencieux — fallback CSS activé
        console.warn('[ParticleBanner] WebGL fallback activé:', err);
        failedRef.current = true;
        if (container) {
          container.style.backgroundImage = `url(${cfg.imagePath})`;
          container.style.backgroundSize = 'cover';
          container.style.backgroundPosition = 'center';
        }
        cleanup();
      }
    };

    init();

    return () => {
      disposed = true;
      const s = stateRef.current;
      if (s) {
        const clean = (s as unknown as Record<string, unknown>)._cleanup as (() => void) | undefined;
        clean?.();
      }
      cleanup();
    };
  }, [cfg.imagePath, cfg.particleDensity, cfg.mouseLerpSpeed, cfg.scrollLerpSpeed, cleanup, lerp]);

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
