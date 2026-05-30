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

import { LocalizedText } from "@/components/site/localized-text";
import { SiteIcon } from "@/components/site/site-icons";
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

function currentLanguage(): SiteLanguage {
  return document.documentElement.dataset.language === "es" ? "es" : "en";
}

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
          ".joe-work-table article",
          { autoAlpha: 0.88, y: 8 },
          {
            autoAlpha: 1,
            duration: 0.5,
            ease: "power3.out",
            scrollTrigger: {
              start: "top 84%",
              trigger: ".joe-work-table",
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
          ".joe-proof-group",
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
          ".joe-photo-sheet figure",
          { autoAlpha: 0.88, y: 8 },
          {
            autoAlpha: 1,
            duration: 0.52,
            ease: "power3.out",
            scrollTrigger: {
              start: "top 84%",
              trigger: ".joe-photo-sheet",
            },
            stagger: 0.045,
            y: 0,
          },
        );
        gsap.to(".joe-identity-field", {
          opacity: 0.48,
          scrollTrigger: {
            end: "bottom top",
            scrub: 0.7,
            start: "top top",
            trigger: ".joe-hero",
          },
          yPercent: -9,
        });
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

function useScrollMeter() {
  useEffect(() => {
    let animationFrame = 0;

    function updateProgress() {
      animationFrame = 0;

      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? window.scrollY / scrollable : 0;

      document.documentElement.style.setProperty(
        "--joe-scroll-progress",
        Math.min(1, Math.max(0, progress)).toFixed(4),
      );
    }

    function requestUpdate() {
      if (animationFrame) {
        return;
      }

      animationFrame = window.requestAnimationFrame(updateProgress);
    }

    updateProgress();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }

      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      document.documentElement.style.removeProperty("--joe-scroll-progress");
    };
  }, []);
}

function usePointerPolish() {
  useEffect(() => {
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const selector = [
      ".joe-work-table article",
      ".joe-photo-sheet figure",
      ".joe-proof-group summary",
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
  const language = currentLanguage();
  const localizedCopy = localizedProjectCopy(
    project,
    projectTranslations,
    language,
  );

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
              aria-label={
                language === "es" ? "Cerrar proyecto" : "Close project"
              }
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

              {actionLinks.length > 0 ? (
                <div className="joe-dialog-actions">
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
              ) : null}
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
  useStructuralMotion();
  usePointerPolish();
  useScrollMeter();

  const [activeSectionId, setActiveSectionId] =
    useState<PortfolioSectionId>("joe");
  const [selectedProjectSlug, setSelectedProjectSlug] = useState<string | null>(
    null,
  );
  const previousFocusRef = useRef<HTMLElement | null>(null);
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
      <span aria-hidden="true" className="joe-scroll-meter" />
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
    </>
  );
}
