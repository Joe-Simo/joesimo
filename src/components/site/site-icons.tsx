import type { ComponentType, SVGProps } from "react";
import {
  AppWindow,
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  Camera,
  Code2,
  Home,
  Mail,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";

import type { IconKey } from "@/lib/site-data";

type SiteIconComponent = LucideIcon | ComponentType<SVGProps<SVGSVGElement>>;

function GitHubMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width="24"
      height="24"
      focusable="false"
      {...props}
    >
      <path d="M12 2C6.48 2 2 6.58 2 12.24c0 4.52 2.87 8.35 6.84 9.71.5.09.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.56 2.35 1.11 2.92.85.09-.67.35-1.11.63-1.37-2.22-.26-4.55-1.14-4.55-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.38 9.38 0 0 1 12 6.98c.85 0 1.7.12 2.5.34 1.9-1.33 2.74-1.05 2.74-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.8-4.57 5.05.36.32.68.95.68 1.92 0 1.38-.01 2.5-.01 2.84 0 .27.18.59.69.49A10.16 10.16 0 0 0 22 12.24C22 6.58 17.52 2 12 2Z" />
    </svg>
  );
}

function LinkedInMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width="24"
      height="24"
      focusable="false"
      {...props}
    >
      <path d="M5.38 8.8H2.45v12h2.93v-12ZM5.62 5.09c0-.96-.72-1.69-1.8-1.69-1.07 0-1.77.73-1.77 1.69 0 .94.68 1.69 1.73 1.69h.02c1.1 0 1.82-.75 1.82-1.69Zm16.33 8.82c0-3.68-1.96-5.39-4.58-5.39-2.11 0-3.05 1.16-3.58 1.98V8.8h-2.93c.04 1.13 0 12 0 12h2.93v-6.7c0-.36.03-.72.13-.97.29-.72.95-1.47 2.06-1.47 1.45 0 2.03 1.11 2.03 2.75v6.39h2.94v-6.89ZM9.3 8.8H6.37v12H9.3v-12Z" />
    </svg>
  );
}

export const siteIcons: Record<IconKey, SiteIconComponent> = {
  appWindow: AppWindow,
  arrowUpRight: ArrowUpRight,
  bookOpen: BookOpen,
  briefcase: BriefcaseBusiness,
  camera: Camera,
  code: Code2,
  github: GitHubMark,
  home: Home,
  linkedin: LinkedInMark,
  mail: Mail,
  menu: Menu,
  x: X,
};

type SiteIconProps = SVGProps<SVGSVGElement> & {
  iconKey: IconKey;
};

export function SiteIcon({ iconKey, ...props }: SiteIconProps) {
  const Icon = siteIcons[iconKey];

  return <Icon {...props} />;
}
