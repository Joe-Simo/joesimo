import {
  githubRepositories as fallbackGithubRepositories,
  type GithubRepository,
} from "@/lib/site-data";

const githubOwner = "Joe-Simo";
const githubApiBaseUrl = `https://api.github.com/users/${githubOwner}/repos`;
const githubReposPerPage = 100;
const githubMaxPages = 10;
const githubRevalidateSeconds = 60 * 60 * 6;

type GithubApiRepository = {
  archived: boolean;
  description: string | null;
  fork: boolean;
  homepage: string | null;
  html_url: string;
  language: string | null;
  name: string;
  private: boolean;
  topics?: unknown;
};

function isGithubApiRepository(value: unknown): value is GithubApiRepository {
  if (!value || typeof value !== "object") {
    return false;
  }

  const repository = value as Record<string, unknown>;

  return (
    typeof repository.archived === "boolean" &&
    (typeof repository.description === "string" ||
      repository.description === null) &&
    typeof repository.fork === "boolean" &&
    (typeof repository.homepage === "string" || repository.homepage === null) &&
    typeof repository.html_url === "string" &&
    (typeof repository.language === "string" || repository.language === null) &&
    typeof repository.name === "string" &&
    typeof repository.private === "boolean"
  );
}

function repoTopics(repository: GithubApiRepository) {
  if (!Array.isArray(repository.topics)) {
    return [];
  }

  return repository.topics.filter(
    (topic): topic is string => typeof topic === "string" && topic.length > 0,
  );
}

function normalizeHomepage(homepage: string | null) {
  if (!homepage) {
    return undefined;
  }

  const trimmedHomepage = homepage.trim();

  if (!trimmedHomepage.startsWith("https://")) {
    return undefined;
  }

  return trimmedHomepage;
}

function fallbackDescription(repository: GithubApiRepository) {
  if (repository.fork) {
    return "Public GitHub fork visible on Joe Simo's GitHub profile.";
  }

  return `Public GitHub repository for ${repository.name}.`;
}

function toPublicGithubRepository(
  repository: GithubApiRepository,
): GithubRepository {
  const kind = repository.fork ? "Public fork" : "Public repo";
  const topics = repoTopics(repository);
  const meta = [
    "github",
    repository.fork ? "public fork" : "public repo",
    repository.language,
    ...topics.slice(0, 2),
  ].filter((item): item is string => Boolean(item));

  return {
    name: repository.name,
    href: repository.html_url,
    description: repository.description?.trim() || fallbackDescription(repository),
    kind,
    source: `github.com/${githubOwner}/${repository.name}`,
    homepage: normalizeHomepage(repository.homepage),
    meta,
    visibility: "public",
  };
}

async function fetchGithubRepositoryPage(page: number) {
  const url = new URL(githubApiBaseUrl);
  url.searchParams.set("type", "owner");
  url.searchParams.set("sort", "updated");
  url.searchParams.set("per_page", String(githubReposPerPage));
  url.searchParams.set("page", String(page));

  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "joesimo.com",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    next: {
      revalidate: githubRevalidateSeconds,
      tags: ["github-public-repositories"],
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub repositories request failed: ${response.status}`);
  }

  const payload: unknown = await response.json();

  if (!Array.isArray(payload)) {
    throw new Error("GitHub repositories response was not an array.");
  }

  return payload.filter(isGithubApiRepository);
}

// Flagship-first ordering for the homepage rail. Forks and asset-only
// packages stay off the rail so every visible slot argues for engineering
// depth; goblins-os leads because it is the strongest public artifact.
const curatedRepositoryOrder = [
  "goblins-os",
  "joesimo",
  "skills",
  "love-presentation",
];
const excludedRepositoryNames = new Set(["joe-simo-pet"]);

function curateRepositories(
  entries: { repository: GithubRepository; fork: boolean }[],
): GithubRepository[] {
  const kept = entries.filter(
    ({ repository, fork }) => !fork && !excludedRepositoryNames.has(repository.name),
  );
  const rank = (name: string) => {
    const index = curatedRepositoryOrder.indexOf(name);
    return index === -1 ? curatedRepositoryOrder.length : index;
  };
  return kept
    .map(({ repository }) => repository)
    .sort((a, b) => rank(a.name) - rank(b.name));
}

export async function getGithubRepositories(): Promise<GithubRepository[]> {
  try {
    const repositories: GithubApiRepository[] = [];

    for (let page = 1; page <= githubMaxPages; page += 1) {
      const pageRepositories = await fetchGithubRepositoryPage(page);
      repositories.push(...pageRepositories);

      if (pageRepositories.length < githubReposPerPage) {
        break;
      }
    }

    const publicRepositories = curateRepositories(
      repositories
        .filter((repository) => !repository.private && !repository.archived)
        .map((repository) => ({
          repository: toPublicGithubRepository(repository),
          fork: repository.fork,
        })),
    );

    if (publicRepositories.length > 0) {
      return publicRepositories;
    }
  } catch (error) {
    console.warn(error);
  }

  return fallbackGithubRepositories.filter(
    (repository) => repository.visibility === "public" && repository.href,
  );
}
