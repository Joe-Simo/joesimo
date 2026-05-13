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

export type AccentKey = "ink" | "signal" | "fault" | "live";

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

export type FieldNote = {
  code: string;
  title: string;
  body: string;
  source: string;
};

export type TraceStageId = "breakage" | "signals" | "surface";

export type TraceStage = {
  id: TraceStageId;
  nodeId: SiteNodeId;
  code: string;
  label: string;
  word: string;
  detail: string;
  ariaValue: string;
  progress: number;
};

export type MethodReceipt = {
  id: TraceStageId;
  code: string;
  label: string;
  problem: string;
  signal: string;
  surface: string;
  proof: string;
  sourceLabel: string;
};

export type StudioSceneId =
  | "joe"
  | "breakage"
  | "signals"
  | "surface"
  | "trail"
  | "contact";

export type StudioScene = {
  id: StudioSceneId;
  code: string;
  label: string;
  shortLabel: string;
  title: string;
  body: string;
  sourceLabel: string;
  progress: number;
  sectionAnchor: `#${string}`;
  sceneMode: SceneMode;
  point: {
    x: number;
    y: number;
  };
  action?: SiteAction;
  media?: SiteMedia;
};

export type StudioSpecimen = {
  scene: StudioSceneId;
  title: string;
  sourceLabel: string;
  body: string;
  media?: SiteMedia;
  actions?: SiteAction[];
};

export type StudioMoment = {
  id: string;
  scene: StudioSceneId;
  progress: number;
  label: string;
  code: string;
  readout: string;
  sourceLabel: string;
  artifactCrop?: {
    objectPosition?: string;
    scale?: number;
  };
  actions?: SiteAction[];
};

export type OwnedArtifact = {
  id: string;
  code: string;
  scene: StudioSceneId;
  label: string;
  title: string;
  detail: string;
  sourceLabel: string;
  sourceNote: string;
  media: SiteMedia;
  priority: "primary" | "secondary";
  action?: SiteAction;
};

export type ProjectSignal = {
  id: string;
  code: string;
  label: string;
  title: string;
  detail: string;
  sourceLabel: string;
  media?: SiteMedia;
};

export type WritingFragment = {
  code: string;
  title: string;
  body: string;
  source: string;
};

export type PublicDepthItem = {
  code: string;
  label: string;
  title: string;
  detail: string;
  source: string;
  href?: string;
  actionLabel?: string;
  media?: SiteMedia;
  meta: string[];
};

export type WorldArtifact = {
  id: string;
  code: string;
  label: string;
  source: string;
  title: string;
  detail: string;
  stage: "origin" | "breakage" | "signal" | "surface" | "trail" | "contact";
  href?: string;
  actionLabel?: string;
  media?: SiteMedia;
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
export const defaultActiveNodeId = "joe" satisfies SiteNodeId;
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
  intro: "I build interfaces from systems work.",
  detail:
    "Support taught me where software breaks. Telematics taught me how signals move. sim0 is the current product surface of that method.",
};

export const siteDescription =
  "Joe Simo is a Fort Myers devsigner building interfaces from support, systems, telematics, and current product work at sim0.com.";

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

export const sim0CurrentEditorMedia: SiteMedia = {
  kind: "artifact",
  src: "/media/work/sim0-current-editor.webp",
  alt: "sim0 working surface capture",
  width: 1495,
  height: 900,
  tone: "desaturated",
};

export const astrosimoVerifiedCaptureMedia: SiteMedia = {
  kind: "artifact",
  src: "/media/work/astrosimo-verified-capture.webp",
  alt: "Astrosimo verified in-app capture screen",
  width: 560,
  height: 1214,
  tone: "desaturated",
};

export const astrosimoNightPlannerMedia: SiteMedia = {
  kind: "artifact",
  src: "/media/work/astrosimo-night-planner.webp",
  alt: "Astrosimo AI night planner screen",
  width: 560,
  height: 1214,
  tone: "desaturated",
};

export const astrosimoLiveGuidanceMedia: SiteMedia = {
  kind: "artifact",
  src: "/media/work/astrosimo-live-guidance.webp",
  alt: "Astrosimo live sky guidance screen",
  width: 560,
  height: 1214,
  tone: "desaturated",
};

export const antonetaGardenMedia: SiteMedia = {
  kind: "artifact",
  src: "/media/work/antoneta-garden-unity.webp",
  alt: "Antoneta's Garden Unity menu capture",
  width: 960,
  height: 633,
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
    value: "Devsigner. One more thing...",
    detail: "The short public identity from Joe's GitHub profile.",
    source: "GitHub",
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
    source: "Method",
  },
  {
    label: "Work scope",
    value: "Support / systems / web consulting",
    detail:
      "The public contact lanes are support, systems, web consulting, sim0, and interface work.",
    source: "Method",
  },
  {
    label: "Telematics",
    value: "Telematics Engineering",
    detail: "The engineering base is networks, systems, signals, and communication.",
    source: "Method",
  },
  {
    label: "Languages",
    value: "English and Spanish",
    detail: "I work comfortably across both.",
    source: "Method",
  },
];

export const githubRepositories: GithubRepository[] = [
  {
    name: "openai-agents-js",
    href: "https://github.com/joe-simo/openai-agents-js",
    description:
      "Public GitHub fork described as a lightweight framework for multi-agent workflows and voice agents.",
    kind: "Public fork",
    source: "github.com/joe-simo/openai-agents-js",
    homepage: "https://openai.github.io/openai-agents-js/",
    meta: ["github", "public repo", "agent workflow"],
  },
  {
    name: "GitHub / @joe-simo",
    href: githubChannel.href,
    description:
      "Public GitHub profile for Joe Simo: Devsigner. One more thing...",
    kind: "Profile",
    source: "github.com/joe-simo",
    meta: ["github", "@joe-simo", "public trail"],
  },
];

export const featuredWork: WorkArtifact = {
  label: "Current work",
  title: "sim0.com",
  detail:
    "sim0 is the current public product surface of Joe's method: browser-first workflow, visible system state, and interface decisions close to the work.",
  href: sim0Link.href,
  actionLabel: "Open sim0",
  iconKey: "appWindow",
  signal: ["Joe", "method", "interface"],
  media: sim0Media,
};

export const sim0ProofPoints = [
  {
    id: "preview",
    code: "01",
    label: "Preview state",
    visibleLabel: "Resolving preview entry...",
    title: "The product exposes state instead of hiding it.",
    detail:
      "The capture shows preview resolution in the open, so the user can see what the system is preparing.",
    x: 50,
    y: 49,
    zoom: { x: 50, y: 49 },
  },
  {
    id: "runtime",
    code: "02",
    label: "Runtime",
    visibleLabel: "SSR wiring",
    title: "Runtime work stays close to the interface.",
    detail:
      "The artifact points to entry runtime and SSR wiring without turning the page into an implementation dump.",
    x: 52,
    y: 57,
    zoom: { x: 52, y: 57 },
  },
  {
    id: "api",
    code: "03",
    label: "Local API",
    visibleLabel: "Local API",
    title: "Local context is visible.",
    detail:
      "The editor surface keeps local API context and preview state in the same working field.",
    x: 25,
    y: 83,
    zoom: { x: 25, y: 83 },
  },
  {
    id: "ship",
    code: "04",
    label: "Ship",
    visibleLabel: "Ship",
    title: "Shipping stays visible.",
    detail:
      "The right-side project panel starts with a clear Ship action, keeping the release decision in view.",
    x: 88,
    y: 11,
    zoom: { x: 88, y: 11 },
  },
  {
    id: "changes",
    code: "05",
    label: "Changes",
    visibleLabel: "Staged changes",
    title: "Change state remains inspectable.",
    detail:
      "The surface shows repository and change context without padding a case study around it.",
    x: 88,
    y: 72,
    zoom: { x: 88, y: 72 },
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
    detail:
      "The working method is simple: find the break, read the signal, make the next action visible.",
    proofType: "background",
    sourceLabel: "Method",
  },
  {
    id: "current-work",
    label: "Current work",
    claim: "sim0.com is the current public product surface.",
    detail:
      "The local capture shows preview state, runtime context, local API context, ship action, and change staging.",
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

export const fieldNotes: FieldNote[] = [
  {
    code: "N1",
    title: "The broken path is the brief.",
    body:
      "If the failure can be described in plain language, the interface has enough signal to begin. The first job is to make the stuck moment visible.",
    source: "Support",
  },
  {
    code: "N2",
    title: "A system is only useful when its state can be read.",
    body:
      "Telematics trained the habit: timing, handoff, routing, and state matter. The screen should not hide those signals from the person doing the work.",
    source: "Signals",
  },
  {
    code: "N3",
    title: "The surface should move the work forward.",
    body:
      "Good interface work does not decorate the system. It brings consequence close to the control and makes the next action hard to miss.",
    source: "Interface",
  },
];

export const traceStages = [
  {
    id: "breakage",
    nodeId: "method",
    code: "01",
    label: "Support",
    word: "Breakage",
    detail: "Support taught Joe to start with the failure path.",
    ariaValue: "Breakage. Support taught Joe to start with the failure path.",
    progress: 0,
  },
  {
    id: "signals",
    nodeId: "method",
    code: "02",
    label: "Telematics",
    word: "Signals",
    detail: "Telematics shaped how Joe reads systems, timing, and state.",
    ariaValue:
      "Signals. Telematics shaped how Joe reads systems, timing, and state.",
    progress: 0.5,
  },
  {
    id: "surface",
    nodeId: "work",
    code: "03",
    label: "Interface",
    word: "Surface",
    detail: "sim0 is the current public surface of that method.",
    ariaValue: "Surface. sim0 is the current public surface of that method.",
    progress: 1,
  },
] as const satisfies readonly TraceStage[];

export const methodReceipts: MethodReceipt[] = [
  {
    id: "breakage",
    code: "01",
    label: "Support",
    problem: "A person can usually name the moment where the product stops.",
    signal: "That sentence is the first trace: where they were, what changed, and what they tried next.",
    surface:
      "The interface work begins by making that stuck state visible instead of burying it.",
    proof: "support / failure path",
    sourceLabel: "Joe-supplied method",
  },
  {
    id: "signals",
    code: "02",
    label: "Telematics",
    problem: "Systems fail through timing, routing, handoff, and missing state.",
    signal:
      "Telematics trained the habit of reading movement, state, and consequence before drawing the screen.",
    surface:
      "Controls belong close to the signal they affect, with state shown before the action.",
    proof: "telematics / system signal",
    sourceLabel: "Joe-supplied background",
  },
  {
    id: "surface",
    code: "03",
    label: "Interface",
    problem: "A beautiful screen is still weak if the next move is unclear.",
    signal:
      "sim0 is the current public artifact for this: preview state, runtime context, local API context, shipping, and staged changes.",
    surface:
      "The product surface keeps the system readable while the work is happening.",
    proof: "local sim0 artifact",
    sourceLabel: "Local owned asset",
  },
];

export const methodStudioScenes: StudioScene[] = [
  {
    id: "joe",
    code: "00",
    label: "Joe",
    shortLabel: "Joe",
    title: "Joe Simo",
    body: "I build interfaces from systems work.",
    sourceLabel: "Fort Myers / Devsigner",
    progress: 0,
    sectionAnchor: "#joe",
    sceneMode: "origin",
    point: { x: 24, y: 52 },
    action: {
      id: "email-joe-studio",
      label: "Email Joe",
      href: emailChannel.href,
      kind: "primary",
    },
    media: profileMedia,
  },
  {
    id: "breakage",
    code: "01",
    label: "Breakage",
    shortLabel: "Break",
    title: "The method starts at the break.",
    body:
      "Support work starts where a person can describe the stuck point in plain language.",
    sourceLabel: "Support / failure path",
    progress: 0.2,
    sectionAnchor: "#method",
    sceneMode: "method",
    point: { x: 39, y: 30 },
  },
  {
    id: "signals",
    code: "02",
    label: "Signals",
    shortLabel: "Signal",
    title: "The signal explains the shape.",
    body:
      "Telematics trained the habit of reading timing, routing, state, and handoff before drawing the screen.",
    sourceLabel: "Telematics / system state",
    progress: 0.4,
    sectionAnchor: "#signals",
    sceneMode: "method",
    point: { x: 57, y: 46 },
  },
  {
    id: "surface",
    code: "03",
    label: "Surface",
    shortLabel: "Surface",
    title: "sim0 is the current surface.",
    body:
      "The local sim0 artifact shows preview state, runtime context, shipping, and staged changes in one working field.",
    sourceLabel: "sim0 / local artifact",
    progress: 0.62,
    sectionAnchor: "#work",
    sceneMode: "work",
    point: { x: 78, y: 32 },
    action: sim0Link,
    media: sim0Media,
  },
  {
    id: "trail",
    code: "04",
    label: "Trail",
    shortLabel: "Trail",
    title: "The public trail stays direct.",
    body:
      "GitHub, X, Instagram, LinkedIn, YouTube, and email stay as factual exits, not a feed wall.",
    sourceLabel: "Public profiles",
    progress: 0.82,
    sectionAnchor: "#trail",
    sceneMode: "trail",
    point: { x: 58, y: 78 },
    action: {
      id: "open-github-studio",
      label: "GitHub",
      href: githubChannel.href,
      external: true,
      ariaLabel: "Open Joe Simo on GitHub in a new tab",
      kind: "primary",
    },
  },
  {
    id: "contact",
    code: "05",
    label: "Contact",
    shortLabel: "Contact",
    title: "Email is the direct route.",
    body:
      "Support, systems, web consulting, sim0, interface work, or a useful introduction can start here.",
    sourceLabel: "hello@joesimo.com",
    progress: 1,
    sectionAnchor: "#contact",
    sceneMode: "contact",
    point: { x: 84, y: 74 },
    action: {
      id: "email-contact-studio",
      label: "Email Joe",
      href: emailChannel.href,
      kind: "primary",
    },
  },
];

export const methodStudioSpecimens: StudioSpecimen[] = [
  {
    scene: "joe",
    title: "A real person before the system.",
    sourceLabel: "Joe",
    body:
      "The portrait stays restrained. The identity is Joe Simo, Fort Myers, Devsigner, English and Spanish.",
    media: profileMedia,
    actions: [
      {
        id: "email-joe-specimen",
        label: "Email Joe",
        href: emailChannel.href,
        kind: "primary",
      },
    ],
  },
  {
    scene: "breakage",
    title: "The broken path is the first artifact.",
    sourceLabel: "Support",
    body:
      "What broke, where it broke, and what a person tried next become the interface brief.",
  },
  {
    scene: "signals",
    title: "Readable state is the working material.",
    sourceLabel: "Telematics",
    body:
      "Timing, route, handoff, and consequence decide where the screen needs to become explicit.",
  },
  {
    scene: "surface",
    title: "The method becomes visible in sim0.",
    sourceLabel: "Local owned artifact",
    body:
      "The artifact is the working surface: preview state, runtime context, local API context, ship control, and staged change state. Astrosimo appears only as a secondary owned release artifact.",
    media: sim0Media,
    actions: [sim0Link],
  },
  {
    scene: "trail",
    title: "Public proof stays small and named.",
    sourceLabel: "Public profiles",
    body:
      "The page links to the actual public surfaces without importing private feed content.",
    actions: [
      {
        id: "github-specimen",
        label: "GitHub",
        href: githubChannel.href,
        external: true,
        ariaLabel: "Open Joe Simo on GitHub in a new tab",
        kind: "primary",
      },
      {
        id: "linkedin-specimen",
        label: "LinkedIn",
        href: linkedinChannel.href,
        external: true,
        ariaLabel: "Open Joe Simo on LinkedIn in a new tab",
        kind: "secondary",
      },
    ],
  },
  {
    scene: "contact",
    title: "The exit is direct.",
    sourceLabel: "Email",
    body:
      "No funnel, no pitch deck, no feed wall. Email is the route for useful work and clean introductions.",
    actions: [
      {
        id: "email-contact-specimen",
        label: "Email Joe",
        href: emailChannel.href,
        kind: "primary",
      },
    ],
  },
];

export const methodStudioMoments: StudioMoment[] = [
  {
    id: "moment-joe",
    scene: "joe",
    progress: 0,
    label: "Joe",
    code: "00",
    readout: "Joe Simo. Fort Myers. Devsigner.",
    sourceLabel: "Identity",
    actions: [
      {
        id: "moment-email-joe",
        label: "Email Joe",
        href: emailChannel.href,
        kind: "primary",
      },
    ],
  },
  {
    id: "moment-breakage",
    scene: "breakage",
    progress: 0.2,
    label: "Breakage",
    code: "01",
    readout: "Start where the product stops.",
    sourceLabel: "Support",
  },
  {
    id: "moment-signals",
    scene: "signals",
    progress: 0.4,
    label: "Signals",
    code: "02",
    readout: "Read timing, route, handoff, and state.",
    sourceLabel: "Telematics",
  },
  {
    id: "moment-surface",
    scene: "surface",
    progress: 0.62,
    label: "Surface",
    code: "03",
    readout: "The trace lands on real product surfaces.",
    sourceLabel: "Local artifact",
    artifactCrop: {
      objectPosition: "50% 52%",
      scale: 1.03,
    },
    actions: [sim0Link],
  },
  {
    id: "moment-trail",
    scene: "trail",
    progress: 0.82,
    label: "Trail",
    code: "04",
    readout: "Public exits stay factual and direct.",
    sourceLabel: "Public profiles",
    actions: [
      {
        id: "moment-github",
        label: "GitHub",
        href: githubChannel.href,
        external: true,
        ariaLabel: "Open Joe Simo on GitHub in a new tab",
        kind: "primary",
      },
    ],
  },
  {
    id: "moment-contact",
    scene: "contact",
    progress: 1,
    label: "Contact",
    code: "05",
    readout: "Email is the direct route.",
    sourceLabel: "hello@joesimo.com",
    actions: [
      {
        id: "moment-email-contact",
        label: "Email Joe",
        href: emailChannel.href,
        kind: "primary",
      },
    ],
  },
];

export const ownedArtifacts: OwnedArtifact[] = [
  {
    id: "sim0-current-editor",
    code: "A0",
    scene: "surface",
    label: "Primary surface",
    title: "sim0 working surface",
    detail:
      "Preview state, runtime context, local API context, shipping, and staged changes stay visible in one field.",
    sourceLabel: "sim0 / local capture",
    sourceNote: "Imported from the local sim0 project folder.",
    media: sim0CurrentEditorMedia,
    priority: "primary",
    action: sim0Link,
  },
  {
    id: "astrosimo-verified-capture",
    code: "A1",
    scene: "surface",
    label: "Release artifact",
    title: "Astrosimo verified capture",
    detail:
      "A release-pack screenshot for the verified in-app capture flow.",
    sourceLabel: "Astrosimo v1.0 asset manifest",
    sourceNote: "Backed by the local v1.0 release asset pack.",
    media: astrosimoVerifiedCaptureMedia,
    priority: "secondary",
  },
  {
    id: "astrosimo-night-planner",
    code: "A2",
    scene: "surface",
    label: "Release artifact",
    title: "Astrosimo night planner",
    detail:
      "A release-pack screenshot for the planning surface.",
    sourceLabel: "Astrosimo v1.0 asset manifest",
    sourceNote: "Backed by the local v1.0 release asset pack.",
    media: astrosimoNightPlannerMedia,
    priority: "secondary",
  },
  {
    id: "astrosimo-live-guidance",
    code: "A3",
    scene: "surface",
    label: "Release artifact",
    title: "Astrosimo live guidance",
    detail:
      "A release-pack screenshot for the live sky guidance surface.",
    sourceLabel: "Astrosimo v1.0 asset manifest",
    sourceNote: "Backed by the local v1.0 release asset pack.",
    media: astrosimoLiveGuidanceMedia,
    priority: "secondary",
  },
];

export const projectSignals: ProjectSignal[] = [
  {
    id: "next-flights",
    code: "P1",
    label: "Flight system",
    title: "Next Flights",
    detail:
      "Flight tracking application work with search, maps, CMS, and typed app surfaces.",
    sourceLabel: "Downloads/next-flights",
  },
  {
    id: "grimgreen-watch",
    code: "P2",
    label: "Monitor",
    title: "GrimmGreen Channel Watch",
    detail:
      "Tiny Next.js dashboard for public reachability checks without a YouTube API key.",
    sourceLabel: "Downloads/grimgreen-watch",
  },
  {
    id: "antonetas-garden",
    code: "P3",
    label: "Game",
    title: "Antoneta's Garden",
    detail:
      "Unity/iOS game and web landing work with release verification and mobile QA.",
    sourceLabel: "Downloads/video",
    media: antonetaGardenMedia,
  },
  {
    id: "signature-copier",
    code: "P4",
    label: "Tool",
    title: "Signature copier",
    detail:
      "Standalone signature-copying tool packaged for Outlook paste workflows.",
    sourceLabel: "Downloads/steve",
  },
  {
    id: "royal-shell",
    code: "P5",
    label: "Brand build",
    title: "Royal Shell",
    detail:
      "Next.js brand build with local logo and partnership assets in the project folder.",
    sourceLabel: "Downloads/royalshell",
  },
  {
    id: "printer-scripts",
    code: "P6",
    label: "Automation",
    title: "Printer installer scripts",
    detail:
      "Windows and macOS printer installation scripts from a local utility folder.",
    sourceLabel: "Downloads/Printers",
  },
];

export const writingFragments: WritingFragment[] = [
  {
    code: "F1",
    title: "The interface starts before the screen.",
    body:
      "The first interface is the explanation a person gives when something breaks. If that explanation is unclear, the product work starts there.",
    source: "Method",
  },
  {
    code: "F2",
    title: "Visible state is a form of respect.",
    body:
      "A working surface should not make people guess what the system is doing. State belongs close to the decision it affects.",
    source: "Systems",
  },
  {
    code: "F3",
    title: "The next action should feel inevitable.",
    body:
      "A good control does not only look available. It explains why this is the right moment to use it.",
    source: "Interface",
  },
  {
    code: "F4",
    title: "Small public proof is better than padded breadth.",
    body:
      "If the public trail is small, it should stay small and named. The page can still show how the work thinks.",
    source: "Trail",
  },
];

export const worldArtifacts: WorldArtifact[] = [
  {
    id: "origin",
    code: "W0",
    label: "Origin",
    source: "Joe",
    title: "A real face before a brand system.",
    detail:
      "The portrait stays small on purpose. The site is personal, but the work still leads.",
    stage: "origin",
    media: profileMedia,
  },
  {
    id: "breakage",
    code: "W1",
    label: "Breakage",
    source: "Support",
    title: "The failure path becomes the brief.",
    detail:
      "Support work is the first artifact: what broke, where it broke, and what a person needed next.",
    stage: "breakage",
  },
  {
    id: "signal",
    code: "W2",
    label: "Signals",
    source: "Telematics",
    title: "Signals, timing, and handoff shape the interface.",
    detail:
      "Telematics Engineering gives the method its bias toward readable state, routing, and consequence.",
    stage: "signal",
  },
  {
    id: "surface",
    code: "W3",
    label: "Surface",
    source: "sim0",
    title: "The current proof object is a working surface.",
    detail:
      "The local sim0 capture shows preview state, runtime context, shipping, and staged changes in one field.",
    stage: "surface",
    href: sim0Link.href,
    actionLabel: "Open sim0",
    media: sim0Media,
  },
  {
    id: "code",
    code: "W4",
    label: "Code",
    source: "GitHub",
    title: "The public code trail is intentionally small.",
    detail:
      "The visible public repository surface is honest: one public fork and the profile, not a padded portfolio shelf.",
    stage: "trail",
    href: "https://github.com/joe-simo/openai-agents-js",
    actionLabel: "View repo",
  },
  {
    id: "contact",
    code: "W5",
    label: "Contact",
    source: "Email",
    title: "The exit is direct.",
    detail:
      "For support, systems, web consulting, sim0, or interface work, email is the working route.",
    stage: "contact",
    href: emailChannel.href,
    actionLabel: "Email Joe",
  },
];

export const publicDepthItems: PublicDepthItem[] = [
  {
    code: "D1",
    label: "Personal",
    title: "Joe is the subject.",
    detail:
      "Portrait, name, Fort Myers, Devsigner, English and Spanish. The page starts with the person instead of a template category.",
    source: "Joe",
    media: profileMedia,
    meta: ["portrait", "identity", "Fort Myers"],
  },
  {
    code: "D2",
    label: "Current work",
    title: "sim0 is the current working artifact.",
    detail:
      "The local capture gives the page a real product surface: preview state, runtime context, local API context, ship action, and change state.",
    source: "sim0.com",
    href: sim0Link.href,
    actionLabel: "Open sim0",
    media: sim0Media,
    meta: ["product", "artifact", "workflow"],
  },
  {
    code: "D3",
    label: "Process",
    title: "The method is shown as a usable instrument.",
    detail:
      "Support breakage, telematics signals, and interface surface are not only copy. They are the way the page can be operated.",
    source: "Method",
    meta: ["support", "signals", "surface"],
  },
  {
    code: "D4",
    label: "Code",
    title: "Public code stays named.",
    detail:
      "The visible GitHub proof is the public profile and the openai-agents-js fork, with no inflated project shelf.",
    source: "GitHub",
    href: "https://github.com/joe-simo/openai-agents-js",
    actionLabel: "View repo",
    meta: ["github", "public repo", "agents"],
  },
  {
    code: "D5",
    label: "Writing",
    title: "Notes live on the page until there is a larger archive.",
    detail:
      "The writing here is short, direct, and tied to the method: breakage, signal, state, surface, and public proof.",
    source: "Notebook",
    meta: ["field notes", "method", "authored"],
  },
  {
    code: "D6",
    label: "Video",
    title: "The video exit is public and simple.",
    detail:
      "YouTube stays as a direct public surface for video instead of an embedded feed wall.",
    source: "YouTube",
    href: "https://www.youtube.com/user/jos007",
    actionLabel: "Open YouTube",
    meta: ["@jos007", "video", "public exit"],
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
      "Fort Myers devsigner working from support failures, systems work, telematics, and interface clarity.",
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
    label: "Method",
    shortLabel: "method",
    kind: "method",
    status: "Support breakage to system signal to interface surface.",
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
    accent: "fault",
    sceneMode: "method",
    scene: {
      code: "01",
      eyebrow: "Method",
      coordinate: "breakage / signal / surface",
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
    status: "Current work: sim0.com.",
    detail:
      "sim0 is the public product surface of this method: a browser-first workflow where system state and interface decisions stay visible.",
    proof: "sim0.com / workflow product",
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
    label: "Trail",
    shortLabel: "trail",
    kind: "trail",
    status: "GitHub, X, Instagram, LinkedIn, YouTube, and email.",
    detail:
      "The public trail keeps the real exits close: code, public profiles, professional context, video, and direct email.",
    proof: "GitHub / X / Instagram / LinkedIn / YouTube / Email",
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
      eyebrow: "Trail",
      coordinate: "public trail",
      tone: "trail",
      scrollRange: [0.58, 0.78],
    },
    route: {
      from: "joe",
      tension: 0.36,
      depth: 0.32,
    },
    sectionAnchor: "#trail",
    readActionLabel: "Read Trail",
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
