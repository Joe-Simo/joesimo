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
import {
  siGithub,
  siV0,
  siX,
  siYoutube,
  type SimpleIcon,
} from "simple-icons";

import type { IconKey } from "@/lib/site-data";

type SiteIconComponent = LucideIcon | ComponentType<SVGProps<SVGSVGElement>>;

function SimpleIconMark({
  icon,
  ...props
}: SVGProps<SVGSVGElement> & {
  icon: SimpleIcon;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width="24"
      height="24"
      focusable="false"
      {...props}
    >
      <path d={icon.path} />
    </svg>
  );
}

function GitHubMark(props: SVGProps<SVGSVGElement>) {
  return <SimpleIconMark icon={siGithub} {...props} />;
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

function V0Mark(props: SVGProps<SVGSVGElement>) {
  return <SimpleIconMark icon={siV0} {...props} />;
}

function XLogoMark(props: SVGProps<SVGSVGElement>) {
  return <SimpleIconMark icon={siX} {...props} />;
}

function YouTubeMark(props: SVGProps<SVGSVGElement>) {
  return <SimpleIconMark icon={siYoutube} {...props} />;
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
  v0: V0Mark,
  youtube: YouTubeMark,
  x: X,
  xLogo: XLogoMark,
};

type SiteIconProps = SVGProps<SVGSVGElement> & {
  iconKey: IconKey;
};

export function SiteIcon({ iconKey, ...props }: SiteIconProps) {
  const Icon = siteIcons[iconKey];

  return <Icon {...props} />;
}
