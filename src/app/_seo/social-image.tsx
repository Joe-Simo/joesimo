import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import {
  featuredWork,
  heroCopy,
  profileFacts,
  siteDescription,
} from "@/lib/site-data";

const artifact = featuredWork;
const locationFact = profileFacts.find((fact) => fact.label === "Location");

async function publicAssetDataUrl(path: string, contentType: string) {
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  const asset = await readFile(join(process.cwd(), "public", normalizedPath));

  return `data:${contentType};base64,${Buffer.from(asset).toString("base64")}`;
}

export async function createSocialImage(label: string) {
  const portraitImage = await publicAssetDataUrl(
    "/media/joe-simo-x-avatar.jpg",
    "image/jpeg",
  );
  const geistSans = await readFile(
    join(
      process.cwd(),
      "node_modules/geist/dist/fonts/geist-sans/Geist-Regular.ttf",
    ),
  );
  const geistMono = await readFile(
    join(
      process.cwd(),
      "node_modules/geist/dist/fonts/geist-mono/GeistMono-Regular.ttf",
    ),
  );

  const facts = [
    "Joe Simo",
    locationFact?.value ?? "Fort Myers, Florida",
    "support / systems / web consulting",
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#fbfbfb",
          color: "#09090b",
          fontFamily:
            'Geist, "Geist Sans", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          padding: 56,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            border: "1px solid rgba(9, 9, 11, 0.12)",
          }}
        />
        <div
          style={{
            width: 650,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: 18,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: "#606069",
              }}
            >
              {label} / joesimo.com
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 42,
                fontSize: 124,
                lineHeight: 0.86,
                fontWeight: 700,
                letterSpacing: 0,
              }}
            >
              {heroCopy.title}
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 26,
                fontSize: 32,
                lineHeight: 1.2,
                color: "#09090b",
              }}
            >
              {heroCopy.intro}
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 22,
                fontSize: 24,
                lineHeight: 1.45,
                color: "#606069",
              }}
            >
              {siteDescription}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            {facts.map((fact) => (
              <div
                key={fact}
                style={{
                  display: "flex",
                  marginRight: 12,
                  border: "1px solid rgba(9, 9, 11, 0.16)",
                  borderRadius: 8,
                  padding: "10px 16px",
                  fontSize: 18,
                  color: "#09090b",
                }}
              >
                {fact}
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            right: 76,
            top: 74,
            width: 318,
            height: 318,
            display: "flex",
            overflow: "hidden",
            border: "1px solid rgba(9, 9, 11, 0.16)",
            borderRadius: 18,
            backgroundImage: `url(${portraitImage})`,
            backgroundSize: "cover",
            backgroundPosition: "50% 42%",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 76,
            bottom: 106,
            width: 318,
            display: "flex",
            flexDirection: "column",
            borderTop: "1px solid rgba(0, 87, 255, 0.54)",
            paddingTop: 18,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 18,
              letterSpacing: 2.4,
              textTransform: "uppercase",
              color: "#606069",
            }}
          >
            Current work
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 10,
              fontSize: 34,
              fontWeight: 700,
              color: "#09090b",
            }}
          >
            {artifact.title}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 8,
              fontSize: 20,
              lineHeight: 1.3,
              color: "#606069",
            }}
          >
            {artifact.actionLabel}
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            left: 56,
            right: 56,
            bottom: 54,
            height: 4,
            display: "flex",
            background: "#09090b",
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Geist",
          data: geistSans,
          style: "normal",
          weight: 400,
        },
        {
          name: "Geist Mono",
          data: geistMono,
          style: "normal",
          weight: 400,
        },
      ],
    },
  );
}
