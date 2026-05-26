import { describe, expect, test } from "bun:test";

import {
  archiveArtifacts,
  communityArtifacts,
  communityHighlights,
  credentialGroups,
  defaultActiveNodeId,
  educationRecords,
  getProjectCaseStudy,
  heroCopy,
  joeProfile,
  learningCredentials,
  navItems,
  originNodeId,
  productReportArtifacts,
  profileFacts,
  projectCaseStudies,
  projectCaseStudiesPublic,
  proudSystemsRoles,
  publicTrailSections,
  publicSourceLabel,
  routeNodeIds,
  sim0InvestigationCase,
  sim0ProofPoints,
  siteRecords,
  socialChannels,
  storyboardForProject,
} from "../../src/lib/site-data";
import sitemap from "../../src/app/sitemap";

const forbiddenPublicTerms =
  /Operated sim0 case|Run The Case|Hold Joe's signal|placeholder|fake|scraped|awwwards|site of the year/i;
const visibleSlopTerms =
  /\b(surface|proof route|public trail|owned frames|readable product surface)\b/i;
const privatePathTerms = /\/Users\/|Downloads\//;
const requiredWorkSlugs = [
  "sim0",
  "astrosimo",
  "antonetas-garden",
  "chesslm",
  "next-flights",
  "grimgreen-channel-watch",
  "royal-shell",
  "signature-copier",
  "printer-scripts",
] as const;
const requiredStepIds = ["preview", "runtime", "api", "ship", "changes"] as const;
const requiredSocials = {
  GitHub: {
    handle: "@joe-simo",
    href: "https://github.com/joe-simo",
  },
  Instagram: {
    handle: "@joesimo_",
    href: "https://www.instagram.com/joesimo_/",
  },
  LinkedIn: {
    handle: "josephsimo",
    href: "https://www.linkedin.com/in/josephsimo/",
  },
  X: {
    handle: "@joesimo",
    href: "https://x.com/joesimo",
  },
  YouTube: {
    handle: "@jos007",
    href: "https://www.youtube.com/user/jos007",
  },
} as const;

function collectStringValues(value: unknown): string[] {
  if (typeof value === "string") {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => collectStringValues(item));
  }

  if (value && typeof value === "object") {
    return Object.values(value).flatMap((item) => collectStringValues(item));
  }

  return [];
}

describe("Joe Simo site data", () => {
  test("keeps the canonical homepage Joe-first", () => {
    expect(originNodeId).toBe("joe");
    expect(defaultActiveNodeId).toBe("joe");
    expect(heroCopy.title).toBe("Joe Simo");
    expect(heroCopy.intro).toBe(
      "Designer/developer, FL.",
    );
    expect(heroCopy.detail).toBe(
      "Web products and interfaces shaped by support, recovery, and systems work.",
    );
    expect(joeProfile.kicker).toContain("FL");
    expect(joeProfile.kicker).toContain("Designer-developer");
    expect(joeProfile.routeLabel).toBe("Work / Systems / Credentials / Community.");
    expect(routeNodeIds).not.toContain("joe");

    const publicHeroCopy = [
      heroCopy.title,
      heroCopy.intro,
      heroCopy.detail,
      joeProfile.kicker,
      joeProfile.headline,
      joeProfile.detail,
    ].join("\n");

    expect(publicHeroCopy).not.toMatch(/operated sim0|run the case/i);
    expect(publicHeroCopy).not.toMatch(/sim0/i);
    expect(publicHeroCopy).not.toMatch(forbiddenPublicTerms);
  });

  test("keeps the primary navigation mapped to real chapters and records", () => {
    const recordIds = new Set(siteRecords.map((record) => record.id));

    expect(navItems.map((item) => item.href)).toEqual([
      "#work",
      "#systems",
      "#credentials",
      "#community",
      "#contact",
    ]);
    expect(navItems.map((item) => item.label)).toEqual([
      "Work",
      "Systems",
      "Credentials",
      "Community",
      "Contact",
    ]);

    for (const item of navItems) {
      expect(recordIds.has(item.recordId)).toBe(true);
    }

    const currentHomepageAnchors = new Set(
      publicTrailSections.map((section) => section.anchor),
    );
    const retiredAnchors = new Set([
      "#method",
      "#people",
      "#trail",
      "#notes",
      "#photos",
      "#blog",
      "#social",
    ]);

    for (const item of navItems) {
      expect(currentHomepageAnchors.has(item.href)).toBe(true);
      expect(retiredAnchors.has(item.href)).toBe(false);
    }

    for (const record of siteRecords) {
      expect(retiredAnchors.has(record.sectionAnchor)).toBe(false);

      for (const action of [
        record.primaryAction,
        ...record.secondaryActions,
      ]) {
        if (action.href.startsWith("#")) {
          expect(retiredAnchors.has(action.href)).toBe(false);
        }
      }
    }
  });

  test("keeps public contact handles exact", () => {
    for (const [label, expected] of Object.entries(requiredSocials)) {
      const channel = socialChannels.find(
        (candidate) => candidate.label === label,
      );

      expect(channel, label).toBeDefined();
      expect(channel?.handle).toBe(expected.handle);
      expect(channel?.href).toBe(expected.href);
    }

    const privateMessageScheme = ["mail", "to:"].join("");

    expect(
      socialChannels.some((channel) =>
        channel.href.startsWith(privateMessageScheme),
      ),
    ).toBe(false);
  });

  test("keeps personal curiosity claims modest", () => {
    const stargazing = profileFacts.find((fact) => fact.label === "Stargazing");
    const physicsNote = profileFacts.find(
      (fact) => fact.label === "Independent physics note",
    );

    expect(stargazing?.value).toBe("Universe study");
    expect(stargazing?.detail).toContain("stargazing");
    expect(physicsNote?.value).toBe("Acceleration and electromagnetic constants");
    expect(physicsNote?.detail).toContain("could not get endorsement");
    expect(physicsNote?.detail).toContain("not a credential");
    expect(physicsNote?.detail).not.toMatch(
      /published|peer-reviewed|endorsed|accepted/i,
    );
  });

  test("keeps education and certification proof visible", () => {
    expect(educationRecords).toHaveLength(5);
    expect(educationRecords[0]?.school).toBe(
      "Pontificia Universidad Católica Madre y Maestra",
    );
    expect(educationRecords[0]?.focus).toBe(
      "Bachelor of Science - BS, Telematics Engineering",
    );
    expect(educationRecords[0]?.period).toBe("2006 - 2014");
    expect(educationRecords.slice(1).map((record) => record.focus)).toEqual([
      "CCNA 1, IT",
      "CCNA 2, IT",
      "CCNA 3, IT",
      "CCNA 4, IT",
    ]);

    const credentialLabels = learningCredentials.map(
      (credential) => credential.label,
    );

    expect(credentialLabels).toContain("Next.js SEO Fundamentals");
    expect(credentialLabels).toContain("React Foundations for Next.js");
    expect(credentialLabels).toContain(
      "Part 107 Small Unmanned Aircraft Systems Initial",
    );
    expect(credentialLabels).toContain(
      "Cert Prep: FAA Part 107 Commercial Drone License",
    );
    expect(credentialLabels).toContain("Unitrends Certified Associate (UCA)");
    expect(credentialLabels).toContain(
      "Microsoft Technology Associate: Networking Fundamentals",
    );
    expect(credentialLabels).toContain("CompTIA A+");
    expect(credentialLabels).toContain("CompTIA Network+");
    expect(credentialLabels).toContain("Datto Technical Specialist I");
    expect(credentialLabels).toContain("Datto Technical Specialist II");
    expect(credentialLabels).toContain(
      "Barracuda Web Security Service Certified Engineer",
    );
    expect(credentialLabels).toContain(
      "Barracuda Email Security Service Certified Engineer",
    );
    expect(credentialLabels).not.toContain("What is SignNow");
    expect(credentialGroups.map((group) => group.label)).toEqual([
      "Web",
      "Systems & Networking",
      "Vendor Tools",
      "Drone Operations",
    ]);

    for (const credential of learningCredentials) {
      expect(credential.href).toBe(requiredSocials.LinkedIn.href);
      expect(credential.sourceLabel).toMatch(
        /LinkedIn (profile export|certification)|Local certificate/,
      );
    }
  });

  test("keeps the surviving web archive as local artifacts", () => {
    expect(archiveArtifacts.map((artifact) => artifact.title)).toEqual([
      "SimoHost",
      "World of Vanilla",
      "World of Vanilla wordmark",
      "WoW Tournaments",
      "Tournament wordmark",
    ]);

    for (const artifact of archiveArtifacts) {
      expect(artifact.media.src).toMatch(/^\/media\/archive\/.+\.webp$/);
      expect(artifact.sourceLabel).toBe("Local logo archive");
      expect(artifact.body).not.toMatch(privatePathTerms);
      expect(artifact.body).not.toMatch(forbiddenPublicTerms);
    }
  });

  test("keeps React Miami and product report artifacts local and modest", () => {
    expect(communityArtifacts).toHaveLength(19);
    expect(communityArtifacts[0]?.title).toBe("Hallway frame");
    expect(communityHighlights).toHaveLength(6);
    expect(communityHighlights[0]?.title).toBe("React Miami room");
    expect(communityHighlights[1]?.title).toBe("ThePrimeagen");
    expect(communityHighlights[1]?.media.src).toBe(
      "/media/community/react-miami-primeagen.webp",
    );

    for (const artifact of communityArtifacts) {
      expect(artifact.sourceLabel).toBe("Owned event photo");
      expect(artifact.media.src).toMatch(
        /^\/media\/community\/react-miami-developer-\d{2}\.webp$/,
      );
      expect(artifact.body).not.toMatch(privatePathTerms);
      expect(artifact.body).not.toMatch(forbiddenPublicTerms);
      expect(artifact.body).not.toMatch(/famous|celebrity/i);
    }

    for (const artifact of communityHighlights) {
      expect(artifact.sourceLabel).toBe("Owned event photo");
      expect(artifact.media.src).toMatch(/^\/media\/community\/.+\.webp$/);
      expect(artifact.body).not.toMatch(privatePathTerms);
      expect(artifact.body).not.toMatch(forbiddenPublicTerms);
      expect(artifact.body).not.toMatch(/famous|celebrity/i);
    }

    expect(productReportArtifacts).toHaveLength(1);
    expect(productReportArtifacts[0]?.title).toBe("Vercel v0 billing report");
    expect(productReportArtifacts[0]?.body).toContain("Reported");
    expect(productReportArtifacts[0]?.outcome).toContain("identified the cause");
    expect(JSON.stringify(productReportArtifacts)).not.toMatch(
      /YC|Y Combinator|equity|fundraising|revenue|Response ID|API key|\/Users\/|Downloads\//i,
    );
  });

  test("keeps the proud systems roles visible", () => {
    expect(proudSystemsRoles.map((role) => role.title)).toEqual([
      "System Administrator",
      "Disaster Recovery Engineer",
      "System Administrator",
    ]);
    expect(proudSystemsRoles.map((role) => role.organization)).toEqual([
      "Macromedica",
      "Neveroff Technology",
      "Brox Industries",
    ]);
  });

  test("defines the sim0 proof route as five ordered required steps", () => {
    expect(sim0InvestigationCase.slug).toBe("sim0");
    expect([...sim0InvestigationCase.signature.requiredStepIds]).toEqual(
      [...requiredStepIds],
    );
    expect(sim0ProofPoints.map((point) => point.id)).toEqual([
      ...requiredStepIds,
    ]);

    const proofIds = new Set(sim0ProofPoints.map((point) => point.id));
    const actionCoverage = new Map(
      sim0InvestigationCase.actions.map((action) => [
        action.id,
        [action.primaryProofPointId, ...action.supportingProofPointIds],
      ]),
    );

    expect(actionCoverage.get("find")).toEqual(["preview"]);
    expect(actionCoverage.get("trace")).toEqual(["runtime", "api"]);
    expect(actionCoverage.get("ship")).toEqual(["ship", "changes"]);

    for (const action of sim0InvestigationCase.actions) {
      for (const proofPointId of [
        action.primaryProofPointId,
        ...action.supportingProofPointIds,
      ]) {
        expect(proofIds.has(proofPointId), proofPointId).toBe(true);
      }
    }

    const receipt = sim0InvestigationCase.machineStates.find(
      (state) => state.id === "receipt",
    );

    expect(receipt?.title).toBe("Changes ready");
    expect(receipt ? [...receipt.proofPointIds] : undefined).toEqual([
      ...requiredStepIds,
    ]);
  });

  test("keeps work range named, ranked, and honest", () => {
    const workBySlug = new Map(
      projectCaseStudies.map((project) => [project.slug, project]),
    );

    for (const slug of requiredWorkSlugs) {
      expect(workBySlug.has(slug), slug).toBe(true);
    }

    expect(workBySlug.get("sim0")?.tier).toBe("featured");
    expect(workBySlug.get("sim0")?.proofMode).toBe("operated");

    const homepageFeatures = projectCaseStudies
      .filter((project) => project.homepageFeature)
      .map((project) => ({
        rank: project.homepageFeature?.rank,
        slug: project.slug,
      }))
      .sort((a, b) => Number(a.rank) - Number(b.rank));

    expect(homepageFeatures).toEqual([
      { rank: 1, slug: "sim0" },
      { rank: 2, slug: "astrosimo" },
      { rank: 3, slug: "antonetas-garden" },
      { rank: 4, slug: "chesslm" },
    ]);
  });

  test("builds complete storyboards for every work page", () => {
    for (const project of projectCaseStudies) {
      const storyboard = storyboardForProject(project);

      expect(
        storyboard.map((panel) => panel.id),
        project.slug,
      ).toEqual([
        "problem-scene",
        "proof-operation",
        "decision-moment",
        "outcome",
      ]);

      for (const panel of storyboard) {
        expect(panel.title.trim(), `${project.slug}:${panel.id}`).not.toBe("");
        expect(panel.body.trim(), `${project.slug}:${panel.id}`).not.toBe("");
        expect(panel.claimIds.length, `${project.slug}:${panel.id}`).toBeGreaterThan(
          0,
        );
      }
    }
  });

  test("sanitizes public project records and source labels", () => {
    const publicText = JSON.stringify(projectCaseStudiesPublic);

    expect(publicText).not.toMatch(privatePathTerms);

    for (const project of projectCaseStudiesPublic) {
      expect("sourcePath" in project, project.slug).toBe(false);
      expect(project.sourceLabel).not.toMatch(privatePathTerms);

      for (const asset of project.assets) {
        expect("sourcePath" in asset, `${project.slug}:${asset.id}`).toBe(false);
        expect(asset.sourceLabel).not.toMatch(privatePathTerms);
      }
    }

    expect(publicSourceLabel("Downloads/final/sim0")).toBe("Interface still");
    expect(publicSourceLabel("Downloads/Printers")).toBe(
      "Redacted process trace",
    );
  });

  test("keeps visible public strings free of banned prompt language", () => {
    const visibleProjects = projectCaseStudiesPublic
      .filter((project) => project.homepageFeature)
      .map((project) => ({
        evidence: project.evidence,
        role: project.role,
        status: project.status,
        summary: project.summary,
        title: project.title,
      }));
    const publicStrings = collectStringValues({
      communityHighlights,
      credentialGroups,
      educationRecords,
      heroCopy,
      joeProfile,
      learningCredentials,
      proudSystemsRoles,
      publicTrailSections: publicTrailSections.map((section) => section.copy),
      socialChannels,
      visibleProjects,
    });

    for (const value of publicStrings) {
      expect(value).not.toMatch(forbiddenPublicTerms);
      expect(value).not.toMatch(visibleSlopTerms);
      expect(value).not.toMatch(privatePathTerms);
    }
  });

  test("sitemap keeps the public site one-page", () => {
    const urls = sitemap().map((entry) => entry.url);

    expect(urls).toEqual(["https://joesimo.com/"]);

    for (const project of projectCaseStudies) {
      expect(urls).not.toContain(`https://joesimo.com/work/${project.slug}`);
    }
  });

  test("lookup helper returns only real work slugs", () => {
    expect(getProjectCaseStudy("sim0")?.title).toBe("sim0");
    expect(getProjectCaseStudy("chesslm")?.title).toBe("ChessLM");
    expect(getProjectCaseStudy("missing")).toBeUndefined();
  });
});
