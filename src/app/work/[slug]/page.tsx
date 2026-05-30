import { permanentRedirect } from "next/navigation";

import { isHomepageProject, projectCaseStudiesPublic } from "@/lib/site-data";

type WorkPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return projectCaseStudiesPublic.map((project) => ({
    slug: project.slug,
  }));
}

export default async function WorkPage({ params }: WorkPageProps) {
  const { slug } = await params;

  permanentRedirect(isHomepageProject({ slug }) ? `/#work-${slug}` : "/#work");
}
