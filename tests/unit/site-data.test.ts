import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";

import {
  archiveArtifacts,
  blogPosts,
  communityArtifacts,
  communityHighlights,
  credentialGroups,
  credentialIssuers,
  educationRecords,
  getProjectCaseStudy,
  githubRepositories,
  heroCopy,
  joeProfile,
  learningCredentials,
  latestBlogPost,
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
const unsafePublicMediaTerms =
  /Local API|server\.ts|\/api\/|sim0-project|\.claude|\.local|Signature HTML|base64|9690 files|raw HTML/i;
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
  v0: {
    handle: "@joesimo",
    href: "https://v0.app/@joesimo",
  },
  LinkedIn: {
    handle: "josephsimo",
    href: "https://www.linkedin.com/in/josephsimo/",
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
    expect(heroCopy.detail).toBe("");
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
      "/blog",
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
      if (item.href.startsWith("#")) {
        const href = item.href as (typeof portfolioSections)[number]["anchor"];

        expect(currentHomepageAnchors.has(href)).toBe(true);
        expect(retiredAnchors.has(item.href)).toBe(false);
      }
    }
  });

  test("keeps public contact handles exact", () => {
    expect(socialChannels.map((channel) => channel.label)).toEqual([
      "X",
      "GitHub",
      "v0",
      "LinkedIn",
      "YouTube",
    ]);

    for (const [label, expected] of Object.entries(requiredSocials)) {
      const channel = socialChannels.find(
        (candidate) => candidate.label === label,
      );

      expect(channel, label).toBeDefined();
      expect(channel?.handle).toBe(expected.handle);
      expect(channel?.href).toBe(expected.href);
    }

    expect(
      Object.fromEntries(
        socialChannels.map((channel) => [channel.label, channel.iconKey]),
      ),
    ).toMatchObject({
      GitHub: "github",
      LinkedIn: "linkedin",
      v0: "v0",
      X: "xLogo",
      YouTube: "youtube",
    });

    const privateMessageScheme = ["mail", "to:"].join("");

    expect(
      socialChannels.some((channel) =>
        channel.href.startsWith(privateMessageScheme),
      ),
    ).toBe(false);
  });

  test("publishes the first blog post without secrets", () => {
    expect(blogPosts).toHaveLength(1);
    expect(latestBlogPost.slug).toBe("vercel-v0-api-billing-bug-report");
    expect(latestBlogPost.href).toBe("/blog/vercel-v0-api-billing-bug-report");
    expect(latestBlogPost.videoHref).toBe(
      "https://www.youtube.com/watch?v=XnmyF2lmCP4&feature=youtu.be",
    );
    expect(latestBlogPost.gallery).toHaveLength(3);

    const publicBlogStrings = collectStringValues(blogPosts);

    for (const value of publicBlogStrings) {
      expect(value).not.toMatch(/REDACTEDAPIKEYHERE|YOUR_API_KEY|Bearer /i);
      expect(value).not.toMatch(privatePathTerms);
    }

    for (const media of latestBlogPost.gallery) {
      expect(existsSync(join(process.cwd(), "public", media.src))).toBe(true);
    }
  });

  test("keeps GitHub project coverage public-safe", () => {
    expect(githubRepositories.length).toBeGreaterThanOrEqual(5);
    expect(githubRepositories.map((repository) => repository.name)).toContain(
      "joesimo",
    );
    expect(githubRepositories.map((repository) => repository.name)).toContain(
      "skills",
    );
    expect(githubRepositories.map((repository) => repository.name)).not.toContain(
      "GitHub / @Joe-Simo",
    );

    expect(
      githubRepositories.filter((repository) => repository.visibility === "private"),
    ).toHaveLength(0);

    for (const repository of githubRepositories.filter(
      (candidate) => candidate.visibility === "public",
    )) {
      expect(repository.href).toMatch(/^https:\/\/github\.com\/Joe-Simo\//);
      expect(repository.meta).toContain(
        repository.kind === "Public fork" ? "public fork" : "public repo",
      );
    }
  });

  test("keeps private product work linked through official product surfaces", () => {
    const linksBySlug = new Map(
      projectCaseStudies.map((project) => [
        project.slug,
        project.links.map((link) => link.href),
      ]),
    );

    expect(linksBySlug.get("sim0")).toContain("https://sim0.com");
    expect(linksBySlug.get("signature-copier")).toContain("https://signature0.com");
    expect(linksBySlug.get("garden0")).not.toContain("https://garden0.com");
    expect(linksBySlug.get("chesslm")).toContain("https://chesslm.com");
    expect(linksBySlug.get("astrosimo")).toContain("https://astrosimo.com");
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

    const badgeCredentials = learningCredentials.filter(
      (credential) => credential.badge,
    );

    expect(badgeCredentials.map((credential) => credential.label)).toEqual(
      [
        "PPC Fundamentals Exam",
        "Content Marketing Fundamentals Exam",
        "Technical SEO Exam",
        "Unitrends Certified Associate (UCA)",
        "Microsoft Technology Associate: Networking Fundamentals",
        "CompTIA A+",
        "CompTIA Network+",
      ],
    );
    expect(
      learningCredentials.find(
        (credential) =>
          credential.label === "Unitrends Certified Associate (UCA)",
      )?.badge?.src,
    ).toBe("/media/credentials/unitrends-certified-associate.png");
    expect(
      learningCredentials.find(
        (credential) =>
          credential.label ===
          "Microsoft Technology Associate: Networking Fundamentals",
      )?.badge?.src,
    ).toBe(
      "/media/credentials/microsoft-mta-networking-fundamentals-2018.png",
    );
    expect(
      learningCredentials.find(
        (credential) => credential.label === "CompTIA A+",
      )?.badge?.src,
    ).toBe("/media/credentials/comptia-a-plus-certification.png");
    expect(
      learningCredentials.find(
        (credential) => credential.label === "CompTIA Network+",
      )?.badge?.src,
    ).toBe("/media/credentials/comptia-network-plus-ce-certification.png");
    expect(
      learningCredentials.find(
        (credential) => credential.label === "Datto Technical Specialist I",
      )?.badge,
    ).toBeUndefined();
    expect(
      learningCredentials.find(
        (credential) => credential.label === "Datto Technical Specialist II",
      )?.badge,
    ).toBeUndefined();
    expect(
      learningCredentials.find(
        (credential) =>
          credential.label === "Next.js App Router Fundamentals",
      )?.badge,
    ).toBeUndefined();
    expect(
      learningCredentials.find(
        (credential) =>
          credential.issuer === "Semrush" &&
          credential.label === "PPC Fundamentals Exam",
      )?.badge?.src,
    ).toBe("/media/credentials/semrush-ppc-fundamentals-exam.svg");
    expect(
      learningCredentials.find(
        (credential) =>
          credential.issuer === "Semrush" &&
          credential.label === "Content Marketing Fundamentals Exam",
      )?.badge?.src,
    ).toBe(
      "/media/credentials/semrush-content-marketing-fundamentals-exam.svg",
    );
    expect(
      learningCredentials.find(
        (credential) =>
          credential.issuer === "Semrush" &&
          credential.label === "Technical SEO Exam",
      )?.badge?.src,
    ).toBe("/media/credentials/semrush-technical-seo-exam.svg");
    for (const label of [
      "Local SEO Exam",
      "Mobile SEO Exam",
      "Backlink Management Exam",
      "Keyword Research Exam",
      "SEO Fundamentals Exam",
      "Content Marketing and SEO Fundamentals Exam",
      "Role of Content Exam",
    ]) {
      expect(
        learningCredentials.find(
          (credential) =>
            credential.issuer === "Semrush" && credential.label === label,
        )?.badge,
      ).toBeUndefined();
    }
    expect(
      learningCredentials.find(
        (credential) =>
          credential.label === "React Foundations for Next.js",
      )?.badge,
    ).toBeUndefined();
    expect(
      learningCredentials.find(
        (credential) =>
          credential.label ===
          "Part 107 Small Unmanned Aircraft Systems Initial",
      )?.badge,
    ).toBeUndefined();
    expect(
      learningCredentials.find(
        (credential) =>
          credential.label ===
          "Barracuda Web Security Service Certified Engineer",
      )?.badge,
    ).toBeUndefined();
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
    expect(communityArtifacts).toHaveLength(11);
    expect(communityArtifacts[0]?.title).toBe("ThePrimeagen");
    expect(communityHighlights).toHaveLength(11);
    expect(communityHighlights[0]?.title).toBe("ThePrimeagen");
    expect(communityHighlights[0]?.media.src).toBe(
      "/media/community/joe-community-01.webp",
    );

    for (const artifact of communityArtifacts) {
      expect(artifact.sourceLabel).toBe("Owned event photo");
      expect(artifact.media.src).toMatch(
        /^\/media\/community\/joe-community-\d{2}\.webp$/,
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

    for (const credential of learningCredentials) {
      if (credential.badge) {
        mediaSources.add(credential.badge.src);
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

  test("keeps public media labels free of private implementation details", () => {
    const publicMediaStrings = collectStringValues(
      projectCaseStudiesPublic.map((project) => ({
        assets: project.assets.map((asset) => ({
          alt: asset.media.alt,
          caption: project.proofCaptions[asset.captionId],
          label: asset.label,
          sourceLabel: asset.sourceLabel,
        })),
        miniWorld: project.miniWorld
          ? {
              media: project.miniWorld.media.map((media) => ({
                alt: media.alt,
                label: media.label,
                sourceLabel: media.sourceLabel,
              })),
              panels: project.miniWorld.panels,
            }
          : undefined,
      })),
    );

    for (const value of publicMediaStrings) {
      expect(value).not.toMatch(unsafePublicMediaTerms);
    }
  });

  test("sitemap exposes home and shareable work routes", () => {
    const urls = sitemap().map((entry) => entry.url);

    expect(urls[0]).toBe("https://joesimo.com/");
    expect(urls).toContain("https://joesimo.com/blog");
    expect(urls).toContain(
      "https://joesimo.com/blog/vercel-v0-api-billing-bug-report",
    );

    for (const project of projectCaseStudiesPublic) {
      expect(urls).toContain(`https://joesimo.com/work/${project.slug}`);
    }

    expect(urls).toHaveLength(projectCaseStudiesPublic.length + blogPosts.length + 2);
  });

  test("lookup helper returns only real work slugs", () => {
    expect(getProjectCaseStudy("sim0")?.title).toBe("sim0");
    expect(getProjectCaseStudy("chesslm")?.title).toBe("ChessLM");
    expect(getProjectCaseStudy("missing")).toBeUndefined();
  });
});
