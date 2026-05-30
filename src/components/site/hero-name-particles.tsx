"use client";

import { useEffect, useRef, useState } from "react";

type HeroNameParticlesProps = {
  id: string;
  text: string;
};

type Particle = {
  baseX: number;
  baseY: number;
  life: number;
  size: number;
  x: number;
  y: number;
};

type PointerState = {
  active: boolean;
  x: number;
  y: number;
};

type ParticlePalette = {
  accent: string;
  foreground: string;
};

const MAX_PIXEL_RATIO = 1.65;
const POINTER_RADIUS = 168;

function cssVar(name: string, fallback: string) {
  const value = window
    .getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();

  return value || fallback;
}

function readParticlePalette(): ParticlePalette {
  return {
    accent: cssVar("--signal-accent", "#3291ff"),
    foreground: cssVar("--foreground", "#ffffff"),
  };
}

function canvasFontFrom(element: HTMLElement) {
  const style = window.getComputedStyle(element);

  return `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
}

function createParticle({
  imageData,
  dpr,
  width,
}: {
  dpr: number;
  imageData: ImageData;
  width: number;
}) {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    const x = Math.floor(Math.random() * imageData.width);
    const y = Math.floor(Math.random() * imageData.height);
    const alpha = imageData.data[(y * imageData.width + x) * 4 + 3];

    if (alpha < 96) {
      continue;
    }

    const baseX = x / dpr;
    const baseY = y / dpr;
    const side = baseX < width * 0.48 ? -1 : 1;

    return {
      baseX,
      baseY,
      life: Math.random() * 140 + 90,
      size: Math.random() * 1.2 + 0.62,
      x: baseX + side * (Math.random() * 22 + 10),
      y: baseY + (Math.random() - 0.5) * 18,
    } satisfies Particle;
  }

  return null;
}

function buildParticles({
  canvas,
  context,
  title,
  text,
}: {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  title: HTMLElement;
  text: string;
}) {
  const bounds = title.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
  const paddingX = 40;
  const paddingY = 10;
  const textWidth = Math.max(1, Math.ceil(bounds.width));
  const textHeight = Math.max(1, Math.ceil(bounds.height));
  const width = textWidth + paddingX * 2;
  const height = textHeight + paddingY * 2;

  canvas.width = Math.ceil(width * dpr);
  canvas.height = Math.ceil(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  canvas.style.left = `-${paddingX}px`;
  canvas.style.top = `-${paddingY}px`;

  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.clearRect(0, 0, width, height);
  context.fillStyle = "#ffffff";
  context.font = canvasFontFrom(title);
  context.textBaseline = "middle";
  context.fillText(text, paddingX, height / 2);

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const particles: Particle[] = [];
  const targetParticleCount = Math.round(
    Math.max(4_800, Math.min(9_500, (width * height) / 7.5)),
  );

  for (let index = 0; index < targetParticleCount; index += 1) {
    const particle = createParticle({ dpr, imageData, width });

    if (particle) {
      particles.push(particle);
    }
  }

  context.clearRect(0, 0, width, height);

  return { dpr, height, imageData, particles, targetParticleCount, width };
}

export function HeroNameParticles({ id, text }: HeroNameParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const title = titleRef.current;

    if (!canvas || !title) {
      setReady(false);
      return;
    }

    const hoverQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const canvasElement = canvas;
    const titleElement = title;
    let disposed = false;
    let cleanupParticles: (() => void) | undefined;
    let palette = readParticlePalette();

    function stopParticles(updateReady = true) {
      cleanupParticles?.();
      cleanupParticles = undefined;

      if (updateReady && !disposed) {
        setReady(false);
      }
    }

    function startParticles() {
      if (cleanupParticles) {
        return;
      }

      if (!hoverQuery.matches || motionQuery.matches) {
        setReady(false);
        return;
      }

      const maybeContext = canvasElement.getContext("2d", {
        alpha: true,
        willReadFrequently: true,
      });

      if (!maybeContext) {
        setReady(false);
        return;
      }

      const drawingContext: CanvasRenderingContext2D = maybeContext;
      let active = true;
      let animationFrame = 0;
      let scene = buildParticles({
        canvas: canvasElement,
        context: drawingContext,
        text,
        title: titleElement,
      });
      const pointer: PointerState = { active: false, x: 0, y: 0 };

      async function rebuildAfterFonts() {
        await document.fonts?.ready;

        if (disposed || !active) {
          return;
        }

        scene = buildParticles({
          canvas: canvasElement,
          context: drawingContext,
          text,
          title: titleElement,
        });
        setReady(scene.particles.length > 0);
      }

      function draw() {
        if (disposed || !active) {
          return;
        }

        drawingContext.setTransform(scene.dpr, 0, 0, scene.dpr, 0, 0);
        drawingContext.clearRect(0, 0, scene.width, scene.height);

        for (const particle of scene.particles) {
          const dx = pointer.x - particle.x;
          const dy = pointer.y - particle.y;
          const distance = Math.hypot(dx, dy);
          const force =
            pointer.active && distance < POINTER_RADIUS
              ? (POINTER_RADIUS - distance) / POINTER_RADIUS
              : 0;

          if (force > 0) {
            const angle = Math.atan2(dy, dx);

            particle.x +=
              (particle.baseX - Math.cos(angle) * force * 46 - particle.x) *
              0.24;
            particle.y +=
              (particle.baseY - Math.sin(angle) * force * 46 - particle.y) *
              0.24;
            drawingContext.fillStyle = palette.accent;
          } else {
            particle.x += (particle.baseX - particle.x) * 0.09;
            particle.y += (particle.baseY - particle.y) * 0.09;
            drawingContext.fillStyle = palette.foreground;
          }

          drawingContext.globalAlpha = force > 0 ? 1 : 0.98;
          drawingContext.fillRect(
            particle.x,
            particle.y,
            particle.size,
            particle.size,
          );
          particle.life -= 1;

          if (particle.life <= 0) {
            const replacement = createParticle({
              dpr: scene.dpr,
              imageData: scene.imageData,
              width: scene.width,
            });

            if (replacement) {
              Object.assign(particle, replacement);
            } else {
              particle.life = Math.random() * 140 + 90;
            }
          }
        }

        drawingContext.globalAlpha = 1;
        while (scene.particles.length < scene.targetParticleCount) {
          const particle = createParticle({
            dpr: scene.dpr,
            imageData: scene.imageData,
            width: scene.width,
          });

          if (!particle) {
            break;
          }

          scene.particles.push(particle);
        }
        animationFrame = window.requestAnimationFrame(draw);
      }

      function handlePointerMove(event: PointerEvent) {
        const rect = canvasElement.getBoundingClientRect();

        pointer.active = true;
        pointer.x = event.clientX - rect.left;
        pointer.y = event.clientY - rect.top;
      }

      function handlePointerLeave() {
        pointer.active = false;
      }

      const resizeObserver = new ResizeObserver(() => {
        if (!active) {
          return;
        }

        scene = buildParticles({
          canvas: canvasElement,
          context: drawingContext,
          text,
          title: titleElement,
        });
        setReady(scene.particles.length > 0);
      });

      void rebuildAfterFonts();
      resizeObserver.observe(titleElement);
      canvasElement.addEventListener("pointermove", handlePointerMove);
      canvasElement.addEventListener("pointerleave", handlePointerLeave);
      setReady(scene.particles.length > 0);
      animationFrame = window.requestAnimationFrame(draw);

      cleanupParticles = () => {
        active = false;
        resizeObserver.disconnect();
        canvasElement.removeEventListener("pointermove", handlePointerMove);
        canvasElement.removeEventListener("pointerleave", handlePointerLeave);
        window.cancelAnimationFrame(animationFrame);
        drawingContext.clearRect(0, 0, scene.width, scene.height);
      };
    }

    function handleMotionSettingChange() {
      stopParticles();
      startParticles();
    }

    const themeObserver = new MutationObserver(() => {
      palette = readParticlePalette();
    });

    themeObserver.observe(document.documentElement, {
      attributeFilter: ["class", "style", "data-theme"],
      attributes: true,
    });
    motionQuery.addEventListener("change", handleMotionSettingChange);
    hoverQuery.addEventListener("change", handleMotionSettingChange);
    startParticles();

    return () => {
      disposed = true;
      motionQuery.removeEventListener("change", handleMotionSettingChange);
      hoverQuery.removeEventListener("change", handleMotionSettingChange);
      themeObserver.disconnect();
      stopParticles(false);
    };
  }, [text]);

  return (
    <div className="joe-name-particles" data-particles-ready={ready}>
      <h1 id={id} ref={titleRef} tabIndex={-1}>
        {text}
      </h1>
      <canvas
        aria-hidden="true"
        className="joe-name-particles-canvas"
        ref={canvasRef}
      />
    </div>
  );
}
