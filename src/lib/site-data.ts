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
  | "video"
  | "x";

export type AccentKey = "ink" | "signal" | "live";

export type SiteNodeId =
  | "joe"
  | "method"
  | "work"
  | "trail"
  | "contact";

export type SceneMode =
  | "origin"
  | "method"
  | "work"
  | "trail"
  | "contact";

export type SiteRecordKind =
  | "origin"
  | "method"
  | "work"
  | "trail"
  | "contact";

export type SiteAction = {
  id?: string;
  label: string;
  href: string;
  external?: boolean;
  ariaLabel?: string;
  kind?: "primary" | "secondary" | "section";
};

export type SiteMedia = {
  kind: "portrait" | "artifact";
  src: string;
  alt: string;
  width: number;
  height: number;
  tone: "mono" | "desaturated";
};

export type ExperienceScene = {
  code: string;
  eyebrow: string;
  coordinate: string;
  tone: "origin" | "method" | "work" | "trail" | "contact";
  scrollRange: [number, number];
};

export type ExperienceRoute = {
  from: SiteNodeId;
  tension: number;
  depth: number;
};

export type SiteRecord = {
  id: SiteNodeId;
  label: string;
  shortLabel: string;
  kind: SiteRecordKind;
  status: string;
  detail: string;
  proof: string;
  primaryAction: SiteAction;
  secondaryActions: SiteAction[];
  iconKey: IconKey;
  accent: AccentKey;
  sceneMode: SceneMode;
  scene: ExperienceScene;
  route: ExperienceRoute;
  sectionAnchor: `#${string}`;
  readActionLabel: string;
  media?: SiteMedia;
  map: {
    desktopPoint: {
      x: number;
      y: number;
    };
    mobilePoint: {
      x: number;
      y: number;
    };
  };
};

export type SocialChannel = {
  label: string;
  handle: string;
  href: string;
  iconKey: IconKey;
  description: string;
};

export type ProfileFact = {
  label: string;
  value: string;
  detail: string;
  source: string;
};

export type GithubRepository = {
  name: string;
  href: string;
  description: string;
  kind: string;
  source: string;
  homepage?: string;
  meta: string[];
};

export type WorkArtifact = {
  label: string;
  title: string;
  detail: string;
  href: string;
  actionLabel: string;
  iconKey: IconKey;
  signal: [string, string, string];
  media?: SiteMedia;
};

export type ArtifactProofPoint = {
  id: string;
  code: string;
  label: string;
  visibleLabel: string;
  title: string;
  detail: string;
  x: number;
  y: number;
  zoom: {
    x: number;
    y: number;
  };
};

export type ProofItem = {
  id: string;
  label: string;
  claim: string;
  detail?: string;
  proofType:
    | "identity"
    | "artifact"
    | "code"
    | "profile"
    | "background"
    | "contact";
  sourceLabel: string;
  href?: string;
  media?: SiteMedia;
  crop?: {
    aspectRatio?: string;
    objectPosition?: string;
  };
};

export type SiteCanvasRecord = Pick<
  SiteRecord,
  | "id"
  | "label"
  | "shortLabel"
  | "kind"
  | "status"
  | "detail"
  | "proof"
  | "primaryAction"
  | "secondaryActions"
  | "iconKey"
  | "accent"
  | "sceneMode"
  | "scene"
  | "route"
  | "sectionAnchor"
  | "readActionLabel"
  | "media"
  | "map"
>;

export const originNodeId = "joe" satisfies SiteNodeId;
export const defaultActiveNodeId = "method" satisfies SiteNodeId;
export const routeNodeIds = [
  "method",
  "work",
  "trail",
  "contact",
] as const satisfies readonly SiteNodeId[];

export const legacyNodeIdMap = {
  home: "joe",
  now: "work",
  sim0: "work",
  code: "trail",
  linkedin: "method",
  systems: "method",
  notes: "trail",
  writing: "trail",
} as const satisfies Partial<Record<string, SiteNodeId>>;

export const legacyHashMap = {
  "#top": "joe",
  "#now": "joe",
  "#sim0": "work",
  "#background": "method",
  "#systems": "method",
  "#code": "trail",
  "#notes": "trail",
  "#writing": "trail",
} as const satisfies Partial<Record<string, SiteNodeId>>;

export const heroCopy = {
  title: "Joe Simo",
  intro:
    "Fort Myers devsigner working across support, systems, and web consulting.",
  detail:
    "I help make web interfaces and operational systems easier to understand and use. Current work: sim0.com.",
};

export const siteDescription =
  "Joe Simo is a Fort Myers devsigner working across support, systems, web consulting, and current product work at sim0.com.";

export const sim0Link: SiteAction = {
  id: "open-sim0",
  label: "Open sim0",
  href: "https://sim0.com",
  external: true,
  ariaLabel: "Open sim0 in a new tab",
  kind: "primary",
};

export const profileMedia: SiteMedia = {
  kind: "portrait",
  src: "/media/joe-simo-x-avatar.webp",
  alt: "Joe Simo portrait",
  width: 512,
  height: 512,
  tone: "mono",
};

export const sim0Media: SiteMedia = {
  kind: "artifact",
  src: "/media/sim0-editor-artifact.png",
  alt: "sim0 editor capture",
  width: 1495,
  height: 900,
  tone: "desaturated",
};

export const socialChannels: SocialChannel[] = [
  {
    label: "GitHub",
    handle: "@joe-simo",
    href: "https://github.com/joe-simo",
    iconKey: "github",
    description: "GitHub profile and public code.",
  },
  {
    label: "X",
    handle: "@joesimo",
    href: "https://x.com/joesimo",
    iconKey: "x",
    description: "X profile.",
  },
  {
    label: "Instagram",
    handle: "@joesimo_",
    href: "https://www.instagram.com/joesimo_/",
    iconKey: "camera",
    description: "Instagram profile.",
  },
  {
    label: "LinkedIn",
    handle: "josephsimo",
    href: "https://www.linkedin.com/in/josephsimo/",
    iconKey: "linkedin",
    description: "LinkedIn profile.",
  },
  {
    label: "YouTube",
    handle: "@jos007",
    href: "https://www.youtube.com/user/jos007",
    iconKey: "video",
    description: "YouTube profile.",
  },
  {
    label: "Email",
    handle: "hello@joesimo.com",
    href: "mailto:hello@joesimo.com",
    iconKey: "mail",
    description: "Direct email.",
  },
];

const githubChannel = socialChannels[0];
const xChannel = socialChannels[1];
const instagramChannel = socialChannels[2];
const linkedinChannel = socialChannels[3];
const emailChannel = socialChannels[5];

export const profileFacts: ProfileFact[] = [
  {
    label: "Name",
    value: "Joe Simo",
    detail: "The name I use across the public places linked here.",
    source: "Identity",
  },
  {
    label: "Bio",
    value: "Devsigner",
    detail: "The short public identity used here.",
    source: "Identity",
  },
  {
    label: "Location",
    value: "Fort Myers, Florida",
    detail: "I work from Fort Myers and keep this page direct.",
    source: "Base",
  },
  {
    label: "Professional track",
    value: "Support, systems, and web consulting",
    detail:
      "The interface work sits on support, systems, and web consulting.",
    source: "Background",
  },
  {
    label: "Work scope",
    value: "Support / systems / web consulting",
    detail:
      "The public contact lanes are support, systems, web consulting, sim0, and interface work.",
    source: "Background",
  },
  {
    label: "Telematics background",
    value: "Telematics Engineering",
    detail: "The engineering base is networks, systems, signals, and communication.",
    source: "Background",
  },
  {
    label: "Languages",
    value: "English and Spanish",
    detail: "I work comfortably across both.",
    source: "Background",
  },
];

export const githubRepositories: GithubRepository[] = [
  {
    name: "GitHub / @joe-simo",
    href: githubChannel.href,
    description: "Public GitHub profile.",
    kind: "Profile",
    source: "github.com/joe-simo",
    meta: ["github", "@joe-simo"],
  },
];

export const featuredWork: WorkArtifact = {
  label: "Current work",
  title: "sim0.com",
  detail: "sim0.com is Joe's current public work.",
  href: sim0Link.href,
  actionLabel: "Open sim0",
  iconKey: "appWindow",
  signal: ["Joe", "method", "sim0"],
  media: sim0Media,
};

export const sim0ProofPoints = [
  {
    id: "work",
    code: "01",
    label: "Current work",
    visibleLabel: "sim0-project",
    title: "sim0 is Joe's current public work.",
    detail:
      "The artifact shows the current work without inventing a portfolio case study around it.",
    x: 88,
    y: 35,
    zoom: { x: 88, y: 35 },
  },
  {
    id: "state",
    code: "02",
    label: "State",
    visibleLabel: "Resolving preview entry...",
    title: "The interface shows project state.",
    detail:
      "The center state keeps the next action readable instead of hiding the work behind an empty loading surface.",
    x: 50,
    y: 49,
    zoom: { x: 50, y: 49 },
  },
  {
    id: "ship",
    code: "03",
    label: "Ship",
    visibleLabel: "Ship",
    title: "Shipping stays visible.",
    detail:
      "The right-side project panel starts with a clear Ship action, keeping the release decision in view.",
    x: 88,
    y: 11,
    zoom: { x: 88, y: 11 },
  },
] as const satisfies readonly ArtifactProofPoint[];

export const workArtifacts: WorkArtifact[] = [featuredWork];

export const proofItems: ProofItem[] = [
  {
    id: "joe-identity",
    label: "Identity",
    claim: "Joe Simo, Devsigner, based in Fort Myers.",
    proofType: "identity",
    sourceLabel: "Joe",
    media: profileMedia,
    crop: {
      aspectRatio: "1 / 1",
      objectPosition: "50% 42%",
    },
  },
  {
    id: "method-background",
    label: "Method",
    claim:
      "Support work taught where software breaks. Telematics Engineering gave the signal base.",
    proofType: "background",
    sourceLabel: "Background",
  },
  {
    id: "current-work",
    label: "Current work",
    claim: "sim0.com is Joe's current public work.",
    detail:
      "The local capture shows the sim0 editor surface: project state, preview resolution, local API context, ship action, and change staging.",
    proofType: "artifact",
    sourceLabel: "Local artifact",
    href: sim0Link.href,
    media: sim0Media,
    crop: {
      aspectRatio: "16 / 10",
      objectPosition: "50% 50%",
    },
  },
];

export const siteRecords: SiteRecord[] = [
  {
    id: "joe",
    label: "Joe",
    shortLabel: "Joe",
    kind: "origin",
    status: "Joe Simo in Fort Myers.",
    detail:
      "Devsigner in Fort Myers, working across support, systems, web consulting, and interface work.",
    proof: "Joe Simo / Devsigner / Fort Myers",
    primaryAction: {
      id: "email-joe",
      label: "Email Joe",
      href: emailChannel.href,
      kind: "primary",
    },
    secondaryActions: [
      {
        id: "view-work",
        label: "View Work",
        href: "#work",
        kind: "section",
      },
    ],
    iconKey: "home",
    accent: "ink",
    sceneMode: "origin",
    scene: {
      code: "00",
      eyebrow: "Origin",
      coordinate: "Fort Myers / Joe",
      tone: "origin",
      scrollRange: [0, 0.16],
    },
    route: {
      from: "joe",
      tension: 0,
      depth: 0,
    },
    sectionAnchor: "#joe",
    readActionLabel: "Read Joe",
    media: profileMedia,
    map: {
      desktopPoint: { x: 62, y: 42 },
      mobilePoint: { x: 50, y: 50 },
    },
  },
  {
    id: "method",
    label: "Background",
    shortLabel: "background",
    kind: "method",
    status: "Support to signals to interfaces.",
    detail:
      "I start from the broken path a person can describe, trace the signal or system state behind it, then design the interface so the next action is obvious.",
    proof: "support / telematics / interfaces",
    primaryAction: {
      id: "view-work-method",
      label: "View Work",
      href: "#work",
      kind: "section",
    },
    secondaryActions: [
      {
        id: "open-linkedin",
        label: "LinkedIn",
        href: linkedinChannel.href,
        external: true,
        ariaLabel: "Open Joe Simo on LinkedIn in a new tab",
        kind: "secondary",
      },
    ],
    iconKey: "briefcase",
    accent: "signal",
    sceneMode: "method",
    scene: {
      code: "01",
      eyebrow: "Background",
      coordinate: "support / signals",
      tone: "method",
      scrollRange: [0.16, 0.38],
    },
    route: {
      from: "joe",
      tension: 0.66,
      depth: 0.58,
    },
    sectionAnchor: "#method",
    readActionLabel: "Read Method",
    map: {
      desktopPoint: { x: 69, y: 23 },
      mobilePoint: { x: 25, y: 16 },
    },
  },
  {
    id: "work",
    label: "Work",
    shortLabel: "work",
    kind: "work",
    status: "Current work at sim0.com.",
    detail: "sim0.com is Joe's current public work.",
    proof: "sim0.com / current public work",
    primaryAction: sim0Link,
    secondaryActions: [
      {
        id: "email-work",
        label: "Email Joe",
        href: emailChannel.href,
        kind: "secondary",
      },
    ],
    iconKey: "appWindow",
    accent: "signal",
    sceneMode: "work",
    scene: {
      code: "02",
      eyebrow: "Work",
      coordinate: "sim0 / product",
      tone: "work",
      scrollRange: [0.38, 0.58],
    },
    route: {
      from: "joe",
      tension: 0.72,
      depth: 0.78,
    },
    sectionAnchor: "#work",
    readActionLabel: "View Work",
    media: sim0Media,
    map: {
      desktopPoint: { x: 87, y: 28 },
      mobilePoint: { x: 75, y: 16 },
    },
  },
  {
    id: "trail",
    label: "Links",
    shortLabel: "links",
    kind: "trail",
    status: "GitHub, X, Instagram, LinkedIn, YouTube, and email.",
    detail: "Public links stay simple, with email as the direct contact path.",
    proof: "GitHub / X / Instagram / LinkedIn / YouTube",
    primaryAction: {
      id: "open-github",
      label: "GitHub",
      href: githubChannel.href,
      external: true,
      ariaLabel: "Open Joe Simo on GitHub in a new tab",
      kind: "primary",
    },
    secondaryActions: [
      {
        id: "open-x",
        label: "X",
        href: xChannel.href,
        external: true,
        ariaLabel: "Open Joe Simo on X in a new tab",
        kind: "secondary",
      },
      {
        id: "open-instagram",
        label: "Instagram",
        href: instagramChannel.href,
        external: true,
        ariaLabel: "Open Joe Simo on Instagram in a new tab",
        kind: "secondary",
      },
    ],
    iconKey: "code",
    accent: "ink",
    sceneMode: "trail",
    scene: {
      code: "03",
      eyebrow: "Links",
      coordinate: "public links",
      tone: "trail",
      scrollRange: [0.58, 0.78],
    },
    route: {
      from: "joe",
      tension: 0.36,
      depth: 0.32,
    },
    sectionAnchor: "#trail",
    readActionLabel: "Read Links",
    map: {
      desktopPoint: { x: 62, y: 74 },
      mobilePoint: { x: 25, y: 50 },
    },
  },
  {
    id: "contact",
    label: "Contact",
    shortLabel: "contact",
    kind: "contact",
    status: "Useful email is best.",
    detail:
      "Reach out about support, systems, web consulting, sim0, interface work, or a useful introduction.",
    proof: "hello@joesimo.com",
    primaryAction: {
      id: "email-contact",
      label: "Email",
      href: emailChannel.href,
      kind: "primary",
    },
    secondaryActions: [sim0Link],
    iconKey: "mail",
    accent: "live",
    sceneMode: "contact",
    scene: {
      code: "04",
      eyebrow: "Contact",
      coordinate: "hello@joesimo.com",
      tone: "contact",
      scrollRange: [0.78, 1],
    },
    route: {
      from: "joe",
      tension: 0.54,
      depth: 0.18,
    },
    sectionAnchor: "#contact",
    readActionLabel: "Contact Joe",
    map: {
      desktopPoint: { x: 76, y: 78 },
      mobilePoint: { x: 50, y: 84 },
    },
  },
];

export const navItems = siteRecords
  .filter((record) =>
    ["joe", "method", "work", "trail", "contact"].includes(record.id),
  )
  .map((record) => ({
    label: record.label,
    href: record.sectionAnchor,
    iconKey: record.iconKey,
    recordId: record.id,
  }));

export type NavHref = (typeof navItems)[number]["href"];

function recordsForCanvas(ids: readonly SiteNodeId[]): SiteCanvasRecord[] {
  return ids.map((id) => {
    const record = siteRecords.find((candidate) => candidate.id === id);

    if (!record) {
      throw new Error(`Missing canvas record: ${id}`);
    }

    return {
      id: record.id,
      label: record.label,
      shortLabel: record.shortLabel,
      kind: record.kind,
      status: record.status,
      detail: record.detail,
      proof: record.proof,
      primaryAction: record.primaryAction,
      secondaryActions: record.secondaryActions,
      iconKey: record.iconKey,
      accent: record.accent,
      sceneMode: record.sceneMode,
      scene: record.scene,
      route: record.route,
      sectionAnchor: record.sectionAnchor,
      readActionLabel: record.readActionLabel,
      media: record.media,
      map: record.map,
    };
  });
}

export const desktopCanvasRecords = recordsForCanvas([
  originNodeId,
  ...routeNodeIds,
]);
export const mobileCanvasRecords = recordsForCanvas(routeNodeIds);
export const mobileCanvasOriginRecord = recordsForCanvas([originNodeId])[0];
