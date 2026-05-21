"use client";

import Image from "next/image";
import { Dialog } from "@base-ui/react/dialog";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import * as THREE from "three";

import { SiteIcon } from "@/components/site/site-icons";
import type {
  PublicEvidenceAsset,
  PublicProjectCaseStudy,
  PublicTrailSection,
  PublicTrailSectionId,
  SocialChannel,
} from "@/lib/site-data";

export type PublicTrailNote = {
  body: string;
  code: string;
  source: string;
  title: string;
};

type PublicTrailRuntimeProps = {
  notes: PublicTrailNote[];
  projects: PublicProjectCaseStudy[];
  sections: readonly PublicTrailSection[];
  socialChannels: SocialChannel[];
};

type PublicTrailCanvasProps = {
  activeSectionId: PublicTrailSectionId;
  sections: readonly PublicTrailSection[];
};

const MAX_PIXEL_RATIO = 2;
const POINTER_FALLOFF = 1.45;

function isImageAsset(asset: PublicEvidenceAsset | undefined): asset is PublicEvidenceAsset {
  return Boolean(asset && !asset.media.src.endsWith(".webm"));
}

function getPreferredImageAsset(project: PublicProjectCaseStudy) {
  const requestedIds = project.homepageFeature?.mediaAssetIds ?? [];
  const requestedAssets = requestedIds
    .map((assetId) => project.assets.find((asset) => asset.id === assetId))
    .filter(isImageAsset);

  return requestedAssets[0] ?? project.assets.find(isImageAsset);
}

function getPreferredVideo(project: PublicProjectCaseStudy) {
  return project.miniWorld?.media.find((media) => media.kind === "video");
}

function getVideoType(src: string) {
  return src.endsWith(".mp4") ? "video/mp4" : "video/webm";
}

function useDialogFocusGuard(
  open: boolean,
  initialFocusRef: RefObject<HTMLElement | null>,
  identity: string,
) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    let disposed = false;

    const moveFocusIntoDialog = () => {
      const dialog = dialogRef.current;
      const activeElement = document.activeElement;

      if (
        disposed ||
        !dialog ||
        (activeElement instanceof Node && dialog.contains(activeElement))
      ) {
        return;
      }

      (initialFocusRef.current ?? dialog).focus({ preventScroll: true });
    };

    const animationFrame = window.requestAnimationFrame(moveFocusIntoDialog);
    const timeout = window.setTimeout(moveFocusIntoDialog, 40);

    function handleFocusIn(event: FocusEvent) {
      const dialog = dialogRef.current;
      const target = event.target;

      if (!dialog || !(target instanceof Node) || dialog.contains(target)) {
        return;
      }

      window.requestAnimationFrame(moveFocusIntoDialog);
    }

    function handleTabKey(event: KeyboardEvent) {
      if (event.key !== "Tab") {
        return;
      }

      const dialog = dialogRef.current;

      if (!dialog) {
        return;
      }

      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          [
            "a[href]",
            "button:not([disabled])",
            "textarea:not([disabled])",
            "input:not([disabled])",
            "select:not([disabled])",
            "[tabindex]:not([tabindex='-1'])",
          ].join(","),
        ),
      ).filter(
        (element) =>
          !element.hasAttribute("disabled") &&
          element.getAttribute("aria-hidden") !== "true" &&
          element.offsetParent !== null,
      );

      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus({ preventScroll: true });
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey && activeElement === first) {
        event.preventDefault();
        last?.focus({ preventScroll: true });
        return;
      }

      if (!event.shiftKey && activeElement === last) {
        event.preventDefault();
        first?.focus({ preventScroll: true });
      }
    }

    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("keydown", handleTabKey, true);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(timeout);
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("keydown", handleTabKey, true);
    };
  }, [identity, initialFocusRef, open]);

  return dialogRef;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function cssColor(name: string, fallback: string) {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();

  return value || fallback;
}

function buildCurve(sections: readonly PublicTrailSection[]) {
  const points = sections.map(
    (section) =>
      new THREE.Vector3(section.point.x, section.point.y, section.point.z),
  );

  return new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.42);
}

function createParticleField(curve: THREE.CatmullRomCurve3, count: number) {
  const positions = new Float32Array(count * 3);
  const basePositions = new Float32Array(count * 3);
  const vortexCount = Math.floor(count * 0.56);

  for (let index = 0; index < count; index += 1) {
    const shell = ((index * 37) % 101) / 100;
    const phase = ((index * 53) % 97) / 97;
    const offset = index * 3;

    if (index < vortexCount) {
      const orbit = index / Math.max(vortexCount - 1, 1);
      const angle = phase * Math.PI * 2 + orbit * Math.PI * 5.4;
      const radius = 0.28 + orbit * 2.35 + shell * 0.32;
      const compression = 0.46 + Math.sin(orbit * Math.PI) * 0.12;

      basePositions[offset] = 0.78 + Math.cos(angle) * radius;
      basePositions[offset + 1] =
        0.18 + Math.sin(angle) * radius * compression + Math.sin(index) * 0.035;
      basePositions[offset + 2] = 1.25 - orbit * 1.9 + (shell - 0.5) * 0.8;
    } else {
      const trailBias = index / count;
      const sample = curve.getPoint((index * 0.61803398875) % 1);
      const spread = 0.2 + shell * 1.15;
      const angle = phase * Math.PI * 2;

      basePositions[offset] = sample.x + Math.cos(angle) * spread;
      basePositions[offset + 1] =
        sample.y + Math.sin(angle) * spread * 0.46 + Math.sin(index) * 0.08;
      basePositions[offset + 2] =
        sample.z + (shell - 0.5) * 1.4 + (trailBias - 0.5) * 0.8;
    }

    positions[offset] = basePositions[offset];
    positions[offset + 1] = basePositions[offset + 1];
    positions[offset + 2] = basePositions[offset + 2];
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  return { basePositions, geometry, positions };
}

function PublicTrailCanvas({
  activeSectionId,
  sections,
}: PublicTrailCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const activeSectionIdRef = useRef(activeSectionId);

  useEffect(() => {
    activeSectionIdRef.current = activeSectionId;
  }, [activeSectionId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;

    if (!canvas || !host) {
      return;
    }

    const hostElement = host;
    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const curve = buildCurve(sections);
    const contextAttributes: WebGLContextAttributes = {
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
      preserveDrawingBuffer: true,
    };
    const rendererContext =
      canvas.getContext("webgl2", contextAttributes) ??
      canvas.getContext("webgl", contextAttributes);
    let renderer: THREE.WebGLRenderer;

    if (!rendererContext) {
      hostElement.dataset.webglReady = "false";
      return;
    }

    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        canvas,
        context: rendererContext,
        powerPreference: "low-power",
        preserveDrawingBuffer: true,
      });
    } catch {
      hostElement.dataset.webglReady = "false";
      return;
    }
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 30);
    const pointer = new THREE.Vector2(8, 8);
    const particleCount = window.innerWidth < 760 ? 300 : 680;
    const { basePositions, geometry, positions } = createParticleField(
      curve,
      particleCount,
    );
    const routeGeometry = new THREE.BufferGeometry().setFromPoints(
      curve.getPoints(180),
    );
    const particleMaterial = new THREE.PointsMaterial({
      blending: THREE.AdditiveBlending,
      color: 0xffffff,
      depthWrite: false,
      opacity: 0.56,
      size: 0.018,
      sizeAttenuation: true,
      transparent: true,
    });
    const routeMaterial = new THREE.LineBasicMaterial({
      blending: THREE.AdditiveBlending,
      color: 0xffffff,
      depthWrite: false,
      opacity: 0.18,
      transparent: true,
    });
    const nodeGeometry = new THREE.SphereGeometry(0.032, 14, 8);
    const nodeMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
    });
    const points = new THREE.Points(geometry, particleMaterial);
    const route = new THREE.Line(routeGeometry, routeMaterial);
    const nodes = sections.map((section) => {
      const mesh = new THREE.Mesh(nodeGeometry, nodeMaterial.clone());
      mesh.position.set(section.point.x, section.point.y, section.point.z);
      scene.add(mesh);
      return mesh;
    });

    let animationFrame = 0;
    let isDocumentVisible = document.visibilityState === "visible";
    let reducedMotion = reducedMotionQuery.matches;
    let scrollProgress = 0;
    let themeFrame = 0;
    let particleBaseOpacity = 0.32;
    let routeBaseOpacity = 0.14;
    let nodeBaseOpacity = 0.78;

    hostElement.dataset.webglReady = "true";
    renderer.setClearColor(0x000000, 0);
    scene.add(route, points);

    function applyTheme() {
      const isDark =
        document.documentElement.classList.contains("dark") ||
        getComputedStyle(document.documentElement).colorScheme.includes("dark");
      const foreground = new THREE.Color(isDark ? 0xffffff : 0x09090b);
      const accent = new THREE.Color(
        cssColor("--signal-accent", isDark ? "#7ab8ff" : "#0057ff"),
      );

      particleMaterial.color.copy(foreground);
      routeMaterial.color.copy(accent);
      particleBaseOpacity = isDark ? 0.46 : 0.22;
      routeBaseOpacity = isDark ? 0.16 : 0.07;
      nodeBaseOpacity = isDark ? 0.88 : 0.64;
      particleMaterial.opacity = particleBaseOpacity;
      routeMaterial.opacity = routeBaseOpacity;
      nodes.forEach((node) => {
        const material = node.material as THREE.MeshBasicMaterial;
        material.color.copy(accent);
        material.opacity = nodeBaseOpacity;
      });
    }

    function resize() {
      const { innerHeight, innerWidth } = window;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);

      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(innerWidth, innerHeight, false);
      camera.aspect = innerWidth / Math.max(innerHeight, 1);
      camera.updateProjectionMatrix();
    }

    function updateScrollProgress() {
      const scrollMax = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1,
      );

      scrollProgress = Math.min(1, Math.max(0, window.scrollY / scrollMax));
      document.documentElement.style.setProperty(
        "--trail-scroll-progress",
        scrollProgress.toFixed(4),
      );
    }

    function updatePointer(event: PointerEvent) {
      if (event.pointerType && event.pointerType !== "mouse") {
        return;
      }

      pointer.set(
        (event.clientX / Math.max(window.innerWidth, 1)) * 2 - 1,
        1 - (event.clientY / Math.max(window.innerHeight, 1)) * 2,
      );
    }

    function clearPointer() {
      pointer.set(8, 8);
    }

    function render(time = 0) {
      animationFrame = 0;
      updateScrollProgress();

      const activeIndex = Math.max(
        0,
        sections.findIndex((section) => section.id === activeSectionIdRef.current),
      );
      const activeSection = activeSectionIdRef.current;
      const sectionIntensity =
        activeSection === "work" ? 0.28 : activeSection === "joe" ? 1 : 0.56;
      const cameraPoint = curve.getPoint(scrollProgress);
      const target = curve.getPoint(Math.min(1, scrollProgress + 0.08));
      const cameraDepth = 6.05 - scrollProgress * 1.28;

      camera.position.lerp(
        new THREE.Vector3(
          cameraPoint.x * 0.2,
          cameraPoint.y * 0.16,
          cameraDepth + cameraPoint.z * 0.1,
        ),
        reducedMotion ? 1 : 0.08,
      );
      camera.lookAt(target.x * 0.18, target.y * 0.12, target.z * 0.1);

      const positionAttribute = geometry.getAttribute(
        "position",
      ) as THREE.BufferAttribute;

      for (let index = 0; index < particleCount; index += 1) {
        const offset = index * 3;
        const baseX = basePositions[offset];
        const baseY = basePositions[offset + 1];
        const baseZ = basePositions[offset + 2];
        const pulse = reducedMotion
          ? 0
          : Math.sin(time * 0.00032 + index * 0.21) * 0.025;
        const pointerX = pointer.x * 2.6;
        const pointerY = pointer.y * 1.55;
        const dx = baseX - pointerX;
        const dy = baseY - pointerY;
        const distance = Math.max(Math.sqrt(dx * dx + dy * dy), 0.001);
        const lift =
          Math.max(0, 1 - distance / POINTER_FALLOFF) *
          (reducedMotion ? 0 : 0.16);

        positions[offset] = baseX + (dx / distance) * lift + pulse;
        positions[offset + 1] = baseY + (dy / distance) * lift - pulse * 0.45;
        positions[offset + 2] = baseZ + pulse;
      }

      positionAttribute.needsUpdate = true;
      particleMaterial.opacity +=
        (particleBaseOpacity * sectionIntensity - particleMaterial.opacity) *
        0.1;
      routeMaterial.opacity +=
        (routeBaseOpacity * (activeSection === "work" ? 0.22 : sectionIntensity) -
          routeMaterial.opacity) *
        0.12;

      nodes.forEach((node, index) => {
        const material = node.material as THREE.MeshBasicMaterial;
        const active = index === activeIndex;
        const scale = active ? 1.42 : 1;

        node.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.16);
        material.opacity +=
          ((active ? nodeBaseOpacity : nodeBaseOpacity * 0.42) -
            material.opacity) *
          0.14;
      });

      route.rotation.z = reducedMotion ? 0 : Math.sin(time * 0.00008) * 0.025;
      points.rotation.z = reducedMotion ? 0 : Math.sin(time * 0.00006) * 0.018;
      renderer.render(scene, camera);

      if (!reducedMotion && isDocumentVisible) {
        animationFrame = window.requestAnimationFrame(render);
      }
    }

    function renderOnce() {
      window.cancelAnimationFrame(animationFrame);
      render(performance.now());
    }

    function scheduleTheme() {
      window.cancelAnimationFrame(themeFrame);
      themeFrame = window.requestAnimationFrame(() => {
        applyTheme();
        renderOnce();
      });
    }

    function handleReducedMotionChange() {
      reducedMotion = reducedMotionQuery.matches;
      renderOnce();

      if (!reducedMotion && !animationFrame) {
        animationFrame = window.requestAnimationFrame(render);
      }
    }

    function handleVisibilityChange() {
      isDocumentVisible = document.visibilityState === "visible";

      if (isDocumentVisible && !reducedMotion && !animationFrame) {
        animationFrame = window.requestAnimationFrame(render);
      }
    }

    function handleContextLost(event: Event) {
      event.preventDefault();
      hostElement.dataset.webglReady = "false";
      window.cancelAnimationFrame(animationFrame);
    }

    const themeObserver = new MutationObserver(scheduleTheme);

    resize();
    applyTheme();
    updateScrollProgress();
    renderOnce();

    if (!reducedMotion) {
      animationFrame = window.requestAnimationFrame(render);
    }

    themeObserver.observe(document.documentElement, {
      attributeFilter: ["class"],
      attributes: true,
    });
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", updateScrollProgress, { passive: true });
    window.addEventListener("pointermove", updatePointer, { passive: true });
    window.addEventListener("pointerleave", clearPointer);
    window.addEventListener("blur", clearPointer);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    reducedMotionQuery.addEventListener("change", handleReducedMotionChange);
    canvas.addEventListener("webglcontextlost", handleContextLost);

    return () => {
      hostElement.dataset.webglReady = "false";
      window.cancelAnimationFrame(animationFrame);
      window.cancelAnimationFrame(themeFrame);
      themeObserver.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", updateScrollProgress);
      window.removeEventListener("pointermove", updatePointer);
      window.removeEventListener("pointerleave", clearPointer);
      window.removeEventListener("blur", clearPointer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      reducedMotionQuery.removeEventListener("change", handleReducedMotionChange);
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      nodes.forEach((node) => {
        const material = node.material as THREE.Material;
        scene.remove(node);
        material.dispose();
      });
      scene.remove(route, points);
      nodeGeometry.dispose();
      geometry.dispose();
      routeGeometry.dispose();
      particleMaterial.dispose();
      routeMaterial.dispose();
      nodeMaterial.dispose();
      renderer.dispose();
    };
  }, [sections]);

  return (
    <div
      aria-hidden="true"
      className="simo-public-trail-canvas"
      data-active-section={activeSectionId}
      ref={hostRef}
    >
      <div className="simo-public-trail-fallback" />
      <canvas ref={canvasRef} />
    </div>
  );
}

function TrailProgressNav({
  activeSectionId,
  sections,
}: {
  activeSectionId: PublicTrailSectionId;
  sections: readonly PublicTrailSection[];
}) {
  return (
    <nav aria-label="Public trail progress" className="simo-trail-progress-nav">
      {sections.map((section) => (
        <a
          aria-current={section.id === activeSectionId ? "location" : undefined}
          href={section.anchor}
          key={section.id}
        >
          <span>{section.code}</span>
          <strong>{section.label}</strong>
        </a>
      ))}
    </nav>
  );
}

function ProjectDialog({
  onClose,
  project,
}: {
  onClose: () => void;
  project: PublicProjectCaseStudy;
}) {
  const [open, setOpen] = useState(true);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useDialogFocusGuard(open, closeButtonRef, project.slug);
  const asset = getPreferredImageAsset(project);
  const video = getPreferredVideo(project);
  const actionLinks = project.links.filter((link) => link.href);
  const proofPanels = project.miniWorld?.panels ?? project.storyboard ?? [];

  return (
    <Dialog.Root
      modal
      onOpenChange={setOpen}
      onOpenChangeComplete={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
      open={open}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="simo-trail-dialog-backdrop" />
        <Dialog.Viewport className="simo-trail-dialog-layer">
          <Dialog.Popup
            aria-label={project.title}
            className="simo-trail-project-dialog"
            finalFocus={false}
            initialFocus={closeButtonRef}
            ref={dialogRef}
          >
            <Dialog.Close
              aria-label="Close project"
              className="simo-trail-dialog-close"
              ref={closeButtonRef}
              type="button"
            >
              <SiteIcon aria-hidden iconKey="x" />
            </Dialog.Close>

            <div className="simo-trail-dialog-media">
              {asset ? (
                <Image
                  alt={asset.media.alt}
                  height={asset.media.height}
                  src={asset.media.src}
                  width={asset.media.width}
                  sizes="(max-width: 900px) 100vw, 54vw"
                />
              ) : null}
              {video ? (
                <video
                  aria-label={video.alt}
                  controls
                  poster={video.posterSrc}
                  preload="metadata"
                >
                  <source src={video.src} type={getVideoType(video.src)} />
                </video>
              ) : null}
            </div>

            <div className="simo-trail-dialog-copy">
              <p>{project.code} / {project.proofMode}</p>
              <Dialog.Title>{project.title}</Dialog.Title>
              <Dialog.Description className="simo-trail-dialog-description">
                {project.summary}
              </Dialog.Description>

              <dl className="simo-trail-dialog-meta">
                <div>
                  <dt>Role</dt>
                  <dd>{project.role}</dd>
                </div>
                <div>
                  <dt>Stage</dt>
                  <dd>{project.methodStage}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>{project.status}</dd>
                </div>
              </dl>

              <div className="simo-trail-proofline">
                <strong>{project.completedRoute.title}</strong>
                <span>{project.proofSummary}</span>
              </div>

              {proofPanels.length > 0 ? (
                <ol className="simo-trail-proof-list">
                  {proofPanels.slice(0, 4).map((panel, index) => (
                    <li key={panel.id}>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <strong>{panel.title}</strong>
                    </li>
                  ))}
                </ol>
              ) : null}

              {actionLinks.length > 0 ? (
                <div className="simo-trail-dialog-actions">
                  {actionLinks.map((link) => (
                    <a
                      aria-label={link.ariaLabel}
                      href={link.href}
                      key={`${project.slug}-${link.href}`}
                      rel={link.external ? "noreferrer" : undefined}
                      target={link.external ? "_blank" : undefined}
                    >
                      {link.label}
                      <SiteIcon aria-hidden iconKey="arrowUpRight" />
                      {link.external ? (
                        <span className="sr-only">opens in a new tab</span>
                      ) : null}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function NoteDialog({
  note,
  onClose,
}: {
  note: PublicTrailNote;
  onClose: () => void;
}) {
  const [open, setOpen] = useState(true);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useDialogFocusGuard(open, closeButtonRef, note.code);

  return (
    <Dialog.Root
      modal
      onOpenChange={setOpen}
      onOpenChangeComplete={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
      open={open}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="simo-trail-dialog-backdrop" />
        <Dialog.Viewport className="simo-trail-dialog-layer simo-trail-note-layer">
          <Dialog.Popup
            aria-label={note.title}
            className="simo-trail-note-dialog"
            finalFocus={false}
            initialFocus={closeButtonRef}
            ref={dialogRef}
          >
            <Dialog.Close
              aria-label="Close note"
              className="simo-trail-dialog-close"
              ref={closeButtonRef}
              type="button"
            >
              <SiteIcon aria-hidden iconKey="x" />
            </Dialog.Close>
            <p>{note.code} / {note.source}</p>
            <Dialog.Title>{note.title}</Dialog.Title>
            <Dialog.Description className="simo-trail-dialog-description">
              {note.body}
            </Dialog.Description>
            <div className="simo-trail-dialog-actions">
              <Dialog.Close type="button">Back to notes</Dialog.Close>
            </div>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function PublicTrailRuntime({
  notes,
  projects,
  sections,
  socialChannels,
}: PublicTrailRuntimeProps) {
  const [activeSectionId, setActiveSectionId] =
    useState<PublicTrailSectionId>("joe");
  const [selectedProjectSlug, setSelectedProjectSlug] = useState<string | null>(
    null,
  );
  const [selectedNoteCode, setSelectedNoteCode] = useState<string | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const selectedProject = useMemo(
    () => projects.find((project) => project.slug === selectedProjectSlug),
    [projects, selectedProjectSlug],
  );
  const selectedNote = useMemo(
    () => notes.find((note) => note.code === selectedNoteCode),
    [notes, selectedNoteCode],
  );

  useEffect(() => {
    document.documentElement.dataset.trailRuntime = "ready";

    return () => {
      delete document.documentElement.dataset.trailRuntime;
    };
  }, []);

  const closeOverlay = useCallback(() => {
    const focusTarget = previousFocusRef.current;

    setSelectedProjectSlug(null);
    setSelectedNoteCode(null);

    const restoreFocus = () => {
      if (focusTarget?.isConnected) {
        focusTarget.focus({ preventScroll: true });
      }
    };

    window.requestAnimationFrame(() => {
      restoreFocus();
      window.setTimeout(restoreFocus, 40);
      window.setTimeout(() => {
        restoreFocus();
        if (previousFocusRef.current === focusTarget) {
          previousFocusRef.current = null;
        }
      }, 120);
    });
  }, []);

  useEffect(() => {
    const observedSections = sections
      .map((section) => document.querySelector<HTMLElement>(section.anchor))
      .filter((section): section is HTMLElement => Boolean(section));

    if (observedSections.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (left, right) =>
              Math.abs(left.boundingClientRect.top) -
              Math.abs(right.boundingClientRect.top),
          )[0];

        const nextId = visible?.target.getAttribute(
          "data-trail-section",
        ) as PublicTrailSectionId | null;

        if (nextId) {
          setActiveSectionId(nextId);
          document.documentElement.dataset.trailSection = nextId;
        }
      },
      { rootMargin: "-34% 0px -50% 0px", threshold: [0.01, 0.2, 0.5] },
    );

    observedSections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [sections]);

  useEffect(() => {
    function handleDocumentClick(event: MouseEvent) {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const projectTrigger = target.closest("[data-project-open]");
      const projectOpenArea = target.closest("[data-project-open-area]");
      const noteTrigger = target.closest("[data-note-open]");
      const projectButton =
        projectTrigger instanceof HTMLElement ? projectTrigger : null;
      const projectArea =
        projectOpenArea instanceof HTMLElement ? projectOpenArea : null;

      if (projectButton || projectArea) {
        const projectSlug =
          projectButton?.dataset.projectOpen ??
          projectArea?.dataset.projectOpenArea;
        const focusTarget =
          projectButton ??
          projectArea?.querySelector<HTMLElement>("[data-project-open]");

        previousFocusRef.current = focusTarget ?? null;
        setSelectedNoteCode(null);
        setSelectedProjectSlug(projectSlug ?? null);
        return;
      }

      if (noteTrigger instanceof HTMLElement) {
        previousFocusRef.current = noteTrigger;
        setSelectedProjectSlug(null);
        setSelectedNoteCode(noteTrigger.dataset.noteOpen ?? null);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && (selectedProjectSlug || selectedNoteCode)) {
        closeOverlay();
      }
    }

    document.addEventListener("click", handleDocumentClick);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("click", handleDocumentClick);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeOverlay, selectedNoteCode, selectedProjectSlug]);

  useEffect(() => {
    if (prefersReducedMotion()) {
      return;
    }

    let animationFrame = 0;
    let lenis: { destroy: () => void; raf: (time: number) => void } | null = null;
    let cleanupGsap: (() => void) | undefined;
    let mounted = true;

    async function bootMotion() {
      const [{ default: Lenis }, gsapModule, scrollTriggerModule] =
        await Promise.all([
          import("lenis"),
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);

      if (!mounted) {
        return;
      }

      const gsap = gsapModule.default;
      const ScrollTrigger = scrollTriggerModule.ScrollTrigger;

      gsap.registerPlugin(ScrollTrigger);
      const matchMedia = gsap.matchMedia();
      const nextLenis = new Lenis({
        lerp: 0.08,
        smoothWheel: true,
        syncTouch: false,
      });
      nextLenis.on("scroll", ScrollTrigger.update);
      lenis = nextLenis;

      const revealTweens = gsap.utils
        .toArray<HTMLElement>("[data-trail-reveal]")
        .map((element) =>
          gsap.fromTo(
            element,
            { opacity: 0, y: 34 },
            {
              duration: 0.95,
              ease: "power4.out",
              immediateRender: false,
              opacity: 1,
              scrollTrigger: {
                start: "top 82%",
                trigger: element,
              },
              y: 0,
            },
          ),
        );
      const trailTweens = [
        gsap.to(".simo-trail-orbit-board", {
          "--trail-board-scale": 1.06,
          "--trail-board-y": "42px",
          ease: "none",
          scrollTrigger: {
            end: "bottom top",
            scrub: 0.8,
            start: "top top",
            trigger: "#joe",
          },
        }),
        gsap.fromTo(
          ".simo-trail-work-card",
          { opacity: 0.72 },
          {
            ease: "power3.out",
            opacity: 1,
            scrollTrigger: {
              end: "bottom 45%",
              scrub: 0.7,
              start: "top 78%",
              trigger: "#work",
            },
            stagger: 0.08,
          },
        ),
        gsap.fromTo(
          ".simo-trail-menu-preview",
          { opacity: 0.62 },
          {
            ease: "none",
            opacity: 1,
            scrollTrigger: {
              end: "bottom 60%",
              scrub: 0.8,
              start: "top 78%",
              trigger: "#social",
            },
          },
        ),
        gsap.to(".simo-trail-social-orbit, .simo-trail-contact-signal", {
          "--trail-orbit-scale": 1.36,
          ease: "none",
          scrollTrigger: {
            end: "bottom 70%",
            scrub: 0.8,
            start: "top 70%",
            trigger: "#contact",
          },
        }),
        gsap.to(".simo-trail-about-sphere", {
          ease: "none",
          rotate: 16,
          scrollTrigger: {
            end: "bottom top",
            scrub: 0.9,
            start: "top 80%",
            trigger: "#about",
          },
        }),
        gsap.fromTo(
          ".simo-trail-system-grid article",
          { y: 18 },
          {
            ease: "power3.out",
            scrollTrigger: {
              end: "bottom 58%",
              scrub: 0.7,
              start: "top 82%",
              trigger: "#system",
            },
            stagger: 0.05,
            y: 0,
          },
        ),
      ];

      matchMedia.add("(min-width: 1081px)", () => {
        const pinTriggers = gsap.utils
          .toArray<HTMLElement>("[data-trail-work-pin]")
          .map((element) =>
            ScrollTrigger.create({
              end: "+=70%",
              pin: true,
              pinSpacing: false,
              start: "top 72px",
              trigger: element,
            }),
          );
        const momentsTrail = gsap.to(".simo-trail-moment-rail", {
          ease: "none",
          scrollTrigger: {
            end: "bottom top",
            invalidateOnRefresh: true,
            scrub: 0.8,
            start: "top 76%",
            trigger: "#photos",
          },
          xPercent: -24,
        });

        return () => {
          pinTriggers.forEach((trigger) => trigger.kill());
          momentsTrail.kill();
        };
      });

      matchMedia.add("(max-width: 1080px)", () => {
        const momentsTrail = gsap.to(".simo-trail-moment", {
          ease: "none",
          scrollTrigger: {
            end: "bottom top",
            scrub: 0.7,
            start: "top 75%",
            trigger: "#photos",
          },
          stagger: 0.04,
          xPercent: -18,
        });

        return () => {
          momentsTrail.kill();
        };
      });

      const raf = (time: number) => {
        lenis?.raf(time);
        animationFrame = window.requestAnimationFrame(raf);
      };

      animationFrame = window.requestAnimationFrame(raf);

      cleanupGsap = () => {
        revealTweens.forEach((tween) => tween.kill());
        trailTweens.forEach((tween) => tween.kill());
        matchMedia.revert();
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      };
    }

    void bootMotion();

    return () => {
      mounted = false;
      window.cancelAnimationFrame(animationFrame);
      lenis?.destroy();
      cleanupGsap?.();
    };
  }, []);

  useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      if (event.pointerType && event.pointerType !== "mouse") {
        return;
      }

      const root = document.documentElement;
      const orbitX =
        ((event.clientX / Math.max(window.innerWidth, 1)) - 0.5) * -18;
      const orbitY =
        ((event.clientY / Math.max(window.innerHeight, 1)) - 0.5) * -14;
      const target = event.target;
      let magnet: HTMLElement | null = null;
      let magnetX = "0px";
      let magnetY = "0px";

      if (target instanceof Element) {
        const magnetElement = target.closest("[data-magnetic]");

        if (magnetElement instanceof HTMLElement) {
          magnet = magnetElement;

          const rect = magnet.getBoundingClientRect();
          const x = ((event.clientX - rect.left) / rect.width - 0.5) * 18;
          const y = ((event.clientY - rect.top) / rect.height - 0.5) * 18;

          magnetX = `${x.toFixed(2)}px`;
          magnetY = `${y.toFixed(2)}px`;
        }
      }

      root.style.setProperty("--trail-pointer-x", `${event.clientX}px`);
      root.style.setProperty("--trail-pointer-y", `${event.clientY}px`);
      root.style.setProperty("--trail-orbit-x", `${orbitX.toFixed(2)}px`);
      root.style.setProperty("--trail-orbit-y", `${orbitY.toFixed(2)}px`);

      if (magnet) {
        magnet.style.setProperty("--magnet-x", magnetX);
        magnet.style.setProperty("--magnet-y", magnetY);
      }
    }

    function handlePointerOut(event: PointerEvent) {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const magnet = target.closest("[data-magnetic]");

      if (magnet instanceof HTMLElement) {
        magnet.style.setProperty("--magnet-x", "0px");
        magnet.style.setProperty("--magnet-y", "0px");
      }
    }

    document.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    document.addEventListener("pointerout", handlePointerOut, {
      passive: true,
    });

    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerout", handlePointerOut);
    };
  }, []);

  return (
    <>
      <PublicTrailCanvas activeSectionId={activeSectionId} sections={sections} />
      <TrailProgressNav
        activeSectionId={activeSectionId}
        sections={sections}
      />
      <div aria-hidden="true" className="simo-trail-status">
        <span>{sections.find((section) => section.id === activeSectionId)?.code}</span>
        <strong>
          {sections.find((section) => section.id === activeSectionId)?.label}
        </strong>
      </div>
      <div aria-hidden="true" className="simo-trail-social-orbit">
        {socialChannels.slice(0, 5).map((channel) => (
          <span data-channel={channel.label.toLowerCase()} key={channel.label} />
        ))}
      </div>
      {selectedProject ? (
        <ProjectDialog
          key={selectedProject.slug}
          onClose={closeOverlay}
          project={selectedProject}
        />
      ) : null}
      {selectedNote ? (
        <NoteDialog
          key={selectedNote.code}
          note={selectedNote}
          onClose={closeOverlay}
        />
      ) : null}
    </>
  );
}
