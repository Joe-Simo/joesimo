import { JoeHomeApp } from "@/components/site/joe-home-app";
import type {
  FieldNote,
  JoeProfile,
  PublicProjectCaseStudy,
  SiteMedia,
  WritingFragment,
} from "@/lib/site-data";

type JoeHomeStageProps = {
  fieldNotes: FieldNote[];
  joeProfile: JoeProfile;
  profileMedia: SiteMedia;
  projects: PublicProjectCaseStudy[];
  writingFragments: WritingFragment[];
};

export function JoeHomeStage(props: JoeHomeStageProps) {
  return <JoeHomeApp {...props} />;
}
