import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import {
  heroCopy,
  siteDescription,
} from "@/lib/site-data";

export async function createSocialImage(label: string) {
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
    "FL",
    "work / systems / certifications / community",
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#ffffff",
          color: "#000000",
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
            border: "1px solid rgba(0, 0, 0, 0.12)",
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
                color: "#666666",
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
                color: "#000000",
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
                color: "#666666",
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
                  border: "1px solid rgba(0, 0, 0, 0.16)",
                  borderRadius: 8,
                  padding: "10px 16px",
                  fontSize: 18,
                  color: "#000000",
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
            top: 76,
            width: 360,
            display: "flex",
            flexDirection: "column",
            border: "1px solid rgba(0, 0, 0, 0.16)",
            borderRadius: 18,
            overflow: "hidden",
            background: "#ffffff",
          }}
        >
          {[
            ["Work", "public repos / live products"],
            ["Systems", "Macromedica Dominicana / Never Off / Brox"],
            ["Certifications", "web / systems / drone"],
            ["Contact", "X / GitHub / LinkedIn / Instagram"],
          ].map(([title, detail]) => (
            <div
              key={title}
              style={{
                display: "flex",
                flexDirection: "column",
                borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
                padding: 22,
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 18,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  color: "#666666",
                }}
              >
                {title}
              </div>
              <div
                style={{
                  display: "flex",
                  marginTop: 8,
                  fontSize: 34,
                  fontWeight: 700,
                  color: "#000000",
                }}
              >
                {detail}
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            position: "absolute",
            left: 56,
            right: 56,
            bottom: 54,
            height: 4,
            display: "flex",
            background: "#000000",
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
