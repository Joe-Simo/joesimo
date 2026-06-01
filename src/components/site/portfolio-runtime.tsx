"use client";

import { Dialog } from "@base-ui/react/dialog";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type RefObject,
} from "react";

import { LocalizedText } from "@/components/site/localized-text";
import { SiteIcon } from "@/components/site/site-icons";
import { useSiteLanguage } from "@/components/site/use-site-language";
import type {
  PortfolioSection,
  PortfolioSectionId,
  PublicEvidenceAsset,
  PublicProjectCaseStudy,
} from "@/lib/site-data";

export type PortfolioNote = {
  body: string;
  code: string;
  source: string;
  title: string;
};

type PortfolioRuntimeProps = {
  projectTranslations: ProjectTranslationMap;
  projects: PublicProjectCaseStudy[];
  sections: readonly PortfolioSection[];
};

export type ProjectTranslation = {
  evidence: readonly string[];
  role: string;
  status: string;
  summary: string;
};

export type ProjectTranslationMap = Record<string, { es: ProjectTranslation }>;

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

type SiteLanguage = "en" | "es";

const PROJECT_QUERY_PARAM = "project";
const projectUrlStateListeners = new Set<() => void>();

function localizedProjectCopy(
  project: PublicProjectCaseStudy,
  translations: ProjectTranslationMap,
  language: SiteLanguage,
) {
  const translated = language === "es" ? translations[project.slug]?.es : undefined;

  return {
    evidence: translated?.evidence ?? project.evidence,
    role: translated?.role ?? project.role,
    status: translated?.status ?? project.status,
    summary: translated?.summary ?? project.summary,
  };
}

function localizedActionLabel(label: string, language: SiteLanguage) {
  if (language === "es" && label.startsWith("Open ")) {
    return label.replace("Open ", "Abrir ");
  }

  return label;
}

function currentRelativeUrl() {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

function projectUrl(projectSlug: string | null) {
  const url = new URL(window.location.href);

  if (projectSlug) {
    url.searchParams.set(PROJECT_QUERY_PARAM, projectSlug);
  } else {
    url.searchParams.delete(PROJECT_QUERY_PARAM);
  }

  const search = url.searchParams.toString();

  return `${url.pathname}${search ? `?${search}` : ""}${url.hash}`;
}

function notifyProjectUrlStateListeners() {
  projectUrlStateListeners.forEach((listener) => listener());
}

function subscribeToProjectUrlState(listener: () => void) {
  projectUrlStateListeners.add(listener);
  window.addEventListener("popstate", listener);

  return () => {
    projectUrlStateListeners.delete(listener);
    window.removeEventListener("popstate", listener);
  };
}

function readProjectSlugFromUrl(validProjectSlugs: ReadonlySet<string>) {
  const url = new URL(window.location.href);
  const projectSlug = url.searchParams.get(PROJECT_QUERY_PARAM);

  return projectSlug && validProjectSlugs.has(projectSlug) ? projectSlug : null;
}

function hasInvalidProjectSlugInUrl(validProjectSlugs: ReadonlySet<string>) {
  const url = new URL(window.location.href);
  const projectSlug = url.searchParams.get(PROJECT_QUERY_PARAM);

  return Boolean(projectSlug && !validProjectSlugs.has(projectSlug));
}

function useProjectDialogUrlState(projects: readonly PublicProjectCaseStudy[]) {
  const validProjectSlugs = useMemo(
    () => new Set(projects.map((project) => project.slug)),
    [projects],
  );
  const selectedProjectSlug = useSyncExternalStore(
    subscribeToProjectUrlState,
    () => readProjectSlugFromUrl(validProjectSlugs),
    () => null,
  );

  useEffect(() => {
    if (hasInvalidProjectSlugInUrl(validProjectSlugs)) {
      window.history.replaceState(null, "", projectUrl(null));
      notifyProjectUrlStateListeners();
    }
  }, [validProjectSlugs]);

  const setProjectSlugInUrl = useCallback(
    (projectSlug: string | null, mode: "push" | "replace") => {
      if (typeof window === "undefined") {
        return;
      }

      const nextProjectSlug =
        projectSlug && validProjectSlugs.has(projectSlug) ? projectSlug : null;
      const nextUrl = projectUrl(nextProjectSlug);

      if (nextUrl !== currentRelativeUrl()) {
        window.history[mode === "push" ? "pushState" : "replaceState"](
          null,
          "",
          nextUrl,
        );
      }

      notifyProjectUrlStateListeners();
    },
    [validProjectSlugs],
  );

  return { selectedProjectSlug, setProjectSlugInUrl };
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

function useStructuralMotion() {
  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    let mounted = true;
    let cleanupGsap: (() => void) | undefined;
    let cancelIdleTask: (() => void) | undefined;
    let motionGeneration = 0;

    function stopMotion() {
      motionGeneration += 1;
      cleanupGsap?.();
      cleanupGsap = undefined;
      cancelIdleTask?.();
      cancelIdleTask = undefined;
    }

    async function bootMotion(generation: number) {
      if (generation !== motionGeneration || prefersReducedMotion()) {
        return;
      }

      const [gsapModule, scrollTriggerModule] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      if (
        generation !== motionGeneration ||
        !mounted ||
        motionQuery.matches ||
        prefersReducedMotion()
      ) {
        return;
      }

      const gsap = gsapModule.default;
      const ScrollTrigger = scrollTriggerModule.ScrollTrigger;

      gsap.registerPlugin(ScrollTrigger);

      const context = gsap.context(() => {
        gsap.utils
          .toArray<HTMLElement>("[data-joe-reveal]")
          .forEach((element) => {
            gsap.fromTo(
              element,
              { autoAlpha: 0.9, y: 8 },
              {
                autoAlpha: 1,
                duration: 0.56,
                ease: "power3.out",
                scrollTrigger: {
                  start: "top 88%",
                  trigger: element,
                },
                y: 0,
              },
            );
          });
        gsap.fromTo(
          ".joe-github-card",
          { autoAlpha: 0.88, y: 8 },
          {
            autoAlpha: 1,
            duration: 0.5,
            ease: "power3.out",
            scrollTrigger: {
              start: "top 84%",
              trigger: ".joe-github-grid",
            },
            stagger: 0.035,
            y: 0,
          },
        );
        gsap.fromTo(
          ".joe-timeline article",
          { autoAlpha: 0.88, y: 8 },
          {
            autoAlpha: 1,
            duration: 0.5,
            ease: "power3.out",
            scrollTrigger: {
              start: "top 84%",
              trigger: ".joe-timeline",
            },
            stagger: 0.035,
            y: 0,
          },
        );
        gsap.fromTo(
          ".joe-certification-tile",
          { autoAlpha: 0.88, y: 8 },
          {
            autoAlpha: 1,
            duration: 0.5,
            ease: "power3.out",
            scrollTrigger: {
              start: "top 84%",
              trigger: "#credentials",
            },
            stagger: 0.035,
            y: 0,
          },
        );
        gsap.fromTo(
          ".joe-photo-card",
          { autoAlpha: 0.88, y: 8 },
          {
            autoAlpha: 1,
            duration: 0.52,
            ease: "power3.out",
            scrollTrigger: {
              start: "top 84%",
              trigger: ".joe-photo-marquee",
            },
            stagger: 0.045,
            y: 0,
          },
        );
      });

      cleanupGsap = () => {
        context.revert();
      };
    }

    function startMotion() {
      stopMotion();

      if (motionQuery.matches) {
        return;
      }

      const generation = motionGeneration;

      cancelIdleTask = scheduleIdleTask(() => {
        void bootMotion(generation);
      });
    }

    function handleMotionChange(event: MediaQueryListEvent) {
      if (!mounted) {
        return;
      }

      if (event.matches) {
        stopMotion();
        return;
      }

      startMotion();
    }

    motionQuery.addEventListener("change", handleMotionChange);
    startMotion();

    return () => {
      mounted = false;
      motionQuery.removeEventListener("change", handleMotionChange);
      stopMotion();
    };
  }, []);
}

function usePointerPolish() {
  useEffect(() => {
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const selector = [
      ".joe-work-card",
      ".joe-github-card",
      ".joe-system-role-card",
      ".joe-photo-card",
      ".joe-certification-tile",
      ".joe-blog-row",
    ].join(",");
    let activeSurface: HTMLElement | null = null;
    let isListening = false;

    function resetSurface(surface: HTMLElement | null) {
      surface?.style.removeProperty("--surface-x");
      surface?.style.removeProperty("--surface-y");
    }

    function resetActiveSurface() {
      resetSurface(activeSurface);
      activeSurface = null;
    }

    function canUsePointerPolish() {
      return canHover.matches && !reduceMotion.matches;
    }

    function handlePointerMove(event: PointerEvent) {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const surface = target.closest<HTMLElement>(selector);

      if (!surface) {
        resetActiveSurface();
        return;
      }

      if (activeSurface && activeSurface !== surface) {
        resetSurface(activeSurface);
      }

      const rect = surface.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;

      surface.style.setProperty("--surface-x", `${x.toFixed(2)}%`);
      surface.style.setProperty("--surface-y", `${y.toFixed(2)}%`);
      activeSurface = surface;
    }

    function handlePointerLeave() {
      resetActiveSurface();
    }

    function startListening() {
      if (isListening || !canUsePointerPolish()) {
        return;
      }

      document.addEventListener("pointermove", handlePointerMove, {
        passive: true,
      });
      document.addEventListener("pointerleave", handlePointerLeave);
      isListening = true;
    }

    function stopListening() {
      if (!isListening) {
        resetActiveSurface();
        return;
      }

      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerleave", handlePointerLeave);
      isListening = false;
      resetActiveSurface();
    }

    function syncPointerPolish() {
      if (canUsePointerPolish()) {
        startListening();
        return;
      }

      stopListening();
    }

    canHover.addEventListener("change", syncPointerPolish);
    reduceMotion.addEventListener("change", syncPointerPolish);
    syncPointerPolish();

    return () => {
      canHover.removeEventListener("change", syncPointerPolish);
      reduceMotion.removeEventListener("change", syncPointerPolish);
      stopListening();
    };
  }, []);
}

type PhotoDialogState = {
  alt: string;
  height: number;
  src: string;
  title: string;
  width: number;
};

const photoRailResumeTimers = new WeakMap<HTMLElement, number>();

function pausePhotoRailTemporarily(rail: HTMLElement, delay = 1_400) {
  rail.dataset.userInteracting = "true";

  const existingTimer = photoRailResumeTimers.get(rail);

  if (existingTimer) {
    window.clearTimeout(existingTimer);
  }

  const timer = window.setTimeout(() => {
    delete rail.dataset.userInteracting;
    photoRailResumeTimers.delete(rail);
  }, delay);

  photoRailResumeTimers.set(rail, timer);
}

function photoFromOpener(opener: HTMLElement): PhotoDialogState | null {
  const { photoAlt, photoHeight, photoSrc, photoTitle, photoWidth } =
    opener.dataset;
  const width = Number(photoWidth);
  const height = Number(photoHeight);

  if (!photoSrc || !photoAlt || !Number.isFinite(width) || !Number.isFinite(height)) {
    return null;
  }

  return {
    alt: photoAlt,
    height,
    src: photoSrc,
    title: photoTitle || photoAlt,
    width,
  };
}

function usePhotoRailInteraction(
  onOpenPhoto: (photo: PhotoDialogState) => void,
) {
  useEffect(() => {
    let dragState:
      | {
          opener: HTMLElement | null;
          pointerId: number;
          rail: HTMLElement;
          startScrollLeft: number;
          startX: number;
          wasDragging: boolean;
        }
      | null = null;
    let lastDragEndAt = 0;
    let lastPointerUpAt = 0;
    let pendingClickOpener: HTMLElement | null = null;

    function railFromEvent(event: Event) {
      const target = event.target;

      return target instanceof Element
        ? target.closest<HTMLElement>("[data-photo-rail]")
        : null;
    }

    function handleWheel(event: WheelEvent) {
      const rail = railFromEvent(event);

      if (!rail) {
        return;
      }

      const horizontalDelta =
        Math.abs(event.deltaX) >= Math.abs(event.deltaY) || event.shiftKey
          ? event.deltaX || event.deltaY
          : 0;

      if (!horizontalDelta) {
        return;
      }

      event.preventDefault();
      rail.scrollLeft += horizontalDelta;
      pausePhotoRailTemporarily(rail);
    }

    function handlePointerDown(event: PointerEvent) {
      if (event.button !== 0 || event.pointerType === "touch") {
        return;
      }

      const rail = railFromEvent(event);

      if (!rail) {
        return;
      }

      dragState = {
        opener:
          event.target instanceof Element
            ? event.target.closest<HTMLElement>("[data-photo-open]")
            : null,
        pointerId: event.pointerId,
        rail,
        startScrollLeft: rail.scrollLeft,
        startX: event.clientX,
        wasDragging: false,
      };
    }

    function handlePointerMove(event: PointerEvent) {
      if (!dragState || event.pointerId !== dragState.pointerId) {
        return;
      }

      const deltaX = event.clientX - dragState.startX;

      if (!dragState.wasDragging && Math.abs(deltaX) < 5) {
        return;
      }

      if (!dragState.wasDragging) {
        dragState.wasDragging = true;
        dragState.rail.dataset.dragging = "true";
        dragState.rail.setPointerCapture(event.pointerId);
      }

      dragState.rail.scrollLeft = dragState.startScrollLeft - deltaX;
      pausePhotoRailTemporarily(dragState.rail);
      event.preventDefault();
    }

    function finishDrag(event: PointerEvent) {
      if (!dragState || event.pointerId !== dragState.pointerId) {
        return;
      }

      const { opener, rail, wasDragging } = dragState;

      if (rail.hasPointerCapture(event.pointerId)) {
        rail.releasePointerCapture(event.pointerId);
      }

      delete rail.dataset.dragging;
      pausePhotoRailTemporarily(rail, wasDragging ? 900 : 240);

      if (wasDragging) {
        lastDragEndAt = performance.now();
      } else {
        pendingClickOpener = opener;
        lastPointerUpAt = performance.now();
      }

      dragState = null;
    }

    function handleClick(event: MouseEvent) {
      const target = event.target;
      const opener =
        target instanceof Element
          ? target.closest<HTMLElement>("[data-photo-open]")
          : null;
      const fallbackOpener =
        performance.now() - lastPointerUpAt < 320 ? pendingClickOpener : null;
      const photoOpener = opener ?? fallbackOpener;

      pendingClickOpener = null;

      if (!photoOpener) {
        return;
      }

      if (performance.now() - lastDragEndAt < 220) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      const photo = photoFromOpener(photoOpener);

      if (!photo) {
        return;
      }

      const rail = photoOpener.closest<HTMLElement>("[data-photo-rail]");

      if (rail) {
        rail.dataset.photoDialogOpen = "true";
      }

      event.preventDefault();
      onOpenPhoto(photo);
    }

    document.addEventListener("wheel", handleWheel, { passive: false });
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", finishDrag);
    document.addEventListener("pointercancel", finishDrag);
    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("wheel", handleWheel);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", finishDrag);
      document.removeEventListener("pointercancel", finishDrag);
      document.removeEventListener("click", handleClick, true);
    };
  }, [onOpenPhoto]);
}

function usePhotoDialogRailPause(open: boolean) {
  useEffect(() => {
    const rails = Array.from(
      document.querySelectorAll<HTMLElement>("[data-photo-rail]"),
    );

    for (const rail of rails) {
      if (open) {
        rail.dataset.photoDialogOpen = "true";
      } else {
        delete rail.dataset.photoDialogOpen;
      }
    }

    return () => {
      for (const rail of rails) {
        delete rail.dataset.photoDialogOpen;
      }
    };
  }, [open]);
}

function usePhotoRailKeyboard() {
  useEffect(() => {
    const handledKeys = new Set(["ArrowLeft", "ArrowRight", "Home", "End"]);

    function handleKeyDown(event: KeyboardEvent) {
      if (!handledKeys.has(event.key)) {
        return;
      }

      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const rail = target.closest<HTMLElement>("[data-photo-rail]");

      if (!rail) {
        return;
      }

      const card = rail.querySelector<HTMLElement>(".joe-photo-card");
      const cardWidth = card?.getBoundingClientRect().width ?? 0;
      const scrollStep = Math.max(
        Math.round(cardWidth),
        Math.round(rail.clientWidth * 0.8),
        240,
      );
      const behavior: ScrollBehavior = prefersReducedMotion() ? "auto" : "smooth";

      event.preventDefault();
      pausePhotoRailTemporarily(rail);

      if (event.key === "Home") {
        rail.scrollTo({ behavior, left: 0 });
        return;
      }

      if (event.key === "End") {
        rail.scrollTo({
          behavior,
          left: Math.max(0, rail.scrollWidth - rail.clientWidth),
        });
        return;
      }

      rail.scrollBy({
        behavior,
        left: event.key === "ArrowLeft" ? -scrollStep : scrollStep,
      });
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);
}

function ProjectDialog({
  onClose,
  project,
  projectTranslations,
}: {
  onClose: () => void;
  project: PublicProjectCaseStudy;
  projectTranslations: ProjectTranslationMap;
}) {
  const [open, setOpen] = useState(true);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useDialogFocusGuard(open, closeButtonRef);
  const asset = getPreferredImageAsset(project);
  const actionLinks = project.links.filter((link) => link.href);
  const language = useSiteLanguage();
  const localizedCopy = localizedProjectCopy(
    project,
    projectTranslations,
    language,
  );
  const closeLabel = language === "es" ? "Cerrar proyecto" : "Close project";

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
              aria-keyshortcuts="Escape"
              aria-label={closeLabel}
              className="joe-dialog-close"
              ref={closeButtonRef}
              title={closeLabel}
              type="button"
            >
              <SiteIcon aria-hidden iconKey="x" />
              <span className="sr-only">{closeLabel}</span>
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
                {localizedCopy.summary}
              </Dialog.Description>

              <dl>
                <div>
                  <dt>
                    <LocalizedText en="Role" es="Rol" />
                  </dt>
                  <dd>{localizedCopy.role}</dd>
                </div>
                <div>
                  <dt>
                    <LocalizedText en="Status" es="Estado" />
                  </dt>
                  <dd>{localizedCopy.status}</dd>
                </div>
              </dl>

              {localizedCopy.evidence.length > 0 ? (
                <ul>
                  {localizedCopy.evidence.slice(0, 4).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}

              <div className="joe-dialog-actions">
                <a href={`/work/${project.slug}`}>
                  <LocalizedText en="Open Case Study" es="Abrir caso" />
                  <SiteIcon aria-hidden iconKey="bookOpen" />
                </a>
                {actionLinks.map((link) => (
                  <a
                    href={link.href}
                    key={`${project.slug}-${link.href}`}
                    rel={link.external ? "noreferrer" : undefined}
                    target={link.external ? "_blank" : undefined}
                  >
                    {localizedActionLabel(link.label, language)}
                    <SiteIcon aria-hidden iconKey="arrowUpRight" />
                    {link.external ? (
                      <span className="sr-only">
                        <LocalizedText
                          en="opens in a new tab"
                          es="abre en una pestaña nueva"
                        />
                      </span>
                    ) : null}
                  </a>
                ))}
              </div>
            </div>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function PhotoDialog({
  onClose,
  photo,
}: {
  onClose: () => void;
  photo: PhotoDialogState;
}) {
  const [open, setOpen] = useState(true);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useDialogFocusGuard(open, closeButtonRef);
  const language = useSiteLanguage();
  const closeLabel = language === "es" ? "Cerrar foto" : "Close Photo";

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
            aria-label={photo.title}
            className="joe-photo-dialog"
            finalFocus={false}
            initialFocus={closeButtonRef}
            ref={dialogRef}
          >
            <Dialog.Close
              aria-keyshortcuts="Escape"
              aria-label={closeLabel}
              className="joe-dialog-close"
              ref={closeButtonRef}
              title={closeLabel}
              type="button"
            >
              <SiteIcon aria-hidden iconKey="x" />
              <span className="sr-only">{closeLabel}</span>
            </Dialog.Close>
            <Dialog.Title className="sr-only">{photo.title}</Dialog.Title>
            <div className="joe-photo-dialog-scroll">
              <figure className="joe-photo-dialog-media">
                <Image
                  alt={photo.alt}
                  className="joe-photo-dialog-image"
                  fetchPriority="high"
                  height={photo.height}
                  loading="eager"
                  sizes="(max-width: 760px) 165vw, 78vw"
                  src={photo.src}
                  width={photo.width}
                />
              </figure>
            </div>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function PortfolioRuntime({
  projectTranslations,
  projects,
  sections,
}: PortfolioRuntimeProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoDialogState | null>(
    null,
  );
  const openPhoto = useCallback((photo: PhotoDialogState) => {
    setSelectedPhoto(photo);
  }, []);

  useStructuralMotion();
  usePointerPolish();
  usePhotoRailKeyboard();
  usePhotoRailInteraction(openPhoto);
  usePhotoDialogRailPause(Boolean(selectedPhoto));

  const [activeSectionId, setActiveSectionId] =
    useState<PortfolioSectionId>("joe");
  const { selectedProjectSlug, setProjectSlugInUrl } =
    useProjectDialogUrlState(projects);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const previousSelectedProjectSlugRef = useRef<string | null>(null);
  const selectedProject = useMemo(
    () => projects.find((project) => project.slug === selectedProjectSlug),
    [projects, selectedProjectSlug],
  );

  useEffect(() => {
    document.documentElement.dataset.portfolioRuntime = "ready";

    return () => {
      delete document.documentElement.dataset.portfolioRuntime;
      delete document.documentElement.dataset.portfolioSection;
    };
  }, []);

  const restorePreviousFocus = useCallback((projectSlug: string | null) => {
    const explicitFocusTarget = previousFocusRef.current;

    window.requestAnimationFrame(() => {
      const fallbackFocusTarget =
        projectSlug
          ? Array.from(
              document.querySelectorAll<HTMLElement>("[data-project-open]"),
            ).find((trigger) => trigger.dataset.projectOpen === projectSlug)
          : null;
      const sectionFocusTarget = document.getElementById("work-title");
      const focusTarget =
        explicitFocusTarget ?? fallbackFocusTarget ?? sectionFocusTarget;

      if (focusTarget?.isConnected) {
        focusTarget.focus({ preventScroll: true });
      }

      if (previousFocusRef.current === explicitFocusTarget) {
        previousFocusRef.current = null;
      }
    });
  }, []);

  const closeOverlay = useCallback(() => {
    if (previousFocusRef.current && selectedProjectSlug) {
      window.history.back();
      return;
    }

    setProjectSlugInUrl(null, "replace");
  }, [selectedProjectSlug, setProjectSlugInUrl]);

  useEffect(() => {
    const previousProjectSlug = previousSelectedProjectSlugRef.current;

    if (previousProjectSlug && !selectedProjectSlug) {
      restorePreviousFocus(previousProjectSlug);
    }

    previousSelectedProjectSlugRef.current = selectedProjectSlug;
  }, [restorePreviousFocus, selectedProjectSlug]);

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
        const nextId = visible?.target.id as PortfolioSectionId | undefined;

        if (nextId) {
          setActiveSectionId(nextId);
          document.documentElement.dataset.portfolioSection = nextId;
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
        setProjectSlugInUrl(projectTrigger.dataset.projectOpen ?? null, "push");
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
  }, [closeOverlay, selectedProjectSlug, setProjectSlugInUrl]);

  return (
    <>
      <span className="sr-only" data-active-section={activeSectionId}>
        {activeSectionId}
      </span>
      {selectedProject ? (
        <ProjectDialog
          key={selectedProject.slug}
          onClose={closeOverlay}
          project={selectedProject}
          projectTranslations={projectTranslations}
        />
      ) : null}
      {selectedPhoto ? (
        <PhotoDialog
          key={selectedPhoto.src}
          onClose={() => setSelectedPhoto(null)}
          photo={selectedPhoto}
        />
      ) : null}
    </>
  );
}
