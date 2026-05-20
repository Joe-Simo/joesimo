import { JoeHomeStage } from "@/components/site/joe-home-stage";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import {
  communityHighlights,
  fieldNotes,
  joeProfile,
  profileMedia,
  projectCaseStudiesPublic,
  writingFragments,
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

      <SiteHeader surface="home" />

      <main
        id="main-content"
        tabIndex={-1}
        className="outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
      >
        <JoeHomeStage
          communityArtifacts={communityHighlights}
          fieldNotes={fieldNotes}
          joeProfile={joeProfile}
          profileMedia={profileMedia}
          projects={projectCaseStudiesPublic}
          writingFragments={writingFragments}
        />
      </main>

      <SiteFooter />
    </div>
  );
}
