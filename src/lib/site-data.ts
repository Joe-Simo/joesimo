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

export type PublicTrailSectionId =
  | "joe"
  | "work"
  | "about"
  | "photos"
  | "blog"
  | "social"
  | "contact"
  | "system";

export type PublicTrailSection = {
  id: PublicTrailSectionId;
  code: string;
  label: string;
  navLabel: string;
  anchor: `#${string}`;
  sceneMode: SceneMode;
  point: {
    x: number;
    y: number;
    z: number;
  };
  copy: {
    title: string;
    detail: string;
  };
};

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

export type ProofMedia = {
  id: string;
  kind: "image" | "video";
  src: string;
  posterSrc?: string;
  alt: string;
  width: number;
  height: number;
  label: string;
  sourceLabel: string;
  treatment: "machine-state" | "route-replay" | "release-reel" | "progression-reel";
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

export type EducationRecord = {
  school: string;
  focus: string;
  period: string;
  detail: string;
  sourceLabel: string;
  href?: string;
};

export type LearningCredential = {
  label: string;
  issuer: string;
  issued?: string;
  period?: string;
  sourceLabel: string;
  href?: string;
};

export type JoeProfile = {
  name: string;
  kicker: string;
  headline: string;
  detail: string;
  routeLabel: string;
  receiptTitle: string;
  receiptDetail: string;
  contactPrompt: string;
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
  lens: MethodLens;
  readout: string;
  sourceLabel: string;
  x: number;
  y: number;
  zoom: {
    x: number;
    y: number;
  };
};

export type InvestigationPhase =
  | "breakage"
  | "signal"
  | "handoff"
  | "surface"
  | "ship";

export type InvestigationStatus =
  | "idle"
  | "briefing"
  | "tracing"
  | "inspecting"
  | "synthesizing"
  | "shipped";

export type CaseActionId = "find" | "trace" | "ship";

export type CaseAction = {
  id: CaseActionId;
  label: string;
  hook: string;
  primaryProofPointId: string;
  supportingProofPointIds: readonly string[];
  completionLabel: string;
};

export type InvestigationStep = ArtifactProofPoint & {
  action: CaseActionId;
  phase: InvestigationPhase;
  prompt: string;
  finding: string;
  interfaceDecision: string;
  completionLabel: string;
  hotspot: {
    x: number;
    y: number;
    zoomX: number;
    zoomY: number;
  };
  webglNode: {
    x: number;
    y: number;
    tension: number;
    depth: number;
  };
};

export type HumanStake = {
  blockedPerson: string;
  confusion: string;
  madeVisible: string;
  whyItMatters: string;
};

export type MachineStateId = CaseActionId | "receipt";

export type MachineState = {
  id: MachineStateId;
  label: string;
  title: string;
  detail: string;
  proofPointIds: readonly string[];
  mediaId: string;
  accent: "fault" | "signal" | "proof" | "live";
};

export type InvestigationCase = {
  slug: "sim0";
  title: string;
  hook: string;
  emotionalStake: string;
  humanStake: HumanStake;
  premise: string;
  outcome: string;
  artifact: SiteMedia;
  actions: readonly CaseAction[];
  machineStates: readonly MachineState[];
  proofMedia: readonly ProofMedia[];
  steps: readonly InvestigationStep[];
  signature: {
    label: string;
    title: string;
    detail: string;
    requiredStepIds: readonly string[];
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

export type MethodChapterId = "joe" | "method" | "work" | "notes" | "contact";

export type MethodLens = "breakage" | "signals" | "surface";

export type MethodStage = MethodLens;

export type ProjectProofMode = "operated" | "reel" | "anatomy" | "specimen";

export type WorkTier = "featured" | "case" | "supporting" | "specimen";

export type EvidenceStatus =
  | "verified"
  | "local-proof"
  | "redacted"
  | "needs-media";

export type ProjectStoryboardPanelId =
  | "problem-scene"
  | "proof-operation"
  | "decision-moment"
  | "outcome";

export type CaseStory = {
  signal: string;
  problem: string;
  constraint: string;
  approach: string[];
  outcome: string;
  limitation?: string;
};

export type ProofCaption = {
  eyebrow: string;
  title: string;
  detail: string;
  sourceLabel: string;
  evidenceStatus: EvidenceStatus;
};

export type ProjectStoryboardPanel = {
  id: ProjectStoryboardPanelId;
  label: string;
  title: string;
  body: string;
  assetId?: string;
  mediaId?: string;
  captionId?: string;
  claimIds: string[];
  evidenceStatus?: EvidenceStatus;
};

export type CompletedRouteCopy = {
  label: string;
  title: string;
  detail: string;
};

export type EvidenceAsset = {
  id: string;
  captionId: string;
  label: string;
  claimIds: string[];
  media: SiteMedia;
  sourcePath: string;
  treatment: "hero" | "supporting" | "strip";
};

export type ProjectMiniWorld = {
  hook: string;
  humanStake: HumanStake;
  media: readonly ProofMedia[];
  panels: readonly ProjectStoryboardPanel[];
};

export type ProjectCaseStudy = {
  slug: string;
  code: string;
  title: string;
  role: string;
  methodStage: MethodStage;
  schemaType: "SoftwareApplication" | "VideoGame" | "CreativeWork";
  applicationCategory?: string;
  summary: string;
  evidence: string[];
  assets: EvidenceAsset[];
  links: SiteAction[];
  status: string;
  sourcePath: string;
  tier: WorkTier;
  story: CaseStory;
  humanStake?: HumanStake;
  miniWorld?: ProjectMiniWorld;
  proofCaptions: Record<string, ProofCaption>;
  storyboard?: ProjectStoryboardPanel[];
  completedRoute: CompletedRouteCopy;
  safeClaimIds: string[];
  proofMode: ProjectProofMode;
  proofSummary: string;
  homepageFeature?: {
    rank: 1 | 2 | 3 | 4;
    mediaAssetIds: readonly string[];
    treatment:
      | "operated-surface"
      | "mobile-strip"
      | "progression-strip"
      | "training-strip";
  };
};

export type PublicEvidenceAsset = Omit<EvidenceAsset, "sourcePath"> & {
  sourceLabel: string;
};

export type PublicProjectCaseStudy = Omit<
  ProjectCaseStudy,
  "assets" | "sourcePath"
> & {
  assets: PublicEvidenceAsset[];
  sourceLabel: string;
};

export function publicSourceLabel(sourcePath: string) {
  if (sourcePath.includes("final/sim0")) {
    return "Interface still";
  }

  if (sourcePath.includes("astro")) {
    return "Release reel";
  }

  if (sourcePath.includes("video")) {
    return "Playable capture";
  }

  if (sourcePath.includes("next-flights")) {
    return "Product anatomy";
  }

  if (sourcePath.includes("grimgreen-watch")) {
    return "Process trace";
  }

  if (sourcePath.includes("royalshell")) {
    return "Brand utility still";
  }

  if (sourcePath.includes("steve")) {
    return "Signature surface";
  }

  if (sourcePath.includes("Printers")) {
    return "Redacted process trace";
  }

  if (sourcePath.includes("chess")) {
    return "Training capture";
  }

  return "Owned work artifact";
}

export type MethodWorldChapter = {
  id: MethodChapterId;
  code: string;
  label: string;
  title: string;
  body: string;
  anchor: `#${string}`;
  progress: number;
  sceneMode: SceneMode;
  point: {
    x: number;
    y: number;
  };
};

export type MethodWorldMoment = {
  id: string;
  chapter: MethodChapterId;
  stage?: MethodStage;
  progress: number;
  code: string;
  label: string;
  readout: string;
};

export type WritingFragment = {
  code: string;
  title: string;
  body: string;
  source: string;
};

export type ArchiveArtifact = {
  code: string;
  title: string;
  body: string;
  sourceLabel: string;
  media: SiteMedia;
};

export type CommunityArtifact = {
  code: string;
  title: string;
  body: string;
  sourceLabel: string;
  media: SiteMedia;
};

export type ProductReportArtifact = {
  code: string;
  title: string;
  body: string;
  outcome: string;
  sourceLabel: string;
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
  "#photos": "trail",
  "#social": "contact",
  "#sim0": "work",
  "#blog": "trail",
  "#background": "method",
  "#systems": "method",
  "#code": "trail",
  "#notes": "trail",
  "#writing": "trail",
} as const satisfies Partial<Record<string, SiteNodeId>>;

export const heroCopy = {
  title: "Joe Simo",
  intro: "A public trail of work, systems, notes, and moments.",
  detail:
    "I build interfaces, tools, and experiments that move between code and design.",
};

export const siteDescription =
  "Joe Simo is a Fort Myers devsigner sharing a public trail of work, systems, notes, moments, and public profile links.";

export const joeProfile: JoeProfile = {
  name: heroCopy.title,
  kicker: "Fort Myers / Devsigner / public trail",
  headline: heroCopy.intro,
  detail: heroCopy.detail,
  routeLabel: "Work / Moments / Notes / Internet.",
  receiptTitle: "Support → Signals → Surface",
  receiptDetail:
    "Trace the method, then choose the work that proves the route.",
  contactPrompt:
    "Bring a stuck workflow, product surface, or useful introduction.",
};

export const publicTrailSections = [
  {
    id: "joe",
    code: "00",
    label: "Hero",
    navLabel: "Joe",
    anchor: "#joe",
    sceneMode: "origin",
    point: { x: -2.8, y: 0.3, z: 2.8 },
    copy: {
      title: "Joe Simo",
      detail: "The first mark on the public trail.",
    },
  },
  {
    id: "work",
    code: "01",
    label: "Work",
    navLabel: "Work",
    anchor: "#work",
    sceneMode: "work",
    point: { x: -1.2, y: -0.4, z: 1.3 },
    copy: {
      title: "Trail artifacts",
      detail: "Real project surfaces, treated like spatial proof objects.",
    },
  },
  {
    id: "about",
    code: "02",
    label: "About",
    navLabel: "About",
    anchor: "#about",
    sceneMode: "method",
    point: { x: -0.05, y: 0.22, z: 0.68 },
    copy: {
      title: "System profile",
      detail:
        "Designer and developer building browser-first tools, interfaces, and systems.",
    },
  },
  {
    id: "photos",
    code: "03",
    label: "Moments",
    navLabel: "Moments",
    anchor: "#photos",
    sceneMode: "trail",
    point: { x: 0.5, y: 0.45, z: 0.2 },
    copy: {
      title: "Moments on the trail",
      detail: "People, rooms, and builder context from the public archive.",
    },
  },
  {
    id: "blog",
    code: "04",
    label: "Notes",
    navLabel: "Notes",
    anchor: "#blog",
    sceneMode: "trail",
    point: { x: 1.5, y: -0.35, z: -1.1 },
    copy: {
      title: "Trail markers",
      detail: "Short authored fragments about systems and interface work.",
    },
  },
  {
    id: "social",
    code: "05",
    label: "Internet",
    navLabel: "Internet",
    anchor: "#social",
    sceneMode: "contact",
    point: { x: 2.45, y: 0.35, z: -2.2 },
    copy: {
      title: "Public exits",
      detail: "The real profiles connected to the same path.",
    },
  },
  {
    id: "contact",
    code: "06",
    label: "Contact",
    navLabel: "Contact",
    anchor: "#contact",
    sceneMode: "contact",
    point: { x: 3.1, y: -0.05, z: -3.2 },
    copy: {
      title: "Leave a mark",
      detail: "Public profiles stay closed to the noise. Open to the work.",
    },
  },
  {
    id: "system",
    code: "07",
    label: "Trail Engine",
    navLabel: "System",
    anchor: "#system",
    sceneMode: "method",
    point: { x: 3.58, y: 0.42, z: -3.82 },
    copy: {
      title: "Interaction system",
      detail:
        "The visible mechanics behind the public trail experience.",
    },
  },
] as const satisfies readonly PublicTrailSection[];

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
  src: "/media/joe-simo-headshot.webp",
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
  width: 1710,
  height: 900,
  tone: "desaturated",
};

export const sim0ShipSurfaceMedia: SiteMedia = {
  kind: "artifact",
  src: "/media/work/sim0-machine-ship.webp",
  alt: "sim0 preview, local API, shipping, and staged changes surface",
  width: 1600,
  height: 900,
  tone: "desaturated",
};

export const astrosimoSignalStripMedia: SiteMedia = {
  kind: "artifact",
  src: "/media/work/astrosimo-signal-strip.webp",
  alt: "Astrosimo release screens composed as a horizontal proof strip",
  width: 1600,
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
  alt: "Antoneta's Garden Unity gameplay capture",
  width: 1440,
  height: 950,
  tone: "desaturated",
};

export const antonetaGardenLandingMedia: SiteMedia = {
  kind: "artifact",
  src: "/media/work/antoneta-garden-landing.webp",
  alt: "Antoneta's Garden landing page capture",
  width: 1440,
  height: 1072,
  tone: "desaturated",
};

export const antonetaGardenPreviewMedia: SiteMedia = {
  kind: "artifact",
  src: "/media/work/antoneta-garden-preview.webp",
  alt: "Antoneta's Garden WebGL preview capture",
  width: 1280,
  height: 800,
  tone: "desaturated",
};

export const nextFlightsOverviewMedia: SiteMedia = {
  kind: "artifact",
  src: "/media/work/next-flights-overview.webp",
  alt: "Next Flights product overview artwork",
  width: 1600,
  height: 840,
  tone: "desaturated",
};

export const nextFlightsCtaMedia: SiteMedia = {
  kind: "artifact",
  src: "/media/work/next-flights-cta.webp",
  alt: "Next Flights interface background artwork",
  width: 1600,
  height: 524,
  tone: "desaturated",
};

export const signatureCopierMedia: SiteMedia = {
  kind: "artifact",
  src: "/media/work/signature-copier.webp",
  alt: "Signature copier application capture",
  width: 1440,
  height: 1200,
  tone: "desaturated",
};

export const royalShellLogoMedia: SiteMedia = {
  kind: "artifact",
  src: "/media/work/royal-shell-logo.webp",
  alt: "Royal Shell signature generator logo asset",
  width: 180,
  height: 60,
  tone: "desaturated",
};

export const chessLmUnityMedia: SiteMedia = {
  kind: "artifact",
  src: "/media/work/chesslm-unity.webp",
  alt: "ChessLM Unity WebGL chessboard capture",
  width: 1440,
  height: 900,
  tone: "desaturated",
};

export const chessLmWorkspaceMedia: SiteMedia = {
  kind: "artifact",
  src: "/media/work/chesslm-workspace.webp",
  alt: "ChessLM web training workspace capture",
  width: 1280,
  height: 1259,
  tone: "desaturated",
};

export const sim0MachineProofMedia: ProofMedia[] = [
  {
    id: "sim0-machine-find",
    kind: "image",
    src: "/media/work/sim0-machine-find.webp",
    alt: "sim0 stuck preview state crop",
    width: 1600,
    height: 900,
    label: "Stuck preview crop",
    sourceLabel: "Interface still",
    treatment: "machine-state",
  },
  {
    id: "sim0-machine-trace",
    kind: "image",
    src: "/media/work/sim0-machine-trace.webp",
    alt: "sim0 runtime and local API trace crop",
    width: 1600,
    height: 900,
    label: "Runtime trace crop",
    sourceLabel: "Interface still",
    treatment: "machine-state",
  },
  {
    id: "sim0-machine-ship",
    kind: "image",
    src: "/media/work/sim0-machine-ship.webp",
    alt: "sim0 ship and changes state crop",
    width: 1600,
    height: 900,
    label: "Ship state crop",
    sourceLabel: "Interface still",
    treatment: "machine-state",
  },
  {
    id: "sim0-machine-surface",
    kind: "image",
    src: "/media/work/sim0-machine-surface.webp",
    alt: "sim0 completed surface crop",
    width: 1600,
    height: 900,
    label: "Completed surface crop",
    sourceLabel: "Interface still",
    treatment: "machine-state",
  },
  {
    id: "sim0-route-replay",
    kind: "video",
    src: "/media/work/sim0-route-replay.webm",
    posterSrc: "/media/work/sim0-machine-surface.webp",
    alt: "sim0 route replay from stuck preview to shipped surface",
    width: 1600,
    height: 900,
    label: "Route replay",
    sourceLabel: "Case replay",
    treatment: "route-replay",
  },
];

export const astrosimoReleaseReelMedia: ProofMedia = {
  id: "astrosimo-release-reel",
  kind: "video",
  src: "/media/work/astrosimo-release-reel.webm",
  posterSrc: astrosimoSignalStripMedia.src,
  alt: "Astrosimo release reel from owned phone captures",
  width: 1600,
  height: 900,
  label: "Release reel",
  sourceLabel: "Release reel",
  treatment: "release-reel",
};

export const antonetaProgressionReelMedia: ProofMedia = {
  id: "antoneta-progression-reel",
  kind: "video",
  src: "/media/work/antoneta-progression-reel.webm",
  posterSrc: antonetaGardenMedia.src,
  alt: "Antoneta's Garden progression reel from landing to gameplay captures",
  width: 1600,
  height: 900,
  label: "Progression reel",
  sourceLabel: "Playable capture",
  treatment: "progression-reel",
};

export const chessLmTrainingReelMedia: ProofMedia = {
  id: "chesslm-training-reel",
  kind: "video",
  src: "/media/work/chesslm-training-reel.webm",
  posterSrc: chessLmUnityMedia.src,
  alt: "ChessLM training reel from web workspace and Unity board captures",
  width: 1600,
  height: 900,
  label: "Training reel",
  sourceLabel: "Training capture",
  treatment: "progression-reel",
};

export const socialChannels: SocialChannel[] = [
  {
    label: "GitHub",
    handle: "@joe-simo",
    href: "https://github.com/joe-simo",
    iconKey: "github",
    description: "Code trail, systems, and experiments.",
  },
  {
    label: "X",
    handle: "@joesimo",
    href: "https://x.com/joesimo",
    iconKey: "x",
    description: "Public notes and short thinking.",
  },
  {
    label: "Instagram",
    handle: "@joesimo_",
    href: "https://www.instagram.com/joesimo_/",
    iconKey: "camera",
    description: "Moments, people, and rooms.",
  },
  {
    label: "LinkedIn",
    handle: "josephsimo",
    href: "https://www.linkedin.com/in/josephsimo/",
    iconKey: "linkedin",
    description: "Work graph and public context.",
  },
  {
    label: "YouTube",
    handle: "@jos007",
    href: "https://www.youtube.com/user/jos007",
    iconKey: "video",
    description: "Experiments and video surfaces.",
  },
];

const githubChannel = socialChannels[0];
const xChannel = socialChannels[1];
const instagramChannel = socialChannels[2];
const linkedinChannel = socialChannels[3];

export const profileFacts: ProfileFact[] = [
  {
    label: "Name",
    value: "Joe Simo",
    detail: "The name I use across the public places linked here.",
    source: "Identity",
  },
  {
    label: "Bio",
    value: "Devsigner. One more thing.",
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
    label: "Places lived",
    value: "Santo Domingo, Cape Coral, Fort Myers, Lawrence",
    detail:
      "Dominican Republic, Florida, and Massachusetts all sit inside the personal map.",
    source: "Joe",
  },
  {
    label: "Formation",
    value: "Catholic school and Catholic university",
    detail:
      "Catholic formation runs through Quisqueya School in the Dominican Republic and PUCMM.",
    source: "Joe",
  },
  {
    label: "Sacraments",
    value: "Baptism, First Communion, Confirmation",
    detail:
      "Completed while attending Quisqueya School in the Dominican Republic.",
    source: "Joe",
  },
  {
    label: "Professional track",
    value: "Support, systems, and web projects",
    detail:
      "The interface work sits on support, systems, and web projects.",
    source: "Method",
  },
  {
    label: "Default stack",
    value: "Next.js, Bun, Tailwind, shadcn/ui, Convex, Clerk, Polar, Resend, OpenAI SDK, Cloudflare Workers",
    detail:
      "Bun is the package manager and test runner; the rest is modern TypeScript, product UI, and server-side boundaries for sensitive work.",
    source: "Joe",
  },
  {
    label: "AI coding tool",
    value: "Codex",
    detail:
      "Codex is the preferred coding partner because it tends to follow direction closely in Joe's workflow.",
    source: "Joe",
  },
  {
    label: "Motion choice",
    value: "GSAP for personal work; Motion.dev for commercial work",
    detail:
      "The animation preference depends on context: expressive personal experiments or production client surfaces.",
    source: "Joe",
  },
  {
    label: "3D learning",
    value: "Bruno Simon's Three.js Journey",
    detail:
      "A Three.js class that reinforced the interest in browser-native spatial interfaces.",
    source: "Joe",
  },
  {
    label: "Interface curiosity",
    value: "HTML on Canvas",
    detail:
      "The interesting part is the possibility of operating real interface elements inside a canvas-like surface.",
    source: "Joe",
  },
  {
    label: "Work scope",
    value: "Support / systems / web projects",
    detail:
      "The public contact lanes are support, systems, web projects, and interface work.",
    source: "Method",
  },
  {
    label: "Telematics",
    value: "Telematics Engineering",
    detail:
      "The engineering base is networks, systems, signals, and communication.",
    source: "PUCMM",
  },
  {
    label: "Languages",
    value: "English and Spanish",
    detail: "I work comfortably across both.",
    source: "LinkedIn",
  },
  {
    label: "Certification record",
    value: "Next.js, React, FAA, Cisco, Microsoft, CompTIA, Barracuda",
    detail:
      "The LinkedIn profile export carries the fuller certification and class trail.",
    source: "LinkedIn PDF",
  },
  {
    label: "Design",
    value: "I love design.",
    detail:
      "The site treats design as how the surface works, not only how it looks.",
    source: "Joe",
  },
  {
    label: "Design shelf",
    value: "Steve Jobs and Jony Ive biographies",
    detail:
      "Both read twice; the taste reference is usefulness, restraint, and craft.",
    source: "Joe",
  },
  {
    label: "Coding spark",
    value: "Theo Browne",
    detail:
      "Theo's work helped turn coding into a real hobby and ongoing practice.",
    source: "Joe",
  },
  {
    label: "Admiration",
    value: "Jobs, Ive, Tesla, Maxwell, Faraday",
    detail:
      "Product taste, industrial detail, electricity, fields, and signals sit behind the method.",
    source: "Joe",
  },
  {
    label: "Family orbit",
    value: "Architecture, pharmaceutical science, graphic design",
    detail:
      "My dad is an architect, my mom studied pharmaceutical science, and my sister is a graphic designer.",
    source: "Joe",
  },
  {
    label: "Chess",
    value: "Study, puzzles, and computer games",
    detail:
      "Chess sits closer to practice than competition here: pattern study, puzzles, and playing against the computer.",
    source: "Joe",
  },
  {
    label: "Stargazing",
    value: "Universe study",
    detail:
      "I like stargazing and studying the universe because scale, fields, and motion never stop being fascinating.",
    source: "Joe",
  },
  {
    label: "Independent physics note",
    value: "Acceleration and electromagnetic constants",
    detail:
      "I wrote an independent physics note and tried to publish it, but could not get endorsement. It stays here as curiosity, not a credential.",
    source: "Independent note",
  },
  {
    label: "Dogs",
    value: "I love dogs.",
    detail:
      "A simple personal fact that belongs in the map more than another generic portfolio line.",
    source: "Joe",
  },
  {
    label: "Longboards",
    value: "Cruising, not recently",
    detail:
      "A personal interest kept honestly: I like longboards, even if I have not cruised in a while.",
    source: "Joe",
  },
  {
    label: "Cars",
    value: "Cool cars, calm cruises",
    detail:
      "I do not love driving, but I like well-designed cars and quiet cruising without street chaos.",
    source: "Joe",
  },
];

export const educationRecords: EducationRecord[] = [
  {
    school: "Pontificia Universidad Católica Madre y Maestra",
    focus: "Bachelor of Science - BS, Telematics Engineering",
    period: "2006 - 2014",
    detail:
      "Engineering base across networks, programming, systems, signals, and communication.",
    sourceLabel: "LinkedIn profile export",
    href: linkedinChannel.href,
  },
  {
    school: "Cisco Networking Academy",
    focus: "CCNA 1, IT",
    period: "2004 - 2005",
    detail: "Early networking class sequence from the LinkedIn profile export.",
    sourceLabel: "LinkedIn profile export",
    href: linkedinChannel.href,
  },
  {
    school: "Cisco Networking Academy",
    focus: "CCNA 2, IT",
    period: "2004 - 2005",
    detail: "Early networking class sequence from the LinkedIn profile export.",
    sourceLabel: "LinkedIn profile export",
    href: linkedinChannel.href,
  },
  {
    school: "Cisco Networking Academy",
    focus: "CCNA 3, IT",
    period: "2004 - 2005",
    detail: "Early networking class sequence from the LinkedIn profile export.",
    sourceLabel: "LinkedIn profile export",
    href: linkedinChannel.href,
  },
  {
    school: "Cisco Networking Academy",
    focus: "CCNA 4, IT",
    period: "2004 - 2005",
    detail: "Early networking class sequence from the LinkedIn profile export.",
    href: linkedinChannel.href,
    sourceLabel: "LinkedIn profile export",
  },
];

export const learningCredentials: LearningCredential[] = [
  {
    label: "Next.js SEO Fundamentals",
    issuer: "LinkedIn profile record",
    sourceLabel: "LinkedIn profile export",
    href: linkedinChannel.href,
  },
  {
    label: "React Foundations for Next.js",
    issuer: "LinkedIn profile record",
    sourceLabel: "LinkedIn profile export",
    href: linkedinChannel.href,
  },
  {
    label: "Part 107 Small Unmanned Aircraft Systems Initial",
    issuer: "FAA Safety Team Aviation Learning Center",
    issued: "Completed February 24, 2020",
    sourceLabel: "Local certificate",
    href: linkedinChannel.href,
  },
  {
    label: "Cert Prep: FAA Part 107 Commercial Drone License",
    issuer: "LinkedIn",
    issued: "Completed Feb 26, 2020",
    sourceLabel: "Local certificate",
    href: linkedinChannel.href,
  },
  {
    label: "Unitrends Certified Associate (UCA)",
    issuer: "Unitrends",
    issued: "Issued Jun 2019",
    sourceLabel: "LinkedIn certification",
    href: linkedinChannel.href,
  },
  {
    label: "Microsoft Technology Associate: Networking Fundamentals",
    issuer: "Microsoft",
    issued: "Achieved June 23, 2017",
    sourceLabel: "Local certificate",
    href: linkedinChannel.href,
  },
  {
    label: "CompTIA A+",
    issuer: "CompTIA",
    issued: "Issued June 28, 2007",
    sourceLabel: "Local certificate",
    href: linkedinChannel.href,
  },
  {
    label: "CompTIA Network+",
    issuer: "CompTIA",
    period: "Issued September 28, 2017 / Expires September 28, 2020",
    sourceLabel: "Local certificate",
    href: linkedinChannel.href,
  },
  {
    label: "Barracuda Web Security Service Certified Engineer",
    issuer: "Barracuda",
    period: "Valid July 6, 2017 / July 6, 2020",
    sourceLabel: "Local certificate",
    href: linkedinChannel.href,
  },
  {
    label: "Barracuda Email Security Service Certified Engineer",
    issuer: "Barracuda",
    period: "Valid February 24, 2017 / February 24, 2020",
    sourceLabel: "Local certificate",
    href: linkedinChannel.href,
  },
  {
    label: "Datto Technical Specialist I",
    issuer: "Datto, Inc.",
    period: "Issued Jan 2017 / Expires Jan 2020",
    sourceLabel: "LinkedIn certification",
    href: linkedinChannel.href,
  },
  {
    label: "Datto Technical Specialist II",
    issuer: "Datto, Inc.",
    sourceLabel: "LinkedIn certification",
    href: linkedinChannel.href,
  },
  {
    label: "What is SignNow",
    issuer: "Barracuda",
    period: "Valid June 9, 2017 / June 9, 2018",
    sourceLabel: "Local certificate",
    href: linkedinChannel.href,
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
      "Public GitHub profile for Joe Simo: Devsigner. One more thing.",
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
    visibleLabel: "Resolving preview entry",
    title: "The product exposes state instead of hiding it.",
    detail:
      "The capture shows preview resolution in the open, so the user can see what the system is preparing.",
    lens: "breakage",
    action: "find",
    readout: "Find the stuck state before adding another control.",
    sourceLabel: "Interface still",
    x: 60,
    y: 34,
    zoom: { x: 60, y: 34 },
    phase: "breakage",
    prompt: "Find the broken product signal.",
    finding: "The interface is resolving preview entry state in public view.",
    interfaceDecision:
      "Make the stuck state readable before asking the user to trust the next action.",
    completionLabel: "Broken state found",
    hotspot: { x: 60, y: 34, zoomX: 60, zoomY: 34 },
    webglNode: { x: 46, y: 52, tension: 0.48, depth: 0.48 },
  },
  {
    id: "runtime",
    code: "02",
    label: "Runtime",
    visibleLabel: "SSR wiring",
    title: "Runtime work stays close to the interface.",
    detail:
      "The artifact points to entry runtime and SSR wiring without turning the page into an implementation dump.",
    lens: "signals",
    action: "trace",
    readout: "Trace runtime context next to the surface it affects.",
    sourceLabel: "Interface still",
    x: 45,
    y: 62,
    zoom: { x: 45, y: 62 },
    phase: "signal",
    prompt: "Trace runtime and SSR handoff.",
    finding: "Runtime context sits near the surface it affects.",
    interfaceDecision:
      "Keep system handoff visible where the interface decision is made.",
    completionLabel: "Runtime signal traced",
    hotspot: { x: 45, y: 62, zoomX: 45, zoomY: 62 },
    webglNode: { x: 58, y: 45, tension: 0.54, depth: 0.56 },
  },
  {
    id: "api",
    code: "03",
    label: "Local API",
    visibleLabel: "Local API",
    title: "Local context is visible.",
    detail:
      "The editor surface keeps local API context and preview state in the same working field.",
    lens: "signals",
    action: "trace",
    readout: "Keep local context visible while the work moves.",
    sourceLabel: "Interface still",
    x: 25,
    y: 83,
    zoom: { x: 25, y: 83 },
    phase: "handoff",
    prompt: "Trace local API context.",
    finding: "Local API context stays in the same working field as preview state.",
    interfaceDecision:
      "Avoid hiding local state behind a second screen when the work depends on it.",
    completionLabel: "Local context traced",
    hotspot: { x: 25, y: 83, zoomX: 25, zoomY: 83 },
    webglNode: { x: 41, y: 72, tension: 0.62, depth: 0.6 },
  },
  {
    id: "ship",
    code: "04",
    label: "Ship",
    visibleLabel: "Ship",
    title: "Shipping stays visible.",
    detail:
      "The right-side project panel starts with a clear Ship action, keeping the release decision in view.",
    lens: "surface",
    action: "ship",
    readout: "Make the release action easy to find at the moment it matters.",
    sourceLabel: "Interface still",
    x: 88,
    y: 11,
    zoom: { x: 88, y: 11 },
    phase: "surface",
    prompt: "Surface the shipping decision.",
    finding: "The Ship action is visible at the edge of the active project panel.",
    interfaceDecision:
      "Put the release action where the working state can justify it.",
    completionLabel: "Shipping surface found",
    hotspot: { x: 88, y: 11, zoomX: 88, zoomY: 11 },
    webglNode: { x: 78, y: 32, tension: 0.64, depth: 0.68 },
  },
  {
    id: "changes",
    code: "05",
    label: "Changes",
    visibleLabel: "Staged changes",
    title: "Change state remains inspectable.",
    detail:
      "The surface shows repository and change context without padding a case study around it.",
    lens: "surface",
    action: "ship",
    readout: "Expose change state so the next decision is not a guess.",
    sourceLabel: "Interface still",
    x: 88,
    y: 72,
    zoom: { x: 88, y: 72 },
    phase: "ship",
    prompt: "Confirm the shipped interface route.",
    finding: "Repository and change state remain inspectable at the release edge.",
    interfaceDecision:
      "Make the final route show what changed before it asks for confidence.",
    completionLabel: "Case signal complete",
    hotspot: { x: 88, y: 72, zoomX: 88, zoomY: 72 },
    webglNode: { x: 86, y: 62, tension: 0.7, depth: 0.74 },
  },
] as const satisfies readonly InvestigationStep[];

export const sim0InvestigationCase = {
  slug: "sim0",
  title: "Find the stuck point. Trace the signal. Ship the surface.",
  hook: "Find what is stuck. Trace the signal. Ship the surface.",
  emotionalStake:
    "When state is hidden, people guess. This case shows the stuck point, follows the signal, and lands the decision on the surface.",
  humanStake: {
    blockedPerson: "A builder trying to understand why the surface has not moved yet.",
    confusion:
      "Preview state, runtime handoff, local context, release action, and changed files can feel like separate rooms.",
    madeVisible:
      "The machine keeps those signals on the same surface, then makes the next action visible.",
    whyItMatters:
      "When the stuck point is readable, the person doing the work can decide instead of guessing.",
  },
  premise:
    "Operate one real sim0 surface through three actions: find, trace, ship.",
  outcome:
    "The completed route shows how a hidden product state becomes a readable shipped interface.",
  artifact: sim0CurrentEditorMedia,
  actions: [
    {
      id: "find",
      label: "Find",
      hook: "Find the stuck state before adding another control.",
      primaryProofPointId: "preview",
      supportingProofPointIds: [],
      completionLabel: "Stuck point found",
    },
    {
      id: "trace",
      label: "Trace",
      hook: "Trace runtime and local API context where the surface can use it.",
      primaryProofPointId: "runtime",
      supportingProofPointIds: ["api"],
      completionLabel: "Signal traced",
    },
    {
      id: "ship",
      label: "Ship",
      hook: "Ship the surface with release and change state still visible.",
      primaryProofPointId: "ship",
      supportingProofPointIds: ["changes"],
      completionLabel: "Surface shipped",
    },
  ],
  machineStates: [
    {
      id: "find",
      label: "Find",
      title: "Stuck preview state",
      detail:
        "Start by locating the unresolved state before the interface asks for confidence.",
      proofPointIds: ["preview"],
      mediaId: "sim0-machine-find",
      accent: "fault",
    },
    {
      id: "trace",
      label: "Trace",
      title: "Runtime and local API path",
      detail:
        "Follow the handoff signals that explain why the surface is behaving that way.",
      proofPointIds: ["runtime", "api"],
      mediaId: "sim0-machine-trace",
      accent: "signal",
    },
    {
      id: "ship",
      label: "Ship",
      title: "Release action and changes",
      detail:
        "Keep the decision point and change state visible at the edge of the working surface.",
      proofPointIds: ["ship", "changes"],
      mediaId: "sim0-machine-ship",
      accent: "proof",
    },
    {
      id: "receipt",
      label: "Receipt",
      title: "Surface shipped",
      detail:
        "The route resolves into one completed surface after all five proof points are inspected.",
      proofPointIds: ["preview", "runtime", "api", "ship", "changes"],
      mediaId: "sim0-machine-surface",
      accent: "live",
    },
  ],
  proofMedia: sim0MachineProofMedia,
  steps: sim0ProofPoints,
  signature: {
    label: "Route receipt",
    title: "Surface shipped.",
    detail:
      "The stuck point, runtime signal, local context, release action, and change state resolve into one readable surface.",
    requiredStepIds: ["preview", "runtime", "api", "ship", "changes"],
  },
} as const satisfies InvestigationCase;

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
      "The interface still shows preview state, runtime context, local API context, ship action, and change staging.",
    proofType: "artifact",
    sourceLabel: "Interface still",
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

export const methodWorldChapters: MethodWorldChapter[] = [
  {
    id: "joe",
    code: "00",
    label: "Joe",
    title: "Joe Simo",
    body:
      "Fort Myers devsigner working from support failures, systems, telematics, and interface clarity.",
    anchor: "#joe",
    progress: 0,
    sceneMode: "origin",
    point: { x: 18, y: 50 },
  },
  {
    id: "method",
    code: "01",
    label: "Method",
    title: "Support → Signals → Surface.",
    body:
      "The method starts with what a person can describe, traces timing, route, state, and handoff, then removes what does not help the next action.",
    anchor: "#work",
    progress: 0.22,
    sceneMode: "method",
    point: { x: 43, y: 28 },
  },
  {
    id: "work",
    code: "02",
    label: "Work",
    title: "Selected work, not a wall of projects.",
    body:
      "sim0 is the flagship proof. Astrosimo, Antoneta's Garden, ChessLM, Next Flights, and smaller utilities show the range around Joe's method.",
    anchor: "#work",
    progress: 0.44,
    sceneMode: "work",
    point: { x: 76, y: 38 },
  },
  {
    id: "notes",
    code: "03",
    label: "Field Notes",
    title: "Short notes from the method.",
    body:
      "Small authored fragments hold the site together until there is a larger writing archive.",
    anchor: "#blog",
    progress: 0.66,
    sceneMode: "trail",
    point: { x: 56, y: 76 },
  },
  {
    id: "contact",
    code: "04",
    label: "Contact",
    title: "Public profiles are the route.",
    body:
      "Bring a stuck workflow, product surface, or useful introduction through the public trail.",
    anchor: "#contact",
    progress: 0.88,
    sceneMode: "contact",
    point: { x: 84, y: 70 },
  },
];

export const methodWorldMoments: MethodWorldMoment[] = [
  {
    id: "world-joe",
    chapter: "joe",
    progress: 0,
    code: "00",
    label: "Joe",
    readout: "Joe Simo. Fort Myers. Devsigner.",
  },
  {
    id: "world-breakage",
    chapter: "method",
    stage: "breakage",
    progress: 0.16,
    code: "01A",
    label: "Breakage",
    readout: "Start where the product stops.",
  },
  {
    id: "world-signals",
    chapter: "method",
    stage: "signals",
    progress: 0.29,
    code: "01B",
    label: "Signals",
    readout: "Read timing, route, handoff, and state.",
  },
  {
    id: "world-surface",
    chapter: "work",
    stage: "surface",
    progress: 0.44,
    code: "02A",
    label: "Surface",
    readout: "Land the trace on a working surface.",
  },
  {
    id: "world-proof",
    chapter: "work",
    stage: "surface",
    progress: 0.55,
    code: "02B",
    label: "Proof",
    readout: "Move through named work artifacts.",
  },
  {
    id: "world-notes",
    chapter: "notes",
    progress: 0.66,
    code: "03",
    label: "Field Notes",
    readout: "Keep the public trail short and named.",
  },
  {
    id: "world-contact",
    chapter: "contact",
    progress: 0.88,
    code: "04",
    label: "Contact",
    readout: "Public profiles are the route.",
  },
];

export const projectCaseStudies: ProjectCaseStudy[] = [
  {
    slug: "sim0",
    code: "W01",
    title: "sim0",
    role: "Designed and built product interface surface",
    methodStage: "surface",
    schemaType: "SoftwareApplication",
    applicationCategory: "DeveloperApplication",
    summary:
      "Figma for real codebases: a working surface where an imported app runs in the browser and visual edits map back to source code.",
    evidence: [
      "Interface still",
      "Public product route at sim0.com",
      "Visible workflow state in one interface",
    ],
    assets: [
      {
        id: "sim0-ship-surface",
        captionId: "sim0-working-surface",
        label: "Shipping surface capture",
        claimIds: ["sim0-preview", "sim0-runtime", "sim0-ship"],
        media: sim0ShipSurfaceMedia,
        sourcePath: "Downloads/final/sim0",
        treatment: "hero",
      },
      {
        id: "sim0-current-editor",
        captionId: "sim0-working-surface",
        label: "Working surface capture",
        claimIds: ["sim0-preview", "sim0-runtime", "sim0-ship"],
        media: sim0CurrentEditorMedia,
        sourcePath: "Downloads/final/sim0",
        treatment: "hero",
      },
    ],
    links: [sim0Link],
    status: "Current public work",
    sourcePath: "Downloads/final/sim0",
    tier: "featured",
    story: {
      signal:
        "A running app becomes the design surface when preview state, runtime context, and source changes stay readable together.",
      problem:
        "Real interface work can stall when the design surface, running product, and code diff live in different places.",
      constraint:
        "The public case shows the owned editor artifact and product route, not private implementation detail.",
      approach: [
        "Import a real repo and run the app in the browser.",
        "Keep visual edits, AI edits, runtime context, and local API context close to the working surface.",
        "Put the code diff, ship action, and change state where the decision happens.",
      ],
      outcome:
        "The sim0 surface reads as one route from running product to editable source code.",
    },
    humanStake: {
      blockedPerson: "A builder waiting for a preview to explain what it is doing.",
      confusion:
        "The state appears in fragments: preview, runtime, API context, ship action, and staged changes.",
      madeVisible:
        "The operated case keeps the route on one surface and asks the visitor to complete it.",
      whyItMatters:
        "A visible route turns a blocked moment into a decision instead of another guess.",
    },
    miniWorld: {
      hook: "Operate the real surface until the stuck preview becomes a shipped route.",
      humanStake: {
        blockedPerson: "A builder waiting for a preview to explain what it is doing.",
        confusion:
          "The state appears in fragments: preview, runtime, API context, ship action, and staged changes.",
        madeVisible:
          "The operated case keeps the route on one surface and asks the visitor to complete it.",
        whyItMatters:
          "A visible route turns a blocked moment into a decision instead of another guess.",
      },
      media: sim0MachineProofMedia,
      panels: [
        {
          id: "problem-scene",
          label: "Problem",
          title: "The surface is not stuck in silence.",
          body:
            "The preview state is present, but it only becomes useful when the interface makes that state readable.",
          assetId: "sim0-current-editor",
          mediaId: "sim0-machine-find",
          captionId: "sim0-working-surface",
          claimIds: ["sim0-preview"],
          evidenceStatus: "local-proof",
        },
        {
          id: "proof-operation",
          label: "Operate",
          title: "The route is inspected, not narrated.",
          body:
            "The visitor follows runtime and local API context through the same real product surface.",
          mediaId: "sim0-route-replay",
          captionId: "sim0-working-surface",
          claimIds: ["sim0-runtime", "sim0-preview"],
          evidenceStatus: "local-proof",
        },
        {
          id: "decision-moment",
          label: "Decision",
          title: "The release action has evidence beside it.",
          body:
            "Ship and staged changes stay visible at the edge where the product asks for confidence.",
          assetId: "sim0-current-editor",
          mediaId: "sim0-machine-ship",
          captionId: "sim0-working-surface",
          claimIds: ["sim0-ship"],
          evidenceStatus: "local-proof",
        },
        {
          id: "outcome",
          label: "Receipt",
          title: "Surface shipped.",
          body:
            "The completed route is preview state, runtime, local API, ship action, and changes resolved into one readable surface.",
          mediaId: "sim0-machine-surface",
          captionId: "sim0-working-surface",
          claimIds: ["sim0-preview", "sim0-runtime", "sim0-ship"],
          evidenceStatus: "local-proof",
        },
      ],
    },
    proofCaptions: {
      "sim0-working-surface": {
        eyebrow: "Operated proof",
        title: "Working surface capture",
        detail:
          "Preview, runtime, local API context, shipping, and staged changes are visible in one product field.",
        sourceLabel: "Interface still",
        evidenceStatus: "local-proof",
      },
    },
    completedRoute: {
      label: "Completed route",
      title: "What this proves",
      detail:
        "sim0 is the flagship operated case: a broken product signal is inspected, traced, surfaced, and completed as one readable route.",
    },
    safeClaimIds: ["sim0-preview", "sim0-runtime", "sim0-ship"],
    proofMode: "operated",
    proofSummary:
      "Operated proof case: inspect real interface hotspots across preview, runtime, local context, shipping, and changes.",
    homepageFeature: {
      rank: 1,
      mediaAssetIds: ["sim0-ship-surface", "sim0-current-editor"],
      treatment: "operated-surface",
    },
  },
  {
    slug: "astrosimo",
    code: "W02",
    title: "Astrosimo",
    role: "Built iOS release and guidance surfaces",
    methodStage: "surface",
    schemaType: "SoftwareApplication",
    applicationCategory: "LifestyleApplication",
    summary:
      "A night-planning and live-guidance product surface represented by owned release-pack screenshots.",
    evidence: [
      "Verified capture flow",
      "Night planner surface",
      "Live sky guidance surface",
    ],
    assets: [
      {
        id: "astrosimo-signal-strip",
        captionId: "astrosimo-release-strip",
        label: "Release proof strip",
        claimIds: ["astrosimo-release", "astrosimo-guidance"],
        media: astrosimoSignalStripMedia,
        sourcePath: "Downloads/astro/artifacts",
        treatment: "hero",
      },
      {
        id: "astrosimo-verified",
        captionId: "astrosimo-verified",
        label: "Verified capture",
        claimIds: ["astrosimo-release"],
        media: astrosimoVerifiedCaptureMedia,
        sourcePath: "Downloads/astro/artifacts",
        treatment: "strip",
      },
      {
        id: "astrosimo-planner",
        captionId: "astrosimo-planner",
        label: "Night planner",
        claimIds: ["astrosimo-planning"],
        media: astrosimoNightPlannerMedia,
        sourcePath: "Downloads/astro/artifacts",
        treatment: "strip",
      },
      {
        id: "astrosimo-guidance",
        captionId: "astrosimo-guidance",
        label: "Live guidance",
        claimIds: ["astrosimo-guidance"],
        media: astrosimoLiveGuidanceMedia,
        sourcePath: "Downloads/astro/artifacts",
        treatment: "strip",
      },
    ],
    links: [],
    status: "Release proof",
    sourcePath: "Downloads/astro",
    tier: "case",
    story: {
      signal:
        "Astrosimo turns sky-planning state into phone-sized guidance surfaces.",
      problem:
        "A planning app has to compress time, location, verification, and live guidance into a small mobile surface.",
      constraint:
        "The public case uses owned release screenshots and avoids private app-store or service data.",
      approach: [
        "Show verified capture as the trust point.",
        "Keep planning and live guidance as adjacent proof surfaces.",
        "Let the release strip carry the story from verified capture to guidance.",
      ],
      outcome:
        "The case shows a mobile product moving from planning to live guidance through owned release artifacts.",
    },
    humanStake: {
      blockedPerson: "A person trying to plan a night outside from a phone-sized surface.",
      confusion:
        "Verification, timing, planning, and guidance can feel disconnected when each screen asks for trust separately.",
      madeVisible:
        "The release reel connects verified capture, night planning, and live guidance as one mobile route.",
      whyItMatters:
        "A small screen has to make the next outdoor decision readable without making the person decode the system.",
    },
    miniWorld: {
      hook: "A phone-sized release route: verify, plan, then follow the sky guidance surface.",
      humanStake: {
        blockedPerson: "A person trying to plan a night outside from a phone-sized surface.",
        confusion:
          "Verification, timing, planning, and guidance can feel disconnected when each screen asks for trust separately.",
        madeVisible:
          "The release reel connects verified capture, night planning, and live guidance as one mobile route.",
        whyItMatters:
          "A small screen has to make the next outdoor decision readable without making the person decode the system.",
      },
      media: [astrosimoReleaseReelMedia],
      panels: [
        {
          id: "problem-scene",
          label: "Problem",
          title: "The phone has to carry trust.",
          body:
            "Night planning becomes confusing when verification and guidance are split across separate moments.",
          assetId: "astrosimo-verified",
          captionId: "astrosimo-verified",
          claimIds: ["astrosimo-release"],
          evidenceStatus: "local-proof",
        },
        {
          id: "proof-operation",
          label: "Operate",
          title: "The release reel becomes the route.",
          body:
            "Owned captures move from verified state to planning and live guidance.",
          mediaId: "astrosimo-release-reel",
          captionId: "astrosimo-release-strip",
          claimIds: ["astrosimo-release", "astrosimo-planning"],
          evidenceStatus: "local-proof",
        },
        {
          id: "decision-moment",
          label: "Decision",
          title: "Planning and guidance stay adjacent.",
          body:
            "The mobile surface keeps the night planner and guidance state close enough to make the next action clear.",
          assetId: "astrosimo-planner",
          captionId: "astrosimo-planner",
          claimIds: ["astrosimo-planning"],
          evidenceStatus: "local-proof",
        },
        {
          id: "outcome",
          label: "Receipt",
          title: "A mobile route, not a feature list.",
          body:
            "The public proof stays limited to owned release captures: verified state, planning, and live guidance.",
          assetId: "astrosimo-guidance",
          captionId: "astrosimo-guidance",
          claimIds: ["astrosimo-guidance"],
          evidenceStatus: "local-proof",
        },
      ],
    },
    proofCaptions: {
      "astrosimo-release-strip": {
        eyebrow: "Release proof",
        title: "Release proof strip",
        detail:
          "Verified capture, night planning, and live guidance are represented as one local mobile proof strip.",
        sourceLabel: "Release reel",
        evidenceStatus: "local-proof",
      },
      "astrosimo-verified": {
        eyebrow: "Verification",
        title: "Verified capture",
        detail: "The screen provides the trust state for the release proof.",
        sourceLabel: "Release still",
        evidenceStatus: "local-proof",
      },
      "astrosimo-planner": {
        eyebrow: "Planning",
        title: "Night planner",
        detail: "The planning surface shows the app as a mobile decision tool.",
        sourceLabel: "Planning still",
        evidenceStatus: "local-proof",
      },
      "astrosimo-guidance": {
        eyebrow: "Guidance",
        title: "Live guidance",
        detail: "The guidance surface completes the mobile signal path.",
        sourceLabel: "Guidance still",
        evidenceStatus: "local-proof",
      },
    },
    completedRoute: {
      label: "Completed route",
      title: "What this proves",
      detail:
        "Astrosimo proves the method on mobile surfaces: verification, planning, and guidance stay visible as owned release evidence.",
    },
    safeClaimIds: [
      "astrosimo-release",
      "astrosimo-planning",
      "astrosimo-guidance",
    ],
    proofMode: "reel",
    proofSummary:
      "Release reel: verified capture, night planning, and live guidance are shown as owned mobile proof surfaces.",
    homepageFeature: {
      rank: 2,
      mediaAssetIds: [
        "astrosimo-signal-strip",
        "astrosimo-verified",
        "astrosimo-planner",
        "astrosimo-guidance",
      ],
      treatment: "mobile-strip",
    },
  },
  {
    slug: "antonetas-garden",
    code: "W03",
    title: "Antoneta's Garden",
    role: "Built Unity game surface and web landing",
    methodStage: "surface",
    schemaType: "VideoGame",
    summary:
      "A game project with Unity/iOS work, mobile controls, release verification, and a web landing surface.",
    evidence: [
      "Unity menu capture",
      "Landing page capture",
      "WebGL preview capture",
      "Progress log with lint, build, iOS export, and mobile checks",
    ],
    assets: [
      {
        id: "antoneta-unity",
        captionId: "antoneta-unity",
        label: "Unity menu",
        claimIds: ["antoneta-unity", "antoneta-playable"],
        media: antonetaGardenMedia,
        sourcePath: "Downloads/video/output/review",
        treatment: "hero",
      },
      {
        id: "antoneta-landing",
        captionId: "antoneta-landing",
        label: "Landing page",
        claimIds: ["antoneta-public-surface"],
        media: antonetaGardenLandingMedia,
        sourcePath: "Downloads/video/output",
        treatment: "supporting",
      },
      {
        id: "antoneta-preview",
        captionId: "antoneta-preview",
        label: "WebGL preview",
        claimIds: ["antoneta-playable"],
        media: antonetaGardenPreviewMedia,
        sourcePath: "Downloads/video/output",
        treatment: "strip",
      },
    ],
    links: [],
    status: "Game project",
    sourcePath: "Downloads/video",
    tier: "case",
    story: {
      signal:
        "Antoneta's Garden moves from a landing surface into a playable Unity/WebGL proof path.",
      problem:
        "A game project needs to prove both the public story surface and the playable client surface.",
      constraint:
        "The public case is limited to owned captures and progress evidence from the project folder.",
      approach: [
        "Show the landing surface as the entry point.",
        "Show the Unity menu and gameplay surface as the playable proof.",
        "Keep WebGL preview evidence tied to the same product route.",
      ],
      outcome:
        "The case carries a small game from public surface to playable proof.",
    },
    humanStake: {
      blockedPerson: "A player who needs to know whether the world is more than a landing page.",
      confusion:
        "A game can look public before it proves the playable surface exists.",
      madeVisible:
        "The progression moves from landing capture to Unity client and browser preview proof.",
      whyItMatters:
        "For a game, the interface promise only matters when the world can be entered.",
    },
    miniWorld: {
      hook: "Move from the public garden surface into the playable client proof.",
      humanStake: {
        blockedPerson: "A player who needs to know whether the world is more than a landing page.",
        confusion:
          "A game can look public before it proves the playable surface exists.",
        madeVisible:
          "The progression moves from landing capture to Unity client and browser preview proof.",
        whyItMatters:
          "For a game, the interface promise only matters when the world can be entered.",
      },
      media: [antonetaProgressionReelMedia],
      panels: [
        {
          id: "problem-scene",
          label: "Problem",
          title: "The story surface has to lead somewhere.",
          body:
            "The landing capture sets the outside face, but the case needs playable proof behind it.",
          assetId: "antoneta-landing",
          captionId: "antoneta-landing",
          claimIds: ["antoneta-public-surface"],
          evidenceStatus: "local-proof",
        },
        {
          id: "proof-operation",
          label: "Operate",
          title: "The reel crosses into the client.",
          body:
            "Owned captures move from public surface to Unity and WebGL proof.",
          mediaId: "antoneta-progression-reel",
          captionId: "antoneta-unity",
          claimIds: ["antoneta-unity", "antoneta-playable"],
          evidenceStatus: "local-proof",
        },
        {
          id: "decision-moment",
          label: "Decision",
          title: "The playable surface becomes the proof.",
          body:
            "The Unity capture carries the case because it shows the project as an operated game client.",
          assetId: "antoneta-unity",
          captionId: "antoneta-unity",
          claimIds: ["antoneta-unity", "antoneta-playable"],
          evidenceStatus: "local-proof",
        },
        {
          id: "outcome",
          label: "Receipt",
          title: "Landing to gameplay stays one route.",
          body:
            "The result is a small authored progression from public page to playable evidence.",
          assetId: "antoneta-preview",
          captionId: "antoneta-preview",
          claimIds: ["antoneta-playable"],
          evidenceStatus: "local-proof",
        },
      ],
    },
    proofCaptions: {
      "antoneta-unity": {
        eyebrow: "Playable proof",
        title: "Unity menu",
        detail: "The Unity capture shows the game as an operated client surface.",
        sourceLabel: "Playable capture",
        evidenceStatus: "local-proof",
      },
      "antoneta-landing": {
        eyebrow: "Public surface",
        title: "Landing page",
        detail: "The landing capture shows the outside face of the game project.",
        sourceLabel: "Landing still",
        evidenceStatus: "local-proof",
      },
      "antoneta-preview": {
        eyebrow: "WebGL proof",
        title: "WebGL preview",
        detail: "The preview capture shows the game moving through a browser surface.",
        sourceLabel: "Browser preview",
        evidenceStatus: "local-proof",
      },
    },
    completedRoute: {
      label: "Completed route",
      title: "What this proves",
      detail:
        "Antoneta's Garden proves Joe's surface work across landing, Unity, and WebGL artifacts.",
    },
    safeClaimIds: [
      "antoneta-unity",
      "antoneta-playable",
      "antoneta-public-surface",
    ],
    proofMode: "reel",
    proofSummary:
      "Progression reel: Unity gameplay and landing captures show the project moving from public surface to playable client.",
    homepageFeature: {
      rank: 3,
      mediaAssetIds: ["antoneta-unity", "antoneta-landing"],
      treatment: "progression-strip",
    },
  },
  {
    slug: "next-flights",
    code: "W04",
    title: "Next Flights",
    role: "Flight tracking application",
    methodStage: "signals",
    schemaType: "SoftwareApplication",
    applicationCategory: "TravelApplication",
    summary:
      "A flight tracking app with search, maps, CMS-backed surfaces, and typed application structure.",
    evidence: [
      "README lists real-time tracking, search, maps, and CMS",
      "Owned product artwork",
      "Typed Next.js application structure",
    ],
    assets: [
      {
        id: "next-flights-overview",
        captionId: "next-flights-overview",
        label: "Product overview",
        claimIds: ["next-flights-product", "next-flights-maps"],
        media: nextFlightsOverviewMedia,
        sourcePath: "Downloads/next-flights/public",
        treatment: "hero",
      },
      {
        id: "next-flights-cta",
        captionId: "next-flights-cta",
        label: "Interface artwork",
        claimIds: ["next-flights-product"],
        media: nextFlightsCtaMedia,
        sourcePath: "Downloads/next-flights/public",
        treatment: "supporting",
      },
    ],
    links: [],
    status: "App project",
    sourcePath: "Downloads/next-flights",
    tier: "supporting",
    story: {
      signal:
        "Next Flights is a systems case: search, maps, boards, and typed routes become product anatomy.",
      problem:
        "Flight-tracking surfaces depend on live data shape, routing, search, and map context.",
      constraint:
        "The public page can show owned artwork and repo evidence but not live service credentials.",
      approach: [
        "Use product artwork to show the visual surface.",
        "Describe the typed application structure without exposing secrets.",
        "Treat the case as product anatomy: artwork, routes, search, and map context.",
      ],
      outcome:
        "The case shows a product structure built around signals and route boundaries.",
    },
    proofCaptions: {
      "next-flights-overview": {
        eyebrow: "Product anatomy",
        title: "Product overview",
        detail:
          "Owned artwork represents the flight tracking surface and signal-heavy product shape.",
        sourceLabel: "Product anatomy",
        evidenceStatus: "local-proof",
      },
      "next-flights-cta": {
        eyebrow: "Surface artwork",
        title: "Interface artwork",
        detail: "The supporting artwork shows the public-facing visual system.",
        sourceLabel: "Interface artwork",
        evidenceStatus: "local-proof",
      },
    },
    completedRoute: {
      label: "Completed route",
      title: "What this proves",
      detail:
        "Next Flights supports the signal method through app structure, search, maps, and owned product artwork.",
    },
    safeClaimIds: ["next-flights-product", "next-flights-maps"],
    proofMode: "anatomy",
    proofSummary:
      "Product anatomy: owned artwork and repo evidence show search, map, board, and route/API structure without exposing live tokens.",
  },
  {
    slug: "grimgreen-channel-watch",
    code: "W05",
    title: "GrimmGreen Channel Watch",
    role: "Public reachability monitor",
    methodStage: "signals",
    schemaType: "SoftwareApplication",
    applicationCategory: "UtilitiesApplication",
    summary:
      "A tiny dashboard that checks whether public channel URLs look reachable, without requiring a platform token.",
    evidence: [
      "Public URL fetch and page classification",
      "Server status route",
      "Polling dashboard with rate-limit state",
    ],
    assets: [],
    links: [],
    status: "Dashboard project",
    sourcePath: "Downloads/grimgreen-watch",
    tier: "specimen",
    story: {
      signal:
        "GrimmGreen Channel Watch is a narrow reachability signal case.",
      problem:
        "A small dashboard needs to report whether public channel URLs look reachable without relying on a platform token.",
      constraint:
        "There is no public dashboard media in the current asset set, so the case stays text-first.",
      approach: [
        "Classify public URL fetch responses.",
        "Expose server status and polling state.",
        "Keep the proof narrow until owned dashboard media exists.",
      ],
      outcome:
        "The case remains an honest process specimen for reachability, polling, and status routes.",
      limitation:
        "Visual proof is intentionally limited until a real dashboard capture is added.",
    },
    proofCaptions: {
      "grimgreen-specimen": {
        eyebrow: "Process specimen",
        title: "Reachability flow",
        detail:
          "The case is shown as a factual system flow until dashboard media exists.",
        sourceLabel: "Process trace",
        evidenceStatus: "needs-media",
      },
    },
    completedRoute: {
      label: "Completed route",
      title: "What this proves",
      detail:
        "GrimmGreen proves a small signals utility through reachability, polling, and status-route structure.",
    },
    safeClaimIds: ["grimgreen-reachability", "grimgreen-status"],
    proofMode: "specimen",
    proofSummary:
      "Process specimen: reachability classification, polling, and status routes are shown as a factual system flow until dashboard media exists.",
  },
  {
    slug: "royal-shell",
    code: "W06",
    title: "Royal Shell",
    role: "Signature generator surface",
    methodStage: "surface",
    schemaType: "SoftwareApplication",
    applicationCategory: "BusinessApplication",
    summary:
      "A real-estate signature generator surface with Royal Shell and Golden Ocala signature modes.",
    evidence: [
      "Next.js app",
      "Signature type selector",
      "Royal Shell fallback logo asset",
    ],
    assets: [
      {
        id: "royal-shell-logo",
        captionId: "royal-shell-logo",
        label: "Brand asset",
        claimIds: ["royal-shell-signature", "royal-shell-brand"],
        media: royalShellLogoMedia,
        sourcePath: "Downloads/royalshell/my-app/public",
        treatment: "hero",
      },
    ],
    links: [],
    status: "Tool project",
    sourcePath: "Downloads/royalshell",
    tier: "specimen",
    story: {
      signal:
        "Royal Shell turns brand-specific signature requirements into a focused utility surface.",
      problem:
        "Email signature work breaks when brand assets, modes, and paste behavior drift apart.",
      constraint:
        "The public case can show the app surface and brand asset without exposing private account data.",
      approach: [
        "Keep signature mode selection explicit.",
        "Use fallback logo assets where the generated signature needs stability.",
        "Represent the case as a narrow business utility, not a broad platform.",
      ],
      outcome:
        "The utility surface shows a practical brand workflow with limited public proof.",
    },
    proofCaptions: {
      "royal-shell-logo": {
        eyebrow: "Brand surface",
        title: "Brand asset",
        detail:
          "The fallback logo asset anchors the signature generator proof without exposing private account data.",
        sourceLabel: "Brand utility still",
        evidenceStatus: "local-proof",
      },
    },
    completedRoute: {
      label: "Completed route",
      title: "What this proves",
      detail:
        "Royal Shell proves a focused signature workflow where brand surface and utility behavior meet.",
    },
    safeClaimIds: ["royal-shell-signature", "royal-shell-brand"],
    proofMode: "specimen",
    proofSummary:
      "Brand-surface specimen: signature modes and fallback brand assets are shown as a focused utility surface.",
  },
  {
    slug: "signature-copier",
    code: "W07",
    title: "Signature Copier",
    role: "Outlook paste workflow",
    methodStage: "breakage",
    schemaType: "SoftwareApplication",
    applicationCategory: "UtilitiesApplication",
    summary:
      "A focused utility for preparing signature-copying workflows that survive real email paste behavior.",
    evidence: [
      "App capture",
      "Outlook-oriented image and paste workflow assets",
      "Mobile and desktop review captures",
    ],
    assets: [
      {
        id: "signature-copier-app",
        captionId: "signature-copier-app",
        label: "Application capture",
        claimIds: ["signature-paste", "signature-outlook"],
        media: signatureCopierMedia,
        sourcePath: "Downloads/steve/tmp",
        treatment: "hero",
      },
    ],
    links: [],
    status: "Utility project",
    sourcePath: "Downloads/steve",
    tier: "specimen",
    story: {
      signal:
        "Signature Copier starts from a real paste failure and turns it into a focused preparation surface.",
      problem:
        "Email signatures can look correct in source form and still fail when pasted into Outlook.",
      constraint:
        "The case uses owned captures and avoids account-specific mail data.",
      approach: [
        "Treat paste behavior as the broken state.",
        "Prepare signature assets for the real target surface.",
        "Keep the workflow narrow enough to be reliable.",
      ],
      outcome:
        "The case shows a small utility built around a real copy/paste interface break.",
    },
    proofCaptions: {
      "signature-copier-app": {
        eyebrow: "Paste workflow",
        title: "Application capture",
        detail:
          "The capture shows a utility shaped around real email signature paste behavior.",
        sourceLabel: "Signature surface",
        evidenceStatus: "local-proof",
      },
    },
    completedRoute: {
      label: "Completed route",
      title: "What this proves",
      detail:
        "Signature Copier proves Joe's breakage-first method at utility scale: the failure path becomes the product surface.",
    },
    safeClaimIds: ["signature-paste", "signature-outlook"],
    proofMode: "specimen",
    proofSummary:
      "Paste-workflow specimen: owned capture and Outlook-oriented assets show a narrow real-world utility path.",
  },
  {
    slug: "printer-scripts",
    code: "W08",
    title: "Printer Scripts",
    role: "Cross-platform provisioning utility",
    methodStage: "breakage",
    schemaType: "SoftwareApplication",
    applicationCategory: "UtilitiesApplication",
    summary:
      "Windows and macOS printer installation scripts with administrative checks, service setup, local queues, and fallback drivers.",
    evidence: [
      "macOS command script",
      "Windows batch script",
      "Cross-platform installation flow",
    ],
    assets: [],
    links: [],
    status: "Automation utility",
    sourcePath: "Downloads/Printers",
    tier: "specimen",
    story: {
      signal:
        "Printer Scripts turns provisioning breakage into a redacted, cross-platform flow.",
      problem:
        "Printer setup can fail across operating systems, permissions, drivers, and local queue state.",
      constraint:
        "The public case must not reveal private network details, office-specific values, or internal endpoints.",
      approach: [
        "Show the installation flow rather than sensitive configuration.",
        "Keep macOS and Windows paths visible as process proof.",
        "Redact the parts that belong to a private environment.",
      ],
      outcome:
        "The case remains useful as a provisioning specimen without leaking sensitive setup details.",
      limitation:
        "No private IPs, office values, or internal network details appear publicly.",
    },
    proofCaptions: {
      "printer-redacted-flow": {
        eyebrow: "Redacted specimen",
        title: "Provisioning flow",
        detail:
          "The installer is represented as a redacted flow so private network details stay private.",
        sourceLabel: "Redacted process trace",
        evidenceStatus: "redacted",
      },
    },
    completedRoute: {
      label: "Completed route",
      title: "What this proves",
      detail:
        "Printer Scripts proves the method can describe breakage and setup flow while protecting sensitive details.",
    },
    safeClaimIds: ["printer-macos", "printer-windows", "printer-redacted"],
    proofMode: "specimen",
    proofSummary:
      "Redacted provisioning specimen: Windows and macOS installers are represented by flow steps, not private network details.",
  },
  {
    slug: "chesslm",
    code: "W09",
    title: "ChessLM",
    role: "Chess training product and Unity client",
    methodStage: "signals",
    schemaType: "SoftwareApplication",
    applicationCategory: "EducationalApplication",
    summary:
      "A chess training and coaching product with a Next.js web/backend surface and a Unity client for WebGL, iPhone, and iPad.",
    evidence: [
      "Next.js web/backend and classic training workspace",
      "Unity client for WebGL, iPhone, and iPad",
      "Gateway-first production API boundary",
      "Classical chess and Chess960 support",
    ],
    assets: [
      {
        id: "chesslm-unity",
        captionId: "chesslm-unity",
        label: "Unity WebGL board",
        claimIds: ["chesslm-unity", "chesslm-board"],
        media: chessLmUnityMedia,
        sourcePath: "Downloads/chess/output/playwright",
        treatment: "hero",
      },
      {
        id: "chesslm-workspace",
        captionId: "chesslm-workspace",
        label: "Training workspace",
        claimIds: ["chesslm-web", "chesslm-training"],
        media: chessLmWorkspaceMedia,
        sourcePath: "Downloads/chess/public/preview",
        treatment: "supporting",
      },
    ],
    links: [],
    status: "Product project",
    sourcePath: "Downloads/chess",
    tier: "case",
    story: {
      signal:
        "ChessLM carries one training product across a web workspace and Unity board surface.",
      problem:
        "A chess training product has to keep reasoning, board state, and client targets aligned.",
      constraint:
        "The public case uses owned captures and keeps provider secrets server-side.",
      approach: [
        "Use the web workspace as the training surface.",
        "Use the Unity board as the operated client surface.",
        "Keep the product boundary clear across WebGL, iPhone, and iPad targets.",
      ],
      outcome:
        "The case shows the same product signal across browser and game-client contexts.",
    },
    humanStake: {
      blockedPerson: "A player trying to connect coaching, board state, and the next move.",
      confusion:
        "Training gets noisy when reasoning, board surface, and client target feel like separate products.",
      madeVisible:
        "The reel connects web workspace and Unity board as one training route.",
      whyItMatters:
        "A player should be able to follow the lesson without wondering which surface owns the state.",
    },
    miniWorld: {
      hook: "Carry one training signal from the web workspace into the Unity board.",
      humanStake: {
        blockedPerson: "A player trying to connect coaching, board state, and the next move.",
        confusion:
          "Training gets noisy when reasoning, board surface, and client target feel like separate products.",
        madeVisible:
          "The reel connects web workspace and Unity board as one training route.",
        whyItMatters:
          "A player should be able to follow the lesson without wondering which surface owns the state.",
      },
      media: [chessLmTrainingReelMedia],
      panels: [
        {
          id: "problem-scene",
          label: "Problem",
          title: "Training state has to stay aligned.",
          body:
            "The browser workspace shows the reasoning surface, but the board client has to carry the same signal.",
          assetId: "chesslm-workspace",
          captionId: "chesslm-workspace",
          claimIds: ["chesslm-web", "chesslm-training"],
          evidenceStatus: "local-proof",
        },
        {
          id: "proof-operation",
          label: "Operate",
          title: "The signal crosses surfaces.",
          body:
            "The training reel moves from workspace context into the Unity board without exposing provider secrets.",
          mediaId: "chesslm-training-reel",
          captionId: "chesslm-unity",
          claimIds: ["chesslm-unity", "chesslm-web"],
          evidenceStatus: "local-proof",
        },
        {
          id: "decision-moment",
          label: "Decision",
          title: "The board becomes the client surface.",
          body:
            "The Unity board capture proves the operated training client across WebGL, iPhone, and iPad direction.",
          assetId: "chesslm-unity",
          captionId: "chesslm-unity",
          claimIds: ["chesslm-unity", "chesslm-board"],
          evidenceStatus: "local-proof",
        },
        {
          id: "outcome",
          label: "Receipt",
          title: "One product route crosses two clients.",
          body:
            "The case shows a training surface moving between browser workspace and game-client board while secrets stay server-side.",
          assetId: "chesslm-unity",
          captionId: "chesslm-unity",
          claimIds: ["chesslm-unity", "chesslm-training"],
          evidenceStatus: "local-proof",
        },
      ],
    },
    proofCaptions: {
      "chesslm-unity": {
        eyebrow: "Unity client",
        title: "Unity WebGL board",
        detail:
          "The board capture shows the training product as an operated game-client surface.",
        sourceLabel: "Training capture",
        evidenceStatus: "local-proof",
      },
      "chesslm-workspace": {
        eyebrow: "Training surface",
        title: "Training workspace",
        detail:
          "The workspace capture shows the browser training surface for the same product.",
        sourceLabel: "Unity board capture",
        evidenceStatus: "local-proof",
      },
    },
    completedRoute: {
      label: "Completed route",
      title: "What this proves",
      detail:
        "ChessLM proves a product route that crosses web workspace and Unity client while keeping secrets out of the client.",
    },
    safeClaimIds: ["chesslm-unity", "chesslm-web", "chesslm-training"],
    proofMode: "reel",
    proofSummary:
      "Training reel: web workspace and Unity board captures show the same product surface across browser and game-client contexts.",
    homepageFeature: {
      rank: 4,
      mediaAssetIds: ["chesslm-workspace", "chesslm-unity"],
      treatment: "training-strip",
    },
  },
];

export const projectCaseStudiesPublic: PublicProjectCaseStudy[] =
  projectCaseStudies.map(({ assets, sourcePath, ...project }) => ({
    ...project,
    assets: assets.map(({ sourcePath: assetSourcePath, ...asset }) => ({
      ...asset,
      sourceLabel: publicSourceLabel(assetSourcePath),
    })),
    sourceLabel: publicSourceLabel(sourcePath),
  }));

type StoryboardSourceProject = Pick<
  ProjectCaseStudy,
  | "assets"
  | "completedRoute"
  | "proofCaptions"
  | "safeClaimIds"
  | "story"
  | "storyboard"
  | "summary"
>;

function buildStoryboardPanel(input: {
  id: ProjectStoryboardPanelId;
  label: string;
  title: string;
  body: string;
  assetId?: string;
  mediaId?: string;
  captionId?: string;
  claimIds?: string[];
  evidenceStatus?: EvidenceStatus;
}): ProjectStoryboardPanel {
  const panel: ProjectStoryboardPanel = {
    id: input.id,
    label: input.label,
    title: input.title,
    body: input.body,
    claimIds: input.claimIds?.length ? input.claimIds : [],
  };

  if (input.assetId) {
    panel.assetId = input.assetId;
  }

  if (input.mediaId) {
    panel.mediaId = input.mediaId;
  }

  if (input.captionId) {
    panel.captionId = input.captionId;
  }

  if (input.evidenceStatus) {
    panel.evidenceStatus = input.evidenceStatus;
  }

  return panel;
}

export function storyboardForProject(
  project: StoryboardSourceProject,
): ProjectStoryboardPanel[] {
  if (project.storyboard?.length) {
    return project.storyboard;
  }

  const primaryAsset = project.assets[0];
  const secondaryAsset = project.assets[1] ?? primaryAsset;
  const finalAsset =
    project.assets.find((asset) => asset.treatment === "hero") ??
    project.assets[project.assets.length - 1] ??
    primaryAsset;

  const statusFor = (captionId?: string) =>
    captionId ? project.proofCaptions[captionId]?.evidenceStatus : undefined;
  const safeClaims = project.safeClaimIds.slice(0, 3);
  const operationClaims = secondaryAsset?.claimIds.length
    ? secondaryAsset.claimIds
    : safeClaims;
  const outcomeClaims = finalAsset?.claimIds.length
    ? finalAsset.claimIds
    : safeClaims;

  return [
    buildStoryboardPanel({
      id: "problem-scene",
      label: "Problem Scene",
      title: "Where the route gets stuck",
      body: project.story.problem,
      assetId: primaryAsset?.id,
      captionId: primaryAsset?.captionId,
      claimIds: primaryAsset?.claimIds.length ? primaryAsset.claimIds : safeClaims,
      evidenceStatus: statusFor(primaryAsset?.captionId),
    }),
    buildStoryboardPanel({
      id: "proof-operation",
      label: "Proof Operation",
      title: "How the signal is operated",
      body: project.story.approach.join(" "),
      assetId: secondaryAsset?.id,
      captionId: secondaryAsset?.captionId,
      claimIds: operationClaims,
      evidenceStatus: statusFor(secondaryAsset?.captionId),
    }),
    buildStoryboardPanel({
      id: "decision-moment",
      label: "Decision Moment",
      title: "What has to become visible",
      body: project.story.constraint,
      assetId: finalAsset?.id,
      captionId: finalAsset?.captionId,
      claimIds: outcomeClaims,
      evidenceStatus: statusFor(finalAsset?.captionId),
    }),
    buildStoryboardPanel({
      id: "outcome",
      label: "Outcome",
      title: project.completedRoute.title,
      body: project.completedRoute.detail,
      assetId: finalAsset?.id,
      captionId: finalAsset?.captionId,
      claimIds: outcomeClaims,
      evidenceStatus: statusFor(finalAsset?.captionId),
    }),
  ];
}

export function getProjectCaseStudy(slug: string) {
  return projectCaseStudies.find((project) => project.slug === slug);
}

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
    title: "Small public proof should stay named.",
    body:
      "If the public trail is small, it should stay small and named. The page can still show how the work thinks.",
    source: "Trail",
  },
  {
    code: "F5",
    title: "The sky keeps the scale honest.",
    body:
      "Stargazing and independent physics study sit behind the same habit: follow the system, respect the limits, and say exactly what is known.",
    source: "Universe",
  },
];

export const archiveArtifacts: ArchiveArtifact[] = [
  {
    code: "A1",
    title: "SimoHost",
    body:
      "A surviving hosting-era mark from the years of domain names, web hosting, WordPress, e-commerce, SEO, and small-business sites.",
    sourceLabel: "Local logo archive",
    media: {
      kind: "artifact",
      src: "/media/archive/simohost-logo.webp",
      alt: "SimoHost circular globe logo",
      width: 512,
      height: 512,
      tone: "desaturated",
    },
  },
  {
    code: "A2",
    title: "World of Vanilla",
    body:
      "A fan/community web identity from the deleted-site archive. The current page keeps it as design proof, not as an active public project.",
    sourceLabel: "Local logo archive",
    media: {
      kind: "artifact",
      src: "/media/archive/world-of-vanilla-icon.webp",
      alt: "World of Vanilla circular gold logo",
      width: 511,
      height: 512,
      tone: "desaturated",
    },
  },
  {
    code: "A3",
    title: "World of Vanilla wordmark",
    body:
      "A compact surviving wordmark from the same community-site visual system.",
    sourceLabel: "Local logo archive",
    media: {
      kind: "artifact",
      src: "/media/archive/world-of-vanilla-logo.webp",
      alt: "World of Vanilla wordmark logo",
      width: 215,
      height: 100,
      tone: "desaturated",
    },
  },
  {
    code: "A4",
    title: "WoW Tournaments",
    body:
      "A tournament/community identity fragment from the old web archive. It documents the habit of making sites for fun, then moving on.",
    sourceLabel: "Local logo archive",
    media: {
      kind: "artifact",
      src: "/media/archive/wow-tourney-emblem.webp",
      alt: "WoW Tourney gold emblem",
      width: 512,
      height: 512,
      tone: "desaturated",
    },
  },
  {
    code: "A5",
    title: "Tournament wordmark",
    body:
      "A smaller surviving tournament logo from the same archived visual direction.",
    sourceLabel: "Local logo archive",
    media: {
      kind: "artifact",
      src: "/media/archive/wow-tournaments-logo.webp",
      alt: "WoW Tournaments wordmark logo",
      width: 221,
      height: 115,
      tone: "desaturated",
    },
  },
];

const reactMiamiDeveloperFrames = [
  "Hallway signal",
  "Builder table",
  "Night conversation",
  "Agentic infrastructure",
  "La Tropical",
  "Orange pocket",
  "Conference room",
  "Badge receipt",
  "Hallway frame",
  "Front row",
  "After-hours group",
  "React Miami stage",
  "React Miami still",
  "React Miami motion",
  "React Miami portrait",
  "React Miami lockup",
  "React Miami pair",
  "React Miami proof",
  "React Miami receipt",
] as const;

export const communityArtifacts: CommunityArtifact[] =
  reactMiamiDeveloperFrames.map((title, index) => {
    const frameNumber = index + 1;
    const code = `R${String(frameNumber).padStart(2, "0")}`;

    return {
      code,
      title,
      body:
        "Owned React Miami 2026 frame from Joe's developer community trail.",
      sourceLabel: "Owned event photo",
      media: {
        kind: "artifact",
        src: `/media/community/react-miami-developer-${String(frameNumber).padStart(2, "0")}.webp`,
        alt: `Joe Simo at React Miami 2026 developer community frame ${frameNumber}`,
        width: 1200,
        height: 1600,
        tone: "desaturated",
      },
    };
  });

export const communityHighlights: CommunityArtifact[] = [
  {
    code: "R00",
    title: "React Miami room",
    body:
      "Owned React Miami 2026 room frame: the broader builder context before any individual receipt.",
    sourceLabel: "Owned event photo",
    media: {
      kind: "artifact",
      src: "/media/community/react-miami-room.webp",
      alt: "React Miami 2026 builder room with Joe Simo community context",
      width: 1199,
      height: 800,
      tone: "desaturated",
    },
  },
  {
    code: "R01",
    title: "ThePrimeagen",
    body:
      "Owned React Miami 2026 photo with ThePrimeagen, kept as a people-and-community receipt.",
    sourceLabel: "Owned event photo",
    media: {
      kind: "artifact",
      src: "/media/community/react-miami-primeagen.webp",
      alt: "Joe Simo with ThePrimeagen at React Miami 2026",
      width: 960,
      height: 1186,
      tone: "desaturated",
    },
  },
  {
    code: "R02",
    title: "Builder table",
    body:
      "Owned React Miami 2026 table frame from the same builder trail.",
    sourceLabel: "Owned event photo",
    media: {
      kind: "artifact",
      src: "/media/community/react-miami-table.webp",
      alt: "React Miami 2026 builder table community frame",
      width: 1199,
      height: 800,
      tone: "desaturated",
    },
  },
  {
    code: "R03",
    title: "Audience signal",
    body:
      "Owned React Miami 2026 audience frame showing the room around the work.",
    sourceLabel: "Owned event photo",
    media: {
      kind: "artifact",
      src: "/media/community/react-miami-audience.webp",
      alt: "React Miami 2026 audience community frame",
      width: 900,
      height: 993,
      tone: "desaturated",
    },
  },
  ...communityArtifacts.slice(0, 2),
];

export const productReportArtifacts: ProductReportArtifact[] = [
  {
    code: "P1",
    title: "Vercel v0 billing report",
    body:
      "Reported a v0 API billing issue with a repro video and written recommendations. Vercel connected Joe with the v0 team to investigate.",
    outcome:
      "The team identified the cause and marked the issue fixed. This page keeps the claim modest: reported, documented, and helped verify.",
    sourceLabel: "Private report and team thread",
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
      "The sim0 interface still shows preview state, runtime context, shipping, and staged changes in one field.",
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
      "The visible public repository surface is the profile plus a named public fork.",
    stage: "trail",
    href: "https://github.com/joe-simo/openai-agents-js",
    actionLabel: "View repo",
  },
  {
    id: "contact",
    code: "W5",
    label: "Contact",
    source: "LinkedIn",
    title: "The exit stays public.",
    detail:
      "For support, systems, web projects, sim0, or interface work, use the public profile trail.",
    stage: "contact",
    href: linkedinChannel.href,
    actionLabel: "Open LinkedIn",
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
      "The interface still gives the page a real product surface: preview state, runtime context, local API context, ship action, and change state.",
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
      "The visible GitHub proof is the public profile and the openai-agents-js fork.",
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
      id: "view-public-trail-work",
      label: "View Work",
      href: "#work",
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
    sectionAnchor: "#work",
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
        id: "open-linkedin-work",
        label: "LinkedIn",
        href: linkedinChannel.href,
        external: true,
        ariaLabel: "Open Joe Simo on LinkedIn in a new tab",
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
    status: "GitHub, X, Instagram, LinkedIn, and YouTube.",
    detail:
      "The public trail keeps the real exits close: code, public profiles, professional context, and video.",
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
    sectionAnchor: "#social",
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
    status: "Public profiles are best.",
    detail:
      "Reach out through public profiles about support, systems, web projects, sim0, interface work, or a useful introduction.",
    proof: "LinkedIn / X / GitHub",
    primaryAction: {
      id: "open-linkedin-contact",
      label: "LinkedIn",
      href: linkedinChannel.href,
      external: true,
      ariaLabel: "Open Joe Simo on LinkedIn in a new tab",
      kind: "primary",
    },
    secondaryActions: [
      {
        id: "open-x-contact",
        label: "X",
        href: xChannel.href,
        external: true,
        ariaLabel: "Open Joe Simo on X in a new tab",
        kind: "secondary",
      },
      sim0Link,
    ],
    iconKey: "arrowUpRight",
    accent: "live",
    sceneMode: "contact",
    scene: {
      code: "04",
      eyebrow: "Contact",
      coordinate: "public profiles",
      tone: "contact",
      scrollRange: [0.78, 1],
    },
    route: {
      from: "joe",
      tension: 0.54,
      depth: 0.18,
    },
    sectionAnchor: "#contact",
    readActionLabel: "Open Public Profiles",
    map: {
      desktopPoint: { x: 76, y: 78 },
      mobilePoint: { x: 50, y: 84 },
    },
  },
];

export const navItems = [
  {
    label: "Work",
    href: "#work",
    iconKey: "appWindow",
    recordId: "work",
  },
  {
    label: "Moments",
    href: "#photos",
    iconKey: "camera",
    recordId: "trail",
  },
  {
    label: "Notes",
    href: "#blog",
    iconKey: "bookOpen",
    recordId: "trail",
  },
  {
    label: "Internet",
    href: "#social",
    iconKey: "code",
    recordId: "contact",
  },
  {
    label: "Contact",
    href: "#contact",
    iconKey: "arrowUpRight",
    recordId: "contact",
  },
] as const satisfies readonly {
  label: string;
  href: `#${string}`;
  iconKey: IconKey;
  recordId: SiteNodeId;
}[];

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
