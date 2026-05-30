"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type * as Three from "three";

type HeroWebGLFieldProps = {
  alt: string;
  imageSrc: string;
  label: string;
};

type PointerState = {
  active: boolean;
  x: number;
  y: number;
};

type HeroWebGLMode = "booting" | "disabled" | "fallback" | "ready";

const MAX_PIXEL_RATIO = 1.35;
const PORTRAIT_PROXIMITY = 0.92;
const DESKTOP_HERO_QUERY = "(min-width: 981px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const portraitVertexShader = `
  varying vec2 vUv;
  uniform float uHover;
  uniform vec2 uPointer;

  void main() {
    vUv = uv;
    vec3 transformed = position;
    float pointerDistance = distance(uv, vec2(0.5) + uPointer * 0.08);
    float lift = smoothstep(0.72, 0.0, pointerDistance) * uHover;
    transformed.z += lift * 0.035;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  }
`;

const portraitFragmentShader = `
  varying vec2 vUv;
  uniform sampler2D uTexture;
  uniform float uHover;
  uniform float uTime;
  uniform vec2 uPointer;

  void main() {
    vec2 uv = vUv + uPointer * uHover * 0.012;
    vec4 image = texture2D(uTexture, uv);
    float gray = dot(image.rgb, vec3(0.299, 0.587, 0.114));
    float contrast = (gray - 0.5) * 1.22 + 0.5;
    float vignette = smoothstep(0.78, 0.28, distance(vUv, vec2(0.5)));
    float scan = sin((vUv.y + uTime * 0.012) * 170.0) * 0.015;
    float tone = clamp(contrast * (0.72 + vignette * 0.42) + scan + uHover * 0.06, 0.0, 1.0);

    gl_FragColor = vec4(vec3(tone), image.a);
  }
`;

export function HeroWebGLField({
  alt,
  imageSrc,
  label,
}: HeroWebGLFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<HeroWebGLMode>("disabled");

  useEffect(() => {
    const desktopQuery = window.matchMedia(DESKTOP_HERO_QUERY);
    const motionQuery = window.matchMedia(REDUCED_MOTION_QUERY);

    let disposed = false;
    let animationFrame = 0;
    let modeFrame = 0;
    let startFrame = 0;
    let renderer: Three.WebGLRenderer | undefined;
    const pointer: PointerState = { active: false, x: 0, y: 0 };
    let cleanupScene: (() => void) | undefined;

    function canRunScene() {
      return desktopQuery.matches && !motionQuery.matches;
    }

    function idleMode(): HeroWebGLMode {
      return desktopQuery.matches ? "fallback" : "disabled";
    }

    function stopScene() {
      window.cancelAnimationFrame(animationFrame);
      window.cancelAnimationFrame(modeFrame);
      window.cancelAnimationFrame(startFrame);
      cleanupScene?.();
      cleanupScene = undefined;
      renderer?.dispose();
      renderer = undefined;
    }

    function queueMode(nextMode: HeroWebGLMode) {
      window.cancelAnimationFrame(modeFrame);
      modeFrame = window.requestAnimationFrame(() => {
        modeFrame = 0;

        if (!disposed) {
          setMode(nextMode);
        }
      });
    }

    async function boot() {
      const canvas = canvasRef.current;

      if (!canvas || !canRunScene()) {
        queueMode(idleMode());
        return;
      }

      setMode("booting");

      try {
        const THREE = await import("three");

        if (disposed || !canRunScene()) {
          queueMode(idleMode());
          return;
        }

        const activeCanvas = canvas;
        const container = activeCanvas.parentElement;

        if (!container) {
          queueMode(idleMode());
          return;
        }

        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
        const portraitGroup = new THREE.Group();
        const texture = await new THREE.TextureLoader().loadAsync(imageSrc);

        if (disposed || !canRunScene()) {
          texture.dispose();
          queueMode(idleMode());
          return;
        }

        texture.colorSpace = THREE.SRGBColorSpace;
        texture.magFilter = THREE.LinearFilter;
        texture.minFilter = THREE.LinearMipmapLinearFilter;

        const portraitMaterial = new THREE.ShaderMaterial({
          fragmentShader: portraitFragmentShader,
          uniforms: {
            uHover: { value: 0 },
            uPointer: { value: new THREE.Vector2(0, 0) },
            uTexture: { value: texture },
            uTime: { value: 0 },
          },
          vertexShader: portraitVertexShader,
        });
        const portrait = new THREE.Mesh(
          new THREE.PlaneGeometry(1, 1, 28, 28),
          portraitMaterial,
        );
        const frameGeometry = new THREE.BufferGeometry();
        const frameMaterial = new THREE.LineBasicMaterial({
          color: 0x888888,
          opacity: 0.22,
          transparent: true,
        });
        const frameLines = new THREE.LineSegments(frameGeometry, frameMaterial);
        const nodeGeometry = new THREE.BufferGeometry();
        const nodeMaterial = new THREE.PointsMaterial({
          color: 0x888888,
          opacity: 0.26,
          size: 0.022,
          sizeAttenuation: false,
          transparent: true,
        });
        const nodes = new THREE.Points(nodeGeometry, nodeMaterial);

        camera.position.z = 5;
        frameGeometry.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(
            [
              -0.52, 0.52, 0,
              0.52, 0.52, 0,
              0.52, 0.52, 0,
              0.52, -0.52, 0,
              0.52, -0.52, 0,
              -0.52, -0.52, 0,
              -0.52, -0.52, 0,
              -0.52, 0.52, 0,
              -0.34, 0, 0,
              0.34, 0, 0,
              0, -0.34, 0,
              0, 0.34, 0,
            ],
            3,
          ),
        );
        nodeGeometry.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(
            [
              -0.52, 0.52, 0,
              0.52, 0.52, 0,
              0.52, -0.52, 0,
              -0.52, -0.52, 0,
              0, 0, 0,
            ],
            3,
          ),
        );
        portraitGroup.add(frameLines);
        portraitGroup.add(nodes);
        portraitGroup.add(portrait);
        scene.add(portraitGroup);

        renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: true,
          canvas,
          powerPreference: "high-performance",
        });
        renderer.setClearColor(0x000000, 0);

        function resize() {
          if (!container || !renderer) {
            return;
          }

          const rect = container.getBoundingClientRect();
          const width = Math.max(1, Math.floor(rect.width));
          const height = Math.max(1, Math.floor(rect.height));
          const aspect = width / height;
          const portraitSize = Math.max(1.02, Math.min(1.26, 1.92 / aspect));

          renderer.setPixelRatio(
            Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO),
          );
          renderer.setSize(width, height, false);
          camera.left = -aspect;
          camera.right = aspect;
          camera.top = 1;
          camera.bottom = -1;
          camera.updateProjectionMatrix();
          portraitGroup.scale.set(portraitSize, portraitSize, 1);
        }

        function handlePointerMove(event: PointerEvent) {
          const rect = activeCanvas.getBoundingClientRect();

          pointer.active = true;
          pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
          pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
        }

        function handlePointerLeave() {
          pointer.active = false;
        }

        function animate(time: number) {
          if (disposed || !renderer) {
            return;
          }

          const distance = Math.hypot(pointer.x, pointer.y);
          const proximity =
            pointer.active && distance < PORTRAIT_PROXIMITY
              ? 1 - distance / PORTRAIT_PROXIMITY
              : 0;
          const scrollShift = Math.min(window.scrollY / 1800, 0.3);
          const breathe = Math.sin(time * 0.001) * 0.012;

          portraitMaterial.uniforms.uHover.value +=
            (proximity - portraitMaterial.uniforms.uHover.value) * 0.12;
          portraitMaterial.uniforms.uPointer.value.set(
            pointer.x * proximity,
            pointer.y * proximity,
          );
          portraitMaterial.uniforms.uTime.value = time * 0.001;
          portraitGroup.position.set(
            pointer.x * proximity * 0.035,
            -0.02 + pointer.y * proximity * 0.03 + breathe - scrollShift * 0.05,
            0,
          );
          portraitGroup.rotation.z = pointer.active
            ? pointer.x * proximity * 0.035
            : Math.sin(time * 0.00035) * 0.008;
          frameMaterial.opacity = 0.18 + proximity * 0.1;
          nodeMaterial.opacity = 0.22 + proximity * 0.12;

          renderer.render(scene, camera);
          animationFrame = window.requestAnimationFrame(animate);
        }

        resize();
        window.addEventListener("resize", resize);
        activeCanvas.addEventListener("pointermove", handlePointerMove);
        activeCanvas.addEventListener("pointerleave", handlePointerLeave);
        renderer.render(scene, camera);
        setMode("ready");
        animationFrame = window.requestAnimationFrame(animate);

        return () => {
          window.removeEventListener("resize", resize);
          activeCanvas.removeEventListener("pointermove", handlePointerMove);
          activeCanvas.removeEventListener("pointerleave", handlePointerLeave);
          texture.dispose();
          portrait.geometry.dispose();
          portraitMaterial.dispose();
          frameGeometry.dispose();
          frameMaterial.dispose();
          nodeGeometry.dispose();
          nodeMaterial.dispose();
        };
      } catch {
        if (!disposed) {
          queueMode(idleMode());
        }
      }
    }

    function startScene() {
      void boot().then((cleanup) => {
        if (disposed || !canRunScene()) {
          cleanup?.();
          return;
        }

        cleanupScene = cleanup;
      });
    }

    function queueStartScene() {
      window.cancelAnimationFrame(startFrame);
      startFrame = window.requestAnimationFrame(() => {
        if (disposed) {
          return;
        }

        setMode("booting");
        startFrame = window.requestAnimationFrame(() => {
          startFrame = 0;
          startScene();
        });
      });
    }

    function handleCapabilityChange() {
      stopScene();

      if (!canRunScene()) {
        queueMode(idleMode());
        return;
      }

      queueStartScene();
    }

    handleCapabilityChange();
    desktopQuery.addEventListener("change", handleCapabilityChange);
    motionQuery.addEventListener("change", handleCapabilityChange);

    return () => {
      disposed = true;
      desktopQuery.removeEventListener("change", handleCapabilityChange);
      motionQuery.removeEventListener("change", handleCapabilityChange);
      stopScene();
    };
  }, [imageSrc]);

  return (
    <figure
      aria-label={label}
      className="joe-identity-field"
      data-hero-mode={mode}
      data-hero-webgl={mode === "ready" ? "ready" : mode}
      role="img"
    >
      {mode === "booting" || mode === "ready" ? (
        <canvas aria-hidden="true" data-hero-webgl-canvas ref={canvasRef} />
      ) : null}
      <div aria-hidden="true" className="joe-identity-grid" />
      {mode === "fallback" ? (
        <div aria-hidden="true" className="joe-identity-fallback">
          <Image
            alt=""
            className="joe-identity-portrait-fallback"
            fetchPriority="high"
            fill
            loading="eager"
            sizes="(min-width: 981px) 32vw, 1px"
            src={imageSrc}
          />
        </div>
      ) : null}
      <span className="sr-only">{alt}</span>
    </figure>
  );
}
