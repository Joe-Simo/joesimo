import type { LucideIcon } from "lucide-react";
import {
  AppWindow,
  BookOpen,
  BriefcaseBusiness,
  Camera,
  GitBranch,
  Layers3,
  Mail,
  Palette,
  PencilLine,
  Rocket,
  Video,
  X,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
};

export type Channel = {
  label: string;
  handle: string;
  href: string;
  icon: LucideIcon;
  description: string;
};

export type PortfolioArea = {
  value: string;
  label: string;
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  action: string;
};

export const navItems: NavItem[] = [
  { label: "Work", href: "#work" },
  { label: "Apps", href: "#apps" },
  { label: "Design", href: "#design" },
  { label: "Blog", href: "/blog" },
];

export const channels: Channel[] = [
  {
    label: "GitHub",
    handle: "@joe-simo",
    href: "https://github.com/joe-simo",
    icon: GitBranch,
    description: "Code, repos, and public build history.",
  },
  {
    label: "X",
    handle: "@joesimo",
    href: "https://x.com/joesimo",
    icon: X,
    description: "Short notes, links, and shipping updates.",
  },
  {
    label: "Instagram",
    handle: "@joesimo_",
    href: "https://www.instagram.com/joesimo_/",
    icon: Camera,
    description: "Design details and workbench snapshots.",
  },
  {
    label: "LinkedIn",
    handle: "josephsimo",
    href: "https://www.linkedin.com/in/josephsimo/",
    icon: BriefcaseBusiness,
    description: "Professional profile and work background.",
  },
  {
    label: "YouTube",
    handle: "@jos007",
    href: "https://www.youtube.com/@jos007",
    icon: Video,
    description: "Videos, demos, and whatever makes it to camera.",
  },
];

export const portfolioAreas: PortfolioArea[] = [
  {
    value: "work",
    label: "Work",
    title: "Selected work",
    description:
      "A home for real case studies, launches, and product decisions once the public pieces are ready.",
    href: "#work",
    icon: Rocket,
    action: "Open work",
  },
  {
    value: "apps",
    label: "Apps",
    title: "App index",
    description:
      "A clean index for current and past apps without inflated metrics or placeholder products.",
    href: "#apps",
    icon: AppWindow,
    action: "View apps",
  },
  {
    value: "design",
    label: "Design",
    title: "Design archive",
    description:
      "Interface systems, prototypes, visual explorations, and the small details behind them.",
    href: "#design",
    icon: Palette,
    action: "See designs",
  },
  {
    value: "blog",
    label: "Blog",
    title: "Writing desk",
    description:
      "A blog route is wired in for essays, build notes, and personal field reports when posts are published.",
    href: "/blog",
    icon: BookOpen,
    action: "Read blog",
  },
];

export const workPrinciples = [
  {
    title: "Minimal surface",
    body: "Fewer sections, clearer decisions, and enough whitespace for the work to breathe.",
    icon: Layers3,
  },
  {
    title: "Real content only",
    body: "No invented apps, fake post dates, or vanity metrics. Empty states stay honest until content exists.",
    icon: PencilLine,
  },
  {
    title: "Quiet interaction",
    body: "Micro-interactions support discovery without turning the portfolio into a carnival.",
    icon: AppWindow,
  },
];

export const contactLink = {
  label: "Get in touch",
  href: "mailto:hello@joesimo.com",
  icon: Mail,
};
