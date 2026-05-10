import type { SVGProps } from "react";
import {
  AppWindow,
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  Camera,
  Code2,
  GitBranch,
  Home,
  Mail,
  Menu,
  Palette,
  SquareUser,
  Video,
  X,
  type LucideIcon,
} from "lucide-react";

import type { IconKey } from "@/lib/site-data";

export const siteIcons: Record<IconKey, LucideIcon> = {
  appWindow: AppWindow,
  arrowUpRight: ArrowUpRight,
  bookOpen: BookOpen,
  briefcase: BriefcaseBusiness,
  camera: Camera,
  code: Code2,
  github: GitBranch,
  home: Home,
  linkedin: SquareUser,
  mail: Mail,
  menu: Menu,
  palette: Palette,
  video: Video,
  x: X,
};

type SiteIconProps = SVGProps<SVGSVGElement> & {
  iconKey: IconKey;
};

export function SiteIcon({ iconKey, ...props }: SiteIconProps) {
  const Icon = siteIcons[iconKey];

  return <Icon {...props} />;
}
