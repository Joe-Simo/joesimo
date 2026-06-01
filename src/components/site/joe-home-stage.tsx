import { JoeHomeApp } from "@/components/site/joe-home-app";
import type {
  CommunityArtifact,
  GithubRepository,
  JoeProfile,
  PublicProjectCaseStudy,
  LearningCredential,
  ProudRole,
} from "@/lib/site-data";

type JoeHomeStageProps = {
  communityHighlights: CommunityArtifact[];
  githubRepositories: GithubRepository[];
  joeProfile: JoeProfile;
  learningCredentials: LearningCredential[];
  projects: PublicProjectCaseStudy[];
  proudRoles: ProudRole[];
};

export function JoeHomeStage(props: JoeHomeStageProps) {
  return <JoeHomeApp {...props} />;
}
