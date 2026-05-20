"use client";

import {
  Search,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
} from "react";

import { SiteIcon } from "@/components/site/site-icons";
import { Button } from "@/components/ui/button";
import {
  communityHighlights,
  navItems,
  projectCaseStudiesPublic,
  socialChannels,
  type IconKey,
  type NavHref,
} from "@/lib/site-data";
import { cn } from "@/lib/utils";

type CommandGroup = {
  label: string;
  items: CommandItem[];
};

type CommandItem = {
  description: string;
  external?: boolean;
  href: string;
  iconKey: IconKey;
  label: string;
  meta: string;
};

type SiteCommandNavProps = ComponentPropsWithoutRef<"div"> & {
  sectionPrefix?: string;
};

function resolveNavHref(href: NavHref | `#${string}`, sectionPrefix: string) {
  return href.startsWith("#") ? `${sectionPrefix}${href}` : href;
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function buildCommandGroups(sectionPrefix: string): CommandGroup[] {
  const sectionItems: CommandItem[] = [
    {
      description: "Return to the first personal signal.",
      href: resolveNavHref("#joe", sectionPrefix),
      iconKey: "home",
      label: "Joe",
      meta: "Start",
    },
    ...navItems.map((item) => ({
      description: `Jump to ${item.label.toLowerCase()}.`,
      href: resolveNavHref(item.href, sectionPrefix),
      iconKey: item.iconKey,
      label: item.label,
      meta: "Section",
    })),
  ];

  const workItems = [...projectCaseStudiesPublic]
    .sort((left, right) => {
      const leftRank = left.homepageFeature?.rank ?? 99;
      const rightRank = right.homepageFeature?.rank ?? 99;

      return leftRank - rightRank || left.title.localeCompare(right.title);
    })
    .slice(0, 4)
    .map((project) => ({
      description: project.proofSummary,
      href: resolveNavHref(`#work-${project.slug}`, sectionPrefix),
      iconKey: "appWindow" as const,
      label: project.title,
      meta: project.code,
    }));

  const peopleItems = communityHighlights.slice(0, 4).map((artifact) => ({
    description: artifact.body,
    href: resolveNavHref("#people", sectionPrefix),
    iconKey: "camera" as const,
    label: artifact.title,
    meta: artifact.code,
  }));

  const profileItems = socialChannels
    .filter((channel) => channel.href.startsWith("http"))
    .map((channel) => ({
      description: channel.description,
      external: true,
      href: channel.href,
      iconKey: channel.iconKey,
      label: channel.label,
      meta: channel.handle,
    }));

  return [
    { label: "Sections", items: sectionItems },
    { label: "Work", items: workItems },
    { label: "People", items: peopleItems },
    { label: "Profiles", items: profileItems },
  ];
}

function CommandIcon({
  icon: Icon,
  iconKey,
}: {
  icon?: LucideIcon;
  iconKey?: IconKey;
}) {
  if (Icon) {
    return <Icon aria-hidden />;
  }

  if (iconKey) {
    return <SiteIcon aria-hidden iconKey={iconKey} />;
  }

  return null;
}

export function SiteCommandNav({
  className,
  sectionPrefix = "",
  ...props
}: SiteCommandNavProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const hasOpenedRef = useRef(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const groups = useMemo(() => buildCommandGroups(sectionPrefix), [sectionPrefix]);
  const normalizedQuery = normalizeText(query);

  const filteredGroups = groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (!normalizedQuery) {
          return true;
        }

        return normalizeText(
          `${item.label} ${item.meta} ${item.description}`,
        ).includes(normalizedQuery);
      }),
    }))
    .filter((group) => group.items.length > 0);

  const openCommand = useCallback(() => {
    hasOpenedRef.current = true;
    setOpen(true);
  }, []);

  const closeCommand = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openCommand();
        return;
      }

      if (open && event.key === "Tab") {
        const focusableElements = Array.from(
          panelRef.current?.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ) ?? [],
        ).filter((element) => {
          const rect = element.getBoundingClientRect();
          const styles = window.getComputedStyle(element);

          return (
            rect.width > 0 &&
            rect.height > 0 &&
            styles.display !== "none" &&
            styles.visibility !== "hidden"
          );
        });
        const firstElement = focusableElements[0];
        const lastElement = focusableElements.at(-1);

        if (firstElement && lastElement) {
          if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
            return;
          }

          if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
            return;
          }
        }
      }

      if (event.key === "Escape") {
        closeCommand();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeCommand, open, openCommand]);

  useEffect(() => {
    if (!open) {
      if (hasOpenedRef.current) {
        triggerRef.current?.focus();
      }
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  return (
    <div className={cn("simo-command-nav", className)} {...props}>
      <Button
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Open jump menu"
        className="simo-command-trigger"
        onClick={openCommand}
        ref={triggerRef}
        type="button"
        variant="outline"
      >
        <CommandIcon icon={Search} />
        <span>Jump</span>
        <kbd>⌘K</kbd>
      </Button>

      {open ? (
        <div
          aria-modal="true"
          className="simo-command-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeCommand();
            }
          }}
          role="dialog"
        >
          <div className="simo-command-panel" ref={panelRef}>
            <div className="simo-command-search">
              <Search aria-hidden />
              <input
                aria-label="Filter jump destinations"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search sections, work, people, profiles..."
                ref={inputRef}
                type="search"
                value={query}
              />
              <button
                aria-label="Close jump menu"
                onClick={closeCommand}
                type="button"
              >
                <X aria-hidden />
                <span>Esc</span>
              </button>
            </div>

            <div className="simo-command-results">
              {filteredGroups.length > 0 ? (
                filteredGroups.map((group) => (
                  <section key={group.label}>
                    <h2>{group.label}</h2>
                    <div>
                      {group.items.map((item) => (
                        <a
                          href={item.href}
                          key={`${group.label}-${item.href}-${item.label}`}
                          onClick={closeCommand}
                          rel={item.external ? "noreferrer" : undefined}
                          target={item.external ? "_blank" : undefined}
                        >
                          <span className="simo-command-item-icon">
                            <SiteIcon aria-hidden iconKey={item.iconKey} />
                          </span>
                          <span className="simo-command-item-copy">
                            <strong>{item.label}</strong>
                            <span>{item.description}</span>
                          </span>
                          <em>{item.meta}</em>
                        </a>
                      ))}
                    </div>
                  </section>
                ))
              ) : (
                <p className="simo-command-empty">No matching destination.</p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
