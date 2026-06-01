import { RenderedLocalizedText } from "@/components/site/use-site-language";

export type SiteLanguage = "en" | "es";

export type LocalizedTextProps = {
  en: string;
  es: string;
};

export function LocalizedText(props: LocalizedTextProps) {
  return <RenderedLocalizedText {...props} />;
}

export const navLabelTranslations = {
  Blog: "Blog",
  Certifications: "Certificaciones",
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
