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
  | "v0"
  | "youtube"
  | "x"
  | "xLogo";

export type AccentKey = "ink" | "signal" | "fault" | "live";

export type PortfolioSectionId =
  | "joe"
  | "work"
  | "systems"
  | "credentials"
  | "community"
  | "blog"
  | "contact";

export type PortfolioSection = {
  id: PortfolioSectionId;
  code: string;
  label: string;
  anchor: `#${string}`;
  copy: {
    title: string;
    detail: string;
  };
};

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

export type SocialChannel = {
  label: string;
  handle: string;
  href: string;
  iconKey: IconKey;
  description: string;
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
  badge?: {
    alt: string;
    height: number;
    sourceLabel: string;
    src: string;
    width: number;
  };
};

export type CredentialGroupId =
  | "web"
  | "systems-networking"
  | "vendor-tools"
  | "drone-operations";

export type CredentialIssuerMark =
  | "barracuda"
  | "comptia"
  | "datto"
  | "faa"
  | "linkedin"
  | "microsoft"
  | "semrush"
  | "unitrends"
  | "vercel";

export type CredentialIssuerLogo = {
  id: string;
  label: string;
  mark: CredentialIssuerMark;
  issuerNames: readonly string[];
  groupIds: readonly CredentialGroupId[];
};

export type CredentialGroup = {
  id: CredentialGroupId;
  label: string;
  detail: string;
  credentialLabels: readonly string[];
};

export type ProudRole = {
  id: string;
  title: string;
  organization: string;
  detail: string;
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
  href?: string;
  description: string;
  kind: string;
  source: string;
  homepage?: string;
  meta: string[];
  visibility: "private" | "profile" | "public";
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
  started: {
    label: string;
    sortKey: string;
    sourceLabel: string;
  };
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
    rank: number;
    mediaAssetIds: readonly string[];
    thumbnailMedia?: SiteMedia;
    treatment:
      | "operated-surface"
      | "mobile-strip"
      | "progression-strip"
      | "site-snapshot"
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
  if (sourcePath.includes("sim0")) {
    return "Interface still";
  }

  if (sourcePath.includes("astro")) {
    return "Release reel";
  }

  if (sourcePath.includes("love-presentation")) {
    return "Live site snapshot";
  }

  if (sourcePath.includes("garden0") || sourcePath.includes("video")) {
    return "Playable capture";
  }

  if (sourcePath.includes("next-flights")) {
    return "Product anatomy";
  }

  if (sourcePath.includes("grimgreen-watch")) {
    return "Process trace";
  }

  if (sourcePath.includes("royal-shell")) {
    return "Brand utility still";
  }

  if (sourcePath.includes("signature-copier")) {
    return "Signature utility";
  }

  if (sourcePath.includes("printer-scripts")) {
    return "Redacted process trace";
  }

  if (sourcePath.includes("chesslm")) {
    return "Training capture";
  }

  return "Owned work sample";
}

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

export type BlogPostMedia = SiteMedia & {
  caption: string;
  sourceLabel: string;
};

export type BlogPostFact = {
  label: string;
  value: string;
};

export type BlogPostSection = {
  heading: string;
  body: readonly string[];
};

export type BlogPost = {
  slug: string;
  title: string;
  kicker: string;
  summary: string;
  excerpt: string;
  publishedAt: string;
  dateLabel: string;
  readingTime: string;
  href: `/blog/${string}`;
  videoHref: string;
  videoLabel: string;
  heroMedia: BlogPostMedia;
  gallery: readonly BlogPostMedia[];
  facts: readonly BlogPostFact[];
  timeline: readonly BlogPostFact[];
  sections: readonly BlogPostSection[];
  tags: readonly string[];
};

export const heroCopy = {
  title: "Joe Simo",
  intro: "AI-Native Full-Stack Product Engineer, FL.",
  detail:
    "TypeScript, Next.js & React products / an open-source Rust OS / 10+ years operating production systems.",
};

export const siteDescription =
  "Joe Simo is an AI-native full-stack product engineer in Florida building TypeScript/Next.js products and an open-source Rust operating system, backed by 10+ years operating production systems.";

export const joeProfile: JoeProfile = {
  name: heroCopy.title,
  kicker: "FL / AI-native product engineer / systems background",
  headline: heroCopy.intro,
  detail: heroCopy.detail,
  routeLabel: "Work / Systems / Certifications / Community / Blog.",
  receiptTitle: "Support -> Recovery -> Interfaces",
  receiptDetail:
    "Practical work shaped by support rooms, disaster recovery, and product interfaces.",
  contactPrompt:
    "Web projects, interface work, systems questions, or useful introductions.",
};

export const portfolioSections = [
  {
    id: "joe",
    code: "00",
    label: "Profile",
    anchor: "#joe",
    copy: {
      title: "Joe Simo",
      detail: "AI-Native Full-Stack Product Engineer, FL.",
    },
  },
  {
    id: "work",
    code: "01",
    label: "Work",
    anchor: "#work",
    copy: {
      title: "Work",
      detail: "Public GitHub projects and live product surfaces.",
    },
  },
  {
    id: "systems",
    code: "02",
    label: "Systems",
    anchor: "#systems",
    copy: {
      title: "Systems",
      detail: "Systems roles that shaped how I design and build.",
    },
  },
  {
    id: "credentials",
    code: "03",
    label: "Certifications",
    anchor: "#credentials",
    copy: {
      title: "Certifications",
      detail: "Certification issuers.",
    },
  },
  {
    id: "community",
    code: "04",
    label: "Community",
    anchor: "#community",
    copy: {
      title: "Community",
      detail: "Photos from React Miami 2026.",
    },
  },
  {
    id: "blog",
    code: "05",
    label: "Blog",
    anchor: "#blog",
    copy: {
      title: "Blog",
      detail: "Short notes and writing.",
    },
  },
  {
    id: "contact",
    code: "06",
    label: "Contact",
    anchor: "#contact",
    copy: {
      title: "Contact",
      detail:
        "Message me on X. LinkedIn, GitHub, v0, and YouTube are public ways to reach or review my work.",
    },
  },
] as const satisfies readonly PortfolioSection[];

export const sim0Link: SiteAction = {
  id: "open-sim0",
  label: "Open sim0",
  href: "https://sim0.com",
  external: true,
  ariaLabel: "Open sim0 in a new tab",
  kind: "primary",
};

export const lovePresentationLink: SiteAction = {
  id: "open-love-presentation",
  label: "Open Love Presentation",
  href: "https://lovepresentation.com",
  external: true,
  ariaLabel: "Open Love Presentation in a new tab",
  kind: "primary",
};

export const lovePresentationRepoLink: SiteAction = {
  id: "open-love-presentation-repo",
  label: "View Love Presentation repo",
  href: "https://github.com/Joe-Simo/love-presentation",
  external: true,
  ariaLabel: "Open Love Presentation on GitHub in a new tab",
  kind: "secondary",
};

export const signature0Link: SiteAction = {
  id: "open-signature0",
  label: "Open signature0",
  href: "https://signature0.com",
  external: true,
  ariaLabel: "Open signature0 in a new tab",
  kind: "primary",
};

export const chessLmLink: SiteAction = {
  id: "open-chesslm",
  label: "Open ChessLM",
  href: "https://chesslm.com",
  external: true,
  ariaLabel: "Open ChessLM in a new tab",
  kind: "primary",
};

export const astrosimoLink: SiteAction = {
  id: "open-astrosimo",
  label: "Open Astrosimo",
  href: "https://astrosimo.com",
  external: true,
  ariaLabel: "Open Astrosimo in a new tab",
  kind: "primary",
};

// sim0.com serves a coming-soon page. Note: the page's particle canvas
// throws an uncaught IndexSizeError (getImageData on a zero-width canvas) in
// automated/headless Chromium contexts, though interactive browsers render
// fine — worth a one-line width guard whenever the sim0 landing is touched.
export const finishedPrivateProductSlugs = [
  "sim0",
  "signature-copier",
  "chesslm",
  "astrosimo",
] as const;

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

export const sim0HeroCropMedia: SiteMedia = {
  kind: "artifact",
  src: "/media/work/sim0-hero-crop.webp",
  alt: "Redacted sim0 editor workspace with preview and review state",
  width: 1600,
  height: 900,
  tone: "desaturated",
};

export const sim0WorkThumbMedia: SiteMedia = {
  kind: "artifact",
  src: "/media/work/sim0-work-thumb.webp",
  alt: "Redacted sim0 editor workspace thumbnail",
  width: 960,
  height: 540,
  tone: "desaturated",
};

export const sim0CurrentEditorMedia: SiteMedia = {
  kind: "artifact",
  src: "/media/work/sim0-current-editor.webp",
  alt: "Redacted sim0 editor workspace capture",
  width: 1710,
  height: 900,
  tone: "desaturated",
};

export const sim0ShipSurfaceMedia: SiteMedia = {
  kind: "artifact",
  src: "/media/work/sim0-machine-ship.webp",
  alt: "Redacted sim0 review and shipping state",
  width: 1600,
  height: 900,
  tone: "desaturated",
};

export const lovePresentationHomeMedia: SiteMedia = {
  kind: "artifact",
  src: "/media/work/love-presentation-home.png",
  alt: "Love Presentation homepage with hero copy and slideshow preview",
  width: 1440,
  height: 520,
  tone: "desaturated",
};

export const lovePresentationWorkThumbMedia: SiteMedia = {
  kind: "artifact",
  src: "/media/work/love-presentation-work-thumb.webp",
  alt: "Love Presentation homepage thumbnail",
  width: 960,
  height: 540,
  tone: "desaturated",
};

export const astrosimoSignalStripMedia: SiteMedia = {
  kind: "artifact",
  src: "/media/work/astrosimo-signal-strip.webp",
  alt: "Astrosimo release screens shown in one row",
  width: 1600,
  height: 900,
  tone: "desaturated",
};

export const astrosimoWorkThumbMedia: SiteMedia = {
  kind: "artifact",
  src: "/media/work/astrosimo-work-thumb.webp",
  alt: "Astrosimo planning screens thumbnail",
  width: 960,
  height: 540,
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
  alt: "Astrosimo night planner screen",
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

export const garden0UnityMedia: SiteMedia = {
  kind: "artifact",
  src: "/media/work/garden0-unity.webp",
  alt: "garden0 Unity gameplay capture",
  width: 1440,
  height: 950,
  tone: "desaturated",
};

export const garden0WorkThumbMedia: SiteMedia = {
  kind: "artifact",
  src: "/media/work/garden0-work-thumb.webp",
  alt: "garden0 gameplay thumbnail",
  width: 960,
  height: 540,
  tone: "desaturated",
};

export const garden0LandingMedia: SiteMedia = {
  kind: "artifact",
  src: "/media/work/garden0-landing.webp",
  alt: "garden0 landing page capture",
  width: 1440,
  height: 1072,
  tone: "desaturated",
};

export const garden0PreviewMedia: SiteMedia = {
  kind: "artifact",
  src: "/media/work/garden0-preview.webp",
  alt: "garden0 browser preview capture",
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
  alt: "Redacted signature copier application capture",
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
  alt: "ChessLM Unity chessboard capture",
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

export const chessLmWorkThumbMedia: SiteMedia = {
  kind: "artifact",
  src: "/media/work/chesslm-work-thumb.webp",
  alt: "ChessLM training workspace thumbnail",
  width: 960,
  height: 540,
  tone: "desaturated",
};

export const sim0MachineProofMedia: ProofMedia[] = [
  {
    id: "sim0-machine-find",
    kind: "image",
    src: "/media/work/sim0-machine-find.webp",
    alt: "Redacted sim0 preview state crop",
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
    alt: "Redacted sim0 runtime trace crop",
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
    alt: "Redacted sim0 review and changes state crop",
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
    alt: "Redacted sim0 completed surface crop",
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
    alt: "Redacted sim0 route replay from preview to shipped surface",
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

export const garden0ProgressionReelMedia: ProofMedia = {
  id: "garden0-progression-reel",
  kind: "video",
  src: "/media/work/garden0-progression-reel.webm",
  posterSrc: garden0UnityMedia.src,
  alt: "garden0 progression reel from landing to gameplay captures",
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
    label: "X",
    handle: "@joesimo",
    href: "https://x.com/joesimo",
    iconKey: "xLogo",
    description: "Public notes and short thinking.",
  },
  {
    label: "GitHub",
    handle: "@Joe-Simo",
    href: "https://github.com/Joe-Simo",
    iconKey: "github",
    description: "Code, systems, and experiments.",
  },
  {
    label: "v0",
    handle: "@joesimo",
    href: "https://v0.app/@joesimo",
    iconKey: "v0",
    description: "v0 profile and UI experiments.",
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
    handle: "@JoeSimo",
    href: "https://www.youtube.com/@JoeSimo",
    iconKey: "youtube",
    description: "Video and public channel updates.",
  },
];

const githubChannel = socialChannels.find((channel) => channel.label === "GitHub");
const linkedinChannel = socialChannels.find((channel) => channel.label === "LinkedIn");

if (!githubChannel || !linkedinChannel) {
  throw new Error("Missing required profile channels.");
}

export const educationRecords: EducationRecord[] = [
  {
    school: "Pontificia Universidad Católica Madre y Maestra",
    focus: "Bachelor of Science, Telematics Engineering",
    period: "2006 - 2014",
    detail:
      "Reference degree for developing and programming networks and applications that make the Information Society possible.",
    sourceLabel: "LinkedIn profile export",
    href: linkedinChannel.href,
  },
  {
    school: "Cisco Networking Academy",
    focus: "CCNA 1, IT",
    period: "2004 - 2005",
    detail: "Networking Basics",
    sourceLabel: "LinkedIn profile export",
    href: linkedinChannel.href,
  },
  {
    school: "Cisco Networking Academy",
    focus: "CCNA 2, IT",
    period: "2004 - 2005",
    detail: "Routers and Routing Basics",
    sourceLabel: "LinkedIn profile export",
    href: linkedinChannel.href,
  },
  {
    school: "Cisco Networking Academy",
    focus: "CCNA 3, IT",
    period: "2004 - 2005",
    detail: "Switching Basics and Intermediate Routing",
    sourceLabel: "LinkedIn profile export",
    href: linkedinChannel.href,
  },
  {
    school: "Cisco Networking Academy",
    focus: "CCNA 4, IT",
    period: "2004 - 2005",
    detail: "WAN Technologies",
    href: linkedinChannel.href,
    sourceLabel: "LinkedIn profile export",
  },
  {
    school: "Cisco Networking Academy",
    focus: "IT 1, IT",
    period: "2004 - 2004",
    detail: "Hardware and Software",
    href: linkedinChannel.href,
    sourceLabel: "LinkedIn profile export",
  },
  {
    school: "Cisco Networking Academy",
    focus: "IT 2, IT",
    period: "2005 - 2005",
    detail: "Servers and Network OS",
    href: linkedinChannel.href,
    sourceLabel: "LinkedIn profile export",
  },
];

const unitrendsCertifiedAssociateBadge = {
  alt: "Unitrends Certified Associate badge",
  height: 199,
  sourceLabel: "Unitrends partner training badge image",
  src: "/media/credentials/unitrends-certified-associate.png",
  width: 199,
} satisfies NonNullable<LearningCredential["badge"]>;

const semrushPpcFundamentalsExamBadge = {
  alt: "PPC Fundamentals Exam badge",
  height: 382,
  sourceLabel: "Archived Semrush Academy exam artwork",
  src: "/media/credentials/semrush-ppc-fundamentals-exam.svg",
  width: 343,
} satisfies NonNullable<LearningCredential["badge"]>;

const semrushContentMarketingFundamentalsExamBadge = {
  alt: "Content Marketing Fundamentals Exam badge",
  height: 382,
  sourceLabel: "Archived Semrush Academy exam artwork",
  src: "/media/credentials/semrush-content-marketing-fundamentals-exam.svg",
  width: 343,
} satisfies NonNullable<LearningCredential["badge"]>;

const semrushTechnicalSeoExamBadge = {
  alt: "Technical SEO Exam badge",
  height: 382,
  sourceLabel: "Archived Semrush Academy exam artwork",
  src: "/media/credentials/semrush-technical-seo-exam.svg",
  width: 343,
} satisfies NonNullable<LearningCredential["badge"]>;

export const learningCredentials: LearningCredential[] = [
  {
    label: "Next.js Pages Router Fundamentals",
    issuer: "Vercel",
    issued: "Issued May 2025",
    sourceLabel: "User-provided LinkedIn certification",
    href: linkedinChannel.href,
  },
  {
    label: "Next.js App Router Fundamentals",
    issuer: "Vercel",
    issued: "Issued May 2025",
    sourceLabel: "User-provided LinkedIn certification",
    href: linkedinChannel.href,
  },
  {
    label: "Next.js SEO Fundamentals",
    issuer: "Vercel",
    issued: "Issued May 2025",
    sourceLabel: "User-provided LinkedIn certification",
    href: linkedinChannel.href,
  },
  {
    label: "React Foundations for Next.js",
    issuer: "Vercel",
    issued: "Issued May 2025",
    sourceLabel: "User-provided LinkedIn certification",
    href: linkedinChannel.href,
  },
  {
    label: "PPC Fundamentals Exam",
    issuer: "Semrush",
    period: "Issued Jan 2021 / Expired Jan 2022",
    sourceLabel: "User-provided LinkedIn certification",
    href: linkedinChannel.href,
    badge: semrushPpcFundamentalsExamBadge,
  },
  {
    label: "Content Marketing Fundamentals Exam",
    issuer: "Semrush",
    period: "Issued Jan 2021 / Expired Jan 2022",
    sourceLabel: "User-provided LinkedIn certification",
    href: linkedinChannel.href,
    badge: semrushContentMarketingFundamentalsExamBadge,
  },
  {
    label: "Technical SEO Exam",
    issuer: "Semrush",
    period: "Issued Dec 2020 / Expired Dec 2021",
    sourceLabel: "User-provided LinkedIn certification",
    href: linkedinChannel.href,
    badge: semrushTechnicalSeoExamBadge,
  },
  {
    label: "Local SEO Exam",
    issuer: "Semrush",
    period: "Issued Dec 2020 / Expired Dec 2021",
    sourceLabel: "User-provided LinkedIn certification",
    href: linkedinChannel.href,
  },
  {
    label: "Mobile SEO Exam",
    issuer: "Semrush",
    period: "Issued Dec 2020 / Expired Dec 2021",
    sourceLabel: "User-provided LinkedIn certification",
    href: linkedinChannel.href,
  },
  {
    label: "Backlink Management Exam",
    issuer: "Semrush",
    period: "Issued Dec 2020 / Expired Dec 2021",
    sourceLabel: "User-provided LinkedIn certification",
    href: linkedinChannel.href,
  },
  {
    label: "Keyword Research Exam",
    issuer: "Semrush",
    period: "Issued Dec 2020 / Expired Dec 2021",
    sourceLabel: "User-provided LinkedIn certification",
    href: linkedinChannel.href,
  },
  {
    label: "SEO Fundamentals Exam",
    issuer: "Semrush",
    period: "Issued Dec 2020 / Expired Dec 2021",
    sourceLabel: "User-provided LinkedIn certification",
    href: linkedinChannel.href,
  },
  {
    label: "Content Marketing and SEO Fundamentals Exam",
    issuer: "Semrush",
    period: "Issued Dec 2020 / Expired Dec 2021",
    sourceLabel: "User-provided LinkedIn certification",
    href: linkedinChannel.href,
  },
  {
    label: "Role of Content Exam",
    issuer: "Semrush",
    period: "Issued Dec 2020 / Expired Dec 2021",
    sourceLabel: "User-provided LinkedIn certification",
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
    label: "Part 107 Small Unmanned Aircraft Systems Recurrent",
    issuer: "FAA Safety Team Aviation Learning Center",
    issued: "Completed February 24, 2020",
    sourceLabel: "Local certificate",
    href: linkedinChannel.href,
  },
  {
    label: "Commercial Drone Pilot: CFR Part 107 Explained",
    issuer: "FAA Safety Team Aviation Learning Center",
    issued: "Completed February 24, 2020",
    sourceLabel: "Local certificate",
    href: linkedinChannel.href,
  },
  {
    label: "Cert Prep: FAA Part 107 Commercial Drone License",
    issuer: "LinkedIn",
    issued: "Issued Feb 2020",
    sourceLabel: "Local certificate",
    href: linkedinChannel.href,
  },
  {
    label: "Unitrends Certified Associate (UCA)",
    issuer: "Unitrends",
    issued: "Issued Jun 2019",
    sourceLabel: "LinkedIn certification",
    href: linkedinChannel.href,
    badge: unitrendsCertifiedAssociateBadge,
  },
  {
    label: "Microsoft Technology Associate: Networking Fundamentals",
    issuer: "Microsoft",
    issued: "Issued Jun 2017",
    sourceLabel: "Local certificate",
    href: linkedinChannel.href,
    badge: {
      alt: "MTA: Networking Fundamentals certified 2018 badge",
      height: 352,
      sourceLabel: "Credly badge image",
      src: "/media/credentials/microsoft-mta-networking-fundamentals-2018.png",
      width: 352,
    },
  },
  {
    label: "CompTIA A+",
    issuer: "CompTIA",
    issued: "Issued Jun 2007",
    sourceLabel: "Local certificate",
    href: linkedinChannel.href,
    badge: {
      alt: "CompTIA A+ certification badge",
      height: 600,
      sourceLabel: "Credly badge image",
      src: "/media/credentials/comptia-a-plus-certification.png",
      width: 600,
    },
  },
  {
    label: "CompTIA Network+",
    issuer: "CompTIA",
    period: "Issued Sep 2017 / Expired Sep 2020",
    sourceLabel: "Local certificate",
    href: linkedinChannel.href,
    badge: {
      alt: "CompTIA Network+ CE certification badge",
      height: 601,
      sourceLabel: "Credly badge image",
      src: "/media/credentials/comptia-network-plus-ce-certification.png",
      width: 601,
    },
  },
  {
    label: "Barracuda SignNow",
    issuer: "Barracuda",
    sourceLabel: "User-provided LinkedIn certification",
    href: linkedinChannel.href,
  },
  {
    label: "Barracuda Web Security Service Certified Engineer",
    issuer: "Barracuda",
    period: "Issued May 2017 / Expired May 2020",
    sourceLabel: "Local certificate",
    href: linkedinChannel.href,
  },
  {
    label: "Barracuda Email Security Service Certified Engineer",
    issuer: "Barracuda",
    period: "Issued Apr 2017 / Expired Apr 2020",
    sourceLabel: "Local certificate",
    href: linkedinChannel.href,
  },
  {
    label: "Datto Technical Specialist I",
    issuer: "Datto, Inc.",
    period: "Issued Jan 2017 / Expired Jan 2020",
    sourceLabel: "LinkedIn certification",
    href: linkedinChannel.href,
  },
  {
    label: "Datto Technical Specialist II",
    issuer: "Datto, Inc.",
    sourceLabel: "LinkedIn certification",
    href: linkedinChannel.href,
  },
];

export const credentialIssuers: CredentialIssuerLogo[] = [
  {
    id: "vercel",
    label: "Vercel",
    mark: "vercel",
    issuerNames: ["Vercel"],
    groupIds: ["web"],
  },
  {
    id: "semrush",
    label: "Semrush",
    mark: "semrush",
    issuerNames: ["Semrush"],
    groupIds: ["web"],
  },
  {
    id: "microsoft",
    label: "Microsoft",
    mark: "microsoft",
    issuerNames: ["Microsoft"],
    groupIds: ["systems-networking"],
  },
  {
    id: "comptia",
    label: "CompTIA",
    mark: "comptia",
    issuerNames: ["CompTIA"],
    groupIds: ["systems-networking"],
  },
  {
    id: "unitrends",
    label: "Unitrends",
    mark: "unitrends",
    issuerNames: ["Unitrends"],
    groupIds: ["vendor-tools"],
  },
  {
    id: "datto",
    label: "Datto",
    mark: "datto",
    issuerNames: ["Datto, Inc."],
    groupIds: ["vendor-tools"],
  },
  {
    id: "barracuda",
    label: "Barracuda",
    mark: "barracuda",
    issuerNames: ["Barracuda"],
    groupIds: ["vendor-tools"],
  },
  {
    id: "faa",
    label: "FAA Safety Team",
    mark: "faa",
    issuerNames: ["FAA Safety Team Aviation Learning Center"],
    groupIds: ["drone-operations"],
  },
  {
    id: "linkedin-learning",
    label: "LinkedIn Learning",
    mark: "linkedin",
    issuerNames: ["LinkedIn"],
    groupIds: ["drone-operations"],
  },
];

export const credentialGroups: CredentialGroup[] = [
  {
    id: "web",
    label: "Web / Vercel / SEO",
    detail: "Web, Vercel, and SEO training records.",
    credentialLabels: [
      "Next.js Pages Router Fundamentals",
      "Next.js App Router Fundamentals",
      "Next.js SEO Fundamentals",
      "React Foundations for Next.js",
      "PPC Fundamentals Exam",
      "Content Marketing Fundamentals Exam",
      "Technical SEO Exam",
      "Local SEO Exam",
      "Mobile SEO Exam",
      "Backlink Management Exam",
      "Keyword Research Exam",
      "SEO Fundamentals Exam",
      "Content Marketing and SEO Fundamentals Exam",
      "Role of Content Exam",
    ],
  },
  {
    id: "systems-networking",
    label: "Systems & Networking",
    detail: "Networking and hardware fundamentals.",
    credentialLabels: [
      "Microsoft Technology Associate: Networking Fundamentals",
      "CompTIA A+",
      "CompTIA Network+",
    ],
  },
  {
    id: "vendor-tools",
    label: "Vendor Tools",
    detail: "Backup, recovery, and security service training.",
    credentialLabels: [
      "Unitrends Certified Associate (UCA)",
      "Datto Technical Specialist I",
      "Datto Technical Specialist II",
      "Barracuda SignNow",
      "Barracuda Web Security Service Certified Engineer",
      "Barracuda Email Security Service Certified Engineer",
    ],
  },
  {
    id: "drone-operations",
    label: "Drone Operations",
    detail: "FAA drone coursework completed in 2020.",
    credentialLabels: [
      "Part 107 Small Unmanned Aircraft Systems Initial",
      "Part 107 Small Unmanned Aircraft Systems Recurrent",
      "Commercial Drone Pilot: CFR Part 107 Explained",
      "Cert Prep: FAA Part 107 Commercial Drone License",
    ],
  },
];

export const proudSystemsRoles: ProudRole[] = [
  {
    id: "macromedica-system-administrator",
    title: "System Administrator",
    organization: "Macromedica Dominicana",
    detail:
      "Managed databases, Windows server infrastructure, directory services, telephony, VPN access, virtualization, cabling, and core office infrastructure.",
  },
  {
    id: "neveroff-disaster-recovery-engineer",
    title: "Disaster Recovery Engineer",
    organization: "Never Off Technology",
    detail:
      "Installed, supported, and troubleshot disaster recovery, high availability, business continuity, virtualization, backup appliances, restores, and security workflows.",
  },
  {
    id: "brox-system-administrator",
    title: "IT Systems Administrator",
    organization: "Brox Industries",
    detail:
      "Owned daily infrastructure checks, server health, network access, backups, endpoint security, scheduled updates, snapshots, and manufacturing systems support.",
  },
];

export const githubRepositories: GithubRepository[] = [
  {
    name: "goblins-os",
    href: "https://github.com/Joe-Simo/goblins-os",
    description:
      "Goblins OS - all-Rust Fedora-bootc, macOS-quality Linux desktop",
    kind: "Public repo",
    source: "github.com/Joe-Simo/goblins-os",
    meta: ["github", "public repo", "Rust"],
    visibility: "public",
  },
  {
    name: "skills",
    href: "https://github.com/Joe-Simo/skills",
    description:
      "Community Agent Skills by joe-simo, including a Vercel Geist design-system skill for polished UI and companion routing.",
    kind: "Public repo",
    source: "github.com/Joe-Simo/skills",
    homepage: "https://joesimo.com",
    meta: [
      "github",
      "public repo",
      "agent skills",
      "Vercel Geist",
    ],
    visibility: "public",
  },
  {
    name: "grok-financial-services",
    href: "https://github.com/Joe-Simo/grok-financial-services",
    description:
      "Grok-adapted Anthropic financial services skills, agents, and tools with FMP/Robinhood integration. Includes skill-creator for custom Grok finance skills.",
    kind: "Public repo",
    source: "github.com/Joe-Simo/grok-financial-services",
    meta: ["github", "public repo"],
    visibility: "public",
  },
  {
    name: "financial-services",
    href: "https://github.com/Joe-Simo/financial-services",
    description: "Public GitHub fork visible on Joe Simo's GitHub profile.",
    kind: "Public fork",
    source: "github.com/Joe-Simo/financial-services",
    meta: ["github", "public fork"],
    visibility: "public",
  },
  {
    name: "joesimo",
    href: "https://github.com/Joe-Simo/joesimo",
    description:
      "Public TypeScript repository for joesimo.com and the current portfolio surface.",
    kind: "Public repo",
    source: "github.com/Joe-Simo/joesimo",
    meta: ["github", "public repo", "TypeScript", "Next.js"],
    visibility: "public",
  },
  {
    name: "love-presentation",
    href: "https://github.com/Joe-Simo/love-presentation",
    description:
      "Funny private slideshow links for suspiciously perfect couples.",
    kind: "Public repo",
    source: "github.com/Joe-Simo/love-presentation",
    homepage: "https://lovepresentation.com",
    meta: ["github", "public repo", "TypeScript", "Next.js"],
    visibility: "public",
  },
  {
    name: "joe-simo-pet",
    href: "https://github.com/Joe-Simo/joe-simo-pet",
    description:
      "Public MIT package for Joe Simo's Codex pet assets and package metadata.",
    kind: "Public repo",
    source: "github.com/Joe-Simo/joe-simo-pet",
    meta: ["github", "public repo", "MIT"],
    visibility: "public",
  },
  {
    name: "openai-agents-js",
    href: "https://github.com/Joe-Simo/openai-agents-js",
    description:
      "Public GitHub fork described as a lightweight framework for multi-agent workflows and voice agents.",
    kind: "Public fork",
    source: "github.com/Joe-Simo/openai-agents-js",
    homepage: "https://openai.github.io/openai-agents-js/",
    meta: ["github", "public fork", "agent workflow"],
    visibility: "public",
  },
];

export const featuredWork: WorkArtifact = {
  label: "Product work",
  title: "sim0.com",
  detail:
    "sim0 is a public product surface for browser-first workflow, visible system state, and interface decisions close to the work.",
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
  },
  {
    id: "runtime",
    code: "02",
    label: "Runtime",
    visibleLabel: "SSR wiring",
    title: "Runtime work stays close to the interface.",
    detail:
      "The capture points to entry runtime and SSR wiring without turning the page into an implementation dump.",
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
  },
  {
    id: "api",
    code: "03",
    label: "Runtime context",
    visibleLabel: "Runtime context",
    title: "Runtime context is visible.",
    detail:
      "The editor surface keeps runtime context and preview state in the same working field.",
    lens: "signals",
    action: "trace",
    readout: "Keep runtime context visible while the work moves.",
    sourceLabel: "Interface still",
    x: 25,
    y: 83,
    zoom: { x: 25, y: 83 },
    phase: "handoff",
    prompt: "Trace runtime context.",
    finding: "Runtime context stays in the same working field as preview state.",
    interfaceDecision:
      "Avoid hiding local state behind a second screen when the work depends on it.",
    completionLabel: "Local context traced",
    hotspot: { x: 25, y: 83, zoomX: 25, zoomY: 83 },
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
    completionLabel: "Shipping action found",
    hotspot: { x: 88, y: 11, zoomX: 88, zoomY: 11 },
  },
  {
    id: "changes",
    code: "05",
    label: "Changes",
    visibleLabel: "Staged changes",
    title: "Change state remains inspectable.",
    detail:
      "The workspace shows repository and change context without padding a case study around it.",
    lens: "surface",
    action: "ship",
    readout: "Expose change state so the next decision is not a guess.",
    sourceLabel: "Interface still",
    x: 88,
    y: 72,
    zoom: { x: 88, y: 72 },
    phase: "ship",
    prompt: "Confirm the shipped change.",
    finding: "Repository and change state remain inspectable at the release edge.",
    interfaceDecision:
      "Show what changed before asking for confidence.",
    completionLabel: "Case signal complete",
    hotspot: { x: 88, y: 72, zoomX: 88, zoomY: 72 },
  },
] as const satisfies readonly InvestigationStep[];

export const sim0InvestigationCase = {
  slug: "sim0",
  title: "Find the stuck point. Trace the state. Ship the change.",
  hook: "Find what is stuck. Trace the state. Ship the change.",
  emotionalStake:
    "When state is hidden, people guess. This case shows the stuck point, follows the state, and lands the decision in the workspace.",
  humanStake: {
    blockedPerson: "A builder trying to understand why the preview has not moved yet.",
    confusion:
      "Preview state, runtime handoff, local context, release action, and changed files can feel like separate rooms.",
    madeVisible:
      "The workspace keeps those states together, then makes the next action visible.",
    whyItMatters:
      "When the stuck point is readable, the person doing the work can decide instead of guessing.",
  },
  premise:
    "Review one real sim0 workflow through three actions: find, trace, ship.",
  outcome:
    "The completed workflow shows how hidden product state becomes a readable shipped interface.",
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
      hook: "Trace runtime context where the workspace can use it.",
      primaryProofPointId: "runtime",
      supportingProofPointIds: ["api"],
      completionLabel: "Signal traced",
    },
    {
      id: "ship",
      label: "Ship",
      hook: "Ship with release and change state still visible.",
      primaryProofPointId: "ship",
      supportingProofPointIds: ["changes"],
      completionLabel: "Changes ready",
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
      title: "Runtime path",
      detail:
        "Follow the handoff states that explain why the preview is behaving that way.",
      proofPointIds: ["runtime", "api"],
      mediaId: "sim0-machine-trace",
      accent: "signal",
    },
    {
      id: "ship",
      label: "Ship",
      title: "Release action and changes",
      detail:
        "Keep the decision point and change state visible at the edge of the workspace.",
      proofPointIds: ["ship", "changes"],
      mediaId: "sim0-machine-ship",
      accent: "proof",
    },
    {
      id: "receipt",
      label: "Receipt",
      title: "Changes ready",
      detail:
        "The workflow resolves after all five checkpoints are inspected.",
      proofPointIds: ["preview", "runtime", "api", "ship", "changes"],
      mediaId: "sim0-machine-surface",
      accent: "live",
    },
  ],
  proofMedia: sim0MachineProofMedia,
  steps: sim0ProofPoints,
  signature: {
    label: "Route receipt",
    title: "Changes ready.",
    detail:
      "The stuck point, runtime state, local context, release action, and change state resolve into one readable workspace.",
    requiredStepIds: ["preview", "runtime", "api", "ship", "changes"],
  },
} as const satisfies InvestigationCase;

export const workArtifacts: WorkArtifact[] = [featuredWork];

export const proofItems: ProofItem[] = [
  {
    id: "joe-identity",
    label: "Identity",
    claim: "Joe Simo, Devsigner, based in FL.",
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
    label: "Product work",
    claim: "sim0.com is a public product surface.",
    detail:
      "The interface still shows preview state, runtime context, ship action, and change staging.",
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

export const projectCaseStudies: ProjectCaseStudy[] = [
  {
    slug: "sim0",
    code: "W01",
    title: "sim0",
    started: {
      label: "Sep 2025",
      sortKey: "2025-09-06",
      sourceLabel: "Repository created",
    },
    role: "Designed and built the product interface",
    methodStage: "surface",
    schemaType: "SoftwareApplication",
    applicationCategory: "DeveloperApplication",
    summary:
      "A browser workspace for previewing, editing, and reviewing an app.",
    evidence: [
      "Browser app import and preview",
      "Visual editing tied to source changes",
      "Public site at sim0.com",
    ],
    assets: [
      {
        id: "sim0-hero-crop",
        captionId: "sim0-working-surface",
        label: "Hero workspace crop",
        claimIds: ["sim0-preview", "sim0-runtime", "sim0-ship"],
        media: sim0HeroCropMedia,
        sourcePath: "project/sim0",
        treatment: "hero",
      },
      {
        id: "sim0-editor-artifact",
        captionId: "sim0-working-surface",
        label: "Ship review capture",
        claimIds: ["sim0-preview", "sim0-runtime", "sim0-ship"],
        media: sim0Media,
        sourcePath: "project/sim0",
        treatment: "hero",
      },
      {
        id: "sim0-ship-surface",
        captionId: "sim0-working-surface",
        label: "App editor capture",
        claimIds: ["sim0-preview", "sim0-runtime", "sim0-ship"],
        media: sim0ShipSurfaceMedia,
        sourcePath: "project/sim0",
        treatment: "hero",
      },
      {
        id: "sim0-current-editor",
        captionId: "sim0-working-surface",
        label: "Editor workspace capture",
        claimIds: ["sim0-preview", "sim0-runtime", "sim0-ship"],
        media: sim0CurrentEditorMedia,
        sourcePath: "project/sim0",
        treatment: "hero",
      },
    ],
    links: [sim0Link],
    status: "Pre-launch product",
    sourcePath: "project/sim0",
    tier: "featured",
    story: {
      signal:
        "A running app, preview state, and source changes sit in the same workspace.",
      problem:
        "Interface work slows down when the running product and code changes live in separate tools.",
      constraint:
        "The public case shows the editor workflow without exposing private implementation details.",
      approach: [
        "Import a real repo and run the app in the browser.",
        "Keep visual edits, local context, and source changes in one workspace.",
        "Show the code diff next to the decision to ship.",
      ],
      outcome:
        "The workflow connects the running product to editable source code.",
    },
    humanStake: {
      blockedPerson: "A builder waiting for a preview to explain what changed.",
      confusion:
        "Preview, local context, and staged changes can be split across tools.",
      madeVisible:
        "The editor keeps preview and change state together.",
      whyItMatters:
        "The next decision is easier when the running app and the code change are visible together.",
    },
    miniWorld: {
      hook: "Review the editor workflow from preview to source changes.",
      humanStake: {
        blockedPerson: "A builder waiting for a preview to explain what changed.",
        confusion:
          "Preview, local context, and staged changes can be split across tools.",
        madeVisible:
          "The editor keeps preview and change state together.",
        whyItMatters:
          "The next decision is easier when the running app and the code change are visible together.",
      },
      media: sim0MachineProofMedia,
      panels: [
        {
          id: "problem-scene",
          label: "Problem",
          title: "The preview needs context.",
          body:
            "The preview is useful when nearby context explains what changed.",
          assetId: "sim0-current-editor",
          mediaId: "sim0-machine-find",
          captionId: "sim0-working-surface",
          claimIds: ["sim0-preview"],
          evidenceStatus: "local-proof",
        },
        {
          id: "proof-operation",
          label: "Operate",
          title: "The workflow is inspectable.",
          body:
            "Local context and preview state stay visible in the same product view.",
          mediaId: "sim0-route-replay",
          captionId: "sim0-working-surface",
          claimIds: ["sim0-runtime", "sim0-preview"],
          evidenceStatus: "local-proof",
        },
        {
          id: "decision-moment",
          label: "Decision",
          title: "The ship action has context.",
          body:
            "Staged changes remain visible where the product asks for a decision.",
          assetId: "sim0-current-editor",
          mediaId: "sim0-machine-ship",
          captionId: "sim0-working-surface",
          claimIds: ["sim0-ship"],
          evidenceStatus: "local-proof",
        },
        {
          id: "outcome",
          label: "Receipt",
          title: "Changes ready.",
          body:
            "Preview, local context, ship action, and staged changes resolve into one reviewable workflow.",
          mediaId: "sim0-machine-surface",
          captionId: "sim0-working-surface",
          claimIds: ["sim0-preview", "sim0-runtime", "sim0-ship"],
          evidenceStatus: "local-proof",
        },
      ],
    },
    proofCaptions: {
      "sim0-working-surface": {
        eyebrow: "Capture",
        title: "Editor workspace",
        detail:
          "Preview, edit, review, and ship from one browser workspace.",
        sourceLabel: "Interface still",
        evidenceStatus: "local-proof",
      },
    },
    completedRoute: {
      label: "Result",
      title: "What changed",
      detail:
        "sim0 shows a running app, visual editing, and source changes in one browser workspace.",
    },
    safeClaimIds: ["sim0-preview", "sim0-runtime", "sim0-ship"],
    proofMode: "operated",
    proofSummary:
      "Browser workspace for previewing an imported app, editing the UI, and reviewing source changes.",
    homepageFeature: {
      rank: 1,
      mediaAssetIds: ["sim0-hero-crop", "sim0-editor-artifact"],
      thumbnailMedia: sim0WorkThumbMedia,
      treatment: "operated-surface",
    },
  },
  {
    slug: "love-presentation",
    code: "W02",
    title: "Love Presentation",
    started: {
      label: "May 2026",
      sortKey: "2026-05-22",
      sourceLabel: "GitHub repository created",
    },
    role: "Built the Next.js slideshow app",
    methodStage: "surface",
    schemaType: "SoftwareApplication",
    applicationCategory: "EntertainmentApplication",
    summary: "A tiny app for private slideshow links.",
    evidence: [
      "Live site at lovepresentation.com",
      "Public MIT GitHub repo",
      "Lightweight animated presentation flow",
      "No account, uploads, or database in the public product flow",
    ],
    assets: [
      {
        id: "love-presentation-home",
        captionId: "love-presentation-home",
        label: "Homepage capture",
        claimIds: ["love-presentation-live", "love-presentation-repo"],
        media: lovePresentationHomeMedia,
        sourcePath: "project/love-presentation",
        treatment: "hero",
      },
    ],
    links: [lovePresentationLink, lovePresentationRepoLink],
    status: "Open source",
    sourcePath: "project/love-presentation",
    tier: "case",
    story: {
      signal:
        "A small form creates a shareable slideshow link.",
      problem:
        "The app needs to show the joke, the controls, and the output without making someone create an account.",
      constraint:
        "The public case uses the live site, public repo metadata, and a public-safe homepage capture.",
      approach: [
        "Put the form and sample deck in the first screen.",
        "Keep the public flow account-free.",
        "Use the public repo and live page as the proof.",
      ],
      outcome:
        "The site lets someone make and share a private slideshow link from one page.",
    },
    proofCaptions: {
      "love-presentation-home": {
        eyebrow: "Live site",
        title: "Homepage",
        detail:
          "The first screen shows the form controls and slideshow preview together.",
        sourceLabel: "Live site snapshot",
        evidenceStatus: "local-proof",
      },
    },
    completedRoute: {
      label: "Result",
      title: "What changed",
      detail:
        "Love Presentation turns a small form into a shareable slideshow page.",
    },
    safeClaimIds: ["love-presentation-live", "love-presentation-repo"],
    proofMode: "specimen",
    proofSummary:
      "Live homepage capture and public repo metadata show the slideshow app as a shipped public project.",
    homepageFeature: {
      rank: 5,
      mediaAssetIds: ["love-presentation-home"],
      thumbnailMedia: lovePresentationWorkThumbMedia,
      treatment: "site-snapshot",
    },
  },
  {
    slug: "astrosimo",
    code: "W03",
    title: "Astrosimo",
    started: {
      label: "Feb 2026",
      sortKey: "2026-02-15",
      sourceLabel: "Repository created",
    },
    role: "Built iOS planning and guidance screens",
    methodStage: "surface",
    schemaType: "SoftwareApplication",
    applicationCategory: "LifestyleApplication",
    summary:
      "An iOS stargazing app with night planning, verified capture, and live sky guidance screens.",
    evidence: [
      "Official product site at astrosimo.com",
      "Verified capture flow",
      "Night planner screen",
      "Live sky guidance screen",
    ],
    assets: [
      {
        id: "astrosimo-signal-strip",
        captionId: "astrosimo-release-strip",
        label: "Release screenshot strip",
        claimIds: ["astrosimo-release", "astrosimo-guidance"],
        media: astrosimoSignalStripMedia,
        sourcePath: "project/astrosimo",
        treatment: "hero",
      },
      {
        id: "astrosimo-verified",
        captionId: "astrosimo-verified",
        label: "Verified capture",
        claimIds: ["astrosimo-release"],
        media: astrosimoVerifiedCaptureMedia,
        sourcePath: "project/astrosimo",
        treatment: "strip",
      },
      {
        id: "astrosimo-planner",
        captionId: "astrosimo-planner",
        label: "Night planner",
        claimIds: ["astrosimo-planning"],
        media: astrosimoNightPlannerMedia,
        sourcePath: "project/astrosimo",
        treatment: "strip",
      },
      {
        id: "astrosimo-guidance",
        captionId: "astrosimo-guidance",
        label: "Live guidance",
        claimIds: ["astrosimo-guidance"],
        media: astrosimoLiveGuidanceMedia,
        sourcePath: "project/astrosimo",
        treatment: "strip",
      },
    ],
    links: [astrosimoLink],
    status: "iOS app",
    sourcePath: "project/astrosimo",
    tier: "case",
    story: {
      signal:
        "Astrosimo turns sky planning into phone-sized guidance.",
      problem:
        "A planning app has to compress time, location, verification, and live guidance into small mobile screens.",
      constraint:
        "The public case uses owned release screenshots and avoids private app-store or service data.",
      approach: [
        "Show verified capture as the trust point.",
        "Keep planning and live guidance adjacent.",
        "Let the release strip carry the story from verified capture to guidance.",
      ],
      outcome:
        "The screenshots show the app moving from planning to live guidance.",
    },
    humanStake: {
      blockedPerson: "A person trying to plan a night outside from a phone.",
      confusion:
        "Verification, timing, planning, and guidance can feel disconnected when each screen asks for trust separately.",
      madeVisible:
        "The screenshots connect verified capture, night planning, and live guidance.",
      whyItMatters:
        "A small screen has to make the next outdoor decision clear.",
    },
    miniWorld: {
      hook: "Verify, plan, then follow the sky guidance screen.",
      humanStake: {
        blockedPerson: "A person trying to plan a night outside from a phone.",
        confusion:
          "Verification, timing, planning, and guidance can feel disconnected when each screen asks for trust separately.",
        madeVisible:
          "The screenshots connect verified capture, night planning, and live guidance.",
        whyItMatters:
          "A small screen has to make the next outdoor decision clear.",
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
          title: "The screenshot strip shows the flow.",
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
            "The mobile screens keep planning and guidance close enough to make the next action clear.",
          assetId: "astrosimo-planner",
          captionId: "astrosimo-planner",
          claimIds: ["astrosimo-planning"],
          evidenceStatus: "local-proof",
        },
        {
          id: "outcome",
          label: "Receipt",
          title: "A mobile flow, not a feature list.",
          body:
            "The public case stays limited to owned release captures: verified state, planning, and live guidance.",
          assetId: "astrosimo-guidance",
          captionId: "astrosimo-guidance",
          claimIds: ["astrosimo-guidance"],
          evidenceStatus: "local-proof",
        },
      ],
    },
    proofCaptions: {
      "astrosimo-release-strip": {
        eyebrow: "Release screenshots",
        title: "Release screenshot strip",
        detail:
          "Verified capture, night planning, and live guidance are shown together.",
        sourceLabel: "Release reel",
        evidenceStatus: "local-proof",
      },
      "astrosimo-verified": {
        eyebrow: "Verification",
        title: "Verified capture",
        detail: "The screen provides the trust state for capture.",
        sourceLabel: "Release still",
        evidenceStatus: "local-proof",
      },
      "astrosimo-planner": {
        eyebrow: "Planning",
        title: "Night planner",
        detail: "The planning screen shows the app as a mobile decision tool.",
        sourceLabel: "Planning still",
        evidenceStatus: "local-proof",
      },
      "astrosimo-guidance": {
        eyebrow: "Guidance",
        title: "Live guidance",
        detail: "The guidance screen completes the mobile flow.",
        sourceLabel: "Guidance still",
        evidenceStatus: "local-proof",
      },
    },
    completedRoute: {
      label: "Result",
      title: "What changed",
      detail:
        "Astrosimo shows verification, planning, and guidance as a compact mobile product.",
    },
    safeClaimIds: [
      "astrosimo-release",
      "astrosimo-planning",
      "astrosimo-guidance",
    ],
    proofMode: "reel",
    proofSummary:
      "Verified capture, night planning, and live guidance shown through owned mobile screenshots.",
    homepageFeature: {
      rank: 3,
      mediaAssetIds: [
        "astrosimo-signal-strip",
        "astrosimo-verified",
        "astrosimo-planner",
        "astrosimo-guidance",
      ],
      thumbnailMedia: astrosimoWorkThumbMedia,
      treatment: "mobile-strip",
    },
  },
  {
    slug: "garden0",
    code: "W04",
    title: "garden0",
    started: {
      label: "May 2026",
      sortKey: "2026-05-10",
      sourceLabel: "Repository created",
    },
    role: "Built Unity game screens and web landing",
    methodStage: "surface",
    schemaType: "VideoGame",
    summary:
      "A game project with Unity work, mobile controls, release checks, and a web landing page.",
    evidence: [
      "Unity menu capture",
      "Landing page capture",
      "Browser preview capture",
      "Progress log with lint, build, iOS export, and mobile checks",
    ],
    assets: [
      {
        id: "garden0-unity",
        captionId: "garden0-unity",
        label: "Unity menu",
        claimIds: ["garden0-unity", "garden0-playable"],
        media: garden0UnityMedia,
        sourcePath: "project/garden0",
        treatment: "hero",
      },
      {
        id: "garden0-landing",
        captionId: "garden0-landing",
        label: "Landing page",
        claimIds: ["garden0-public-page"],
        media: garden0LandingMedia,
        sourcePath: "project/garden0",
        treatment: "supporting",
      },
      {
        id: "garden0-preview",
        captionId: "garden0-preview",
        label: "Browser preview",
        claimIds: ["garden0-playable"],
        media: garden0PreviewMedia,
        sourcePath: "project/garden0",
        treatment: "strip",
      },
    ],
    links: [],
    status: "Game prototype",
    sourcePath: "project/garden0",
    tier: "case",
    story: {
      signal:
        "garden0 moves from a landing page into a playable browser preview.",
      problem:
        "A game project needs both a public entry point and a playable client.",
      constraint:
        "The public case is limited to owned captures and progress evidence from the project folder.",
      approach: [
        "Show the landing page as the entry point.",
        "Show the Unity menu and gameplay capture.",
        "Keep browser preview evidence tied to the same game project.",
      ],
      outcome:
        "The case carries a small game from public page to playable preview.",
    },
    humanStake: {
      blockedPerson: "A player who needs to know whether the world is more than a landing page.",
      confusion:
        "A game can look public before the playable client is visible.",
      madeVisible:
        "The progression moves from landing capture to Unity client and browser preview.",
      whyItMatters:
        "For a game, the interface promise only matters when the world can be entered.",
    },
    miniWorld: {
      hook: "Move from the public garden page into the playable client.",
      humanStake: {
        blockedPerson: "A player who needs to know whether the world is more than a landing page.",
        confusion:
          "A game can look public before the playable client is visible.",
        madeVisible:
          "The progression moves from landing capture to Unity client and browser preview.",
        whyItMatters:
          "For a game, the interface promise only matters when the world can be entered.",
      },
      media: [garden0ProgressionReelMedia],
      panels: [
        {
          id: "problem-scene",
          label: "Problem",
          title: "The landing page has to lead somewhere.",
          body:
            "The landing capture sets the outside face, but the case needs a playable client behind it.",
          assetId: "garden0-landing",
          captionId: "garden0-landing",
          claimIds: ["garden0-public-page"],
          evidenceStatus: "local-proof",
        },
        {
          id: "proof-operation",
          label: "Operate",
          title: "The reel crosses into the client.",
          body:
            "Owned captures move from public page to Unity and browser preview.",
          mediaId: "garden0-progression-reel",
          captionId: "garden0-unity",
          claimIds: ["garden0-unity", "garden0-playable"],
          evidenceStatus: "local-proof",
        },
        {
          id: "decision-moment",
          label: "Decision",
          title: "The playable client carries the case.",
          body:
            "The Unity capture carries the case because it shows the project as a game client.",
          assetId: "garden0-unity",
          captionId: "garden0-unity",
          claimIds: ["garden0-unity", "garden0-playable"],
          evidenceStatus: "local-proof",
        },
        {
          id: "outcome",
          label: "Receipt",
          title: "Landing to gameplay stays connected.",
          body:
            "The result is a small authored progression from public page to playable evidence.",
          assetId: "garden0-preview",
          captionId: "garden0-preview",
          claimIds: ["garden0-playable"],
          evidenceStatus: "local-proof",
        },
      ],
    },
    proofCaptions: {
      "garden0-unity": {
        eyebrow: "Playable capture",
        title: "Unity menu",
        detail: "The Unity capture shows the game client.",
        sourceLabel: "Playable capture",
        evidenceStatus: "local-proof",
      },
      "garden0-landing": {
        eyebrow: "Landing page",
        title: "Landing page",
        detail: "The landing capture shows the outside face of the game project.",
        sourceLabel: "Landing still",
        evidenceStatus: "local-proof",
      },
      "garden0-preview": {
        eyebrow: "Browser preview",
        title: "Browser preview",
        detail: "The preview capture shows the game running in a browser.",
        sourceLabel: "Browser preview",
        evidenceStatus: "local-proof",
      },
    },
    completedRoute: {
      label: "Result",
      title: "What changed",
      detail:
        "garden0 shows the public page, Unity client, and browser preview as one game project.",
    },
    safeClaimIds: [
      "garden0-unity",
      "garden0-playable",
      "garden0-public-page",
    ],
    proofMode: "reel",
    proofSummary:
      "Unity gameplay and landing captures show the project moving from public page to playable client.",
    homepageFeature: {
      rank: 2,
      mediaAssetIds: ["garden0-unity", "garden0-landing"],
      thumbnailMedia: garden0WorkThumbMedia,
      treatment: "progression-strip",
    },
  },
  {
    slug: "next-flights",
    code: "W06",
    title: "Next Flights",
    started: {
      label: "Oct 2024",
      sortKey: "2024-10-31",
      sourceLabel: "First local git commit",
    },
    role: "Flight tracking application",
    methodStage: "signals",
    schemaType: "SoftwareApplication",
    applicationCategory: "TravelApplication",
    summary:
      "A flight tracking app with search, maps, CMS-backed content, and typed application structure.",
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
        sourcePath: "project/next-flights",
        treatment: "hero",
      },
      {
        id: "next-flights-cta",
        captionId: "next-flights-cta",
        label: "Interface artwork",
        claimIds: ["next-flights-product"],
        media: nextFlightsCtaMedia,
        sourcePath: "project/next-flights",
        treatment: "supporting",
      },
    ],
    links: [],
    status: "Flight app",
    sourcePath: "project/next-flights",
    tier: "supporting",
    story: {
      signal:
        "Next Flights combines search, maps, boards, and typed routes.",
      problem:
        "Flight tracking depends on live data shape, routing, search, and map context.",
      constraint:
        "The public page can show owned artwork and repo evidence but not live service credentials.",
      approach: [
        "Use product artwork to show the visual direction.",
        "Describe the typed application structure without exposing secrets.",
        "Treat the case as product anatomy: artwork, routes, search, and map context.",
      ],
      outcome:
        "The case shows a product structure built around search, maps, and route boundaries.",
    },
    proofCaptions: {
      "next-flights-overview": {
        eyebrow: "Product anatomy",
        title: "Product overview",
        detail:
          "Owned artwork represents the flight tracking product shape.",
        sourceLabel: "Product anatomy",
        evidenceStatus: "local-proof",
      },
      "next-flights-cta": {
        eyebrow: "Interface artwork",
        title: "Interface artwork",
        detail: "The supporting artwork shows the public-facing visual system.",
        sourceLabel: "Interface artwork",
        evidenceStatus: "local-proof",
      },
    },
    completedRoute: {
      label: "Result",
      title: "What changed",
      detail:
        "Next Flights shows app structure, search, maps, and owned product artwork.",
    },
    safeClaimIds: ["next-flights-product", "next-flights-maps"],
    proofMode: "anatomy",
    proofSummary:
      "Owned artwork and repo structure show search, map, board, and API boundaries without exposing live tokens.",
  },
  {
    slug: "grimgreen-channel-watch",
    code: "W07",
    title: "GrimmGreen Channel Watch",
    started: {
      label: "Dec 2025",
      sortKey: "2025-12-19",
      sourceLabel: "First local git commit",
    },
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
    sourcePath: "project/grimgreen-watch",
    tier: "specimen",
    story: {
      signal:
        "GrimmGreen Channel Watch is a narrow reachability utility.",
      problem:
        "A small dashboard needs to report whether public channel URLs look reachable without relying on a platform token.",
      constraint:
        "There is no public dashboard media in the current asset set, so the case stays text-first.",
      approach: [
        "Classify public URL fetch responses.",
        "Expose server status and polling state.",
        "Keep the public case narrow until dashboard media exists.",
      ],
      outcome:
        "The case remains a small utility record for reachability, polling, and status routes.",
      limitation:
        "Visual proof is intentionally limited until a real dashboard capture is added.",
    },
    proofCaptions: {
      "grimgreen-specimen": {
        eyebrow: "Utility flow",
        title: "Reachability flow",
        detail:
          "The case is shown as a factual system flow until dashboard media exists.",
        sourceLabel: "Process trace",
        evidenceStatus: "needs-media",
      },
    },
    completedRoute: {
      label: "Result",
      title: "What changed",
      detail:
        "GrimmGreen documents a small utility for reachability, polling, and status-route structure.",
    },
    safeClaimIds: ["grimgreen-reachability", "grimgreen-status"],
    proofMode: "specimen",
    proofSummary:
      "Reachability classification, polling, and status routes shown as a factual system flow until dashboard media exists.",
  },
  {
    slug: "royal-shell",
    code: "W08",
    title: "Royal Shell",
    started: {
      label: "Apr 2025",
      sortKey: "2025-04-02",
      sourceLabel: "Local project directory date",
    },
    role: "Signature generator utility",
    methodStage: "surface",
    schemaType: "SoftwareApplication",
    applicationCategory: "BusinessApplication",
    summary:
      "A real-estate signature generator with Royal Shell and Golden Ocala modes.",
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
        sourcePath: "project/royal-shell",
        treatment: "hero",
      },
    ],
    links: [],
    status: "Tool project",
    sourcePath: "project/royal-shell",
    tier: "specimen",
    story: {
      signal:
        "Royal Shell turns brand-specific signature requirements into a focused utility.",
      problem:
        "Email signature work breaks when brand assets, modes, and paste behavior drift apart.",
      constraint:
        "The public case can show the app and brand asset without exposing private account data.",
      approach: [
        "Keep signature mode selection explicit.",
        "Use fallback logo assets where the generated signature needs stability.",
        "Represent the case as a narrow business utility, not a broad platform.",
      ],
      outcome:
        "The utility shows a practical brand workflow with limited public media.",
    },
    proofCaptions: {
      "royal-shell-logo": {
        eyebrow: "Brand asset",
        title: "Brand asset",
        detail:
          "The fallback logo asset anchors the signature generator without exposing private account data.",
        sourceLabel: "Brand utility still",
        evidenceStatus: "local-proof",
      },
    },
    completedRoute: {
      label: "Result",
      title: "What changed",
      detail:
        "Royal Shell documents a focused signature workflow with brand assets and utility behavior.",
    },
    safeClaimIds: ["royal-shell-signature", "royal-shell-brand"],
    proofMode: "specimen",
    proofSummary:
      "Signature modes and fallback brand assets are shown as a focused utility.",
  },
  {
    slug: "signature-copier",
    code: "W09",
    title: "Signature Copier",
    started: {
      label: "Apr 2026",
      sortKey: "2026-04-20",
      sourceLabel: "Local project directory date",
    },
    role: "Outlook paste workflow",
    methodStage: "breakage",
    schemaType: "SoftwareApplication",
    applicationCategory: "UtilitiesApplication",
    summary:
      "A focused utility for preparing signature-copying workflows that survive real email paste behavior.",
    evidence: [
      "Official product site at signature0.com",
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
        sourcePath: "project/signature-copier",
        treatment: "hero",
      },
    ],
    links: [signature0Link],
    status: "Utility project",
    sourcePath: "project/signature-copier",
    tier: "specimen",
    story: {
      signal:
        "Signature Copier starts from a real paste failure and turns it into a focused preparation utility.",
      problem:
        "Email signatures can look correct in source form and still fail when pasted into Outlook.",
      constraint:
        "The case uses owned captures and avoids account-specific mail data.",
      approach: [
        "Treat paste behavior as the broken state.",
        "Prepare signature assets for the real target app.",
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
        sourceLabel: "Signature utility",
        evidenceStatus: "local-proof",
      },
    },
    completedRoute: {
      label: "Result",
      title: "What changed",
      detail:
        "Signature Copier documents a small utility built around a real copy/paste interface break.",
    },
    safeClaimIds: ["signature-paste", "signature-outlook"],
    proofMode: "specimen",
    proofSummary:
      "Paste-workflow specimen: owned capture and Outlook-oriented assets show a narrow real-world utility path.",
  },
  {
    slug: "printer-scripts",
    code: "W10",
    title: "Printer Scripts",
    started: {
      label: "Apr 2025",
      sortKey: "2025-04-04",
      sourceLabel: "Local project directory date",
    },
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
    sourcePath: "project/printer-scripts",
    tier: "specimen",
    story: {
      signal:
        "Printer Scripts turns provisioning failure into a redacted, cross-platform flow.",
      problem:
        "Printer setup can fail across operating systems, permissions, drivers, and local queue state.",
      constraint:
        "The public case must not reveal private network details, office-specific values, or internal endpoints.",
      approach: [
        "Show the installation flow rather than sensitive configuration.",
        "Keep macOS and Windows paths visible as a process record.",
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
      label: "Result",
      title: "What changed",
      detail:
        "Printer Scripts documents setup flow while protecting sensitive details.",
    },
    safeClaimIds: ["printer-macos", "printer-windows", "printer-redacted"],
    proofMode: "specimen",
    proofSummary:
      "Windows and macOS installers are represented by flow steps, not private network details.",
  },
  {
    slug: "chesslm",
    code: "W05",
    title: "ChessLM",
    started: {
      label: "Feb 2026",
      sortKey: "2026-02-10",
      sourceLabel: "Repository created",
    },
    role: "Chess training product and Unity client",
    methodStage: "signals",
    schemaType: "SoftwareApplication",
    applicationCategory: "EducationalApplication",
    summary:
      "A chess training product with a Next.js web/backend app and a Unity client for browser, iPhone, and iPad.",
    evidence: [
      "Official product site at chesslm.com",
      "Next.js web/backend and classic training workspace",
      "Unity client for browser, iPhone, and iPad",
      "Gateway-first production API boundary",
      "Classical chess and Chess960 support",
    ],
    assets: [
      {
        id: "chesslm-unity",
        captionId: "chesslm-unity",
        label: "Unity board",
        claimIds: ["chesslm-unity", "chesslm-board"],
        media: chessLmUnityMedia,
        sourcePath: "project/chesslm",
        treatment: "hero",
      },
      {
        id: "chesslm-workspace",
        captionId: "chesslm-workspace",
        label: "Training workspace",
        claimIds: ["chesslm-web", "chesslm-training"],
        media: chessLmWorkspaceMedia,
        sourcePath: "project/chesslm",
        treatment: "supporting",
      },
    ],
    links: [chessLmLink],
    status: "Training product",
    sourcePath: "project/chesslm",
    tier: "case",
    story: {
      signal:
        "ChessLM carries one training product across a web workspace and Unity board.",
      problem:
        "A chess training product has to keep reasoning, board state, and client targets aligned.",
      constraint:
        "The public case uses owned captures and keeps provider secrets server-side.",
      approach: [
        "Use the web workspace for training.",
        "Use the Unity board as the client.",
        "Keep the product boundary clear across browser, iPhone, and iPad targets.",
      ],
      outcome:
        "The case shows the same training product across browser and game-client contexts.",
    },
    humanStake: {
      blockedPerson: "A player trying to connect coaching, board state, and the next move.",
      confusion:
        "Training gets noisy when reasoning, board state, and client target feel like separate products.",
      madeVisible:
        "The reel connects web workspace and Unity board.",
      whyItMatters:
        "A player should be able to follow the lesson without wondering which surface owns the state.",
    },
    miniWorld: {
      hook: "Carry one training product from the web workspace into the Unity board.",
      humanStake: {
        blockedPerson: "A player trying to connect coaching, board state, and the next move.",
        confusion:
          "Training gets noisy when reasoning, board state, and client target feel like separate products.",
        madeVisible:
          "The reel connects web workspace and Unity board.",
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
            "The browser workspace shows the reasoning, and the board client has to carry the same state.",
          assetId: "chesslm-workspace",
          captionId: "chesslm-workspace",
          claimIds: ["chesslm-web", "chesslm-training"],
          evidenceStatus: "local-proof",
        },
        {
          id: "proof-operation",
          label: "Operate",
          title: "The product crosses clients.",
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
          title: "The board becomes the client.",
          body:
            "The Unity board capture shows the training client across browser, iPhone, and iPad direction.",
          assetId: "chesslm-unity",
          captionId: "chesslm-unity",
          claimIds: ["chesslm-unity", "chesslm-board"],
          evidenceStatus: "local-proof",
        },
        {
          id: "outcome",
          label: "Receipt",
          title: "One product crosses two clients.",
          body:
            "The case shows a training product moving between browser workspace and game-client board while secrets stay server-side.",
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
        title: "Unity board",
        detail:
          "The board capture shows the training product as a game-client app.",
        sourceLabel: "Training capture",
        evidenceStatus: "local-proof",
      },
      "chesslm-workspace": {
        eyebrow: "Training workspace",
        title: "Training workspace",
        detail:
          "The workspace capture shows the browser training app for the same product.",
        sourceLabel: "Unity board capture",
        evidenceStatus: "local-proof",
      },
    },
    completedRoute: {
      label: "Result",
      title: "What changed",
      detail:
        "ChessLM connects a web workspace and Unity client while keeping secrets out of the client.",
    },
    safeClaimIds: ["chesslm-unity", "chesslm-web", "chesslm-training"],
    proofMode: "reel",
    proofSummary:
      "Web workspace and Unity board captures show the same product across browser and game-client contexts.",
    homepageFeature: {
      rank: 4,
      mediaAssetIds: ["chesslm-workspace", "chesslm-unity"],
      thumbnailMedia: chessLmWorkThumbMedia,
      treatment: "training-strip",
    },
  },
];

const workTierOrder: Record<WorkTier, number> = {
  featured: 0,
  case: 1,
  supporting: 2,
  specimen: 3,
};

const projectProofModeOrder: Record<ProjectProofMode, number> = {
  operated: 0,
  reel: 1,
  anatomy: 2,
  specimen: 3,
};

function compareProjectProofOrder(
  left: PublicProjectCaseStudy,
  right: PublicProjectCaseStudy,
) {
  const tierOrder = workTierOrder[left.tier] - workTierOrder[right.tier];

  if (tierOrder !== 0) {
    return tierOrder;
  }

  const miniWorldOrder = Number(!left.miniWorld) - Number(!right.miniWorld);

  if (miniWorldOrder !== 0) {
    return miniWorldOrder;
  }

  const proofModeOrder =
    projectProofModeOrder[left.proofMode] -
    projectProofModeOrder[right.proofMode];

  if (proofModeOrder !== 0) {
    return proofModeOrder;
  }

  const homepageRankOrder =
    (left.homepageFeature?.rank ?? Number.POSITIVE_INFINITY) -
    (right.homepageFeature?.rank ?? Number.POSITIVE_INFINITY);

  if (homepageRankOrder !== 0) {
    return homepageRankOrder;
  }

  const assetOrder = right.assets.length - left.assets.length;

  if (assetOrder !== 0) {
    return assetOrder;
  }

  return (
    right.started.sortKey.localeCompare(left.started.sortKey) ||
    left.title.localeCompare(right.title)
  );
}

export function orderPublicProjectCaseStudies(
  projects: readonly PublicProjectCaseStudy[],
) {
  return [...projects].sort(compareProjectProofOrder);
}

export const projectCaseStudiesPublic: PublicProjectCaseStudy[] =
  orderPublicProjectCaseStudies(
    projectCaseStudies.map(({ assets, sourcePath, ...project }) => ({
      ...project,
      assets: assets.map(({ sourcePath: assetSourcePath, ...asset }) => ({
        ...asset,
        sourceLabel: publicSourceLabel(assetSourcePath),
      })),
      sourceLabel: publicSourceLabel(sourcePath),
    })),
  );

export function getPublicProjectCaseStudy(slug: string) {
  return projectCaseStudiesPublic.find((project) => project.slug === slug);
}

export const homepageProjectSlugs = [
  "sim0",
  "garden0",
  "astrosimo",
  "chesslm",
  "love-presentation",
  "next-flights",
] as const;

const homepageProjectSlugSet = new Set<string>(homepageProjectSlugs);

export function isHomepageProject(
  project: Pick<PublicProjectCaseStudy, "slug">,
) {
  return homepageProjectSlugSet.has(project.slug);
}

type StoryboardSourceProject = Pick<
  ProjectCaseStudy,
  | "completedRoute"
  | "proofCaptions"
  | "safeClaimIds"
  | "story"
  | "storyboard"
  | "summary"
> & {
  assets: readonly Pick<
    EvidenceAsset,
    "captionId" | "claimIds" | "id" | "treatment"
  >[];
};

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
      "A fan/community web identity from the deleted-site archive. The current page keeps it as a design archive item, not as an active public project.",
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

const communityPhotoFrames = [
  {
    alt: "Joe Simo with ThePrimeagen at React Miami 2026",
    height: 2200,
    title: "ThePrimeagen",
    width: 1781,
  },
  {
    alt: "Joe Simo with a React Miami attendee at La Tropical",
    height: 2200,
    title: "La Tropical",
    width: 1650,
  },
  {
    alt: "Joe Simo with a React Miami attendee in Miami",
    height: 2200,
    title: "Miami frame",
    width: 1650,
  },
  {
    alt: "Joe Simo with a React Miami attendee after hours",
    height: 2200,
    title: "After-hours frame",
    width: 1650,
  },
  {
    alt: "Joe Simo with a React Miami attendee near the expo floor",
    height: 2200,
    title: "Expo floor",
    width: 1650,
  },
  {
    alt: "Joe Simo with a React Miami attendee inside the conference room",
    height: 2200,
    title: "Conference selfie",
    width: 1650,
  },
  {
    alt: "Joe Simo with a React Miami attendee holding a sticker",
    height: 2200,
    title: "Sticker frame",
    width: 1650,
  },
  {
    alt: "Joe Simo with a React Miami attendee in a hallway",
    height: 2200,
    title: "Hallway frame",
    width: 1650,
  },
  {
    alt: "Joe Simo with a React Miami attendee at the event backdrop",
    height: 2200,
    title: "Backdrop portrait",
    width: 1650,
  },
  {
    alt: "Joe Simo with React Miami attendees in the audience",
    height: 2200,
    title: "Audience selfie",
    width: 1650,
  },
  {
    alt: "React Miami attendees seated in the conference room",
    height: 2200,
    title: "Front row",
    width: 1993,
  },
] as const;

export const communityArtifacts: CommunityArtifact[] =
  communityPhotoFrames.map((frame, index) => {
    const frameNumber = index + 1;
    const paddedFrameNumber = String(frameNumber).padStart(2, "0");

    return {
      code: `R${paddedFrameNumber}`,
      title: frame.title,
      body: "React Miami 2026 community photo selected by Joe.",
      sourceLabel: "Owned event photo",
      media: {
        kind: "artifact",
        src: `/media/community/joe-community-${paddedFrameNumber}.webp`,
        alt: frame.alt,
        width: frame.width,
        height: frame.height,
        tone: "desaturated",
      },
    };
  });

export const communityHighlights: CommunityArtifact[] = communityArtifacts;

export const blogPosts = [
  {
    slug: "vercel-v0-api-billing-bug-report",
    title: "The time I found a v0 API billing bug",
    kicker: "Responsible disclosure",
    summary:
      "A private report about successful v0 API calls missing from billing, the evidence I sent to Guillermo Rauch, and the v0 engineer who confirmed the fix.",
    excerpt:
      "I found successful v0 API calls through a custom MCP integration that were not showing up in my account billing. Instead of posting it publicly, I recorded proof, wrote a technical report, and sent it directly to Vercel.",
    publishedAt: "2026-06-01",
    dateLabel: "June 1, 2026",
    readingTime: "5 min read",
    href: "/blog/vercel-v0-api-billing-bug-report",
    videoHref: "https://www.youtube.com/watch?v=XnmyF2lmCP4&feature=youtu.be",
    videoLabel: "Open the private report video",
    heroMedia: {
      kind: "artifact",
      src: "/media/blog/v0-api-billing-bug/fix-confirmation.webp",
      alt: "Message from Ido Pesok confirming the v0 billing issue cause was identified and should be fixed",
      width: 1148,
      height: 1716,
      tone: "desaturated",
      caption:
        "The outcome: Vercel's v0 engineer confirmed they identified the cause and that it should be fixed.",
      sourceLabel: "Private disclosure thread",
    },
    gallery: [
      {
        kind: "artifact",
        src: "/media/blog/v0-api-billing-bug/private-video-followup.webp",
        alt: "Private message to Guillermo Rauch with a private YouTube proof video about the v0 API billing bug",
        width: 1290,
        height: 2133,
        tone: "desaturated",
        caption:
          "The proof video was kept private and shared with Vercel so the issue could be handled responsibly.",
        sourceLabel: "Private disclosure thread",
      },
      {
        kind: "artifact",
        src: "/media/blog/v0-api-billing-bug/guillermo-ido-intro.webp",
        alt: "Guillermo Rauch connects Joe Simo with Ido Pesok from v0",
        width: 1168,
        height: 1726,
        tone: "desaturated",
        caption:
          "Guillermo Rauch believed the report and connected me with Ido Pesok from v0.",
        sourceLabel: "Private disclosure thread",
      },
      {
        kind: "artifact",
        src: "/media/blog/v0-api-billing-bug/fix-confirmation.webp",
        alt: "Vercel v0 engineer confirms the billing bug cause was identified",
        width: 1148,
        height: 1716,
        tone: "desaturated",
        caption:
          "After I shared timestamps, usage evidence, and the MCP context, the v0 team identified the cause.",
        sourceLabel: "Private disclosure thread",
      },
    ],
    facts: [
      {
        label: "Report date",
        value: "July 5, 2025",
      },
      {
        label: "Surface",
        value: "v0 API through a custom MCP integration",
      },
      {
        label: "Model",
        value: "v0-1.5-lg",
      },
      {
        label: "Confirmed usage",
        value: "3 successful API calls, 43KB+ generated code",
      },
      {
        label: "Dashboard gap",
        value: "API usage was missing from customer billing events",
      },
      {
        label: "Outcome",
        value: "Vercel identified the cause and said it should be fixed",
      },
    ],
    timeline: [
      {
        label: "20:46 EDT",
        value: "Generated a user profile component through the v0 API.",
      },
      {
        label: "20:56 EDT",
        value: "Generated a complete SaaS landing page through the same path.",
      },
      {
        label: "20:57 EDT",
        value: "Verified the API directly with a curl request and usage tokens.",
      },
      {
        label: "23:45 EDT",
        value: "Sent Guillermo a private proof video and written report.",
      },
      {
        label: "01:52 EDT",
        value: "Guillermo connected me with Ido Pesok from v0.",
      },
      {
        label: "04:32 EDT",
        value: "Ido confirmed the team identified the cause and expected the fix.",
      },
    ],
    sections: [
      {
        heading: "The bug",
        body: [
          "I was experimenting with v0 through a custom MCP integration. The API calls worked. The model returned real React and TypeScript code. The usage metadata was present in the API response. The problem was that the calls were not appearing in my v0 billing dashboard.",
          "That meant the product was doing paid work without the customer-facing billing records reflecting it. From a user point of view, it made budgets and limits unclear. From Vercel's point of view, it looked like potential revenue leakage.",
        ],
      },
      {
        heading: "The evidence",
        body: [
          "I documented three successful calls on July 5, 2025: one user profile component, one complete SaaS landing page, and one direct curl verification. The generated output was more than 43KB of code, and the direct API response included usage tokens.",
          "The dashboard, however, only showed regular web usage events like messages and image generation. The API-based v0-1.5-lg calls were missing. That contrast made the report concrete enough to investigate.",
        ],
      },
      {
        heading: "The disclosure",
        body: [
          "I did not post the issue publicly while it was active. I recorded a private video, wrote a report with timestamps and reproduction context, and sent it directly to Guillermo Rauch.",
          "Guillermo replied that they could not reproduce it yet, but that he believed me. Then he connected me with Ido Pesok from the v0 team. I shared the MCP context, the dashboard gap, the timestamps, and the successful API response details.",
        ],
      },
      {
        heading: "The fix",
        body: [
          "A few hours later, Ido wrote back: \"Thank you so much for reporting! We identified the cause and it should be fixed.\" That was the best possible outcome: the issue moved from a private report to an engineering fix without becoming public exploit material.",
          "The main lesson for me was simple: if you find a billing, auth, quota, or infrastructure bug, the most useful thing you can do is bring evidence, stay calm, and help the team reproduce it safely.",
        ],
      },
    ],
    tags: ["v0", "Vercel", "MCP", "billing", "responsible disclosure"],
  },
] as const satisfies readonly BlogPost[];

export const latestBlogPost = blogPosts[0];

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}

export const navItems = [
  {
    label: "Work",
    href: "#work",
    iconKey: "appWindow",
  },
  {
    label: "Systems",
    href: "#systems",
    iconKey: "briefcase",
  },
  {
    label: "Certifications",
    href: "#credentials",
    iconKey: "bookOpen",
  },
  {
    label: "Community",
    href: "#community",
    iconKey: "camera",
  },
  {
    label: "Blog",
    href: "/blog",
    iconKey: "bookOpen",
  },
  {
    label: "Contact",
    href: "#contact",
    iconKey: "arrowUpRight",
  },
] as const satisfies readonly {
  label: string;
  href: `#${string}` | `/${string}`;
  iconKey: IconKey;
}[];

export type NavItem = (typeof navItems)[number];
export type NavHref = (typeof navItems)[number]["href"];
