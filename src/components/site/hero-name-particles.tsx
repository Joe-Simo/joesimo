"use client";

import { useEffect, useRef, useState } from "react";

type HeroNameParticlesProps = {
  id: string;
  text: string;
};

type Particle = {
  baseX: number;
  baseY: number;
  color: string;
  life: number;
  scatteredColor: string;
  size: number;
  x: number;
  y: number;
};

const BASE_PARTICLE_COUNT = 7_000;
const MAX_PIXEL_RATIO = 1.5;
const MAX_PARTICLE_COUNT = 7_600;
const MIN_PARTICLE_COUNT = 2_600;
const POINTER_RADIUS = 240;
const POINTER_FORCE = 60;
const VERTICAL_CANVAS_OVERSCAN = 96;

function cssVar(name: string, fallback: string) {
  const value = window
    .getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();

  return value || fallback;
}

function canvasFontFrom(element: HTMLElement) {
  const style = window.getComputedStyle(element);

  return `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
}

function applyCanvasTextStyle(
  context: CanvasRenderingContext2D,
  element: HTMLElement,
) {
  const style = window.getComputedStyle(element);
  const letterSpacing =
    style.letterSpacing === "normal" ? "0px" : style.letterSpacing;

  context.font = canvasFontFrom(element);

  if ("letterSpacing" in context) {
    (
      context as CanvasRenderingContext2D & { letterSpacing: string }
    ).letterSpacing = letterSpacing;
  }
}

function particleTarget(width: number, height: number) {
  return Math.max(
    MIN_PARTICLE_COUNT,
    Math.min(
      MAX_PARTICLE_COUNT,
      Math.floor(
        BASE_PARTICLE_COUNT * Math.sqrt((width * height) / (1440 * 360)),
      ),
    ),
  );
}

export function HeroNameParticles({ id, text }: HeroNameParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const pointerRef = useRef({ active: false, x: 0, y: 0 });
  const touchActiveRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [motionPreferenceRevision, setMotionPreferenceRevision] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const title = titleRef.current;

    if (!canvas || !container || !title) {
      setReady(false);
      return;
    }

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (motionQuery.matches) {
      function handleReducedMotionChange(event: MediaQueryListEvent) {
        if (!event.matches) {
          setMotionPreferenceRevision((revision) => revision + 1);
        }
      }

      motionQuery.addEventListener("change", handleReducedMotionChange);

      return () => {
        motionQuery.removeEventListener("change", handleReducedMotionChange);
      };
    }

    const context = canvas.getContext("2d", { willReadFrequently: true });

    if (!context) {
      setReady(false);
      return;
    }

    const canvasElement = canvas;
    const containerElement = container;
    const drawingContext = context;
    const titleElement = title;
    let animationFrame = 0;
    let disposed = false;
    let dpr = 1;
    let height = 0;
    let particleColor = cssVar("--foreground", "#000000");
    let particles: Particle[] = [];
    let textImageData: ImageData | null = null;
    let width = 0;

    function resizeCanvas() {
      const rect = containerElement.getBoundingClientRect();

      width = Math.max(1, Math.round(rect.width));
      height = Math.max(
        1,
        Math.round(rect.height + VERTICAL_CANVAS_OVERSCAN * 2),
      );
      dpr = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
      canvasElement.width = Math.round(width * dpr);
      canvasElement.height = Math.round(height * dpr);
      canvasElement.style.width = `${width}px`;
      canvasElement.style.height = `${height}px`;
      canvasElement.style.top = `-${VERTICAL_CANVAS_OVERSCAN}px`;
      drawingContext.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function createTextImage() {
      resizeCanvas();
      drawingContext.clearRect(0, 0, width, height);
      drawingContext.fillStyle = "#ffffff";
      drawingContext.save();
      applyCanvasTextStyle(drawingContext, titleElement);
      drawingContext.textBaseline = "middle";
      const metrics = drawingContext.measureText(text);
      const textWidth = Math.max(
        metrics.width,
        metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight,
      );

      drawingContext.fillText(text, (width - textWidth) / 2, height / 2);
      drawingContext.restore();
      textImageData = drawingContext.getImageData(
        0,
        0,
        canvasElement.width,
        canvasElement.height,
      );
      drawingContext.clearRect(0, 0, width, height);
    }

    function createParticle() {
      if (!textImageData) {
        return null;
      }

      const data = textImageData.data;

      for (let attempt = 0; attempt < 100; attempt += 1) {
        const imageX = Math.floor(Math.random() * textImageData.width);
        const imageY = Math.floor(Math.random() * textImageData.height);
        const alpha = data[(imageY * textImageData.width + imageX) * 4 + 3];

        if (alpha > 128) {
          const x = imageX / dpr;
          const y = imageY / dpr;

          return {
            baseX: x,
            baseY: y,
            color: particleColor,
            life: Math.random() * 100 + 50,
            scatteredColor: particleColor,
            size: Math.random() + 0.5,
            x,
            y,
          } satisfies Particle;
        }
      }

      return null;
    }

    function createInitialParticles() {
      particles = [];
      const targetParticleCount = particleTarget(width, height);

      for (let index = 0; index < targetParticleCount; index += 1) {
        const particle = createParticle();

        if (particle) {
          particles.push(particle);
        }
      }

      setReady(particles.length > 0);
    }

    function draw() {
      drawingContext.clearRect(0, 0, width, height);

      const { active, x: pointerX, y: pointerY } = pointerRef.current;
      const shouldScatter =
        active && (touchActiveRef.current || !("ontouchstart" in window));

      for (let index = 0; index < particles.length; index += 1) {
        const particle = particles[index];

        if (!particle) {
          continue;
        }

        const dx = pointerX - particle.x;
        const dy = pointerY - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (shouldScatter && distance < POINTER_RADIUS) {
          const force = (POINTER_RADIUS - distance) / POINTER_RADIUS;
          const angle = Math.atan2(dy, dx);

          particle.x = particle.baseX - Math.cos(angle) * force * POINTER_FORCE;
          particle.y = particle.baseY - Math.sin(angle) * force * POINTER_FORCE;
          drawingContext.fillStyle = particle.scatteredColor;
        } else {
          particle.x += (particle.baseX - particle.x) * 0.1;
          particle.y += (particle.baseY - particle.y) * 0.1;
          drawingContext.fillStyle = particle.color;
        }

        drawingContext.fillRect(
          particle.x,
          particle.y,
          particle.size,
          particle.size,
        );

        particle.life -= 1;

        if (particle.life <= 0) {
          const replacement = createParticle();

          if (replacement) {
            particles[index] = replacement;
          } else {
            particles.splice(index, 1);
            index -= 1;
          }
        }
      }

      const targetParticleCount = particleTarget(width, height);

      while (particles.length < targetParticleCount) {
        const particle = createParticle();

        if (!particle) {
          break;
        }

        particles.push(particle);
      }

      animationFrame = window.requestAnimationFrame(draw);
    }

    function stop(updateReady = true) {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      drawingContext.clearRect(0, 0, width, height);
      particles = [];
      textImageData = null;

      if (updateReady && !disposed) {
        setReady(false);
      }
    }

    function start() {
      if (motionQuery.matches) {
        stop();
        return;
      }

      stop(false);
      particleColor = cssVar("--foreground", "#000000");
      createTextImage();
      createInitialParticles();
      draw();
    }

    function pointerPosition(event: MouseEvent | Touch) {
      const rect = canvasElement.getBoundingClientRect();

      pointerRef.current = {
        active: true,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    }

    function handleMouseMove(event: MouseEvent) {
      pointerPosition(event);
    }

    function handleMouseLeave() {
      if (!("ontouchstart" in window)) {
        pointerRef.current = { active: false, x: 0, y: 0 };
      }
    }

    function handleTouchStart(event: TouchEvent) {
      touchActiveRef.current = true;

      if (event.touches[0]) {
        pointerPosition(event.touches[0]);
      }
    }

    function handleTouchMove(event: TouchEvent) {
      if (event.touches[0]) {
        pointerPosition(event.touches[0]);
      }
    }

    function handleTouchEnd() {
      touchActiveRef.current = false;
      pointerRef.current = { active: false, x: 0, y: 0 };
    }

    function handleMotionChange() {
      start();
    }

    const resizeObserver = new ResizeObserver(start);
    const themeObserver = new MutationObserver(start);

    resizeObserver.observe(containerElement);
    themeObserver.observe(document.documentElement, {
      attributeFilter: ["class", "data-theme", "style"],
      attributes: true,
    });
    window.addEventListener("resize", start);
    motionQuery.addEventListener("change", handleMotionChange);
    containerElement.addEventListener("mousemove", handleMouseMove);
    containerElement.addEventListener("mouseleave", handleMouseLeave);
    containerElement.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    containerElement.addEventListener("touchmove", handleTouchMove, {
      passive: true,
    });
    containerElement.addEventListener("touchend", handleTouchEnd);
    void document.fonts?.ready.then(() => {
      if (!disposed) {
        start();
      }
    });
    start();

    return () => {
      disposed = true;
      resizeObserver.disconnect();
      themeObserver.disconnect();
      window.removeEventListener("resize", start);
      motionQuery.removeEventListener("change", handleMotionChange);
      containerElement.removeEventListener("mousemove", handleMouseMove);
      containerElement.removeEventListener("mouseleave", handleMouseLeave);
      containerElement.removeEventListener("touchstart", handleTouchStart);
      containerElement.removeEventListener("touchmove", handleTouchMove);
      containerElement.removeEventListener("touchend", handleTouchEnd);
      stop(false);
    };
  }, [motionPreferenceRevision, text]);

  return (
    <div
      className="joe-name-particles"
      data-particles-ready={ready ? "true" : "false"}
      ref={containerRef}
    >
      <canvas
        aria-hidden="true"
        className="joe-name-particles-canvas"
        ref={canvasRef}
      />
      <h1 id={id} ref={titleRef}>
        {text}
      </h1>
    </div>
  );
}
