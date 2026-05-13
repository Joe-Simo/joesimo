import { MethodStudioStage } from "@/components/site/method-studio-stage";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import {
  githubRepositories,
  methodStudioMoments,
  methodStudioScenes,
  methodStudioSpecimens,
  ownedArtifacts,
  projectSignals,
  sim0ProofPoints,
  socialChannels,
} from "@/lib/site-data";

export default function Home() {
  return (
    <div
      id="top"
      className="min-h-screen overflow-x-clip bg-background text-foreground"
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:border focus:border-border focus:bg-background focus:px-4 focus:py-3 focus:font-mono focus:text-xs focus:uppercase focus:tracking-[0.16em] focus:text-foreground focus:shadow-lg"
      >
        Skip to content
      </a>

      <SiteHeader />

      <main id="main-content" tabIndex={-1} className="outline-none">
        <MethodStudioStage
          githubRepositories={githubRepositories}
          moments={methodStudioMoments}
          ownedArtifacts={ownedArtifacts}
          projectSignals={projectSignals}
          proofPoints={sim0ProofPoints}
          scenes={methodStudioScenes}
          socialChannels={socialChannels}
          specimens={methodStudioSpecimens}
        />
      </main>

      <SiteFooter />
    </div>
  );
}
