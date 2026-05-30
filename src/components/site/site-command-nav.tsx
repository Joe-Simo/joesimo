"use client";

import { Dialog } from "@base-ui/react/dialog";
import {
  Search,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  useEffect,
  useCallback,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
} from "react";

import { SiteIcon } from "@/components/site/site-icons";
import { LocalizedText } from "@/components/site/localized-text";
import { useSiteLanguage } from "@/components/site/use-site-language";
import { Button } from "@/components/ui/button";
import type { IconKey } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export type CommandText = {
  en: string;
  es: string;
};

export type CommandGroup = {
  label: CommandText;
  items: CommandItem[];
};

type CommandItem = {
  description: CommandText;
  external?: boolean;
  href: string;
  iconKey: IconKey;
  label: CommandText;
  meta: CommandText;
};

type SiteCommandNavProps = ComponentPropsWithoutRef<"div"> & {
  groups: readonly CommandGroup[];
};

function normalizeText(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function textForSearch(value: CommandText) {
  return `${value.en} ${value.es}`;
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
  groups,
  ...props
}: SiteCommandNavProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const language = useSiteLanguage();
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const normalizedQuery = normalizeText(query);
  const searchPlaceholder =
    language === "es"
      ? "Buscar secciones, trabajos, comunidad, perfiles…"
      : "Search sections, work, community, profiles…";

  const filteredGroups = groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (!normalizedQuery) {
          return true;
        }

        return normalizeText(
          `${textForSearch(item.label)} ${textForSearch(item.meta)} ${textForSearch(item.description)}`,
        ).includes(normalizedQuery);
      }),
    }))
    .filter((group) => group.items.length > 0);

  const openCommand = useCallback(() => {
    setOpen(true);
  }, []);

  const closeCommand = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  const resolveInitialFocus = useCallback(() => {
    const shouldFocusSearch =
      typeof window !== "undefined" &&
      window.matchMedia(
        "(min-width: 700px) and (hover: hover) and (pointer: fine)",
      ).matches;

    return shouldFocusSearch ? inputRef.current : closeButtonRef.current;
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openCommand();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openCommand]);

  return (
    <Dialog.Root
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);

        if (!nextOpen) {
          setQuery("");
        }
      }}
      open={open}
    >
      <div className={cn("simo-command-nav", className)} {...props}>
        <Button
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-label={
            language === "es" ? "Abrir menú de navegación" : "Open jump menu"
          }
          className="simo-command-trigger"
          onClick={openCommand}
          ref={triggerRef}
          type="button"
          variant="outline"
        >
          <CommandIcon icon={Search} />
          <span>
            <LocalizedText en="Jump" es="Navegar" />
          </span>
          <kbd>⌘K</kbd>
        </Button>

        <Dialog.Portal>
          <Dialog.Backdrop className="simo-command-overlay" />
          <Dialog.Viewport className="simo-command-layer">
            <Dialog.Popup
              aria-label={
                language === "es" ? "Menú de navegación" : "Jump menu"
              }
              className="simo-command-panel"
              finalFocus={triggerRef}
              initialFocus={resolveInitialFocus}
            >
              <div className="simo-command-search">
                <Search aria-hidden />
                <input
                  aria-label={
                    language === "es"
                      ? "Filtrar destinos de navegación"
                      : "Filter jump destinations"
                  }
                  aria-controls="site-command-results"
                  autoComplete="off"
                  enterKeyHint="search"
                  name="site-jump-search"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={searchPlaceholder}
                  ref={inputRef}
                  spellCheck={false}
                  type="search"
                  value={query}
                />
                <Dialog.Close
                  aria-label={
                    language === "es"
                      ? "Cerrar menú de navegación"
                      : "Close jump menu"
                  }
                  render={
                    <button ref={closeButtonRef} type="button">
                      <X aria-hidden />
                      <span>Esc</span>
                    </button>
                  }
                />
              </div>

              <div
                aria-live="polite"
                className="simo-command-results"
                id="site-command-results"
              >
                {filteredGroups.length > 0 ? (
                  filteredGroups.map((group) => (
                    <section key={group.label.en}>
                      <h2>
                        <LocalizedText
                          en={group.label.en}
                          es={group.label.es}
                        />
                      </h2>
                      <div>
                        {group.items.map((item) => (
                          <a
                            href={item.href}
                            key={`${group.label.en}-${item.href}-${item.label.en}`}
                            onClick={closeCommand}
                            rel={item.external ? "noreferrer" : undefined}
                            target={item.external ? "_blank" : undefined}
                          >
                            <span className="simo-command-item-icon">
                              <SiteIcon aria-hidden iconKey={item.iconKey} />
                            </span>
                            <span className="simo-command-item-copy">
                              <strong>
                                <LocalizedText
                                  en={item.label.en}
                                  es={item.label.es}
                                />
                              </strong>
                              <span>
                                <LocalizedText
                                  en={item.description.en}
                                  es={item.description.es}
                                />
                              </span>
                            </span>
                            <em>
                              <LocalizedText
                                en={item.meta.en}
                                es={item.meta.es}
                              />
                            </em>
                            {item.external ? (
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
                    </section>
                  ))
                ) : (
                  <p className="simo-command-empty" role="status">
                    {language === "es"
                      ? "No hay resultados."
                      : "No matching destination."}
                  </p>
                )}
              </div>
            </Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Portal>
      </div>
    </Dialog.Root>
  );
}
