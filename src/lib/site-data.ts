export type IconKey =
  | "appWindow"
  | "arrowUpRight"
  | "bookOpen"
  | "briefcase"
  | "camera"
  | "code"
  | "github"
  | "home"
  | "linkedin"
  | "mail"
  | "menu"
  | "palette"
  | "video"
  | "x";

export type AccentKey = "ink" | "signal" | "green" | "red";

export type SiteNodeId =
  | "home"
  | "work"
  | "apps"
  | "design"
  | "writing"
  | "links"
  | "contact";

export type SiteRecordKind = "origin" | "shelf" | "profile" | "contact";

export type SiteAction = {
  label: string;
  href: string;
  external?: boolean;
};

export type SiteRecord = {
  id: SiteNodeId;
  label: string;
  kind: SiteRecordKind;
  status: string;
  primaryAction: SiteAction;
  secondaryAction?: SiteAction;
  iconKey: IconKey;
  accent: AccentKey;
  sectionAnchor: `#${string}`;
  externalUrl?: string;
  canvas: {
    x: number;
    y: number;
    animated?: boolean;
  };
};

export type SocialChannel = {
  label: string;
  handle: string;
  href: string;
  iconKey: IconKey;
  description: string;
};

export const heroCopy = {
  title: "Joe Simo",
  intro: "I build web things with a bias for sharp interfaces.",
  detail:
    "This is the front door for code, apps, notes, design pieces, and a direct way to reach me.",
};

export const socialChannels: SocialChannel[] = [
  {
    label: "GitHub",
    handle: "@joe-simo",
    href: "https://github.com/joe-simo",
    iconKey: "github",
    description: "Code and public build history.",
  },
  {
    label: "X",
    handle: "@joesimo",
    href: "https://x.com/joesimo",
    iconKey: "x",
    description: "Short notes and links.",
  },
  {
    label: "Instagram",
    handle: "@joesimo_",
    href: "https://www.instagram.com/joesimo_/",
    iconKey: "camera",
    description: "Visual notes.",
  },
  {
    label: "LinkedIn",
    handle: "josephsimo",
    href: "https://www.linkedin.com/in/josephsimo/",
    iconKey: "linkedin",
    description: "Professional profile.",
  },
  {
    label: "YouTube",
    handle: "@jos007",
    href: "https://www.youtube.com/@jos007",
    iconKey: "video",
    description: "Videos and demos.",
  },
  {
    label: "Email",
    handle: "hello@joesimo.com",
    href: "mailto:hello@joesimo.com",
    iconKey: "mail",
    description: "Direct contact.",
  },
];

const githubChannel = socialChannels[0];
const instagramChannel = socialChannels[2];
const xChannel = socialChannels[1];

export const siteRecords: SiteRecord[] = [
  {
    id: "home",
    label: "Joe",
    kind: "origin",
    status: "Web things, interface systems, and personal notes.",
    primaryAction: { label: "View links", href: "#links" },
    secondaryAction: { label: "Email", href: "mailto:hello@joesimo.com" },
    iconKey: "home",
    accent: "ink",
    sectionAnchor: "#top",
    canvas: { x: 360, y: 250 },
  },
  {
    id: "work",
    label: "Work",
    kind: "shelf",
    status: "Public case studies are kept private until they are ready.",
    primaryAction: { label: "Email for work", href: "mailto:hello@joesimo.com" },
    secondaryAction: { label: "Section", href: "#work" },
    iconKey: "briefcase",
    accent: "signal",
    sectionAnchor: "#work",
    canvas: { x: 34, y: 108 },
  },
  {
    id: "apps",
    label: "Apps",
    kind: "shelf",
    status: "Public app work is easiest to follow through GitHub.",
    primaryAction: {
      label: "View GitHub",
      href: githubChannel.href,
      external: true,
    },
    secondaryAction: { label: "Section", href: "#apps" },
    iconKey: "appWindow",
    accent: "green",
    sectionAnchor: "#apps",
    externalUrl: githubChannel.href,
    canvas: { x: 80, y: 430, animated: true },
  },
  {
    id: "design",
    label: "Design",
    kind: "shelf",
    status: "Visual notes and interface fragments show up when they are public.",
    primaryAction: {
      label: "View Instagram",
      href: instagramChannel.href,
      external: true,
    },
    secondaryAction: { label: "Section", href: "#design" },
    iconKey: "palette",
    accent: "red",
    sectionAnchor: "#design",
    externalUrl: instagramChannel.href,
    canvas: { x: 686, y: 96 },
  },
  {
    id: "writing",
    label: "Writing",
    kind: "shelf",
    status: "No public writing here yet.",
    primaryAction: { label: "Open writing", href: "/blog" },
    secondaryAction: { label: "Follow notes", href: xChannel.href, external: true },
    iconKey: "bookOpen",
    accent: "ink",
    sectionAnchor: "#writing",
    canvas: { x: 732, y: 412 },
  },
  {
    id: "links",
    label: "Links",
    kind: "profile",
    status: "GitHub, X, Instagram, LinkedIn, YouTube, and email.",
    primaryAction: { label: "View links", href: "#links" },
    secondaryAction: { label: "Email", href: "mailto:hello@joesimo.com" },
    iconKey: "arrowUpRight",
    accent: "signal",
    sectionAnchor: "#links",
    canvas: { x: 362, y: 584, animated: true },
  },
  {
    id: "contact",
    label: "Contact",
    kind: "contact",
    status: "Send a direct note about work, apps, or a useful introduction.",
    primaryAction: { label: "Email", href: "mailto:hello@joesimo.com" },
    iconKey: "mail",
    accent: "green",
    sectionAnchor: "#contact",
    canvas: { x: 372, y: -34 },
  },
];

export const shelfRecords = siteRecords.filter(
  (record): record is SiteRecord & { kind: "shelf" } =>
    record.kind === "shelf",
);

export const navItems = [
  { label: "Work", href: "#work" },
  { label: "Apps", href: "#apps" },
  { label: "Writing", href: "#writing" },
  { label: "Links", href: "#links" },
  { label: "Contact", href: "#contact" },
] as const;

export const contactLink = socialChannels[5];
