import { createSocialImage } from "@/app/_seo/social-image";
import { heroCopy } from "@/lib/site-data";

export const alt = `${heroCopy.title}: ${heroCopy.intro}`;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return createSocialImage("X");
}
