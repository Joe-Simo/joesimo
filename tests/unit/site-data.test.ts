import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";

import {
  archiveArtifacts,
  communityArtifacts,
  communityHighlights,
  credentialGroups,
  credentialIssuers,
  educationRecords,
  getProjectCaseStudy,
  heroCopy,
  joeProfile,
  learningCredentials,
  navItems,
  projectCaseStudies,
  projectCaseStudiesPublic,
  profileMedia,
  proudSystemsRoles,
  portfolioSections,
  publicSourceLabel,
  sim0InvestigationCase,
  sim0ProofPoints,
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
  "love-presentation",
  "astrosimo",
  "garden0",
  "chesslm",
  "next-flights",
  "grimgreen-channel-watch",
  "royal-shell",
  "signature-copier",
  "printer-scripts",
] as const;
const requiredStepIds = ["preview", "runtime", "api", "ship", "changes"] as const;
const requiredSocials = {
  X: {
    handle: "@joesimo",
    href: "https://x.com/joesimo",
  },
  GitHub: {
    handle: "@Joe-Simo",
    href: "https://github.com/Joe-Simo",
  },
  LinkedIn: {
    handle: "josephsimo",
    href: "https://www.linkedin.com/in/josephsimo/",
  },
  Instagram: {
    handle: "@joesimo_",
    href: "https://www.instagram.com/joesimo_/",
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
    expect(heroCopy.title).toBe("Joe Simo");
    expect(heroCopy.intro).toBe(
      "Designer/developer, FL.",
    );
    expect(heroCopy.detail).toBe(
      "I build practical web tools, product interfaces, and small systems grounded in support, systems, and recovery work.",
    );
    expect(joeProfile.kicker).toContain("FL");
    expect(joeProfile.kicker).toContain("Designer-developer");
    expect(joeProfile.routeLabel).toBe("Work / Systems / Certifications / Community / Blog.");

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

  test("keeps the primary navigation mapped to current homepage sections", () => {
    expect(navItems.map((item) => item.href)).toEqual([
      "#work",
      "#systems",
      "#credentials",
      "#community",
      "#blog",
      "#contact",
    ]);
    expect(navItems.map((item) => item.label)).toEqual([
      "Work",
      "Systems",
      "Certifications",
      "Community",
      "Blog",
      "Contact",
    ]);

    const currentHomepageAnchors = new Set(
      portfolioSections.map((section) => section.anchor),
    );
    const retiredAnchors = new Set([
      "#method",
      "#people",
      "#trail",
      "#notes",
      "#photos",
      "#social",
    ]);

    for (const item of navItems) {
      expect(currentHomepageAnchors.has(item.href)).toBe(true);
      expect(retiredAnchors.has(item.href)).toBe(false);
    }
  });

  test("keeps public contact handles exact", () => {
    expect(socialChannels.map((channel) => channel.label)).toEqual([
      "X",
      "GitHub",
      "LinkedIn",
      "Instagram",
    ]);
    expect(socialChannels.map((channel) => channel.label)).not.toContain(
      "YouTube",
    );

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

  test("keeps education and certification proof visible", () => {
    expect(educationRecords).toHaveLength(7);
    expect(educationRecords[0]?.school).toBe(
      "Pontificia Universidad Católica Madre y Maestra",
    );
    expect(educationRecords[0]?.focus).toBe(
      "Bachelor of Science, Telematics Engineering",
    );
    expect(educationRecords[0]?.period).toBe("2006 - 2014");
    expect(educationRecords.slice(1).map((record) => record.focus)).toEqual([
      "CCNA 1, IT",
      "CCNA 2, IT",
      "CCNA 3, IT",
      "CCNA 4, IT",
      "IT 1, IT",
      "IT 2, IT",
    ]);
    expect(educationRecords.slice(1).map((record) => record.detail)).toEqual([
      "Networking Basics",
      "Routers and Routing Basics",
      "Switching Basics and Intermediate Routing",
      "WAN Technologies",
      "Hardware and Software",
      "Servers and Network OS",
    ]);

    const credentialLabels = learningCredentials.map(
      (credential) => credential.label,
    );

    expect(credentialLabels).toContain("Next.js Pages Router Fundamentals");
    expect(credentialLabels).toContain("Next.js App Router Fundamentals");
    expect(credentialLabels).toContain("Next.js SEO Fundamentals");
    expect(credentialLabels).toContain("React Foundations for Next.js");
    expect(credentialLabels).toContain("PPC Fundamentals Exam");
    expect(credentialLabels).toContain("Content Marketing Fundamentals Exam");
    expect(credentialLabels).toContain("Technical SEO Exam");
    expect(credentialLabels).toContain("Local SEO Exam");
    expect(credentialLabels).toContain("Mobile SEO Exam");
    expect(credentialLabels).toContain("Backlink Management Exam");
    expect(credentialLabels).toContain("Keyword Research Exam");
    expect(credentialLabels).toContain("SEO Fundamentals Exam");
    expect(credentialLabels).toContain(
      "Content Marketing and SEO Fundamentals Exam",
    );
    expect(credentialLabels).toContain("Role of Content Exam");
    expect(credentialLabels).toContain(
      "Part 107 Small Unmanned Aircraft Systems Initial",
    );
    expect(credentialLabels).toContain(
      "Part 107 Small Unmanned Aircraft Systems Recurrent",
    );
    expect(credentialLabels).toContain(
      "Commercial Drone Pilot: CFR Part 107 Explained",
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
    expect(credentialLabels).toContain("Barracuda SignNow");
    expect(credentialLabels).toContain(
      "Barracuda Web Security Service Certified Engineer",
    );
    expect(credentialLabels).toContain(
      "Barracuda Email Security Service Certified Engineer",
    );
    expect(credentialLabels).not.toContain("What is SignNow");
    expect(credentialGroups.map((group) => group.label)).toEqual([
      "Web / Vercel / SEO",
      "Systems & Networking",
      "Vendor Tools",
      "Drone Operations",
    ]);
    expect(credentialIssuers.map((issuer) => issuer.label)).toEqual([
      "Vercel",
      "Semrush",
      "Microsoft",
      "CompTIA",
      "Unitrends",
      "Datto",
      "Barracuda",
      "FAA Safety Team",
      "LinkedIn Learning",
    ]);

    for (const issuer of credentialIssuers) {
      const matchingCredentials = learningCredentials.filter((credential) =>
        issuer.issuerNames.includes(credential.issuer),
      );

      expect(matchingCredentials.length).toBeGreaterThan(0);
    }

    for (const credential of learningCredentials) {
      expect(credential.href).toBe(requiredSocials.LinkedIn.href);
      expect(credential.sourceLabel).toMatch(
        /LinkedIn (profile export|certification)|Local certificate|User-provided LinkedIn certification/,
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

  test("keeps React Miami artifacts local and modest", () => {
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

  });

  test("keeps the proud systems roles visible", () => {
    expect(proudSystemsRoles.map((role) => role.title)).toEqual([
      "System Administrator",
      "Disaster Recovery Engineer",
      "IT Systems Administrator",
    ]);
    expect(proudSystemsRoles.map((role) => role.organization)).toEqual([
      "Macromedica Dominicana",
      "Never Off Technology",
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

  test("keeps work range named, dated, and honest", () => {
    const workBySlug = new Map(
      projectCaseStudies.map((project) => [project.slug, project]),
    );

    for (const slug of requiredWorkSlugs) {
      expect(workBySlug.has(slug), slug).toBe(true);
    }

    expect(workBySlug.get("sim0")?.tier).toBe("featured");
    expect(workBySlug.get("sim0")?.proofMode).toBe("operated");

    const projectsByStartDate = [...projectCaseStudies]
      .sort((left, right) =>
        right.started.sortKey.localeCompare(left.started.sortKey),
      )
      .map((project) => project.slug);

    expect(projectsByStartDate).toEqual([
      "love-presentation",
      "garden0",
      "signature-copier",
      "astrosimo",
      "chesslm",
      "grimgreen-channel-watch",
      "sim0",
      "printer-scripts",
      "royal-shell",
      "next-flights",
    ]);

    for (const project of projectCaseStudies) {
      expect(project.started.label, project.slug).toMatch(
        /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4}$/,
      );
      expect(project.started.sortKey, project.slug).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(project.started.sourceLabel, project.slug).not.toBe("");
    }

    for (const project of projectCaseStudies.filter(
      (candidate) => candidate.homepageFeature,
    )) {
      const thumbnail = project.homepageFeature?.thumbnailMedia;

      expect(thumbnail, project.slug).toBeDefined();
      expect(thumbnail?.width, project.slug).toBe(960);
      expect(thumbnail?.height, project.slug).toBe(540);
      expect(thumbnail?.src, project.slug).toMatch(
        /^\/media\/work\/.+-work-thumb\.webp$/,
      );
    }
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
    const rawProjectText = JSON.stringify(projectCaseStudies);
    const publicText = JSON.stringify(projectCaseStudiesPublic);

    expect(rawProjectText).not.toMatch(privatePathTerms);
    expect(publicText).not.toMatch(privatePathTerms);

    for (const project of projectCaseStudiesPublic) {
      expect("sourcePath" in project, project.slug).toBe(false);
      expect(project.sourceLabel).not.toMatch(privatePathTerms);

      for (const asset of project.assets) {
        expect("sourcePath" in asset, `${project.slug}:${asset.id}`).toBe(false);
        expect(asset.sourceLabel).not.toMatch(privatePathTerms);
      }
    }

    expect(publicSourceLabel("project/sim0")).toBe("Interface still");
    expect(publicSourceLabel("project/printer-scripts")).toBe(
      "Redacted process trace",
    );
  });

  test("points public media records at files that exist locally", () => {
    const mediaSources = new Set<string>();

    mediaSources.add(profileMedia.src);

    for (const artifact of [...archiveArtifacts, ...communityArtifacts, ...communityHighlights]) {
      mediaSources.add(artifact.media.src);
    }

    for (const project of projectCaseStudies) {
      for (const asset of project.assets) {
        mediaSources.add(asset.media.src);
      }

      const thumbnail = project.homepageFeature?.thumbnailMedia;

      if (thumbnail?.src) {
        mediaSources.add(thumbnail.src);
      }
    }

    const missingMedia = [...mediaSources]
      .filter((source) => source.startsWith("/media/"))
      .filter((source) =>
        !existsSync(join(process.cwd(), "public", source.replace(/^\//, ""))),
      );

    expect(missingMedia).toEqual([]);
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
      portfolioSections: portfolioSections.map((section) => section.copy),
      socialChannels,
      visibleProjects,
    });

    for (const value of publicStrings) {
      expect(value).not.toMatch(forbiddenPublicTerms);
      expect(value).not.toMatch(visibleSlopTerms);
      expect(value).not.toMatch(privatePathTerms);
    }

    for (const project of visibleProjects) {
      expect(
        [project.role, project.status, project.summary, project.title].join(" "),
      ).not.toMatch(/\bartifact\b/i);
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
