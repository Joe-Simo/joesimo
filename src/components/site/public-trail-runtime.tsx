"use client";

import { Dialog } from "@base-ui/react/dialog";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";

import { SiteIcon } from "@/components/site/site-icons";
import type {
  PublicEvidenceAsset,
  PublicProjectCaseStudy,
  PublicTrailSection,
  PublicTrailSectionId,
} from "@/lib/site-data";

export type PublicTrailNote = {
  body: string;
  code: string;
  source: string;
  title: string;
};

type PublicTrailRuntimeProps = {
  projects: PublicProjectCaseStudy[];
  sections: readonly PublicTrailSection[];
};

type ThreeModule = typeof import("three");
type ThreeRenderer = InstanceType<ThreeModule["WebGLRenderer"]>;
type ThreeScene = InstanceType<ThreeModule["Scene"]>;
type ThreeCamera = InstanceType<ThreeModule["OrthographicCamera"]>;
type ThreeBufferGeometry = InstanceType<ThreeModule["BufferGeometry"]>;
type ThreeMaterial = InstanceType<ThreeModule["Material"]>;
type LenisInstance = {
  destroy: () => void;
  on: (event: "scroll", callback: () => void) => void;
  raf: (time: number) => void;
};

const SIGNAL_POINT_COUNT = 168;
const MAX_PIXEL_RATIO = 2;

function scheduleIdleTask(callback: () => void, timeout = 1_200) {
  const browserWindow = window as Window & {
    cancelIdleCallback?: (handle: number) => void;
    requestIdleCallback?: (
      callback: IdleRequestCallback,
      options?: IdleRequestOptions,
    ) => number;
  };

  if (
    typeof browserWindow.requestIdleCallback === "function" &&
    typeof browserWindow.cancelIdleCallback === "function"
  ) {
    const handle = browserWindow.requestIdleCallback(callback, { timeout });

    return () => browserWindow.cancelIdleCallback?.(handle);
  }

  const handle = window.setTimeout(callback, 240);

  return () => window.clearTimeout(handle);
}

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

function useDialogFocusGuard(
  open: boolean,
  initialFocusRef: RefObject<HTMLElement | null>,
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
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => {
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);

        return (
          rect.width > 0 &&
          rect.height > 0 &&
          style.display !== "none" &&
          style.visibility !== "hidden"
        );
      });
      const first = focusable[0];
      const last = focusable.at(-1);

      if (!first || !last) {
        return;
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
        return;
      }

      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
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
  }, [initialFocusRef, open]);

  return dialogRef;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isDarkTheme() {
  const root = document.documentElement;
  const colorScheme = getComputedStyle(root).colorScheme;

  return root.classList.contains("dark") || colorScheme.includes("dark");
}

function getSignalSceneStyle() {
  const dark = isDarkTheme();
  const computedStyle = getComputedStyle(document.documentElement);
  const accent =
    computedStyle.getPropertyValue("--signal-accent").trim() ||
    (dark ? "#7ab8ff" : "#0057ff");

  return {
    accent,
    dark,
    ink: dark ? 0xffffff : 0x09090b,
    particleOpacity: dark ? 0.32 : 0.18,
    routeOpacity: dark ? 0.22 : 0.12,
  };
}

function createSignalPositions(count: number) {
  const positions = new Float32Array(count * 3);
  const basePositions = new Float32Array(count * 3);

  for (let index = 0; index < count; index += 1) {
    const phase = (index * 0.61803398875) % 1;
    const shell = ((index * 37) % 101) / 100;
    const angle = phase * Math.PI * 2;
    const radius = 0.12 + shell * 1.05;
    const offset = index * 3;

    basePositions[offset] = Math.cos(angle) * radius;
    basePositions[offset + 1] =
      Math.sin(angle) * radius * 0.42 + (phase - 0.5) * 0.2;
    basePositions[offset + 2] = 0;
    positions[offset] = basePositions[offset];
    positions[offset + 1] = basePositions[offset + 1];
    positions[offset + 2] = basePositions[offset + 2];
  }

  return { basePositions, positions };
}

function createSectionRouteGeometry(
  THREE: ThreeModule,
  sections: readonly PublicTrailSection[],
) {
  const routePositions = new Float32Array(sections.length * 3);
  const divisor = Math.max(sections.length - 1, 1);

  sections.forEach((section, index) => {
    const offset = index * 3;

    routePositions[offset] = (index / divisor) * 2 - 1;
    routePositions[offset + 1] = section.point.y * 0.24;
    routePositions[offset + 2] = 0;
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(routePositions, 3));

  return geometry;
}

function JoeSignalField({
  activeSectionId,
  sections,
}: {
  activeSectionId: PublicTrailSectionId;
  sections: readonly PublicTrailSection[];
}) {
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

    const canvasElement = canvas;
    const hostElement = host;
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    if (prefersReducedMotion()) {
      hostElement.dataset.webglReady = "reduced-motion";
      hostElement.dataset.webglPainted = "skipped";
      return;
    }

    async function bootSignalField() {
      let THREE: ThreeModule;

      try {
        THREE = await import("three");
      } catch {
        if (!cancelled) {
          hostElement.dataset.webglReady = "false";
          hostElement.dataset.webglPainted = "false";
        }

        return;
      }

      if (cancelled) {
        return;
      }

      const contextAttributes: WebGLContextAttributes = {
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
      };
      const context =
        canvasElement.getContext("webgl2", contextAttributes) ??
        canvasElement.getContext("webgl", contextAttributes);

      if (!context) {
        hostElement.dataset.webglReady = "false";
        hostElement.dataset.webglPainted = "false";
        return;
      }

      let renderer: ThreeRenderer;

      try {
        renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: true,
          canvas: canvasElement,
          context: context as WebGLRenderingContext,
          powerPreference: "low-power",
        });
      } catch {
        hostElement.dataset.webglReady = "false";
        hostElement.dataset.webglPainted = "false";
        return;
      }

      const scene: ThreeScene = new THREE.Scene();
      const camera: ThreeCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
      const pointCount = window.innerWidth < 760 ? 108 : SIGNAL_POINT_COUNT;
      const { basePositions, positions } = createSignalPositions(pointCount);
      const particleGeometry: ThreeBufferGeometry = new THREE.BufferGeometry();
      const routeGeometry = createSectionRouteGeometry(THREE, sections);
      const signalStyle = getSignalSceneStyle();
      const particleMaterial = new THREE.PointsMaterial({
        color: signalStyle.ink,
        depthWrite: false,
        opacity: signalStyle.particleOpacity,
        size: 0.018,
        sizeAttenuation: true,
        transparent: true,
      });
      const routeMaterial = new THREE.LineBasicMaterial({
        color: signalStyle.accent,
        depthWrite: false,
        opacity: signalStyle.routeOpacity,
        transparent: true,
      });
      const markerGeometry = new THREE.SphereGeometry(0.024, 16, 8);
      const markerMaterial = new THREE.MeshBasicMaterial({
        color: signalStyle.accent,
        opacity: 0.7,
        transparent: true,
      });
      const sectionMarkers = sections.map((section, index) => {
        const divisor = Math.max(sections.length - 1, 1);
        const marker = new THREE.Mesh(markerGeometry, markerMaterial.clone());

        marker.position.set((index / divisor) * 2 - 1, section.point.y * 0.24, 0);
        scene.add(marker);

        return marker;
      });
      const points = new THREE.Points(particleGeometry, particleMaterial);
      const route = new THREE.Line(routeGeometry, routeMaterial);
      const reducedMotionQuery = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      );
      const colorQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const positionAttribute = new THREE.BufferAttribute(positions, 3);
      let animationFrame = 0;
      let reducedMotion = reducedMotionQuery.matches;

      particleGeometry.setAttribute("position", positionAttribute);
      camera.position.z = 3;
      renderer.setClearColor(0x000000, 0);
      scene.add(route, points);
      hostElement.dataset.webglReady = "true";
      hostElement.dataset.webglPainted = "false";

      function resize() {
        const rect = hostElement.getBoundingClientRect();
        const width = Math.max(1, Math.floor(rect.width));
        const height = Math.max(1, Math.floor(rect.height));
        const aspect = width / height;
        const span = 1.24;

        renderer.setPixelRatio(
          Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO),
        );
        renderer.setSize(width, height, false);
        camera.left = -span * aspect;
        camera.right = span * aspect;
        camera.top = span;
        camera.bottom = -span;
        camera.updateProjectionMatrix();
      }

      function render(time = 0) {
        animationFrame = 0;

        for (let index = 0; index < pointCount; index += 1) {
          const offset = index * 3;
          const drift = reducedMotion
            ? 0
            : Math.sin(time * 0.00028 + index * 0.33) * 0.018;

          positions[offset] = basePositions[offset] + drift;
          positions[offset + 1] = basePositions[offset + 1] - drift * 0.45;
        }

        positionAttribute.needsUpdate = true;

        const activeIndex = Math.max(
          0,
          sections.findIndex((section) => section.id === activeSectionIdRef.current),
        );

        sectionMarkers.forEach((marker, index) => {
          const active = index === activeIndex;
          const targetScale = active ? 1.65 : 1;
          const material = marker.material as InstanceType<
            ThreeModule["MeshBasicMaterial"]
          >;

          marker.scale.lerp(
            new THREE.Vector3(targetScale, targetScale, targetScale),
            reducedMotion ? 1 : 0.16,
          );
          material.opacity += ((active ? 0.92 : 0.36) - material.opacity) * 0.18;
        });

        route.rotation.z = reducedMotion ? 0 : Math.sin(time * 0.00012) * 0.018;
        points.rotation.z = reducedMotion ? 0 : Math.sin(time * 0.00009) * 0.022;
        renderer.render(scene, camera);
        hostElement.dataset.webglPainted = "true";

        if (!reducedMotion && document.visibilityState === "visible") {
          animationFrame = window.requestAnimationFrame(render);
        }
      }

      function updateSignalSceneStyle() {
        const nextSignalStyle = getSignalSceneStyle();

        hostElement.dataset.signalTheme = nextSignalStyle.dark ? "dark" : "light";
        particleMaterial.color.setHex(nextSignalStyle.ink);
        particleMaterial.opacity = nextSignalStyle.particleOpacity;
        routeMaterial.color.setStyle(nextSignalStyle.accent);
        routeMaterial.opacity = nextSignalStyle.routeOpacity;
        markerMaterial.color.setStyle(nextSignalStyle.accent);
        sectionMarkers.forEach((marker) => {
          const material = marker.material as InstanceType<
            ThreeModule["MeshBasicMaterial"]
          >;

          material.color.setStyle(nextSignalStyle.accent);
        });
      }

      function renderOnce() {
        window.cancelAnimationFrame(animationFrame);
        render(performance.now());
      }

      function handleThemeChange() {
        updateSignalSceneStyle();
        renderOnce();
      }

      function handleReducedMotionChange() {
        reducedMotion = reducedMotionQuery.matches;
        renderOnce();

        if (!reducedMotion && !animationFrame) {
          animationFrame = window.requestAnimationFrame(render);
        }
      }

      function handleVisibilityChange() {
        if (
          document.visibilityState === "visible" &&
          !reducedMotion &&
          !animationFrame
        ) {
          animationFrame = window.requestAnimationFrame(render);
        }
      }

      function handleContextLost(event: Event) {
        event.preventDefault();
        hostElement.dataset.webglReady = "false";
        hostElement.dataset.webglPainted = "false";
        window.cancelAnimationFrame(animationFrame);
      }

      resize();
      updateSignalSceneStyle();
      renderOnce();

      if (!reducedMotion) {
        animationFrame = window.requestAnimationFrame(render);
      }

      const themeObserver = new MutationObserver(handleThemeChange);

      window.addEventListener("resize", resize);
      document.addEventListener("visibilitychange", handleVisibilityChange);
      reducedMotionQuery.addEventListener("change", handleReducedMotionChange);
      colorQuery.addEventListener("change", handleThemeChange);
      themeObserver.observe(document.documentElement, {
        attributeFilter: ["class", "style"],
        attributes: true,
      });
      canvasElement.addEventListener("webglcontextlost", handleContextLost);

      cleanup = () => {
        hostElement.dataset.webglReady = "false";
        delete hostElement.dataset.webglPainted;
        delete hostElement.dataset.signalTheme;
        window.cancelAnimationFrame(animationFrame);
        window.removeEventListener("resize", resize);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        reducedMotionQuery.removeEventListener("change", handleReducedMotionChange);
        colorQuery.removeEventListener("change", handleThemeChange);
        themeObserver.disconnect();
        canvasElement.removeEventListener("webglcontextlost", handleContextLost);
        sectionMarkers.forEach((marker) => {
          scene.remove(marker);
          (marker.material as ThreeMaterial).dispose();
        });
        scene.remove(route, points);
        markerGeometry.dispose();
        markerMaterial.dispose();
        particleGeometry.dispose();
        routeGeometry.dispose();
        particleMaterial.dispose();
        routeMaterial.dispose();
        renderer.dispose();
      };
    }

    const cancelIdleTask = scheduleIdleTask(() => {
      void bootSignalField();
    });

    return () => {
      cancelled = true;
      cancelIdleTask();
      cleanup?.();
    };
  }, [sections]);

  return (
    <div
      aria-hidden="true"
      className="joe-signal-field"
      data-active-section={activeSectionId}
      data-webgl-painted="pending"
      data-webgl-ready="pending"
      ref={hostRef}
    >
      <div className="joe-signal-fallback" />
      <canvas ref={canvasRef} />
    </div>
  );
}

function useStructuralMotion() {
  useEffect(() => {
    if (prefersReducedMotion()) {
      return;
    }

    let mounted = true;
    let animationFrame = 0;
    let lenis: LenisInstance | null = null;
    let cleanupGsap: (() => void) | undefined;

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
      lenis = new Lenis({
        lerp: 0.1,
        smoothWheel: true,
        syncTouch: false,
      }) as LenisInstance;
      lenis.on("scroll", ScrollTrigger.update);

      const revealTweens = gsap.utils
        .toArray<HTMLElement>("[data-joe-reveal]")
        .map((element) =>
          gsap.fromTo(
            element,
            { opacity: 0, y: 16 },
            {
              duration: 0.72,
              ease: "power3.out",
              opacity: 1,
              scrollTrigger: {
                start: "top 88%",
                trigger: element,
              },
              y: 0,
            },
          ),
        );
      const rowTweens = [
        gsap.fromTo(
          ".joe-work-table article",
          { opacity: 0.82, y: 12 },
          {
            duration: 0.62,
            ease: "power3.out",
            opacity: 1,
            scrollTrigger: {
              start: "top 84%",
              trigger: ".joe-work-table",
            },
            stagger: 0.035,
            y: 0,
          },
        ),
        gsap.fromTo(
          ".joe-timeline article",
          { opacity: 0.82, y: 12 },
          {
            duration: 0.62,
            ease: "power3.out",
            opacity: 1,
            scrollTrigger: {
              start: "top 84%",
              trigger: ".joe-timeline",
            },
            stagger: 0.035,
            y: 0,
          },
        ),
        gsap.fromTo(
          ".joe-education-row, .joe-credential-list article",
          { opacity: 0.82, y: 12 },
          {
            duration: 0.62,
            ease: "power3.out",
            opacity: 1,
            scrollTrigger: {
              start: "top 84%",
              trigger: "#credentials",
            },
            stagger: 0.035,
            y: 0,
          },
        ),
      ];
      const photoTween = gsap.fromTo(
        ".joe-photo-sheet figure",
        { opacity: 0.86, y: 14 },
        {
          duration: 0.7,
          ease: "power3.out",
          opacity: 1,
          scrollTrigger: {
            start: "top 84%",
            trigger: ".joe-photo-sheet",
          },
          stagger: 0.045,
          y: 0,
        },
      );

      const raf = (time: number) => {
        lenis?.raf(time);
        animationFrame = window.requestAnimationFrame(raf);
      };

      animationFrame = window.requestAnimationFrame(raf);

      cleanupGsap = () => {
        revealTweens.forEach((tween) => tween.kill());
        rowTweens.forEach((tween) => tween.kill());
        photoTween.kill();
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      };
    }

    const cancelIdleTask = scheduleIdleTask(() => {
      void bootMotion();
    });

    return () => {
      mounted = false;
      cancelIdleTask();
      window.cancelAnimationFrame(animationFrame);
      lenis?.destroy();
      cleanupGsap?.();
    };
  }, []);
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
  const dialogRef = useDialogFocusGuard(open, closeButtonRef);
  const asset = getPreferredImageAsset(project);
  const actionLinks = project.links.filter((link) => link.href);

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
        <Dialog.Backdrop className="joe-dialog-backdrop" />
        <Dialog.Viewport className="joe-dialog-layer">
          <Dialog.Popup
            aria-label={project.title}
            className="joe-project-dialog"
            finalFocus={false}
            initialFocus={closeButtonRef}
            ref={dialogRef}
          >
            <Dialog.Close
              aria-label="Close project"
              className="joe-dialog-close"
              ref={closeButtonRef}
              type="button"
            >
              <SiteIcon aria-hidden iconKey="x" />
            </Dialog.Close>

            {asset ? (
              <figure className="joe-dialog-media">
                <Image
                  alt={asset.media.alt}
                  className="joe-cover-image"
                  fill
                  sizes="(max-width: 900px) 100vw, 50vw"
                  src={asset.media.src}
                />
              </figure>
            ) : null}

            <div className="joe-dialog-copy">
              <p>{project.code}</p>
              <Dialog.Title>{project.title}</Dialog.Title>
              <Dialog.Description className="joe-dialog-description">
                {project.summary}
              </Dialog.Description>

              <dl>
                <div>
                  <dt>Role</dt>
                  <dd>{project.role}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>{project.status}</dd>
                </div>
              </dl>

              {project.evidence.length > 0 ? (
                <ul>
                  {project.evidence.slice(0, 4).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}

              {actionLinks.length > 0 ? (
                <div className="joe-dialog-actions">
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

export function PublicTrailRuntime({
  projects,
  sections,
}: PublicTrailRuntimeProps) {
  useStructuralMotion();

  const [activeSectionId, setActiveSectionId] =
    useState<PublicTrailSectionId>("joe");
  const [selectedProjectSlug, setSelectedProjectSlug] = useState<string | null>(
    null,
  );
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const selectedProject = useMemo(
    () => projects.find((project) => project.slug === selectedProjectSlug),
    [projects, selectedProjectSlug],
  );

  useEffect(() => {
    document.documentElement.dataset.trailRuntime = "ready";

    return () => {
      delete document.documentElement.dataset.trailRuntime;
      delete document.documentElement.dataset.trailSection;
    };
  }, []);

  const closeOverlay = useCallback(() => {
    const focusTarget = previousFocusRef.current;

    setSelectedProjectSlug(null);

    window.requestAnimationFrame(() => {
      if (focusTarget?.isConnected) {
        focusTarget.focus({ preventScroll: true });
      }

      if (previousFocusRef.current === focusTarget) {
        previousFocusRef.current = null;
      }
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
        const nextId = visible?.target.id as PublicTrailSectionId | undefined;

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

      if (projectTrigger instanceof HTMLElement) {
        previousFocusRef.current = projectTrigger;
        setSelectedProjectSlug(projectTrigger.dataset.projectOpen ?? null);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && selectedProjectSlug) {
        closeOverlay();
      }
    }

    document.addEventListener("click", handleDocumentClick);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("click", handleDocumentClick);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeOverlay, selectedProjectSlug]);

  return (
    <>
      <JoeSignalField activeSectionId={activeSectionId} sections={sections} />
      <span className="sr-only" data-active-section={activeSectionId}>
        {activeSectionId}
      </span>
      {selectedProject ? (
        <ProjectDialog
          key={selectedProject.slug}
          onClose={closeOverlay}
          project={selectedProject}
        />
      ) : null}
    </>
  );
}
