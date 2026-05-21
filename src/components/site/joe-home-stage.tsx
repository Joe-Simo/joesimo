import { JoeHomeApp } from "@/components/site/joe-home-app";
import type {
  CommunityArtifact,
  FieldNote,
  JoeProfile,
  PublicProjectCaseStudy,
  SocialChannel,
  WritingFragment,
} from "@/lib/site-data";

type JoeHomeStageProps = {
  communityArtifacts: CommunityArtifact[];
  fieldNotes: FieldNote[];
  joeProfile: JoeProfile;
  projects: PublicProjectCaseStudy[];
  socialChannels: SocialChannel[];
  writingFragments: WritingFragment[];
};

export function JoeHomeStage(props: JoeHomeStageProps) {
  return <JoeHomeApp {...props} />;
}
