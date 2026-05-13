"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import * as THREE from "three";

import type { SceneMode } from "@/lib/site-data";

export type WebGLSignalNode = {
  depth?: number;
  id: string;
  tension?: number;
  x: number;
  y: number;
};

export type WebGLSignalFieldProps = {
  activeNodeId?: string;
  activeRouteProgress?: number;
  className?: string;
  nodes?: readonly WebGLSignalNode[];
  originNodeId?: string;
  sceneMode?: SceneMode;
  style?: CSSProperties;
};

type ClipPoint = {
  x: number;
  y: number;
};

const DEFAULT_STYLE: CSSProperties = {
  position: "absolute",
  inset: 0,
  zIndex: 0,
  overflow: "hidden",
  pointerEvents: "none",
};

const CANVAS_STYLE: CSSProperties = {
  display: "block",
  width: "100%",
  height: "100%",
};

const SIGNAL_POINT_COUNT = 176;
const ROUTE_SEGMENTS = 22;
const MAX_DEVICE_PIXEL_RATIO = 2;

const SCENE_PROFILES: Record<
  SceneMode,
  {
    energy: number;
    routeOpacity: number;
    activeRouteOpacity: number;
  }
> = {
  origin: {
    energy: 0.62,
    routeOpacity: 0.78,
    activeRouteOpacity: 0.82,
  },
  method: {
    energy: 0.92,
    routeOpacity: 1,
    activeRouteOpacity: 1,
  },
  work: {
    energy: 1.18,
    routeOpacity: 1.08,
    activeRouteOpacity: 1.14,
  },
  trail: {
    energy: 0.72,
    routeOpacity: 0.84,
    activeRouteOpacity: 0.9,
  },
  contact: {
    energy: 0.84,
    routeOpacity: 0.92,
    activeRouteOpacity: 1.04,
  },
};

const FIELD_VERTEX_SHADER = `
precision highp float;

uniform float uPixelRatio;
uniform float uPointerStrength;
uniform float uSceneEnergy;
uniform float uTime;
uniform vec2 uPointer;

attribute float signalPhase;
attribute float signalScale;

varying float vPulse;

void main() {
  vec3 signalPosition = position;
  float pulse = 0.5 + 0.5 * sin(uTime * 0.8 + signalPhase * 6.28318530718);
  vec2 pointerDelta = signalPosition.xy - uPointer;
  float pointerDistance = max(length(pointerDelta), 0.001);
  float pointerLift = (1.0 - smoothstep(0.0, 0.58, pointerDistance)) * uPointerStrength;

  signalPosition.xy += (pointerDelta / pointerDistance) * pointerLift * 0.035;
  signalPosition.x += sin(uTime * 0.13 + signalPhase * 9.0) * 0.006 * uSceneEnergy;
  signalPosition.y += cos(uTime * 0.11 + signalPhase * 7.0) * 0.005 * uSceneEnergy;

  vPulse = pulse;
  gl_Position = vec4(signalPosition, 1.0);
  gl_PointSize = (2.0 + pulse * 1.4 + pointerLift * 4.0) * signalScale * uPixelRatio * (0.84 + uSceneEnergy * 0.16);
}
`;

const FIELD_FRAGMENT_SHADER = `
precision highp float;

uniform vec3 uAccent;
uniform vec3 uInk;
uniform float uSceneEnergy;

varying float vPulse;

void main() {
  vec2 point = gl_PointCoord - vec2(0.5);
  float distanceFromCenter = length(point);
  float edge = 1.0 - smoothstep(0.16, 0.5, distanceFromCenter);
  float alpha = edge * (0.035 + vPulse * 0.07) * uSceneEnergy;
  vec3 color = mix(uInk, uAccent, 0.24 + vPulse * 0.42);

  gl_FragColor = vec4(color, alpha);
}
`;

function toClipPoint(node: WebGLSignalNode): ClipPoint {
  return {
    x: (node.x / 100) * 2 - 1,
    y: 1 - (node.y / 100) * 2,
  };
}

function cubicClipPoint(
  source: ClipPoint,
  target: ClipPoint,
  progress: number,
  tension = 0.5,
  depth = 0.5,
) {
  const pull = 0.28 + tension * 0.24;
  const deltaX = target.x - source.x;
  const firstControlX = source.x + deltaX * pull;
  const secondControlX = target.x - deltaX * pull;
  const depthOffset = (depth - 0.5) * 0.16;
  const inverse = 1 - progress;

  return {
    x:
      inverse ** 3 * source.x +
      3 * inverse ** 2 * progress * firstControlX +
      3 * inverse * progress ** 2 * secondControlX +
      progress ** 3 * target.x,
    y:
      inverse ** 3 * source.y +
      3 * inverse ** 2 * progress * (source.y + depthOffset) +
      3 * inverse * progress ** 2 * (target.y - depthOffset) +
      progress ** 3 * target.y,
  };
}

function getOriginNode(
  nodes: readonly WebGLSignalNode[],
  originNodeId?: string,
) {
  return (
    nodes.find((node) => node.id === originNodeId) ??
    nodes.find((node) => node.id === "joe") ??
    nodes[0]
  );
}

function createFieldGeometry() {
  const positions = new Float32Array(SIGNAL_POINT_COUNT * 3);
  const phases = new Float32Array(SIGNAL_POINT_COUNT);
  const scales = new Float32Array(SIGNAL_POINT_COUNT);

  for (let index = 0; index < SIGNAL_POINT_COUNT; index += 1) {
    const xSeed = ((index * 37) % 101) / 100;
    const ySeed = ((index * 53) % 103) / 102;
    const edgeFade = Math.min(xSeed, 1 - xSeed, ySeed, 1 - ySeed);
    const offset = index * 3;

    positions[offset] = xSeed * 2 - 1;
    positions[offset + 1] = ySeed * 2 - 1;
    positions[offset + 2] = 0;
    phases[index] = (index * 0.61803398875) % 1;
    scales[index] = 0.58 + edgeFade * 1.1 + ((index * 29) % 67) / 128;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("signalPhase", new THREE.BufferAttribute(phases, 1));
  geometry.setAttribute("signalScale", new THREE.BufferAttribute(scales, 1));

  return geometry;
}

function createRouteGeometry(
  nodes: readonly WebGLSignalNode[],
  originNodeId?: string,
  targetNodeId?: string,
) {
  const originNode = getOriginNode(nodes, originNodeId);

  if (!originNode) {
    return new THREE.BufferGeometry().setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(0), 3),
    );
  }

  const targets = nodes.filter((node) => {
    if (node.id === originNode.id) {
      return false;
    }

    return targetNodeId ? node.id === targetNodeId : true;
  });
  const positions = new Float32Array(targets.length * ROUTE_SEGMENTS * 2 * 3);
  const source = toClipPoint(originNode);
  let offset = 0;

  targets.forEach((targetNode) => {
    const target = toClipPoint(targetNode);
    let previous = cubicClipPoint(
      source,
      target,
      0,
      targetNode.tension,
      targetNode.depth,
    );

    for (let segment = 1; segment <= ROUTE_SEGMENTS; segment += 1) {
      const current = cubicClipPoint(
        source,
        target,
        segment / ROUTE_SEGMENTS,
        targetNode.tension,
        targetNode.depth,
      );

      positions[offset] = previous.x;
      positions[offset + 1] = previous.y;
      positions[offset + 2] = 0;
      positions[offset + 3] = current.x;
      positions[offset + 4] = current.y;
      positions[offset + 5] = 0;
      offset += 6;
      previous = current;
    }
  });

  return new THREE.BufferGeometry().setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3),
  );
}

function isDarkTheme() {
  const root = document.documentElement;
  const colorScheme = getComputedStyle(root).colorScheme;

  return root.classList.contains("dark") || colorScheme.includes("dark");
}

function motionMediaQuery() {
  return window.matchMedia("(prefers-reduced-motion: reduce)");
}

function clampProgress(value: number | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 1;
  }

  return Math.min(1, Math.max(0, value));
}

export function WebGLSignalField({
  activeNodeId,
  activeRouteProgress,
  className,
  nodes = [],
  originNodeId,
  sceneMode = "method",
  style,
}: WebGLSignalFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const activeNodeIdRef = useRef(activeNodeId);
  const activeRouteProgressRef = useRef(activeRouteProgress);
  const sceneModeRef = useRef(sceneMode);
  const applyRouteProgressRef = useRef<(() => void) | null>(null);
  const refreshActiveRouteRef = useRef<(() => void) | null>(null);
  const applySceneModeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    activeNodeIdRef.current = activeNodeId;
    refreshActiveRouteRef.current?.();
  }, [activeNodeId]);

  useEffect(() => {
    activeRouteProgressRef.current = activeRouteProgress;
    applyRouteProgressRef.current?.();
  }, [activeRouteProgress]);

  useEffect(() => {
    sceneModeRef.current = sceneMode;
    applySceneModeRef.current?.();
  }, [sceneMode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;

    if (!canvas || !host) {
      return;
    }

    const motionQuery = motionMediaQuery();

    let renderer: THREE.WebGLRenderer;

    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        canvas,
        powerPreference: "low-power",
      });
    } catch {
      host.dataset.webglReady = "false";
      return;
    }

    host.dataset.webglReady = "true";

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const hostElement: HTMLDivElement = host;
    const colorQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const resolution = new THREE.Vector2(1, 1);
    const pointer = new THREE.Vector2(4, 4);
    const accentColor = new THREE.Color(0x09090b);
    const inkColor = new THREE.Color(0x000000);
    const pixelRatioUniform = { value: 1 };
    const pointerStrengthUniform = { value: 0 };
    const sceneEnergyUniform = { value: SCENE_PROFILES[sceneModeRef.current].energy };
    const timeUniform = { value: 0 };
    const fieldGeometry = createFieldGeometry();
    const routeGeometry = createRouteGeometry(nodes, originNodeId);
    const fieldMaterial = new THREE.ShaderMaterial({
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
      fragmentShader: FIELD_FRAGMENT_SHADER,
      transparent: true,
      uniforms: {
        uAccent: { value: accentColor },
        uInk: { value: inkColor },
        uPixelRatio: pixelRatioUniform,
        uPointer: { value: pointer },
        uPointerStrength: pointerStrengthUniform,
        uResolution: { value: resolution },
        uSceneEnergy: sceneEnergyUniform,
        uTime: timeUniform,
      },
      vertexShader: FIELD_VERTEX_SHADER,
    });
    const routeMaterial = new THREE.LineBasicMaterial({
      color: 0x000000,
      depthTest: false,
      depthWrite: false,
      opacity: 0.06,
      transparent: true,
    });
    const activeRouteMaterial = new THREE.LineBasicMaterial({
      color: 0x0076d6,
      depthTest: false,
      depthWrite: false,
      opacity: 0.18,
      transparent: true,
    });
    const routes = new THREE.LineSegments(routeGeometry, routeMaterial);
    const points = new THREE.Points(fieldGeometry, fieldMaterial);

    let activeRoute: THREE.LineSegments | null = null;
    let animationFrame = 0;
    let animateUntil = 0;
    let isDocumentVisible = document.visibilityState === "visible";
    let isHostVisible = true;
    let reducedMotion: boolean = motionQuery.matches;

    routes.renderOrder = 1;
    points.renderOrder = 2;
    scene.add(routes, points);
    renderer.setClearColor(0x000000, 0);

    function shouldAnimate() {
      return (
        !reducedMotion &&
        isDocumentVisible &&
        isHostVisible &&
        performance.now() < animateUntil
      );
    }

    function cancelAnimation() {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    }

    function render(time = performance.now()) {
      animationFrame = 0;
      timeUniform.value = reducedMotion ? 0 : time / 1000;
      renderer.render(scene, camera);

      if (shouldAnimate()) {
        animationFrame = window.requestAnimationFrame(render);
      }
    }

    function renderNow() {
      cancelAnimation();
      render();
    }

    function renderBurst(duration = 420) {
      animateUntil = Math.max(animateUntil, performance.now() + duration);

      if (!animationFrame) {
        animationFrame = window.requestAnimationFrame(render);
      }
    }

    function resize() {
      const rect = hostElement.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(rect.height));
      const pixelRatio = Math.min(
        window.devicePixelRatio || 1,
        MAX_DEVICE_PIXEL_RATIO,
      );

      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(width, height, false);
      resolution.set(width, height);
      pixelRatioUniform.value = pixelRatio;
      renderNow();
      renderBurst(720);
    }

    function applySceneStyle() {
      const dark = isDarkTheme();
      const ink = dark ? 0xffffff : 0x000000;
      const computedStyle = getComputedStyle(document.documentElement);
      const accent = computedStyle.getPropertyValue("--signal-accent").trim();
      const profile = SCENE_PROFILES[sceneModeRef.current];

      hostElement.dataset.sceneMode = sceneModeRef.current;
      sceneEnergyUniform.value = profile.energy;
      inkColor.setHex(ink);
      accentColor.setStyle(accent || (dark ? "#66d9ff" : "#0057ff"));
      routeMaterial.color.setHex(ink);
      routeMaterial.opacity = (dark ? 0.055 : 0.06) * profile.routeOpacity;
      activeRouteMaterial.color.copy(accentColor);
      activeRouteMaterial.opacity =
        (dark ? 0.34 : 0.3) * profile.activeRouteOpacity;
      renderNow();
      renderBurst(520);
    }

    function clearPointer() {
      pointer.set(4, 4);
      pointerStrengthUniform.value = 0;
      renderNow();
    }

    function handlePointerMove(event: PointerEvent) {
      if (event.pointerType && event.pointerType !== "mouse") {
        return;
      }

      const rect = hostElement.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) {
        clearPointer();
        return;
      }

      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

      if (!inside) {
        if (pointerStrengthUniform.value !== 0) {
          clearPointer();
        }

        return;
      }

      pointer.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        1 - ((event.clientY - rect.top) / rect.height) * 2,
      );
      pointerStrengthUniform.value = 1;
      renderBurst(180);
    }

    function handleMotionChange() {
      reducedMotion = motionQuery.matches;
      applyRouteProgressRef.current?.();
      renderNow();
    }

    function handleVisibilityChange() {
      isDocumentVisible = document.visibilityState === "visible";
      renderNow();
      renderBurst(420);
    }

    function handleContextLost(event: Event) {
      event.preventDefault();
      hostElement.dataset.webglReady = "false";
      cancelAnimation();
    }

    function handleContextRestored() {
      hostElement.dataset.webglReady = "true";
      resize();
      applySceneStyle();
      refreshActiveRoute();
      renderNow();
    }

    function applyActiveRouteProgress() {
      if (!activeRoute) {
        return;
      }

      const positionAttribute = activeRoute.geometry.getAttribute("position");
      const vertexCount = positionAttribute?.count ?? 0;

      if (vertexCount === 0) {
        activeRoute.geometry.setDrawRange(0, 0);
        return;
      }

      const progress = clampProgress(activeRouteProgressRef.current);
      const drawCount = reducedMotion
        ? vertexCount
        : Math.max(2, Math.ceil(vertexCount * progress));

      activeRoute.geometry.setDrawRange(0, drawCount);
      renderNow();
      renderBurst(420);
    }

    function refreshActiveRoute() {
      const nextGeometry = createRouteGeometry(
        nodes,
        originNodeId,
        activeNodeIdRef.current,
      );

      if (activeRoute) {
        scene.remove(activeRoute);
        activeRoute.geometry.dispose();
      }

      activeRoute = new THREE.LineSegments(nextGeometry, activeRouteMaterial);
      activeRoute.renderOrder = 1;
      scene.add(activeRoute);
      applyActiveRouteProgress();
    }

    applyRouteProgressRef.current = applyActiveRouteProgress;
    refreshActiveRouteRef.current = refreshActiveRoute;
    applySceneModeRef.current = applySceneStyle;

    const resizeObserver = new ResizeObserver(resize);
    const themeObserver = new MutationObserver(applySceneStyle);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isHostVisible = Boolean(entry?.isIntersecting);
      renderNow();
    });

    resizeObserver.observe(hostElement);
    intersectionObserver.observe(hostElement);
    themeObserver.observe(document.documentElement, {
      attributeFilter: ["class", "style"],
      attributes: true,
    });
    motionQuery.addEventListener("change", handleMotionChange);
    colorQuery.addEventListener("change", applySceneStyle);
    hostElement.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    document.addEventListener("visibilitychange", handleVisibilityChange);
    canvas.addEventListener("webglcontextlost", handleContextLost);
    canvas.addEventListener("webglcontextrestored", handleContextRestored);
    window.addEventListener("blur", clearPointer);
    window.addEventListener("resize", resize);

    resize();
    applySceneStyle();
    refreshActiveRoute();
    renderBurst(1100);

    return () => {
      applyRouteProgressRef.current = null;
      refreshActiveRouteRef.current = null;
      applySceneModeRef.current = null;
      cancelAnimation();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      themeObserver.disconnect();
      motionQuery.removeEventListener("change", handleMotionChange);
      colorQuery.removeEventListener("change", applySceneStyle);
      hostElement.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      canvas.removeEventListener("webglcontextrestored", handleContextRestored);
      window.removeEventListener("blur", clearPointer);
      window.removeEventListener("resize", resize);
      scene.remove(routes, points);
      routes.geometry.dispose();
      points.geometry.dispose();
      routeMaterial.dispose();
      activeRouteMaterial.dispose();
      fieldMaterial.dispose();

      if (activeRoute) {
        scene.remove(activeRoute);
        activeRoute.geometry.dispose();
      }

      renderer.dispose();
      delete hostElement.dataset.webglReady;
      delete hostElement.dataset.sceneMode;
    };
  }, [nodes, originNodeId]);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className={className}
      style={{ ...DEFAULT_STYLE, ...style }}
    >
      <div className="site-webgl-static-field" />
      <canvas ref={canvasRef} style={CANVAS_STYLE} />
    </div>
  );
}
