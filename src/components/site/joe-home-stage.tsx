import { JoeHomeApp } from "@/components/site/joe-home-app";
import type {
  CommunityArtifact,
  JoeProfile,
  PublicProjectCaseStudy,
  LearningCredential,
  ProudRole,
  SocialChannel,
} from "@/lib/site-data";

type JoeHomeStageProps = {
  communityHighlights: CommunityArtifact[];
  joeProfile: JoeProfile;
  learningCredentials: LearningCredential[];
  projects: PublicProjectCaseStudy[];
  proudRoles: ProudRole[];
  socialChannels: SocialChannel[];
};

export function JoeHomeStage(props: JoeHomeStageProps) {
  return <JoeHomeApp {...props} />;
}
