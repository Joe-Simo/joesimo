export type SiteLanguage = "en" | "es";

export function LocalizedText({ en, es }: { en: string; es: string }) {
  return (
    <>
      <span className="i18n-text i18n-en" lang="en">
        {en}
      </span>
      <span className="i18n-text i18n-es" lang="es">
        {es}
      </span>
    </>
  );
}

export const navLabelTranslations = {
  Blog: "Blog",
  Community: "Comunidad",
  Contact: "Contacto",
  Credentials: "Credenciales",
  Joe: "Joe",
  Systems: "Sistemas",
  Work: "Trabajo",
} as const satisfies Record<string, string>;

export function navLabelEs(label: string) {
  if (label in navLabelTranslations) {
    return navLabelTranslations[label as keyof typeof navLabelTranslations];
  }

  return label;
}
